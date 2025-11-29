import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
import os

from database import get_db_connection
from config import COUNTRY_DATA

# Email configuration - Using Resend API
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "Security Digest <onboarding@resend.dev>")

# Role to keyword mapping for article matching
ROLE_KEYWORDS = {
    "frontend": ["react", "vue", "angular", "ui", "ux", "css", "html", "javascript", "typescript", "next.js", "svelte", "frontend"],
    "backend": ["api", "backend", "server", "database", "sql", "nosql", "postgres", "mongodb", "redis", "node", "django", "flask"],
    "devops": ["devops", "ci/cd", "jenkins", "github actions", "terraform", "ansible", "deployment", "infrastructure", "cloud"],
    "mobile": ["ios", "android", "react native", "flutter", "swift", "kotlin", "mobile app"],
    "cto/vp": ["leadership", "strategy", "architecture", "enterprise", "scalability", "team", "management"],
    "product mgr": ["product", "roadmap", "user experience", "analytics", "metrics", "feature"],
    "founder": ["startup", "funding", "business", "growth", "saas", "revenue"],
    "security": ["security", "vulnerability", "exploit", "breach", "malware", "phishing", "zero-day", "cve"],
    "data/ai": ["ai", "machine learning", "data science", "llm", "gpt", "neural network", "tensorflow", "pytorch", "data pipeline"]
}

def match_articles_to_preferences(role: str, tech_stack: List[str], articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Match articles to subscriber preferences based on role and tech stack.
    
    Returns articles sorted by relevance to the subscriber.
    """
    matched_articles = []
    
    for article in articles:
        score = 0
        
        # Get article text for matching
        title = (article.get("title") or "").lower()
        short_desc = (article.get("content", {}).get("short_description") or "").lower()
        long_desc = (article.get("content", {}).get("long_description") or "").lower()
        category = (article.get("classification", {}).get("category") or "").lower()
        tags = article.get("classification", {}).get("tags") or []
        keywords = article.get("metadata", {}).get("keywords") or []
        
        combined_text = f"{title} {short_desc} {long_desc} {category}"
        
        # Role matching
        role_kws = ROLE_KEYWORDS.get(role.lower(), [])
        for kw in role_kws:
            if kw in combined_text:
                score += 3
            if any(kw.lower() in str(tag).lower() for tag in tags):
                score += 2
        
        # Tech stack matching
        for tech in tech_stack:
            tech_lower = tech.lower()
            if tech_lower in combined_text:
                score += 5
            if any(tech_lower in str(tag).lower() for tag in tags):
                score += 3
            if any(tech_lower in str(kw.get("keyword", "")).lower() for kw in keywords):
                score += 2
        
        # Only include if score > 0
        if score > 0:
            article["_match_score"] = score
            matched_articles.append(article)
    
    # Sort by match score (descending) and then by relevance score
    matched_articles.sort(
        key=lambda x: (x.get("_match_score", 0), x.get("scores", {}).get("relevance_score", 0)),
        reverse=True
    )
    
    return matched_articles[:10]  # Top 10 most relevant


def generate_email_html(subscriber: Dict[str, Any], articles: List[Dict[str, Any]]) -> str:
    """Generate HTML email content for subscriber."""
    
    email = subscriber["email"]
    role = subscriber["role"]
    tech_stack = json.loads(subscriber["tech_stack"])
    
    html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }}
            .header h1 {{ margin: 0; font-size: 28px; }}
            .header p {{ margin: 10px 0 0 0; opacity: 0.9; }}
            .article {{ background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 20px; border-radius: 5px; }}
            .article h2 {{ margin: 0 0 10px 0; font-size: 20px; color: #2d3748; }}
            .article .meta {{ color: #718096; font-size: 14px; margin-bottom: 10px; }}
            .article .description {{ color: #4a5568; margin-bottom: 15px; }}
            .article .scores {{ display: flex; gap: 15px; margin-bottom: 10px; }}
            .score {{ background: #e2e8f0; padding: 5px 10px; border-radius: 4px; font-size: 12px; }}
            .read-more {{ display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: 600; }}
            .footer {{ margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px; text-align: center; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔒 Your Daily Cybersecurity Digest</h1>
            <p>Personalized for: {role.title()} | {', '.join(tech_stack)}</p>
        </div>
    """
    
    if not articles:
        html += """
        <p>No new articles matched your preferences today. Check back tomorrow!</p>
        """
    else:
        for article in articles:
            title = article.get("title", "Untitled")
            url = article.get("url", "#")
            short_desc = article.get("content", {}).get("short_description") or "No description available"
            scores = article.get("scores", {})
            category = article.get("classification", {}).get("category", "General")
            actionable = article.get("classification", {}).get("actionable", False)
            
            confidence = scores.get("confidence_score") or 0
            relevance = scores.get("relevance_score") or 0
            trend = scores.get("trend_score") or 0
            
            html += f"""
        <div class="article">
            <h2>{title}</h2>
            <div class="meta">
                <strong>{category}</strong>
                {' • <span style="color: #48bb78;">⚡ Actionable</span>' if actionable else ''}
            </div>
            <div class="description">{short_desc}</div>
            <div class="scores">
                <span class="score">📊 Confidence: {confidence}%</span>
                <span class="score">🎯 Relevance: {relevance}%</span>
                <span class="score">📈 Trend: {trend}%</span>
            </div>
            <a href="{url}" class="read-more">Read Full Article →</a>
        </div>
            """
    
    unsubscribe_link = f"http://localhost:8000/unsubscribe/{email}"
    
    html += f"""
        <div class="footer">
            <p>You're receiving this because you subscribed to our cybersecurity news digest.</p>
            <p><a href="{unsubscribe_link}" style="color: #667eea;">Unsubscribe</a></p>
        </div>
    </body>
    </html>
    """
    
    return html


def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """Send email via Resend API."""
    resend_api_key = os.getenv("RESEND_API_KEY", "")
    
    if not resend_api_key:
        print(f"⚠️ Resend API key not configured. Would send to: {to_email}")
        print(f"   Subject: {subject}")
        print(f"   Get your API key at: https://resend.com/api-keys")
        return False
    
    try:
        import requests
        
        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json"
            },
            json={
                "from": FROM_EMAIL or "Security Digest <onboarding@resend.dev>",
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }
        )
        
        if response.status_code == 200:
            print(f"✅ Email sent to {to_email}")
            return True
        else:
            print(f"❌ Failed to send email to {to_email}: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Failed to send email to {to_email}: {e}")
        return False


