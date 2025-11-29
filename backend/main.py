import sqlite3
import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any
from urllib.parse import urlparse
import time
import random
import json
import re
import os

# NLP & Keywords
import nltk
from rake_nltk import Rake

# Google Trends
from pytrends.request import TrendReq

# OpenAI (optional)
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

# Download NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)
try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab', quiet=True)
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

# ================= CONFIGURATION =================
BASE_URL = "https://thehackernews.com"
DB_FILE = "hackernews.db"
OUTPUT_JSON = "articles_enriched.json"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Referer": "https://thehackernews.com/",
}

# Rate limiting settings
REQUEST_DELAY_MIN = 1.0  # Minimum delay between requests in seconds
REQUEST_DELAY_MAX = 2.5  # Maximum delay between requests in seconds
PAGE_DELAY_MIN = 2.0     # Minimum delay between pagination requests
PAGE_DELAY_MAX = 4.0     # Maximum delay between pagination requests

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# ================= CATEGORIES =================
CATEGORIES = {
    "malware": {
        "name": "Malware",
        "keywords": ["malware", "virus", "trojan", "worm", "spyware", "adware", "rootkit", "keylogger", "botnet", "backdoor"]
    },
    "vulnerability": {
        "name": "Vulnerability",
        "keywords": ["vulnerability", "cve", "zero-day", "0-day", "exploit", "bug", "flaw", "patch", "security hole", "rce", "remote code execution"]
    },
    "data_breach": {
        "name": "Data Breach",
        "keywords": ["data breach", "leak", "exposed", "stolen data", "compromised", "data theft", "records exposed", "personal data"]
    },
    "ransomware": {
        "name": "Ransomware",
        "keywords": ["ransomware", "ransom", "encrypt", "decryptor", "extortion", "lockbit", "blackcat", "alphv", "conti"]
    },
    "phishing": {
        "name": "Phishing",
        "keywords": ["phishing", "social engineering", "scam", "fraud", "fake", "impersonation", "credential theft", "bec", "business email"]
    },
    "apt": {
        "name": "APT & Nation-State",
        "keywords": ["apt", "nation-state", "state-sponsored", "espionage", "cyber espionage", "threat actor", "campaign", "lazarus", "cozy bear", "fancy bear"]
    },
    "privacy": {
        "name": "Privacy",
        "keywords": ["privacy", "gdpr", "data protection", "surveillance", "tracking", "cookies", "consent", "personal information"]
    },
    "cloud": {
        "name": "Cloud Security",
        "keywords": ["cloud", "aws", "azure", "gcp", "kubernetes", "docker", "container", "saas", "iaas", "paas", "misconfiguration"]
    },
    "mobile": {
        "name": "Mobile Security",
        "keywords": ["android", "ios", "mobile", "smartphone", "app", "play store", "app store", "mobile malware"]
    },
    "iot": {
        "name": "IoT & Hardware",
        "keywords": ["iot", "internet of things", "smart device", "firmware", "hardware", "embedded", "router", "camera", "sensor"]
    },
    "crypto": {
        "name": "Cryptocurrency",
        "keywords": ["crypto", "cryptocurrency", "bitcoin", "ethereum", "blockchain", "wallet", "defi", "nft", "exchange hack"]
    },
    "ai": {
        "name": "AI & Machine Learning",
        "keywords": ["ai", "artificial intelligence", "machine learning", "llm", "chatgpt", "gpt", "deep learning", "neural", "model"]
    },
    "regulation": {
        "name": "Law & Regulation",
        "keywords": ["law", "regulation", "compliance", "legal", "court", "arrest", "indictment", "sanctions", "fine", "penalty", "fbi", "doj"]
    },
    "enterprise": {
        "name": "Enterprise Security",
        "keywords": ["enterprise", "corporate", "business", "organization", "company", "siem", "soc", "incident response", "threat detection"]
    },
    "authentication": {
        "name": "Authentication",
        "keywords": ["authentication", "password", "mfa", "2fa", "passkey", "biometric", "login", "sso", "identity", "oauth"]
    }
}

DEFAULT_CATEGORY = {"name": "Security News", "id": "security_news"}
# =================================================

scheduler = BackgroundScheduler()
pytrends = None
favicon_cache = {}
trends_cache = {}  # Cache for Google Trends data
trends_last_request = 0  # Timestamp of last trends request


def get_pytrends():
    """Lazy initialization of Google Trends client."""
    global pytrends
    if pytrends is None:
        pytrends = TrendReq(hl='en-US', tz=360, timeout=(10, 25))
    return pytrends


