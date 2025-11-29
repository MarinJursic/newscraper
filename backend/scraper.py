import requests
import json
import re
import time
import random
import uuid
import sqlite3
from bs4 import BeautifulSoup
from datetime import datetime
from typing import List, Dict, Any, Tuple

from config import (
    BASE_URL, HEADERS, REQUEST_DELAY_MIN, REQUEST_DELAY_MAX,
    PAGE_DELAY_MIN, PAGE_DELAY_MAX, DEFAULT_CATEGORY, CATEGORIES, DB_FILE
)
from database import get_db_connection
from utils import get_favicon_url, get_domain_name
from analysis import analyze_article

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


# --- WEB SCRAPING FUNCTIONS ---
def scrape_homepage_articles(page_url: str = None) -> Tuple[List[Dict[str, Any]], str]:
    """Scrape articles from a page (homepage or pagination page)."""
    url = page_url or BASE_URL
    articles = []
    next_page_url = None
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(response.content, "lxml")
        
        # Find blog posts
        posts = soup.find_all("div", class_="body-post")
        
        for post in posts:
            try:
                link_tag = post.find("a", class_="story-link")
                if not link_tag:
                    continue
                    
                article_url = link_tag.get("href")
                title_tag = post.find("h2", class_="home-title")
                date_tag = post.find("span", class_="h-datetime")
                img_tag = post.find("img")
                
                if not title_tag:
                    continue
                
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
        
        conn = get_db_connection()
        c = conn.cursor()
        
        new_count = 0
        for article in articles:
            # Only check if article exists - don't update existing ones
            c.execute("SELECT id FROM articles WHERE url = ?", (article["url"],))
            if c.fetchone() is None:
                print(f"   🔥 New: {article['title'][:50]}...")
                details = scrape_article_details(article["url"])
                
                img = details["image_url"] or article.get("thumbnail")
                media = details["media_type"] if details["image_url"] else ("image" if img else "none")
                
                new_id = str(uuid.uuid4())
                c.execute('''
                    INSERT INTO articles (id, title, url, published, image_url, media_type, full_text, author, category, tags_json, sources_json, is_new)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (new_id, article["title"], article["url"], article["published"],
                      img, media, details["full_text"], details["author"],
                      json.dumps(details["category"]) if details["category"] else None,
                      json.dumps(details["tags"]),
                      json.dumps(details["sources"]), True))
                new_count += 1
                
                # Run analysis immediately
                analyze_article(new_id)
                
                time.sleep(random.uniform(REQUEST_DELAY_MIN, REQUEST_DELAY_MAX))
                
        conn.commit()
        conn.close()
        print(f"   ✅ Added {new_count} new articles")
    except Exception as e:
        print(f"   ❌ Error: {e}")


def run_backfill(target_count: int = 100):
    """Backfill articles by scraping homepage and pagination pages."""
    # Import export function dynamically to avoid circular import if main imports scraper
    from main import export_enriched_json
    from concurrent.futures import ThreadPoolExecutor, as_completed
    
    print(f"\n🚀 Backfill starting (target: {target_count} articles)...")
    print("="*50)
    
    conn = get_db_connection()
    c = conn.cursor()
    total_added = 0
    total_skipped = 0
    page_num = 1
    next_page_url = None
    max_pages = (target_count // 12) + 5  # Safety limit
    article_ids_to_analyze = []  # Collect IDs for batch analysis
    
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
                c.execute("SELECT id FROM articles WHERE url = ?", (article["url"],))
                if c.fetchone():
                    total_skipped += 1
                    continue
                
                print(f"   📰 [{total_added + 1}/{target_count}] {article['title'][:45]}...")
                
                # Scrape full article details
                details = scrape_article_details(article["url"])
                
                img = details["image_url"] or article.get("thumbnail")
                media = details["media_type"] if details["image_url"] else ("image" if img else "none")
                
                new_id = str(uuid.uuid4())
                c.execute('''
                    INSERT INTO articles (id, title, url, published, image_url, media_type, full_text, author, category, tags_json, sources_json, is_new)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (new_id, article["title"], article["url"], article["published"],
                      img, media, details["full_text"], details["author"],
                      json.dumps(details["category"]) if details["category"] else None,
                      json.dumps(details["tags"]), json.dumps(details["sources"]), False))
                
                conn.commit()
                article_ids_to_analyze.append(new_id)
                total_added += 1
                
                # Rate limiting between article scrapes
                time.sleep(random.uniform(REQUEST_DELAY_MIN, REQUEST_DELAY_MAX))
            
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
    print(f"✅ Scraping complete!")
    print(f"   📊 Added: {total_added} articles")
    print(f"   ⏭️ Skipped (already exist): {total_skipped}")
    print(f"   📄 Pages scraped: {page_num}")
    print(f"{'='*50}\n")
    
    # === PARALLEL ANALYSIS ===
    if article_ids_to_analyze:
        print(f"\n🤖 Starting parallel AI analysis for {len(article_ids_to_analyze)} articles...")
        print(f"   Using GPT-5.1 with max 5 concurrent threads")
        print("="*50)
        
        # Use ThreadPoolExecutor for parallel analysis
        max_workers = min(5, len(article_ids_to_analyze))  # Max 5 parallel requests
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all analysis tasks
            future_to_id = {
                executor.submit(analyze_article, article_id): article_id 
                for article_id in article_ids_to_analyze
            }
            
            completed = 0
            errors = 0
            
            # Process as they complete
            for future in as_completed(future_to_id):
                article_id = future_to_id[future]
                try:
                    result = future.result()
                    completed += 1
                    print(f"   ✅ [{completed}/{len(article_ids_to_analyze)}] Analysis complete")
                except Exception as e:
                    errors += 1
                    print(f"   ❌ Error analyzing {article_id}: {e}")
        
        print(f"\n{'='*50}")
        print(f"✅ Analysis complete!")
        print(f"   📊 Analyzed: {completed} articles")
        print(f"   ❌ Errors: {errors}")
        print(f"{'='*50}\n")
    
    # Export updated data
    export_enriched_json()

