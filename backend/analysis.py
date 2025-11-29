import json
import time
import random
import re
import os
import sqlite3
from datetime import datetime
from typing import List, Dict, Any, Optional
import requests
from urllib.parse import quote_plus
from rake_nltk import Rake

# Import from other modules
from config import (
    DB_FILE, OPENAI_API_KEY, OPENAI_MODEL, CATEGORIES, DEFAULT_CATEGORY,
    COMPANY_TICKERS, COUNTRY_DATA, trends_cache, trends_last_request,
    get_pytrends
)
from database import get_db_connection
from utils import get_favicon_url, get_domain_name

# OpenAI Setup
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

# --- KEYWORD EXTRACTION ---
def extract_keywords(text: str, top_n: int = 8) -> List[Dict[str, Any]]:
    """Extract keywords using RAKE - prefer shorter, more meaningful phrases."""
    if not text or text == "Content unavailable.":
        return []
    
    try:
        # Use shorter max_length for more searchable keywords
        rake = Rake(min_length=1, max_length=3, include_repeated_phrases=False)
        rake.extract_keywords_from_text(text.lower())
        ranked = rake.get_ranked_phrases_with_scores()
        
        keywords = []
        seen = set()
        
        # Skip generic/useless words
        skip_words = {'said', 'also', 'according', 'used', 'using', 'however', 'including', 'addition', 'example'}
        
        for score, phrase in ranked:
            phrase_clean = phrase.strip()
            phrase_lower = phrase_clean.lower()
            
            # Skip already seen or too short/long
            if phrase_lower in seen or len(phrase_clean) < 3 or len(phrase_clean) > 35:
                continue
            
            # Skip if just numbers
            if re.match(r'^[\d\s]+$', phrase_clean):
                continue
            
            # Skip generic words
            if phrase_lower in skip_words:
                continue
            
            # Prefer shorter keywords (1-2 words) - boost their score
            word_count = len(phrase_clean.split())
            if word_count == 1:
                adjusted_score = score * 1.5
            elif word_count == 2:
                adjusted_score = score * 1.2
            else:
                adjusted_score = score
            
            keywords.append({
                "keyword": phrase_clean.title(),
                "score": min(100, round(adjusted_score * 5))
            })
            seen.add(phrase_lower)
            
            if len(keywords) >= top_n:
                break
        
        # Sort by score descending
        keywords.sort(key=lambda x: x["score"], reverse=True)
        
        return keywords
    except Exception as e:
        print(f"   ⚠️ Keyword error: {e}")
        return []