def get_favicon_url(url: str) -> str:
    """Get favicon URL using Google's service."""
    try:
        parsed = urlparse(url)
        if domain := parsed.netloc:
            return f"https://www.google.com/s2/favicons?domain={domain}&sz=32"
    except:
        pass
    return "https://www.google.com/s2/favicons?domain=example.com&sz=32"


def get_domain_name(url: str) -> str:
    """Extract domain from URL."""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc
        return domain[4:] if domain.startswith('www.') else domain
    except:
        return "Unknown"


def detect_category(title: str, text: str) -> Dict[str, str]:
    """Detect article category from content."""
    combined = (title + " " + text[:2000]).lower()
    
    scores = {}
    for cat_id, cat_info in CATEGORIES.items():
        score = 0
        for keyword in cat_info["keywords"]:
            count = combined.count(keyword.lower())
            if keyword.lower() in title.lower():
                count += 3
            score += count
        if score > 0:
            scores[cat_id] = score
    
    if scores:
        best_cat = max(scores, key=scores.get)
        return {"id": best_cat, "name": CATEGORIES[best_cat]["name"]}
    
    return DEFAULT_CATEGORY


# --- DATABASE SETUP ---
def init_db():
    """Initialize database."""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    c.execute('''
        CREATE TABLE IF NOT EXISTS articles (
            id TEXT PRIMARY KEY,
            title TEXT,
            url TEXT,
            published TEXT,
            image_url TEXT,
            media_type TEXT,
            full_text TEXT,
            ai_summary_json TEXT,
            is_new BOOLEAN,
            author TEXT,
            category TEXT,
            tags_json TEXT,
            sources_json TEXT,
            keywords_json TEXT,
            trends_json TEXT,
            analyzed_at TEXT
        )
    ''')
    
    new_columns = [
        ("author", "TEXT"), ("category", "TEXT"), ("tags_json", "TEXT"), ("sources_json", "TEXT"),
        ("keywords_json", "TEXT"), ("trends_json", "TEXT"), ("analyzed_at", "TEXT"), ("media_type", "TEXT")
    ]
    
    c.execute("PRAGMA table_info(articles)")
    existing = {row[1] for row in c.fetchall()}
    
    for col_name, col_type in new_columns:
        if col_name not in existing:
            try:
                c.execute(f"ALTER TABLE articles ADD COLUMN {col_name} {col_type}")
            except:
                pass
    
    conn.commit()
    conn.close()
    print("✅ Database initialized")


