#!/usr/bin/env python3
"""
Test newsletter with default Resend email (onboarding@resend.dev)
"""
import sys
import os

# Load .env but override FROM_EMAIL
from pathlib import Path
env_file = Path(__file__).parent / '.env'
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key] = value

# Override FROM_EMAIL to use default Resend address
os.environ["FROM_EMAIL"] = "Security News <onboarding@resend.dev>"

sys.path.insert(0, 'backend')

from email_service import send_email

print("🧪 Testing with default Resend email")
print("=" * 50)
print()

# Send test email to your Gmail
your_email = "marin.jursic@gmail.com"

html = """
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h1 style="margin: 0;">🔒 Newsletter System Test</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your cybersecurity news scraper is ready!</p>
    </div>
    <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; border-radius: 5px;">
        <h2 style="margin-top: 0;">✅ System Configured</h2>
        <p><strong>Everything is working!</strong></p>
        <ul>
            <li>✅ Resend API connected</li>
            <li>✅ Database initialized</li>
            <li>✅ Email delivery working</li>
        </ul>
        <p style="margin-top: 20px;">You can now:</p>
        <ol>
            <li>Subscribe users via API</li>
            <li>Send personalized newsletters</li>
            <li>Track engagement</li>
        </ol>
    </div>
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px;">
        <p>Sent from: Security News &lt;onboarding@resend.dev&gt;</p>
        <p><em>Note: Using default Resend email. To use custom domain, verify it at https://resend.com/domains</em></p>
    </div>
</body>
</html>
"""

print(f"Sending test email to: {your_email}")
print(f"From: Security News <onboarding@resend.dev>")
print()

result = send_email(your_email, "🔒 Newsletter Test - System Ready!", html)

print()
if result:
    print("=" * 50)
    print("✅ SUCCESS! Email sent!")
    print()
    print(f"Check your inbox: {your_email}")
    print("(May take a few seconds to arrive)")
    print()
    print("To use your own email address:")
    print("1. Go to https://resend.com/domains")
    print("2. Add and verify your domain")
    print("3. Then update FROM_EMAIL in .env")
else:
    print("❌ Failed. Check your RESEND_API_KEY")

print("=" * 50)
