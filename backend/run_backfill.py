import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from backend.database import init_db
from backend.scraper import run_backfill

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Running backfill...")
    run_backfill(100)  # Run for 100 articles