# --- ENHANCED ARTICLE SCRAPING ---
def scrape_article_details(url: str) -> Dict[str, Any]:
    """Scrape full article content with images, author, etc."""
    result = {
        "full_text": "",
        "author": None,
        "category": None,
        "tags": [],
        "sources": [],
        "reading_time": 0,
        "image_url": None,
        "media_type": "none"
    }
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(response.content, "lxml")
        
        # --- Extract Featured Image ---
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            img_url = og_image.get("content")
            result["image_url"] = img_url
            result["media_type"] = "gif" if ".gif" in img_url.lower() else "image"
        
        if not result["image_url"]:
            twitter_img = soup.find("meta", {"name": "twitter:image"})
            if twitter_img and twitter_img.get("content"):
                result["image_url"] = twitter_img.get("content")
                result["media_type"] = "image"
        
        # Check for video embeds
        video_iframe = soup.find("iframe", src=lambda x: x and ("youtube" in x or "vimeo" in x))
        if video_iframe:
            video_src = video_iframe.get("src", "")
            if "youtube" in video_src:
                video_id_match = re.search(r'(?:embed/|v=|vi=)([a-zA-Z0-9_-]{11})', video_src)
                if video_id_match:
                    result["image_url"] = f"https://img.youtube.com/vi/{video_id_match.group(1)}/maxresdefault.jpg"
                    result["media_type"] = "video"
        
        # Fallback to first article image
        if not result["image_url"]:
            article_body = soup.find("div", {"id": "articlebody"}) or soup.find("div", class_="post-body")
            if article_body:
                first_img = article_body.find("img")
                if first_img:
                    img_url = first_img.get("data-src") or first_img.get("src")
                    if img_url and not img_url.endswith(('.svg', '.ico')):
                        result["image_url"] = img_url
                        result["media_type"] = "gif" if ".gif" in img_url.lower() else "image"
        
        # --- Extract Author (FIXED - using span.author) ---
        # The Hacker News has multiple <span class="author"> - first is date, second is actual author
        author_spans = soup.find_all("span", class_="author")
        for author_span in author_spans:
            author_text = author_span.get_text(strip=True)
            if author_text and len(author_text) > 3:
                # Skip if it looks like a date (contains month names or just digits/commas)
                date_patterns = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                is_date = any(month in author_text for month in date_patterns)
                # Also check if it's mostly numbers (like "Nov 28, 2025")
                if not is_date and not re.match(r'^[A-Za-z]{3}\s+\d{1,2},\s+\d{4}$', author_text):
                    result["author"] = author_text
                    break
                elif not is_date:
                    # Still might be an author name
                    continue
        
        # Fallback methods if span.author not found or was all dates
        if not result["author"]:
            # Try link with rel="author"
            author_link = soup.find("a", rel="author")
            if author_link:
                result["author"] = author_link.get_text(strip=True)
        
        if not result["author"]:
            # Try JSON-LD
            for script_ld in soup.find_all("script", {"type": "application/ld+json"}):
                try:
                    ld_data = json.loads(script_ld.string)
                    if isinstance(ld_data, dict):
                        author_data = ld_data.get("author")
                        if isinstance(author_data, dict):
                            name = author_data.get("name", "").strip()
                            if name and name != "The Hacker News":
                                result["author"] = name
                                break
                except:
                    pass
        
        # --- Extract Tags (using span.p-tags) ---
        # The Hacker News uses: <span class="p-tags">Malware / Vulnerability</span>
        tags_span = soup.find("span", class_="p-tags")
        if tags_span:
            tags_text = tags_span.get_text(strip=True)
            # Split by " / " to get individual tags
            if tags_text:
                result["tags"] = [tag.strip() for tag in tags_text.split("/") if tag.strip()]
        else:
            result["tags"] = []
        
        # --- Extract Article Body ---
        body = soup.find("div", {"id": "articlebody"}) or soup.find("div", class_="articlebody") or soup.find("div", class_="post-body") or soup.find("article")
        
        if body:
            for elem in body.find_all(['script', 'style', 'aside', 'nav', 'iframe', 'ins', 'noscript']):
                elem.decompose()
            
            full_text = body.get_text(separator=" ", strip=True)
            result["full_text"] = full_text
            result["reading_time"] = max(1, round(len(full_text.split()) / 200))
            
            # Extract sources
            seen_domains = set()
            for link in body.find_all('a', href=True):
                href = link.get('href', '')
                text = link.get_text(strip=True)
                
                if not href or href.startswith('#') or href.startswith('javascript:'):
                    continue
                if 'thehackernews.com' in href and '/20' not in href:
                    continue
                
                if href.startswith('/'):
                    href = f"https://thehackernews.com{href}"
                
                domain = get_domain_name(href)
                if domain in seen_domains:
                    continue
                if any(ext in href.lower() for ext in ['.gif', '.jpg', '.png', '.svg', '.webp', '.mp4']):
                    continue
                
                seen_domains.add(domain)
                result["sources"].append({
                    "name": text[:80] if text else domain,
                    "url": href,
                    "domain": domain,
                    "favicon": get_favicon_url(href)
                })
            
            result["sources"] = result["sources"][:15]
            
            # Detect category
            title_tag = soup.find("title")
            title = title_tag.get_text(strip=True) if title_tag else ""
            result["category"] = detect_category(title, full_text)
        
        if not result["category"]:
            title_tag = soup.find("title")
            if title_tag:
                result["category"] = detect_category(title_tag.get_text(strip=True), "")
        
        if not result["full_text"]:
            meta_desc = soup.find("meta", {"name": "description"})
            if meta_desc:
                result["full_text"] = meta_desc.get("content", "")
                
    except Exception as e:
        print(f"   ⚠️ Error scraping {url}: {e}")
        result["full_text"] = "Content unavailable."
        result["category"] = DEFAULT_CATEGORY
    
    return result


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


