import sqlite3
from config import DB_FILE

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database with enhanced schema for AI analysis and enrichment."""
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
            analyzed_at TEXT,
            
            -- AI Analysis Fields --
            ai_analysis_json TEXT,
            confidence_score INTEGER,
            relevance_score INTEGER,
            sentiment_score INTEGER,
            trend_score INTEGER,
            short_description TEXT,
            long_description TEXT,
            ai_category TEXT,
            actionable BOOLEAN,
            
            -- Enrichment Fields (v3.1) --
            trend_graph_json TEXT,
            geo_impact_json TEXT,
            tech_stack_json TEXT,
            market_data_json TEXT,
            actions_json TEXT,
            enrichment_json TEXT
        )
    ''')
    
    # All columns including new ones for AI analysis and enrichment
    new_columns = [
        ("author", "TEXT"),
        ("category", "TEXT"),
        ("tags_json", "TEXT"),
        ("sources_json", "TEXT"),
        ("keywords_json", "TEXT"),
        ("trends_json", "TEXT"),
        ("analyzed_at", "TEXT"),
        ("media_type", "TEXT"),
        # AI analysis columns
        ("ai_analysis_json", "TEXT"),
        ("confidence_score", "INTEGER"),
        ("relevance_score", "INTEGER"),
        ("sentiment_score", "INTEGER"),
        ("trend_score", "INTEGER"),
        ("short_description", "TEXT"),
        ("long_description", "TEXT"),
        ("ai_category", "TEXT"),
        ("actionable", "BOOLEAN"),
        # Enrichment columns (v3.1)
        ("trend_graph_json", "TEXT"),
        ("geo_impact_json", "TEXT"),
        ("tech_stack_json", "TEXT"),
        ("market_data_json", "TEXT"),
        ("actions_json", "TEXT"),
        ("enrichment_json", "TEXT")
    ]
    
    # --- SUBSCRIBERS TABLE FOR NEWSLETTER ---
    c.execute('''
        CREATE TABLE IF NOT EXISTS subscribers (
            email TEXT PRIMARY KEY,
            role TEXT NOT NULL,
            tech_stack TEXT NOT NULL,
            subscribed_at TEXT NOT NULL,
            last_email_sent TEXT,
            active BOOLEAN DEFAULT 1
        )
    ''')
    
    c.execute("PRAGMA table_info(articles)")
    existing = {row[1] for row in c.fetchall()}
    
    for col_name, col_type in new_columns:
        if col_name not in existing:
            try:
                c.execute(f"ALTER TABLE articles ADD COLUMN {col_name} {col_type}")
                print(f"   Added column: {col_name}")
            except Exception as e:
                print(f"   ⚠️ Could not add column {col_name}: {e}")
    
    conn.commit()
    conn.close()
    print("✅ Database initialized with enhanced schema (v3.1)")
