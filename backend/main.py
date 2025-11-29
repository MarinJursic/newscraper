import sqlite3
import json
import os
import time
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from datetime import datetime
from contextlib import asynccontextmanager
from typing import Optional, Dict, Any

from config import (
    DB_FILE, OUTPUT_JSON, scheduler, 
    REQUEST_DELAY_MIN, REQUEST_DELAY_MAX
)
import os
NEWSLETTER_ADMIN_KEY = os.getenv("NEWSLETTER_ADMIN_KEY", "change_me")
from database import init_db, get_db_connection
from scraper import check_for_new_articles, run_backfill
from analysis import analyze_article, analyze_all_articles, get_unified_trends

# --- FASTAPI APP SETUP ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting News Scraper Backend...")
    init_db()
    
    # Start scheduler
    scheduler.add_job(check_for_new_articles, 'interval', minutes=60)
    scheduler.start()
    print("⏰ Scheduler started (checking every 60 mins)")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down...")
    scheduler.shutdown()

app = FastAPI(title="Cybersecurity News Scraper", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- BACKGROUND TASKS WRAPPERS ---
def analyze_single(article_id: str, background_tasks: BackgroundTasks, force: bool = False):
    """Run analysis in background."""
    analyze_article(article_id, force)

def analyze_all(background_tasks: BackgroundTasks, limit: int = 50):
    """Run batch analysis in background."""
    analyze_all_articles(limit)

# --- API ROUTES ---

@app.get("/")
def read_root():
    return {"status": "running", "message": "Cybersecurity News Scraper API"}

@app.get("/articles")
def get_articles(
    limit: int = 50,
    offset: int = 0,
    category: Optional[str] = None,
    search: Optional[str] = None,
    actionable: Optional[bool] = None,
    min_confidence: Optional[int] = None,
    sort: str = "published",
    order: str = "desc"
):
    """
    Get articles with advanced filtering and search.
    
    Args:
        limit: Number of articles to return (max 100)
        offset: Pagination offset
        category: Filter by category (e.g., "Security", "AI")
        search: Search in title/description
        actionable: Filter actionable articles
        min_confidence: Minimum confidence score (0-100)
        sort: Sort field (published, confidence_score, relevance_score, trend_score)
        order: Sort order (asc/desc)
    """
    # Limit max to 100
    limit = min(limit, 100)
    
    # Build query
    conn = get_db_connection()
    c = conn.cursor()
    
    query = "SELECT * FROM articles WHERE analyzed_at IS NOT NULL"
    params = []
    
    # Category filter
    if category and category.lower() != "all":
        query += " AND (ai_category = ? OR category LIKE ?)"
        params.extend([category, f"%{category}%"])
    
    # Actionable filter
    if actionable is not None:
        query += " AND actionable = ?"
        params.append(1 if actionable else 0)
    
    # Confidence filter
    if min_confidence is not None:
        query += " AND confidence_score >= ?"
        params.append(min_confidence)
    
    # Search in title and descriptions
    if search:
        query += " AND (title LIKE ? OR short_description LIKE ? OR long_description LIKE ?)"
        search_term = f"%{search}%"
        params.extend([search_term, search_term, search_term])
    
    # Sorting
    valid_sort_fields = ["published", "confidence_score", "relevance_score", "trend_score", "sentiment_score"]
    if sort not in valid_sort_fields:
        sort = "published"
    
    order_direction = "DESC" if order.lower() == "desc" else "ASC"
    
    # Special handling for published (treat as date string)
    if sort == "published":
        query += f" ORDER BY published {order_direction}, rowid DESC"
    else:
        query += f" ORDER BY {sort} {order_direction}, rowid DESC"
    
    query += " LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    c.execute(query, params)
    articles = [dict(row) for row in c.fetchall()]
    
    # Parse JSON fields (minimal for list view)
    for article in articles:
        for field in ["tags_json", "keywords_json", "category"]:
            if article.get(field):
                try:
                    if field.endswith("_json"):
                        article[field.replace("_json", "")] = json.loads(article[field])
                except:
                    pass
    
    # Get total count for pagination
    count_query = f"SELECT COUNT(*) FROM articles WHERE analyzed_at IS NOT NULL"
    count_params = []
    
    if category and category.lower() != "all":
        count_query += " AND (ai_category = ? OR category LIKE ?)"
        count_params.extend([category, f"%{category}%"])
    if actionable is not None:
        count_query += " AND actionable = ?"
        count_params.append(1 if actionable else 0)
    if min_confidence is not None:
        count_query += " AND confidence_score >= ?"
        count_params.append(min_confidence)
    if search:
        count_query += " AND (title LIKE ? OR short_description LIKE ? OR long_description LIKE ?)"
        search_term = f"%{search}%"
        count_params.extend([search_term, search_term, search_term])
    
    c.execute(count_query, count_params)
    total_count = c.fetchone()[0]
    
    conn.close()
    
    return {
        "articles": articles,
        "pagination": {
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": offset + len(articles) < total_count
        }
    }

@app.get("/articles/stats")
def get_article_stats():
    """Get article statistics for dashboard."""
    conn = get_db_connection()
    c = conn.cursor()
    
    # Total articles
    c.execute("SELECT COUNT(*) FROM articles WHERE analyzed_at IS NOT NULL")
    total = c.fetchone()[0]
    
    # Category breakdown
    c.execute("""
        SELECT ai_category, COUNT(*) as count
        FROM articles
        WHERE analyzed_at IS NOT NULL AND ai_category IS NOT NULL
        GROUP BY ai_category
        ORDER BY count DESC
    """)
    categories = [{"category": row[0], "count": row[1]} for row in c.fetchall()]
    
    # Average scores
    c.execute("""
        SELECT 
            AVG(confidence_score) as avg_confidence,
            AVG(relevance_score) as avg_relevance,
            AVG(sentiment_score) as avg_sentiment,
            AVG(trend_score) as avg_trend
        FROM articles
        WHERE analyzed_at IS NOT NULL
    """)
    scores = c.fetchone()
    
    # Actionable count
    c.execute("SELECT COUNT(*) FROM articles WHERE analyzed_at IS NOT NULL AND actionable = 1")
    actionable_count = c.fetchone()[0]
    
    # Recent activity (last 24h)
    c.execute("""
        SELECT COUNT(*) 
        FROM articles 
        WHERE analyzed_at IS NOT NULL 
        AND datetime(analyzed_at) > datetime('now', '-1 day')
    """)
    recent = c.fetchone()[0]
    
    conn.close()
    
    return {
        "total_articles": total,
        "categories": categories,
        "average_scores": {
            "confidence": round(scores[0] or 0, 1),
            "relevance": round(scores[1] or 0, 1),
            "sentiment": round(scores[2] or 0, 1),
            "trend": round(scores[3] or 0, 1)
        },
        "actionable_count": actionable_count,
        "recent_24h": recent
    }


@app.get("/articles/{article_id}")
def get_article(article_id: str):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM articles WHERE id = ?", (article_id,))
    row = c.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Article not found")
    
    article = dict(row)
    
    # Parse JSON fields
    for field in ["tags_json", "sources_json", "keywords_json", "trends_json", 
                  "ai_summary_json", "ai_analysis_json", "trend_graph_json", 
                  "geo_impact_json", "tech_stack_json", "market_data_json", 
                  "actions_json", "enrichment_json"]:
        if article.get(field):
            try:
                article[field.replace("_json", "")] = json.loads(article[field])
            except:
                article[field.replace("_json", "")] = None
                
    return article

@app.post("/analyze/{article_id}")
def trigger_analysis(article_id: str, background_tasks: BackgroundTasks, force: bool = False):
    background_tasks.add_task(analyze_single, article_id, background_tasks, force)
    return {"message": "Analysis started in background"}

@app.post("/analyze-all")
def trigger_batch_analysis(background_tasks: BackgroundTasks, limit: int = 50):
    background_tasks.add_task(analyze_all, background_tasks, limit)
    return {"message": f"Batch analysis started for {limit} articles"}

@app.get("/trends")
def get_trends(keywords: str):
    """Get trends for comma-separated keywords."""
    kw_list = [k.strip() for k in keywords.split(",") if k.strip()]
    return get_unified_trends(kw_list)

@app.get("/categories")
def get_categories():
    """Get list of available categories with article counts."""
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute("""
        SELECT ai_category, COUNT(*) as count
        FROM articles
        WHERE analyzed_at IS NOT NULL AND ai_category IS NOT NULL
        GROUP BY ai_category
        ORDER BY count DESC
    """)
    
    categories = [{"name": row[0], "count": row[1]} for row in c.fetchall()]
    conn.close()
    
    return {"categories": categories}

@app.get("/export")
def export_json():
    """Trigger JSON export and return the file."""
    filename = export_enriched_json()
    return FileResponse(filename, media_type="application/json", filename=filename)

@app.post("/backfill")
def trigger_backfill(background_tasks: BackgroundTasks, count: int = 100):
    """Trigger backfill process."""
    background_tasks.add_task(run_backfill, count)
    return {"message": f"Backfill started for {count} articles"}

# --- NEWSLETTER SUBSCRIPTION ROUTES ---

@app.post("/subscribe")
def subscribe_to_newsletter(email: str, role: str, tech_stack: list[str]):
    """
    Subscribe to daily newsletter.
    
    Args:
        email: Subscriber email
        role: One of: frontend, backend, devops, mobile, cto/vp, product mgr, founder, security, data/ai
        tech_stack: List of technologies: python, react, aws, docker, cybersec, crypto, ai, rust, go, kubernetes, design, graphql, node.js, next.js
    """
    import json
    from datetime import datetime
    
    # Validate role
    valid_roles = ["frontend", "backend", "devops", "mobile", "cto/vp", "product mgr", "founder", "security", "data/ai"]
    if role.lower() not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}")
    
    # Validate tech stack
    valid_tech = ["python", "react", "aws", "docker", "cybersec", "crypto", "ai", "rust", "go", "kubernetes", "design", "graphql", "node.js", "next.js"]
    invalid_tech = [t for t in tech_stack if t.lower() not in valid_tech]
    if invalid_tech:
        raise HTTPException(status_code=400, detail=f"Invalid tech stack items: {', '.join(invalid_tech)}")
    
    conn = get_db_connection()
    c = conn.cursor()
    
    # Check if already subscribed
    c.execute("SELECT email, active FROM subscribers WHERE email = ?", (email,))
    existing = c.fetchone()
    
    if existing:
        if existing["active"]:
            conn.close()
            raise HTTPException(status_code=400, detail="Email already subscribed")
        else:
            # Reactivate subscription
            c.execute("""
                UPDATE subscribers 
                SET active = 1, role = ?, tech_stack = ?, subscribed_at = ?
                WHERE email = ?
            """, (role.lower(), json.dumps([t.lower() for t in tech_stack]), datetime.now().isoformat(), email))
            conn.commit()
            conn.close()
            return {"message": "Subscription reactivated", "email": email}
    
    # New subscription
    try:
        c.execute("""
            INSERT INTO subscribers (email, role, tech_stack, subscribed_at, active)
            VALUES (?, ?, ?, ?, 1)
        """, (email, role.lower(), json.dumps([t.lower() for t in tech_stack]), datetime.now().isoformat()))
        conn.commit()
        conn.close()
        return {"message": "Successfully subscribed", "email": email, "role": role, "tech_stack": tech_stack}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Failed to subscribe: {str(e)}")