# --- ENHANCED MULTI-SOURCE TREND ANALYSIS ---
def get_unified_trends(keywords: List[str], period_months: int = 6) -> Dict[str, Any]:
    """
    UNIFIED TRENDS OBJECT - Single source of truth for all trend data.
    """
    global trends_cache, trends_last_request
    
    # Clean keywords
    clean_keywords = []
    for kw in keywords[:5]:  # Google Trends allows max 5
        kw_clean = kw.strip()
        if 2 <= len(kw_clean) <= 50:
            clean_keywords.append(kw_clean)
    
    primary_keyword = clean_keywords[0] if clean_keywords else "cybersecurity"
    cache_key = "_".join(clean_keywords[:3]).lower()
    
    # Unified result structure
    result = {
        # === SCORING ===
        "trend_score": 0,                    # Composite 0-100 (for ranking)
        "trend_direction": "stable",         # surging, rising, stable, falling, declining
        "change_percent": 0,                 # Week-over-week change
        
        # === GRAPH DATA (for plotting) ===
        "graph": {
            "period": f"Last {period_months} Months",
            "data_points": [],               # [{label: "2025-01-15", value: 75}, ...]
            "keywords_analyzed": clean_keywords,
            "aggregation_method": "composite_average"
        },
        
        # === PEAK DETECTION ===
        "peak": {
            "date": None,
            "value": 0,
            "is_current_peak": False         # True if peak is in last 2 weeks
        },
        
        # === SOURCE BREAKDOWN ===
        "sources": {
            "google": {
                "score": 0,
                "direction": "stable",
                "change_percent": 0,
                "raw_data": [],              # Full weekly data for detailed analysis
                "related_queries": [],
                "trending_regions": []
            },
            "reddit": {
                "score": 0,
                "posts_24h": 0,
                "sentiment": "neutral",
                "top_subreddits": []
            },
            "hackernews": {
                "score": 0,
                "posts_24h": 0,
                "avg_points": 0
            }
        },
        
        # === VIRALITY INDICATORS ===
        "virality": {
            "is_trending": False,
            "is_breakout": False,            # >50% spike
            "volume_level": "normal",        # low, normal, high, viral
            "momentum": "stable"             # accelerating, stable, decelerating
        },
        
        # === METADATA ===
        "primary_keyword": primary_keyword,
        "generated_at": datetime.now().isoformat(),
        "cached": False
    }
    
    if not clean_keywords:
        return result
    
    # Check cache (30 min validity)
    if cache_key in trends_cache:
        cached = trends_cache[cache_key]
        if time.time() - cached["timestamp"] < 1800:
            cached_result = cached["data"].copy()
            cached_result["cached"] = True
            print(f"   📊 Using cached trends for '{primary_keyword}'")
            return cached_result
    
    # ====== 1. GOOGLE TRENDS (Primary Source + Graph Data) ======
    google_score = _fetch_unified_google_trends(clean_keywords, result, period_months)
    
    # ====== 2. REDDIT SIGNALS ======
    reddit_score = _fetch_reddit_signals_unified(primary_keyword, result)
    
    # ====== 3. HACKER NEWS SIGNALS ======
    hn_score = _fetch_hackernews_signals_unified(primary_keyword, result)
    
    # ====== 4. CALCULATE COMPOSITE TREND SCORE ======
    # Weighted: Google 50%, Reddit 25%, HN 25%
    composite_score = (
        google_score * 0.50 +
        reddit_score * 0.25 +
        hn_score * 0.25
    )
    result["trend_score"] = int(min(100, max(0, composite_score)))
    
    # ====== 5. DETERMINE VIRALITY ======
    score = result["trend_score"]
    if score >= 90:
        result["virality"]["is_trending"] = True
        result["virality"]["volume_level"] = "viral"
    elif score >= 75:
        result["virality"]["is_trending"] = True
        result["virality"]["volume_level"] = "high"
    elif score >= 50:
        result["virality"]["volume_level"] = "high"
    elif score >= 25:
        result["virality"]["volume_level"] = "normal"
    else:
        result["virality"]["volume_level"] = "low"
    
    # Breakout detection
    if result["sources"]["google"]["change_percent"] > 50:
        result["virality"]["is_breakout"] = True
    
    # Momentum calculation
    change = result["sources"]["google"]["change_percent"]
    if change > 20:
        result["virality"]["momentum"] = "accelerating"
    elif change < -20:
        result["virality"]["momentum"] = "decelerating"
    
    # Sync top-level direction with Google
    result["trend_direction"] = result["sources"]["google"]["direction"]
    result["change_percent"] = result["sources"]["google"]["change_percent"]
    
    # Cache result
    trends_cache[cache_key] = {"data": result, "timestamp": time.time()}
    
    print(f"   📈 Trend Score: {result['trend_score']} (G:{google_score}, R:{reddit_score}, HN:{hn_score})")
    
    return result