# --- ENHANCED GOOGLE TRENDS WITH CACHING ---
def get_trends_data(keyword: str) -> Dict[str, Any]:
    """
    Get Google Trends data with 1-year graph data.
    Includes caching and rate limit protection.
    """
    global trends_cache, trends_last_request
    
    result = {
        "keyword": keyword,
        "trend_score": 0,
        "trend_direction": "stable",
        "change_percent": 0,
        "peak_value": 0,
        "peak_date": None,
        "graph_data": [],
        "recommended": []
    }
    
    if not keyword:
        return result
    
    keyword_lower = keyword.lower()
    
    # Check cache first (cache valid for 1 hour)
    if keyword_lower in trends_cache:
        cached = trends_cache[keyword_lower]
        if time.time() - cached["timestamp"] < 3600:  # 1 hour cache
            print(f"   📊 Using cached trends for '{keyword}'")
            return cached["data"]
    
    # Rate limiting: wait at least 3 seconds between requests
    time_since_last = time.time() - trends_last_request
    if time_since_last < 3:
        time.sleep(3 - time_since_last)
    
    try:
        pt = get_pytrends()
        trends_last_request = time.time()
        
        # Get 12 months of data
        pt.build_payload([keyword], cat=0, timeframe="today 12-m", geo='', gprop='')
        
        interest_df = pt.interest_over_time()
        
        if not interest_df.empty and keyword in interest_df.columns:
            values = interest_df[keyword].values
            dates = interest_df.index
            
            # Build graph data
            for date, value in zip(dates, values):
                result["graph_data"].append({
                    "date": date.strftime("%Y-%m-%d"),
                    "value": int(value)
                })
            
            # Calculate scores
            if len(values) >= 4:
                result["trend_score"] = int(values[-4:].mean())
            else:
                result["trend_score"] = int(values.mean())
            
            peak_idx = values.argmax()
            result["peak_value"] = int(values[peak_idx])
            result["peak_date"] = dates[peak_idx].strftime("%Y-%m-%d")
            
            if len(values) >= 8:
                recent = values[-4:].mean()
                previous = values[-8:-4].mean()
                if previous > 0:
                    change = ((recent - previous) / previous) * 100
                    result["change_percent"] = round(change, 1)
                    if change > 10:
                        result["trend_direction"] = "rising"
                    elif change < -10:
                        result["trend_direction"] = "falling"
        
        # Get related queries (with delay)
        time.sleep(1)
        try:
            related = pt.related_queries()
            if keyword in related:
                rising = related[keyword].get('rising')
                if rising is not None and not rising.empty:
                    for _, row in rising.head(5).iterrows():
                        result["recommended"].append({
                            "topic": row['query'],
                            "type": "rising",
                            "growth": str(row.get('value', 'N/A'))
                        })
                
                if len(result["recommended"]) < 5:
                    top = related[keyword].get('top')
                    if top is not None and not top.empty:
                        for _, row in top.head(5 - len(result["recommended"])).iterrows():
                            result["recommended"].append({
                                "topic": row['query'],
                                "type": "top",
                                "score": int(row.get('value', 0))
                            })
        except:
            pass
        
        # Cache the result
        trends_cache[keyword_lower] = {"data": result, "timestamp": time.time()}
        
        return result
        
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg:
            print(f"   ⚠️ Rate limited for '{keyword}' - using fallback")
            # On rate limit, wait longer and return empty result
            time.sleep(5)
        else:
            print(f"   ⚠️ Trends error for '{keyword}': {e}")
        return result


# --- AI SUMMARIZATION ---
def generate_summary(text: str, title: str) -> Dict[str, Any]:
    """Generate summary."""
    summary_result = {"summary": "", "key_points": [], "generated_by": "extractive"}
    
    if not text or text == "Content unavailable.":
        summary_result["summary"] = "Article content not available."
        return summary_result
    
    if OPENAI_AVAILABLE and OPENAI_API_KEY:
        try:
            client = OpenAI(api_key=OPENAI_API_KEY)
            prompt = f"""Summarize this news article:

Title: {title}
Article: {text[:3500]}

JSON response:
{{"summary": "2-3 sentences", "key_points": ["point1", "point2", "point3"]}}"""

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "system", "content": "News summarizer. JSON only."}, {"role": "user", "content": prompt}],
                temperature=0.3, max_tokens=400
            )
            
            result_text = response.choices[0].message.content.strip()
            if result_text.startswith("```"):
                result_text = re.sub(r'^```(?:json)?\n?', '', result_text)
                result_text = re.sub(r'\n?```$', '', result_text)
            
            ai_result = json.loads(result_text)
            ai_result["generated_by"] = "openai"
            return ai_result
        except Exception as e:
            print(f"   ⚠️ OpenAI error: {e}")
    
    # Fallback: Extractive
    try:
        sentences = nltk.sent_tokenize(text)
        summary_result["summary"] = " ".join(sentences[:3])
        if len(sentences) > 3:
            summary_result["key_points"] = [s.strip() for s in sentences[3:6] if 20 < len(s) < 300][:3]
    except:
        summary_result["summary"] = text[:500] + "..."
    
    return summary_result