@app.delete("/unsubscribe/{email}")
def unsubscribe_from_newsletter(email: str):
    """Unsubscribe from newsletter."""
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute("UPDATE subscribers SET active = 0 WHERE email = ?", (email,))
    
    if c.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Email not found")
    
    conn.commit()
    conn.close()
    return {"message": "Successfully unsubscribed", "email": email}

@app.get("/subscribers")
def get_subscribers(admin_key: str = ""):
    """Get all subscribers (admin only)."""
    import os
    
    expected_key = os.getenv("NEWSLETTER_ADMIN_KEY", "change_me")
    if admin_key != expected_key:
        raise HTTPException(status_code=403, detail="Invalid admin key")
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM subscribers ORDER BY subscribed_at DESC")
    subscribers = [dict(row) for row in c.fetchall()]
    conn.close()
    
    # Parse tech_stack JSON
    for sub in subscribers:
        sub["tech_stack"] = json.loads(sub["tech_stack"])
    
    return {"subscribers": subscribers, "total": len(subscribers)}

@app.post("/send-newsletter")
def send_newsletter(admin_key: str, days_back: int = 1, background_tasks: BackgroundTasks = None):
    """
    Send newsletter to all subscribers (admin only).
    
    Args:
        admin_key: Admin authentication key
        days_back: Number of days to look back for articles (default: 1)
    """
    import os
    from email_service import send_daily_newsletter
    
    expected_key = os.getenv("NEWSLETTER_ADMIN_KEY", "change_me")
    if admin_key != expected_key:
        raise HTTPException(status_code=403, detail="Invalid admin key")
    
    # Send in background if possible
    if background_tasks:
        background_tasks.add_task(send_daily_newsletter, days_back)
        return {"message": "Newsletter sending started in background", "days_back": days_back}
    else:
        result = send_daily_newsletter(days_back)
        return result