def _fetch_unified_google_trends(keywords: List[str], result: Dict, period_months: int) -> int:
    """
    Fetch Google Trends with multi-keyword aggregation for graph plotting.
    Returns normalized score (0-100).
    """
    global trends_last_request
    
    # Rate limiting
    time_since_last = time.time() - trends_last_request
    if time_since_last < 3:
        time.sleep(3 - time_since_last)
    
    try:
        pt = get_pytrends()
        trends_last_request = time.time()
        
        # Batch request for all keywords
        timeframe = f"today {period_months}-m"
        
        # Try to build payload with better error handling
        try:
            pt.build_payload(keywords, cat=0, timeframe=timeframe, geo='', gprop='')
        except Exception as build_error:
            error_msg = str(build_error)
            if "400" in error_msg or "429" in error_msg or "rate limit" in error_msg.lower():
                print(f"   ⚠️ Google Trends blocked during payload build, using fallback")
                return _generate_fallback_trend_graph(keywords, result)
            raise  # Re-raise if it's a different error
        
        # Try to get interest data
        try:
            interest_df = pt.interest_over_time()
        except Exception as fetch_error:
            error_msg = str(fetch_error)
            if "400" in error_msg or "429" in error_msg or "rate limit" in error_msg.lower():
                print(f"   ⚠️ Google Trends blocked during data fetch, using fallback")
                return _generate_fallback_trend_graph(keywords, result)
            raise
        
        if interest_df.empty:
            print(f"   ⚠️ Google Trends returned empty data, using fallback")
            return _generate_fallback_trend_graph(keywords, result)
        
        # Drop isPartial column
        if 'isPartial' in interest_df.columns:
            interest_df = interest_df.drop(columns=['isPartial'])
        
        # Calculate composite score (average across all keywords per date)
        interest_df['composite'] = interest_df.mean(axis=1)
        
        dates = interest_df.index.tolist()
        composite_values = interest_df['composite'].values
        
        # Store raw data for detailed analysis
        for date, value in zip(dates, composite_values):
            result["sources"]["google"]["raw_data"].append({
                "date": date.strftime("%Y-%m-%d"),
                "value": int(value)
            })
        
        # === GENERATE GRAPH DATA POINTS (Downsampled ~10 points) ===
        total_points = len(dates)
        target_points = 10
        chunk_size = max(1, total_points // target_points)
        
        data_points = []
        peak_value = 0
        peak_date = None
        
        for i in range(0, total_points, chunk_size):
            chunk_end = min(i + chunk_size, total_points)
            chunk_values = composite_values[i:chunk_end]
            chunk_dates = dates[i:chunk_end]
            
            if len(chunk_values) == 0:
                continue
            
            # Max-pooling within chunk
            max_idx = chunk_values.argmax()
            max_value = int(chunk_values[max_idx])
            max_date = chunk_dates[max_idx]
            
            data_points.append({
                "label": max_date.strftime("%Y-%m-%d"),
                "value": max_value
            })
            
            if max_value > peak_value:
                peak_value = max_value
                peak_date = max_date.strftime("%Y-%m-%d")
        
        result["graph"]["data_points"] = data_points[-10:]
        result["peak"]["value"] = peak_value
        result["peak"]["date"] = peak_date
        
        # Check if peak is recent (within last 2 weeks)
        if peak_date and data_points:
            last_date = data_points[-1]["label"]
            result["peak"]["is_current_peak"] = (peak_date == last_date)
        
        # === CALCULATE SCORE & DIRECTION ===
        if len(composite_values) >= 4:
            recent_score = int(composite_values[-4:].mean())
        else:
            recent_score = int(composite_values.mean())
        
        result["sources"]["google"]["score"] = recent_score
        
        # Trend direction
        if len(composite_values) >= 8:
            recent = composite_values[-4:].mean()
            previous = composite_values[-8:-4].mean()
            if previous > 0:
                change = ((recent - previous) / previous) * 100
                result["sources"]["google"]["change_percent"] = round(change, 1)
                
                if change > 30:
                    result["sources"]["google"]["direction"] = "surging"
                elif change > 15:
                    result["sources"]["google"]["direction"] = "rising"
                elif change < -30:
                    result["sources"]["google"]["direction"] = "declining"
                elif change < -15:
                    result["sources"]["google"]["direction"] = "falling"
        
        # === FETCH RELATED QUERIES ===
        time.sleep(1)
        try:
            related = pt.related_queries()
            primary_kw = keywords[0]
            if primary_kw in related:
                rising = related[primary_kw].get('rising')
                if rising is not None and not rising.empty:
                    for _, row in rising.head(5).iterrows():
                        result["sources"]["google"]["related_queries"].append({
                            "query": row['query'],
                            "growth": str(row.get('value', 'N/A'))
                        })
        except:
            pass
        
        # === FETCH REGIONAL INTEREST ===
        time.sleep(1)
        try:
            pt.build_payload([keywords[0]], timeframe='now 7-d', geo='')
            regions = pt.interest_by_region(resolution='COUNTRY')
            if not regions.empty:
                top_regions = regions[keywords[0]].nlargest(5)
                for country, score in top_regions.items():
                    if score > 0:
                        result["sources"]["google"]["trending_regions"].append({
                            "country": country,
                            "interest": int(score)
                        })
        except:
            pass
        
        return recent_score
        
    except Exception as e:
        error_msg = str(e)
        if "400" in error_msg or "429" in error_msg or "rate limit" in error_msg.lower():
            print(f"   ⚠️ Google Trends rate limited/blocked, using fallback data from Reddit/HN")
            # Fallback: Generate synthetic graph data from Reddit/HN activity
            return _generate_fallback_trend_graph(keywords, result)
        else:
            print(f"   ⚠️ Google Trends error: {e}")
            return _generate_fallback_trend_graph(keywords, result)


def _generate_fallback_trend_graph(keywords: List[str], result: Dict) -> int:
    """
    Generate fallback trend graph data from Reddit/HN when Google Trends fails.
    Creates synthetic time-series data based on recent activity.
    """
    try:
        from datetime import timedelta
        
        # Get recent activity from Reddit/HN
        reddit_score = result["sources"]["reddit"].get("score", 0)
        hn_score = result["sources"]["hackernews"].get("score", 0)
        
        # Combine scores for base trend level
        base_score = int((reddit_score * 0.6 + hn_score * 0.4))
        
        # Generate synthetic data points for last 6 months (~26 weeks)
        data_points = []
        today = datetime.now()
        
        # Create ~10 data points with some variation
        for i in range(10):
            # Go back in time (most recent first)
            days_ago = (9 - i) * 18  # ~18 days per point
            date = today - timedelta(days=days_ago)
            
            # Add some variation: recent activity higher, older lower
            variation = base_score * (1.0 - (i * 0.05))  # Slight decline over time
            noise = variation * 0.1 * (0.5 - (i % 3) * 0.1)  # Small random variation
            
            value = max(0, min(100, int(variation + noise)))
            
            data_points.append({
                "label": date.strftime("%Y-%m-%d"),
                "value": value
            })
        
        result["graph"]["data_points"] = data_points
        result["graph"]["keywords_analyzed"] = keywords[:5]
        
        # Find peak
        if data_points:
            peak_point = max(data_points, key=lambda x: x["value"])
            result["peak"]["value"] = peak_point["value"]
            result["peak"]["date"] = peak_point["label"]
            result["peak"]["is_current_peak"] = (peak_point == data_points[-1])
        
        # Set score and direction
        result["sources"]["google"]["score"] = base_score
        result["sources"]["google"]["direction"] = "stable"
        result["sources"]["google"]["change_percent"] = 0
        
        # Store raw data for compatibility
        for dp in data_points:
            result["sources"]["google"]["raw_data"].append({
                "date": dp["label"],
                "value": dp["value"]
            })
        
        return base_score
        
    except Exception as e:
        print(f"   ⚠️ Fallback trend generation error: {e}")
        return 0


def _fetch_reddit_signals_unified(keyword: str, result: Dict) -> int:
    """Fetch Reddit signals. Returns normalized score (0-100)."""
    try:
        search_url = f"https://www.reddit.com/search.json?q={quote_plus(keyword)}&sort=new&limit=25&t=day"
        headers = {"User-Agent": "NewsAnalyzer/3.1"}
        
        response = requests.get(search_url, headers=headers, timeout=10)
        if response.status_code != 200:
            return 0
        
        data = response.json()
        posts = data.get("data", {}).get("children", [])
        
        post_count = len(posts)
        total_score = sum(p["data"].get("score", 0) for p in posts)
        avg_score = total_score / max(1, post_count)
        
        # Collect top subreddits
        subreddits = {}
        for p in posts:
            sub = p["data"].get("subreddit", "")
            subreddits[sub] = subreddits.get(sub, 0) + 1
        
        top_subs = sorted(subreddits.items(), key=lambda x: x[1], reverse=True)[:5]
        result["sources"]["reddit"]["top_subreddits"] = [s[0] for s in top_subs]
        result["sources"]["reddit"]["posts_24h"] = post_count
        
        # Simple sentiment from vote ratio
        if posts:
            avg_ratio = sum(p["data"].get("upvote_ratio", 0.5) for p in posts) / len(posts)
            if avg_ratio > 0.7:
                result["sources"]["reddit"]["sentiment"] = "positive"
            elif avg_ratio < 0.4:
                result["sources"]["reddit"]["sentiment"] = "negative"
        
        # Normalize: 25+ posts = 100, scale linearly
        normalized = min(100, (post_count / 25) * 100 + (avg_score / 100) * 20)
        result["sources"]["reddit"]["score"] = int(normalized)
        
        time.sleep(1)  # Rate limit
        return int(normalized)
        
    except Exception as e:
        print(f"   ⚠️ Reddit error: {e}")
        return 0


def _fetch_hackernews_signals_unified(keyword: str, result: Dict) -> int:
    """Fetch Hacker News signals. Returns normalized score (0-100)."""
    try:
        search_url = f"https://hn.algolia.com/api/v1/search_by_date?query={quote_plus(keyword)}&tags=story&hitsPerPage=25"
        
        response = requests.get(search_url, timeout=10)
        if response.status_code != 200:
            return 0
        
        data = response.json()
        hits = data.get("hits", [])
        
        # Filter to last 24h
        now = time.time()
        recent_posts = [h for h in hits if now - h.get("created_at_i", 0) < 86400]
        
        post_count = len(recent_posts)
        total_points = sum(h.get("points", 0) or 0 for h in recent_posts)
        avg_points = total_points / max(1, post_count)
        
        result["sources"]["hackernews"]["posts_24h"] = post_count
        result["sources"]["hackernews"]["avg_points"] = round(avg_points, 1)
        
        # Normalize: 10+ posts with avg 50+ points = 100
        normalized = min(100, (post_count / 10) * 50 + (avg_points / 50) * 50)
        result["sources"]["hackernews"]["score"] = int(normalized)
        
        return int(normalized)
        
    except Exception as e:
        print(f"   ⚠️ HN error: {e}")
        return 0


# --- COMPREHENSIVE AI ANALYSIS (GPT-4o) ---
def generate_ai_analysis(text: str, title: str, existing_keywords: List[Dict] = None) -> Dict[str, Any]:
    """
    Generate comprehensive AI analysis using GPT-4o.
    """
    
    default_result = {
        "content": {
            "title": title,
            "short_description": "",
            "long_description": "",
            "category": "Security"
        },
        "scores": {
            "confidence_score": 0,
            "relevance_score": 0,
            "sentiment_score": 0,
            "trend_score": 0
        },
        "metadata": {
            "keywords": [],
            "trend_keywords": [],
            "primary_company": None,
            "affected_regions": [],
            "actionable": False
        }
    }
    
    if not OPENAI_AVAILABLE or not OPENAI_API_KEY:
        print("   ⚠️ OpenAI not available, skipping AI analysis")
        return default_result
        
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        
        # Prepare context
        keyword_str = ", ".join([k["keyword"] for k in (existing_keywords or [])[:5]])
        
        prompt = f"""
        Analyze this cybersecurity news article.
        
        Title: {title}
        Keywords: {keyword_str}
        Content: {text[:4000]}
        
        Return a JSON object with:
        1. scores:
           - confidence_score (0-100): How factual/reliable?
           - relevance_score (0-100): Impact on tech industry?
           - sentiment_score (-100 to 100): Negative (breach) to Positive (launch)
        2. content:
           - short_description: 2 sentences max (for cards)
           - long_description: 4-5 sentences (detailed summary)
           - category: Choose ONE from [Security, Product Launch, Legal, Market, AI, DevOps]
        3. metadata:
           - keywords: List of 3-5 key entities/topics
           - trend_keywords: List of 3-5 terms for Google Trends search
           - primary_company: Main company involved (or null)
           - affected_regions: List of 2-letter country codes (e.g. US, CN)
           - actionable: boolean (true if reader needs to patch/act)
        """
        
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a cybersecurity analyst. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3
        )
        
        result = json.loads(response.choices[0].message.content)
        
        # Merge with default structure to ensure all fields exist
        merged = default_result.copy()
        merged.update(result)
        
        return merged
        
    except Exception as e:
        print(f"   ⚠️ AI Analysis error: {e}")
        return default_result


