#!/usr/bin/env python3
"""
Test newsletter system with Resend API.
"""
import sys
import os

# Load .env file
from pathlib import Path
env_file = Path(__file__).parent / '.env'
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key] = value

sys.path.insert(0, 'backend')

from database import init_db, get_db_connection
from email_service import send_email

print("🧪 Testing Newsletter System with Resend")
print("=" * 50)
print()

# 1. Initialize database
print("1️⃣ Initializing database...")
init_db()
print()

# 2. Test subscriber creation
print("2️⃣ Creating test subscriber...")
conn = get_db_connection()
c = conn.cursor()

test_email = os.getenv("FROM_EMAIL", "test@example.com")
print(f"   Using email: {test_email}")

# Clear existing test subscriber
c.execute("DELETE FROM subscribers WHERE email = ?", (test_email,))

# Insert test subscriber
import json
from datetime import datetime

c.execute("""
    INSERT INTO subscribers (email, role, tech_stack, subscribed_at, active)
    VALUES (?, ?, ?, ?, 1)
""", (test_email, "security", json.dumps(["python", "cybersec"]), datetime.now().isoformat()))

conn.commit()
conn.close()
print("   ✅ Test subscriber created")
print()

# 3. Test email sending
print("3️⃣ Testing email delivery...")
html = """
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h1 style="margin: 0;">🔒 Test Newsletter</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">This is a test email from your cybersecurity news scraper!</p>
    </div>
    <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; border-radius: 5px;">
        <h2 style="margin-top: 0;">✅ Email System Working</h2>
        <p>Your newsletter system is configured correctly with Resend!</p>
        <ul>
            <li>API Key: Configured ✓</li>
            <li>From Email: {}</li>
            <li>Database: Ready ✓</li>
        </ul>
    </div>
</body>
</html>
""".format(os.getenv("FROM_EMAIL", "Not set"))

result = send_email(test_email, "🔒 Newsletter Test - System Ready", html)

print()
if result:
    print("=" * 50)
    print("✅ SUCCESS! Check your inbox at:")
    print(f"   {test_email}")
    print()
    print("Next steps:")
    print("  1. Check your email")
    print("  2. Subscribe more users via API")
    print("  3. Send daily newsletters!")
else:
    print("=" * 50)
    print("❌ Email sending failed")
    print("   Check your RESEND_API_KEY in .env file")
    print("   Make sure it starts with 're_'")

print("=" * 50)