# --- ANALYSIS PIPELINE ---
def analyze_article(article_id: str, force: bool = False) -> Dict[str, Any]:
    """Run full analysis on article."""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
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
    
    print("   📰 Scraping...")
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
    
    print("   🔑 Keywords...")
    keywords = extract_keywords(article["full_text"], top_n=8)
    article["keywords"] = keywords
    
    print("   📈 Trends...")
    # Find a good keyword for trends - use common, searchable terms
    trend_keyword = None
    
    # Priority: Use well-known tech/security terms that have Google Trends data
    known_trending_terms = {
        'phishing', 'ransomware', 'malware', 'hacking', 'cybersecurity', 'data breach',
        'vulnerability', 'exploit', 'zero-day', 'microsoft', 'google', 'apple', 'android',
        'ios', 'chrome', 'windows', 'linux', 'bitcoin', 'cryptocurrency', 'ai', 'chatgpt',
        'openai', 'hacker', 'privacy', 'encryption', 'vpn', 'firewall', 'antivirus',
        'password', 'authentication', 'security', 'cyber attack', 'threat', 'botnet'
    }
    
    # Check title for known trending terms
    title_lower = article["title"].lower()
    for term in known_trending_terms:
        if term in title_lower:
            trend_keyword = term.title() if len(term) > 3 else term.upper()
            break
    
    # If not found in title, check keywords
    if not trend_keyword:
        for kw in keywords:
            kw_lower = kw["keyword"].lower()
            for term in known_trending_terms:
                if term in kw_lower:
                    trend_keyword = term.title() if len(term) > 3 else term.upper()
                    break
            if trend_keyword:
                break
    
    # Fallback: use first single-word keyword or a key title word
    if not trend_keyword:
        for kw in keywords:
            words = kw["keyword"].split()
            if len(words) == 1 and len(kw["keyword"]) >= 5:
                trend_keyword = kw["keyword"]
                break
    
    # Final fallback: use category-based term
    if not trend_keyword:
        cat = article.get("category", {})
        cat_name = cat.get("name", "") if isinstance(cat, dict) else ""
        cat_to_term = {
            "Phishing": "Phishing", "Malware": "Malware", "Ransomware": "Ransomware",
            "Vulnerability": "Security Vulnerability", "Data Breach": "Data Breach",
            "AI & Machine Learning": "AI Security", "Mobile Security": "Mobile Security"
        }
        trend_keyword = cat_to_term.get(cat_name, "Cybersecurity")
    
    trends = get_trends_data(trend_keyword)
    article["trends"] = trends
    
    print("   🤖 Summary...")
    summary = generate_summary(article["full_text"], article["title"])
    article["summary"] = summary
    
    print("   💾 Saving...")
    c.execute('''
        UPDATE articles SET
            full_text = ?, author = ?, category = ?, tags_json = ?, sources_json = ?,
            keywords_json = ?, trends_json = ?, ai_summary_json = ?,
            image_url = ?, media_type = ?, analyzed_at = ?
        WHERE id = ?
    ''', (
        article["full_text"], article["author"], json.dumps(article["category"]),
        json.dumps(article["tags"]), json.dumps(details["sources"]), json.dumps(keywords),
        json.dumps(trends), json.dumps(summary), article["image_url"], article["media_type"],
        datetime.now().isoformat(), article_id
    ))
    
    conn.commit()
    conn.close()
    print(f"   ✅ Done!")
    # Longer delay to avoid rate limits
    time.sleep(random.uniform(4, 6))
    
    return article


def analyze_all_articles(limit: int = 50) -> Dict[str, Any]:
    """Analyze all unanalyzed articles."""
    print("\n" + "="*50)
    print("🚀 BULK ANALYSIS")
    print("="*50)
    
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT id FROM articles WHERE analyzed_at IS NULL ORDER BY rowid DESC LIMIT ?", (limit,))
    ids = [row[0] for row in c.fetchall()]
    conn.close()
    
    total = len(ids)
    print(f"📊 {total} articles to analyze\n")
    
    results = {"success": 0, "failed": 0, "total": total}
    
    for i, aid in enumerate(ids, 1):
        try:
            print(f"\n[{i}/{total}] ", end="")
            result = analyze_article(aid)
            results["success" if "error" not in result else "failed"] += 1
        except Exception as e:
            print(f"   ❌ {e}")
            results["failed"] += 1
    
    print(f"\n✅ Complete: {results['success']}/{total}\n")
    return results