# --- ENHANCED ANALYSIS PIPELINE ---
def analyze_article(article_id: str, force: bool = False) -> Dict[str, Any]:
    """
    Run comprehensive AI analysis on article.
    """
    # Import scraper here to avoid circular dependency
    from scraper import scrape_article_details
    
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute("SELECT * FROM articles WHERE id = ?", (article_id,))
    row = c.fetchone()
    
    if not row:
        conn.close()
        return {"error": "Article not found"}
    
    article = dict(row)
    
    if article.get("analyzed_at") and not force:
        conn.close()
        return {"message": "Already analyzed"}
    
    print(f"\n🔍 Analyzing: {article['title'][:50]}...")
    
    # ====== STEP 1: Scrape article details ======
    print("   📰 Scraping full content...")
    details = scrape_article_details(article["url"])
    
    if len(details["full_text"]) > len(article.get("full_text") or ""):
        article["full_text"] = details["full_text"]
    
    article["author"] = details["author"]
    article["category"] = details["category"]
    article["tags"] = details["tags"]
    article["sources"] = details["sources"]
    article["reading_time"] = details["reading_time"]
    article["image_url"] = details["image_url"]
    article["media_type"] = details["media_type"]
    
    # ====== STEP 2: Extract keywords ======
    print("   🔑 Extracting keywords...")
    keywords = extract_keywords(article["full_text"], top_n=8)
    article["keywords"] = keywords
    
    # ====== STEP 3: GPT-4o AI Analysis ======
    print("   🤖 Running AI analysis (GPT-4o)...")
    ai_analysis = generate_ai_analysis(
        text=article["full_text"],
        title=article["title"],
        existing_keywords=keywords
    )
    
    # Extract scores and descriptions from AI analysis
    confidence_score = ai_analysis["scores"]["confidence_score"]
    relevance_score = ai_analysis["scores"]["relevance_score"]
    sentiment_score = ai_analysis["scores"]["sentiment_score"]
    short_description = ai_analysis["content"]["short_description"]
    long_description = ai_analysis["content"]["long_description"]
    ai_category = ai_analysis["content"]["category"]
    actionable = ai_analysis["metadata"]["actionable"]
    ai_keywords = ai_analysis["metadata"]["keywords"]
    
    # Merge AI keywords with RAKE keywords
    if ai_keywords:
        keyword_set = {kw["keyword"].lower() for kw in keywords}
        for ai_kw in ai_keywords:
            if ai_kw.lower() not in keyword_set:
                keywords.append({"keyword": ai_kw, "score": 50})
    
    article["ai_analysis"] = ai_analysis
    
    # ====== STEP 4: Multi-source Trend Analysis ======
    print("   📈 Fetching trend data...")
    
    # Use AI-extracted trend keywords (preferred) or build from other sources
    trend_keywords = ai_analysis["metadata"].get("trend_keywords", [])
    
    # If no AI trend keywords, fall back to regular keywords
    if not trend_keywords:
        if ai_keywords:
            trend_keywords = ai_keywords[:3]
    
    # Add well-known trending terms from title
    known_trending_terms = {
        'phishing', 'ransomware', 'malware', 'hacking', 'cybersecurity', 'data breach',
        'vulnerability', 'exploit', 'zero-day', 'microsoft', 'google', 'apple', 'android',
        'ios', 'chrome', 'windows', 'linux', 'bitcoin', 'cryptocurrency', 'ai', 'chatgpt',
        'openai', 'hacker', 'privacy', 'encryption', 'vpn', 'firewall', 'antivirus',
        'password', 'authentication', 'security', 'cyber attack', 'threat', 'botnet',
        'crowdstrike', 'cloudflare', 'aws', 'azure', 'nvidia', 'meta', 'facebook'
    }
    
    title_lower = article["title"].lower()
    for term in known_trending_terms:
        if term in title_lower and term.title() not in trend_keywords:
            trend_keywords.insert(0, term.title() if len(term) > 3 else term.upper())
            break
    
    # Add RAKE keywords as fallback
    for kw in keywords:
        if len(trend_keywords) >= 5:
            break
        kw_text = kw["keyword"]
        if len(kw_text.split()) <= 2 and len(kw_text) >= 3:
            if kw_text not in trend_keywords:
                trend_keywords.append(kw_text)
    
    # Fallback: category-based term
    if not trend_keywords:
        cat = article.get("category", {})
        cat_name = cat.get("name", "") if isinstance(cat, dict) else ""
        cat_to_term = {
            "Phishing": "Phishing", "Malware": "Malware", "Ransomware": "Ransomware",
            "Vulnerability": "Security Vulnerability", "Data Breach": "Data Breach",
            "AI & Machine Learning": "AI Security", "Mobile Security": "Mobile Security"
        }
        trend_keywords.append(cat_to_term.get(cat_name, "Cybersecurity"))
    
    # ====== STEP 4b: Get UNIFIED Trends (Score + Graph in one call) ======
    print("   📊 Fetching unified trends data...")
    trends = get_unified_trends(trend_keywords, period_months=6)
    
    # Extract trend_score for AI analysis
    trend_score = trends.get("trend_score", 0)
    ai_analysis["scores"]["trend_score"] = trend_score
    
    # Store the unified trends object (contains everything: score, graph, sources, virality)
    article["trends"] = trends
    
    # ====== STEP 6: Extract Tech Stack ======
    print("   🔧 Extracting tech stack...")
    tech_stack = extract_tech_stack(article["full_text"], keywords)
    article["tech_stack"] = tech_stack
    
    # ====== STEP 7: Fetch Market Data (if primary company identified) ======
    primary_company = ai_analysis["metadata"].get("primary_company")
    market_data = None
    if primary_company:
        print(f"   💹 Fetching market data for {primary_company}...")
        market_data = fetch_market_data(primary_company)
    article["market_data"] = market_data
    
    # ====== STEP 5: Generate Geo Impact (uses AI regions + trends data) ======
    print("   🌍 Generating geo impact...")
    geo_impact = generate_geo_impact(ai_analysis, article["full_text"], article["title"], trends)
    article["geo_impact"] = geo_impact
    
    # ====== STEP 9: Generate Actions (Jira, Slack) ======
    print("   📋 Generating actions...")
    actions = generate_actions(ai_analysis, article["title"], keywords)
    article["actions"] = actions
    
    # ====== STEP 10: Build Enrichment Object ======
    enrichment = {
        "tech_stack": tech_stack,
        "market_data": market_data
    }
    article["enrichment"] = enrichment
    
    # ====== STEP 11: Legacy summary (for backward compatibility) ======
    summary = {
        "summary": short_description,
        "key_points": [long_description]
    }
    
    # ====== UPDATE DATABASE ======
    c.execute('''
        UPDATE articles SET
            full_text = ?,
            author = ?,
            category = ?,
            tags_json = ?,
            sources_json = ?,
            keywords_json = ?,
            trends_json = ?,
            ai_summary_json = ?,
            image_url = ?,
            media_type = ?,
            analyzed_at = ?,
            -- AI analysis fields --
            ai_analysis_json = ?,
            confidence_score = ?,
            relevance_score = ?,
            sentiment_score = ?,
            trend_score = ?,
            short_description = ?,
            long_description = ?,
            ai_category = ?,
            actionable = ?,
            -- Enrichment fields (v3.1) --
            trend_graph_json = ?,
            geo_impact_json = ?,
            tech_stack_json = ?,
            market_data_json = ?,
            actions_json = ?,
            enrichment_json = ?
        WHERE id = ?
    ''', (
        article["full_text"],
        article["author"],
        json.dumps(article["category"]),
        json.dumps(article["tags"]),
        json.dumps(details["sources"]),
        json.dumps(keywords),
        json.dumps(trends),  # Now stores unified trends object
        json.dumps(summary),
        article["image_url"],
        article["media_type"],
        datetime.now().isoformat(),
        # AI analysis fields
        json.dumps(ai_analysis),
        confidence_score,
        relevance_score,
        sentiment_score,
        trend_score,
        short_description,
        long_description,
        ai_category,
        1 if actionable else 0,
        # Enrichment fields (v3.1)
        json.dumps(trends),  # Store unified trends (includes graph data)
        json.dumps(geo_impact),
        json.dumps(tech_stack),
        json.dumps(market_data) if market_data else None,
        json.dumps(actions),
        json.dumps(enrichment),
        article_id
    ))
    
    conn.commit()
    conn.close()
    
    print(f"   ✅ Analysis complete!")
    print(f"      📊 Scores: Conf={confidence_score}, Rel={relevance_score}, Sent={sentiment_score}, Trend={trend_score}")
    print(f"      🏷️ Category: {ai_category} | Actionable: {actionable}")
    
    # Rate limit protection
    time.sleep(random.uniform(3, 5))
    
    return article