# --- EXPORT FUNCTION (Kept here for API access) ---
def export_enriched_json() -> str:
    """Export enriched articles to JSON with full AI analysis and enrichment data."""
    conn = get_db_connection()
    c = conn.cursor()
    
    # Get articles that have been analyzed
    c.execute("SELECT * FROM articles WHERE analyzed_at IS NOT NULL ORDER BY relevance_score DESC, rowid DESC")
    
    articles = []
    for row in c.fetchall():
        article = dict(row)
        
        # Parse JSON fields safely
        def parse_json(field):
            val = article.get(field)
            if val:
                try:
                    return json.loads(val)
                except:
                    return None
            return None

        ai_analysis = parse_json("ai_analysis_json") or {}
        trends = parse_json("trends_json") or {}
        geo_impact_data = parse_json("geo_impact_json") or {}
        tech_stack = parse_json("tech_stack_json") or []
        market_data = parse_json("market_data_json")
        actions = parse_json("actions_json") or []
        keywords = parse_json("keywords_json") or []
        tags = parse_json("tags_json") or []
        category_data = parse_json("category")
        sources = parse_json("sources_json") or []
        
        # Transform geo_impact to array format
        geo_impact_array = []
        if geo_impact_data and isinstance(geo_impact_data, dict):
            regions = geo_impact_data.get("regions", [])
            for region_code in regions:
                from config import COUNTRY_DATA
                geo_impact_array.append({
                    "iso_code": region_code,
                    "country_name": COUNTRY_DATA.get(region_code, region_code),
                    "severity": 2,  # Default severity
                    "reason": "Identified as affected region based on analysis."
                })
        
        # Transform market_data to array format
        market_data_array = []
        if market_data and isinstance(market_data, dict):
            market_data_array = [market_data]
        
        # Extract trend graph from trends object
        trend_graph = {}
        if trends and isinstance(trends, dict):
            graph_data = trends.get("graph", {})
            trend_graph = {
                "period": graph_data.get("period", "Last 6 Months"),
                "trend_direction": trends.get("trend_direction", "stable"),
                "data_points": graph_data.get("data_points", [])
            }
        
        # Transform actions to new format
        actions_obj = {"jira_payload": {}, "slack_message": ""}
        if actions and isinstance(actions, list) and len(actions) > 0:
            # Build Jira payload from actions list
            priority_map = {"Critical": "Highest", "High": "High", "Medium": "Medium"}
            first_action = actions[0]
            actions_obj["jira_payload"] = {
                "summary": first_action.get("title", "Security Alert"),
                "description": first_action.get("description", ""),
                "priority": priority_map.get(first_action.get("priority", "Medium"), "Medium")
            }
            # Build Slack message
            if first_action.get("priority") == "Critical":
                actions_obj["slack_message"] = f"*🚨 CRITICAL:* {first_action.get('title', 'Security Alert')}"
            else:
                actions_obj["slack_message"] = f"*⚠️ {first_action.get('priority', 'Alert')}:* {first_action.get('title', 'Security Alert')}"
        
        # Construct enriched object with new schema
        enriched_article = {
            "id": article.get("id"),
            "title": article.get("title"),
            "url": article.get("url"),
            "published": article.get("published"),
            "author": article.get("author"),
            "image_url": article.get("image_url"),
            "media_type": article.get("media_type"),
            "is_new": bool(article.get("is_new")),
            
            # Content object
            "content": {
                "short_description": article.get("short_description"),
                "long_description": article.get("long_description"),
                "full_text": article.get("full_text"),
                "reading_time": len((article.get("full_text") or "").split()) // 200 or 1
            },
            
            # Scores object
            "scores": {
                "confidence_score": article.get("confidence_score"),
                "relevance_score": article.get("relevance_score"),
                "sentiment_score": article.get("sentiment_score"),
                "trend_score": article.get("trend_score")
            },
            
            # Classification object
            "classification": {
                "category": article.get("ai_category") or "Security",
                "legacy_category": category_data if category_data else {"id": "security_news", "name": "Security News"},
                "tags": tags,
                "actionable": bool(article.get("actionable"))
            },
            
            # Metadata object
            "metadata": {
                "analyzed_at": article.get("analyzed_at"),
                "keywords": keywords,
                "sources": sources
            },
            
            # Visual data object
            "visual_data": {
                "trend_graph": trend_graph,
                "geo_impact": geo_impact_array
            },
            
            # Enrichment object (simplified)
            "enrichment": {
                "tech_stack": tech_stack,
                "market_data": market_data_array
            },
            
            # Actions object
            "actions": actions_obj
        }
        
        articles.append(enriched_article)
    
    conn.close()
    
    # Create final export structure
    export_data = {
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "total_articles": len(articles),
            "version": "3.1",
            "avg_confidence": round(sum((a["scores"]["confidence_score"] or 0) for a in articles) / len(articles), 1) if articles else 0,
            "avg_relevance": round(sum((a["scores"]["relevance_score"] or 0) for a in articles) / len(articles), 1) if articles else 0
        },
        "articles": articles
    }
    
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(export_data, f, indent=2, ensure_ascii=False)
        
    print(f"✅ Exported {len(articles)} enriched articles to {OUTPUT_JSON}")
    return OUTPUT_JSON

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