def export_enriched_json() -> str:
    """Export to JSON file."""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM articles WHERE analyzed_at IS NOT NULL ORDER BY rowid DESC")
    
    articles = []
    for row in c.fetchall():
        article = dict(row)
        # Parse all JSON fields
        for field in ["sources_json", "keywords_json", "trends_json", "ai_summary_json", "tags_json"]:
            if article.get(field):
                try:
                    article[field.replace("_json", "")] = json.loads(article[field])
                except:
                    article[field.replace("_json", "")] = [] if "tags" in field else None
            if field in article:
                del article[field]
        
        if isinstance(article.get("category"), str):
            try:
                article["category"] = json.loads(article["category"])
            except:
                article["category"] = DEFAULT_CATEGORY
        
        articles.append(article)
    
    conn.close()
    
    export_data = {
        "generated_at": datetime.now().isoformat(),
        "total_articles": len(articles),
        "categories": {k: v["name"] for k, v in CATEGORIES.items()},
        "articles": articles,
        "metadata": {"source": "The Hacker News", "source_url": BASE_URL}
    }
    
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Exported {len(articles)} articles")
    return OUTPUT_JSON


# --- WEB SCRAPING FUNCTIONS ---
def scrape_homepage_articles(page_url: str = None) -> List[Dict[str, Any]]:
    """Scrape articles from a page (homepage or pagination page)."""
    url = page_url or BASE_URL
    articles = []
    next_page_url = None
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=20)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "lxml")
        
        posts = soup.find_all("div", class_="body-post")
        
        for post in posts:
            try:
                link_tag = post.find("a", class_="story-link")
                if not link_tag:
                    continue
                article_url = link_tag.get('href')
                if not article_url:
                    continue
                
                title_tag = post.find("h2", class_="home-title")
                if not title_tag:
                    continue
                
                date_tag = post.find("span", class_="h-datetime")
                
                # Get thumbnail image from the post
                img_tag = post.find("img")
                img_url = None
                if img_tag:
                    img_url = img_tag.get("data-src") or img_tag.get("src")
                
                articles.append({
                    "url": article_url,
                    "title": title_tag.get_text(strip=True),
                    "published": date_tag.get_text(strip=True) if date_tag else "Unknown",
                    "thumbnail": img_url
                })
            except Exception as e:
                print(f"   ⚠️ Error parsing post: {e}")
                continue
        
        # Find next page link
        for link in soup.find_all("a"):
            if "next" in link.get_text(strip=True).lower():
                next_page_url = link.get("href")
                break
        
    except Exception as e:
        print(f"   ❌ Error fetching {url}: {e}")
    
    return articles, next_page_url