def send_daily_newsletter(days_back: int = 1) -> Dict[str, Any]:
    """
    Send daily newsletter to all active subscribers.
    
    Args:
        days_back: Number of days to look back for articles
    
    Returns:
        Summary of emails sent
    """
    conn = get_db_connection()
    c = conn.cursor()
    
    # Get active subscribers
    c.execute("SELECT * FROM subscribers WHERE active = 1")
    subscribers = [dict(row) for row in c.fetchall()]
    
    if not subscribers:
        conn.close()
        return {"message": "No active subscribers", "sent": 0}
    
    # Get recent articles
    cutoff_date = (datetime.now() - timedelta(days=days_back)).isoformat()
    c.execute("""
        SELECT * FROM articles 
        WHERE analyzed_at IS NOT NULL 
        AND datetime(analyzed_at) > datetime(?)
        ORDER BY relevance_score DESC
    """, (cutoff_date,))
    
    db_articles = [dict(row) for row in c.fetchall()]
    
    # Parse JSON fields for each article
    articles = []
    for article in db_articles:
        parsed = {
            "id": article.get("id"),
            "title": article.get("title"),
            "url": article.get("url"),
            "content": {
                "short_description": article.get("short_description"),
                "long_description": article.get("long_description"),
            },
            "scores": {
                "confidence_score": article.get("confidence_score"),
                "relevance_score": article.get("relevance_score"),
                "trend_score": article.get("trend_score"),
            },
            "classification": {
                "category": article.get("ai_category"),
                "actionable": bool(article.get("actionable")),
                "tags": json.loads(article.get("tags_json")) if article.get("tags_json") else []
            },
            "metadata": {
                "keywords": json.loads(article.get("keywords_json")) if article.get("keywords_json") else []
            }
        }
        articles.append(parsed)
    
    # Send to each subscriber
    sent_count = 0
    failed_count = 0
    
    for subscriber in subscribers:
        email = subscriber["email"]
        role = subscriber["role"]
        tech_stack = json.loads(subscriber["tech_stack"])
        
        # Match articles to preferences
        matched = match_articles_to_preferences(role, tech_stack, articles)
        
        if not matched:
            print(f"⏭️ No matching articles for {email}")
            continue
        
        # Generate and send email
        html = generate_email_html(subscriber, matched)
        subject = f"🔒 {len(matched)} New Cybersecurity Articles for You"
        
        if send_email(email, subject, html):
            sent_count += 1
            # Update last_email_sent
            c.execute(
                "UPDATE subscribers SET last_email_sent = ? WHERE email = ?",
                (datetime.now().isoformat(), email)
            )
            conn.commit()
        else:
            failed_count += 1
    
    conn.close()
    
    return {
        "message": "Newsletter sent",
        "total_subscribers": len(subscribers),
        "sent": sent_count,
        "failed": failed_count,
        "articles_available": len(articles)
    }