# --- HELPER FUNCTIONS FOR ANALYSIS ---

def extract_tech_stack(text: str, keywords: List[Dict]) -> List[str]:
    """Extract tech stack mentions."""
    tech_stack = []
    common_tech = {
        'python', 'javascript', 'java', 'c++', 'rust', 'go', 'php', 'ruby',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'linux', 'windows',
        'android', 'ios', 'react', 'angular', 'vue', 'node.js', 'django',
        'flask', 'spring', 'postgresql', 'mysql', 'mongodb', 'redis',
        'elasticsearch', 'kafka', 'rabbitmq', 'tensorflow', 'pytorch'
    }
    
    text_lower = text.lower()
    
    # Check common tech list
    for tech in common_tech:
        if f" {tech} " in f" {text_lower} ":
            tech_stack.append(tech)
            
    # Check keywords
    for kw in keywords:
        if kw["keyword"].lower() in common_tech:
            if kw["keyword"].lower() not in tech_stack:
                tech_stack.append(kw["keyword"].lower())
                
    return list(set(tech_stack))[:10]


def fetch_market_data(company_key: str) -> Dict[str, Any]:
    """
    Fetch real-time stock market data using Yahoo Finance.
    """
    result = None
    
    if not company_key:
        return result
    
    company_key_lower = company_key.lower()
    company_info = None
    
    # Look up company in our mappings
    for key, info in COMPANY_TICKERS.items():
        if key in company_key_lower:
            company_info = info
            break
    
    if not company_info or not company_info.get("ticker"):
        return result
    
    ticker_symbol = company_info["ticker"]
    
    # Check if yfinance is available (imported in main, but we need to check here or import it)
    try:
        import yfinance as yf
        YFINANCE_AVAILABLE = True
    except ImportError:
        YFINANCE_AVAILABLE = False
    
    if not YFINANCE_AVAILABLE:
        # Return static data without live price
        return {
            "ticker": ticker_symbol,
            "company_name": company_info["name"],
            "change_percent": None,
            "last_price": None,
            "currency": "USD",
            "market_status": "Unknown",
            "logo_url": f"https://logo.clearbit.com/{company_info['domain']}"
        }
    
    try:
        ticker = yf.Ticker(ticker_symbol)
        fast_info = ticker.fast_info
        
        last_price = fast_info.get('lastPrice', 0)
        prev_close = fast_info.get('previousClose', 0)
        
        change_percent = 0
        if prev_close > 0:
            change_percent = round(((last_price - prev_close) / prev_close) * 100, 2)
        
        # Determine market status
        market_status = "Closed"
        try:
            if hasattr(fast_info, 'market_state'):
                market_status = fast_info.market_state
            else:
                # Simple heuristic: US markets open 9:30-16:00 ET (14:30-21:00 UTC)
                now_utc = datetime.utcnow()
                hour_utc = now_utc.hour
                weekday = now_utc.weekday()
                if weekday < 5 and 14 <= hour_utc < 21:
                    market_status = "Open"
        except:
            pass
        
        result = {
            "ticker": ticker_symbol,
            "company_name": company_info["name"],
            "change_percent": change_percent,
            "last_price": round(last_price, 2) if last_price else None,
            "currency": fast_info.get('currency', 'USD'),
            "market_status": market_status,
            "logo_url": f"https://logo.clearbit.com/{company_info['domain']}"
        }
        
        return result
        
    except Exception as e:
        print(f"   ⚠️ Market data error: {e}")
        return None