def check_for_new_articles():
    """Check homepage for new articles only (skip existing ones)."""
    print(f"\n⏰ [{datetime.now().strftime('%H:%M:%S')}] Checking for new articles...")
    
    try:
        articles, _ = scrape_homepage_articles()
        
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        new_count = 0
        for article in articles:
            # Only check if article exists - don't update existing ones
            c.execute("SELECT id FROM articles WHERE id = ?", (article["url"],))
            if c.fetchone() is None:
                print(f"   🔥 New: {article['title'][:50]}...")
                details = scrape_article_details(article["url"])
                
                img = details["image_url"] or article.get("thumbnail")
                media = details["media_type"] if details["image_url"] else ("image" if img else "none")
                
                c.execute('''
                    INSERT INTO articles (id, title, url, published, image_url, media_type, full_text, author, category, tags_json, sources_json, is_new)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (article["url"], article["title"], article["url"], article["published"],
                      img, media, details["full_text"], details["author"],
                      json.dumps(details["category"]) if details["category"] else None,
                      json.dumps(details["tags"]),
                      json.dumps(details["sources"]), True))
                new_count += 1
                time.sleep(random.uniform(REQUEST_DELAY_MIN, REQUEST_DELAY_MAX))
                
        conn.commit()
        conn.close()
        print(f"   ✅ Added {new_count} new articles")
    except Exception as e:
        print(f"   ❌ Error: {e}")


def run_backfill(target_count: int = 100):
    """Backfill articles by scraping homepage and pagination pages."""
    print(f"\n🚀 Backfill starting (target: {target_count} articles)...")
    print("="*50)
    
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    total_added = 0
    total_skipped = 0
    page_num = 1
    next_page_url = None
    max_pages = (target_count // 12) + 5  # Safety limit
    
    while total_added < target_count and page_num <= max_pages:
        print(f"\n📄 Page {page_num}...")
        
        try:
            articles, next_page_url = scrape_homepage_articles(next_page_url)
            
            if not articles:
                print("   ⚠️ No articles found, stopping pagination")
                break
            
            print(f"   Found {len(articles)} articles on this page")
            
            for article in articles:
                if total_added >= target_count:
                    break
                
                # Check if article already exists
                c.execute("SELECT id FROM articles WHERE id = ?", (article["url"],))
                if c.fetchone():
                    total_skipped += 1
                    continue
                
                print(f"   📰 [{total_added + 1}/{target_count}] {article['title'][:45]}...")
                
                # Scrape full article details
                details = scrape_article_details(article["url"])
                
                img = details["image_url"] or article.get("thumbnail")
                media = details["media_type"] if details["image_url"] else ("image" if img else "none")
                
                c.execute('''
                    INSERT INTO articles (id, title, url, published, image_url, media_type, full_text, author, category, tags_json, sources_json, is_new)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (article["url"], article["title"], article["url"], article["published"],
                      img, media, details["full_text"], details["author"],
                      json.dumps(details["category"]) if details["category"] else None,
                      json.dumps(details["tags"]), json.dumps(details["sources"]), False))
                total_added += 1
                
                # Rate limiting between article scrapes
                time.sleep(random.uniform(REQUEST_DELAY_MIN, REQUEST_DELAY_MAX))
            
            conn.commit()
            
            if not next_page_url:
                print("   ℹ️ No more pages available")
                break
            
            page_num += 1
            
            # Rate limiting between pages
            print(f"   💤 Waiting before next page...")
            time.sleep(random.uniform(PAGE_DELAY_MIN, PAGE_DELAY_MAX))
            
        except Exception as e:
            print(f"   ❌ Error on page {page_num}: {e}")
            # On error, wait longer before retrying
            time.sleep(5)
            page_num += 1
            continue
    
    conn.close()
    print(f"\n{'='*50}")
    print(f"✅ Backfill complete!")
    print(f"   📊 Added: {total_added} articles")
    print(f"   ⏭️ Skipped (already exist): {total_skipped}")
    print(f"   📄 Pages scraped: {page_num}")
    print(f"{'='*50}\n")


# --- LIFESPAN ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM articles")
    count = c.fetchone()[0]
    conn.close()
    
    if count < 100:
        print(f"📊 Only {count} articles in DB, fetching more...")
        run_backfill(target_count=100)
    else:
        print(f"📊 {count} articles in DB")
    
    # Check for new articles every 30 minutes (won't reprocess old ones)
    scheduler.add_job(check_for_new_articles, 'interval', minutes=30, id='article_check')
    scheduler.start()
    print("⏰ Scheduler started (checking every 30 mins)\n")
    
    # Initial check for new articles
    check_for_new_articles()
    yield
    scheduler.shutdown()


