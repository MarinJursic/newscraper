"""
Setup instructions for Resend email service.

1. Sign up for Resend (free tier):
   - Go to https://resend.com
   - Sign up with GitHub or email
   - Free tier: 3,000 emails/month, 100 emails/day

2. Get your API key:
   - Go to https://resend.com/api-keys
   - Click "Create API Key"
   - Give it a name (e.g., "Newsletter")
   - Copy the API key (starts with "re_")

3. Set environment variable:
   export RESEND_API_KEY="re_your_api_key_here"

4. (Optional) Set custom from email:
   export FROM_EMAIL="Your Name <you@yourdomain.com>"
   
   Note: With free tier, you can only send from:
   - onboarding@resend.dev (default)
   - Your verified domain (requires DNS setup)

5. Verify domain (optional, for custom from address):
   - Go to https://resend.com/domains
   - Add your domain
   - Add DNS records as instructed
   - Wait for verification

That's it! Much simpler than SMTP configuration.
"""