def generate_geo_impact(ai_analysis: Dict, text: str, title: str, trends: Dict) -> Dict[str, Any]:
    """Generate geo impact data."""
    affected_regions = ai_analysis["metadata"].get("affected_regions", [])
    
    # If no regions from AI, try to detect from text
    if not affected_regions:
        for code, name in COUNTRY_DATA.items():
            if name.lower() in text.lower() or name.lower() in title.lower():
                affected_regions.append(code)
    
    # Add trending regions from Google Trends
    trending_regions = trends.get("sources", {}).get("google", {}).get("trending_regions", [])
    for region in trending_regions:
        if region["country"] in COUNTRY_DATA and region["country"] not in affected_regions:
            affected_regions.append(region["country"])
            
    # Default to US/Global if nothing found
    if not affected_regions:
        affected_regions = ["US"]
        
    return {
        "regions": affected_regions,
        "primary_region": affected_regions[0] if affected_regions else "US",
        "scope": "Global" if len(affected_regions) > 2 else "Regional"
    }


def generate_actions(ai_analysis: Dict, title: str, keywords: List[Dict]) -> List[Dict[str, Any]]:
    """Generate actionable items."""
    actions = []
    
    if ai_analysis["metadata"].get("actionable"):
        actions.append({
            "type": "patch",
            "title": "Check for Updates",
            "description": "Verify if your systems are affected and apply latest patches.",
            "priority": "High"
        })
        
    # Add generic actions based on keywords
    kw_text = " ".join([k["keyword"].lower() for k in keywords])
    
    if "phishing" in kw_text:
        actions.append({
            "type": "alert",
            "title": "Warn Employees",
            "description": "Send alert about new phishing campaign.",
            "priority": "Medium"
        })
        
    if "ransomware" in kw_text:
        actions.append({
            "type": "backup",
            "title": "Verify Backups",
            "description": "Ensure offline backups are up to date.",
            "priority": "Critical"
        })
        
    return actions


def analyze_all_articles(limit: int = 50) -> Dict[str, Any]:
    """Analyze multiple articles in background."""
    conn = get_db_connection()
    c = conn.cursor()
    
    # Find unanalyzed articles
    c.execute("SELECT id FROM articles WHERE analyzed_at IS NULL OR analyzed_at = '' LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    
    results = {"analyzed": 0, "errors": 0}
    
    for row in rows:
        try:
            analyze_article(row["id"])
            results["analyzed"] += 1
        except Exception as e:
            print(f"Error analyzing {row['id']}: {e}")
            results["errors"] += 1
            
    return results