# --- FASTAPI ---
app = FastAPI(title="News Analyzer API", version="2.3.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.get("/")
def root():
    return {"status": "running", "version": "2.3.0", "openai": bool(OPENAI_API_KEY)}


@app.get("/categories")
def get_categories():
    return {k: v["name"] for k, v in CATEGORIES.items()}


@app.get("/articles")
def get_articles(limit: int = 50, offset: int = 0, analyzed_only: bool = False, category: str = None):
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    query = "SELECT * FROM articles"
    conditions, params = [], []
    if analyzed_only:
        conditions.append("analyzed_at IS NOT NULL")
    if category:
        conditions.append("category LIKE ?")
        params.append(f'%"{category}"%')
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    query += " ORDER BY rowid DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    c.execute(query, params)
    items = []
    for row in c.fetchall():
        article = dict(row)
        for field in ["sources_json", "keywords_json", "trends_json", "ai_summary_json", "tags_json"]:
            if article.get(field):
                try:
                    article[field.replace("_json", "")] = json.loads(article[field])
                except:
                    article[field.replace("_json", "")] = [] if "tags" in field else None
                del article[field]
            else:
                article[field.replace("_json", "")] = [] if "tags" in field else None
                if field in article:
                    del article[field]
        if article.get("category"):
            try:
                article["category"] = json.loads(article["category"])
            except:
                pass
        items.append(article)
    
    c.execute("SELECT COUNT(*) FROM articles")
    total = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM articles WHERE analyzed_at IS NOT NULL")
    analyzed = c.fetchone()[0]
    conn.close()
    
    return {"articles": items, "total": total, "analyzed": analyzed}


@app.get("/articles/enriched")
def get_enriched():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM articles WHERE analyzed_at IS NOT NULL ORDER BY rowid DESC")
    
    articles = []
    for row in c.fetchall():
        article = dict(row)
        for field in ["sources_json", "keywords_json", "trends_json", "ai_summary_json", "tags_json"]:
            if article.get(field):
                try:
                    article[field.replace("_json", "")] = json.loads(article[field])
                except:
                    article[field.replace("_json", "")] = [] if "tags" in field else None
            if field in article:
                del article[field]
        if article.get("category"):
            try:
                article["category"] = json.loads(article["category"])
            except:
                pass
        articles.append(article)
    conn.close()
    
    return {"articles": articles, "total": len(articles), "categories": {k: v["name"] for k, v in CATEGORIES.items()}}


@app.get("/article/{article_id:path}")
def get_article(article_id: str):
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM articles WHERE id = ?", (article_id,))
    row = c.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(404, "Not found")
    
    article = dict(row)
    for field in ["sources_json", "keywords_json", "trends_json", "ai_summary_json", "tags_json"]:
        if article.get(field):
            try:
                article[field.replace("_json", "")] = json.loads(article[field])
            except:
                article[field.replace("_json", "")] = [] if "tags" in field else None
        if field in article:
            del article[field]
    if article.get("category"):
        try:
            article["category"] = json.loads(article["category"])
        except:
            pass
    return article


@app.post("/analyze/{article_id:path}")
def analyze_single(article_id: str, background_tasks: BackgroundTasks, force: bool = False):
    background_tasks.add_task(analyze_article, article_id, force)
    return {"status": "Started"}


@app.post("/analyze-all")
def analyze_all(background_tasks: BackgroundTasks, limit: int = 50):
    background_tasks.add_task(analyze_all_articles, limit)
    return {"status": f"Started for {limit}"}


@app.post("/reanalyze-all")
def reanalyze_all(background_tasks: BackgroundTasks, limit: int = 50):
    def reanalyze():
        conn = sqlite3.connect(DB_FILE)
        conn.cursor().execute("UPDATE articles SET analyzed_at = NULL")
        conn.commit()
        conn.close()
        analyze_all_articles(limit)
    background_tasks.add_task(reanalyze)
    return {"status": "Re-analysis started"}


@app.post("/export")
def export_json():
    return {"status": "Done", "file": export_enriched_json()}


@app.get("/download")
def download():
    if not os.path.exists(OUTPUT_JSON):
        export_enriched_json()
    return FileResponse(OUTPUT_JSON, media_type="application/json", filename="articles_enriched.json")


@app.get("/trends/{keyword}")
def get_keyword_trends(keyword: str):
    return get_trends_data(keyword)


@app.post("/refresh")
def refresh(background_tasks: BackgroundTasks):
    background_tasks.add_task(check_for_new_articles)
    return {"status": "Started"}


@app.post("/backfill")
def backfill(background_tasks: BackgroundTasks, target: int = 100):
    background_tasks.add_task(run_backfill, target)
    return {"status": f"Started for up to {target} articles"}


@app.post("/clear-and-reload")
def clear_and_reload(background_tasks: BackgroundTasks, target: int = 100):
    """Clear all existing data and fetch fresh articles."""
    def clear_and_fetch():
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("DELETE FROM articles")
        conn.commit()
        conn.close()
        print("🗑️ Cleared all articles")
        run_backfill(target_count=target)
    
    background_tasks.add_task(clear_and_fetch)
    return {"status": f"Clearing data and fetching {target} fresh articles"}


@app.get("/stats")
def stats():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM articles")
    total = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM articles WHERE is_new = 1")
    new_count = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM articles WHERE analyzed_at IS NOT NULL")
    analyzed = c.fetchone()[0]
    
    c.execute("SELECT category, COUNT(*) FROM articles WHERE category IS NOT NULL GROUP BY category")
    cats = {}
    for row in c.fetchall():
        try:
            cat = json.loads(row[0]) if row[0] else None
            if cat:
                cats[cat.get("name", "Unknown")] = row[1]
        except:
            pass
    conn.close()
    
    return {"total": total, "new": new_count, "analyzed": analyzed, "categories": cats, "scheduler": scheduler.running}
