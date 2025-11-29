import os
from apscheduler.schedulers.background import BackgroundScheduler
from pytrends.request import TrendReq

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

# OpenAI Configuration - Use GPT-4o for best analysis
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is required. Please set it in your .env file or environment.")
OPENAI_MODEL = "gpt-4o"  # Using GPT-4o for comprehensive analysis

# ================= CATEGORIES (Original for legacy support) =================
LEGACY_CATEGORIES = {
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

# New simplified categories for AI classification
AI_CATEGORIES = ["Security", "Product Launch", "Legal", "Market", "AI", "DevOps"]

DEFAULT_CATEGORY = {"name": "Security News", "id": "security_news"}

# Keep CATEGORIES for backward compatibility
CATEGORIES = LEGACY_CATEGORIES

# ================= COMPANY TICKER MAPPINGS =================
# Maps company names to their stock ticker and domain for logo
COMPANY_TICKERS = {
    # Big Tech
    "amazon": {"ticker": "AMZN", "domain": "amazon.com", "name": "Amazon.com Inc."},
    "aws": {"ticker": "AMZN", "domain": "amazon.com", "name": "Amazon.com Inc."},
    "google": {"ticker": "GOOGL", "domain": "google.com", "name": "Alphabet Inc."},
    "alphabet": {"ticker": "GOOGL", "domain": "google.com", "name": "Alphabet Inc."},
    "microsoft": {"ticker": "MSFT", "domain": "microsoft.com", "name": "Microsoft Corporation"},
    "azure": {"ticker": "MSFT", "domain": "microsoft.com", "name": "Microsoft Corporation"},
    "apple": {"ticker": "AAPL", "domain": "apple.com", "name": "Apple Inc."},
    "meta": {"ticker": "META", "domain": "meta.com", "name": "Meta Platforms Inc."},
    "facebook": {"ticker": "META", "domain": "meta.com", "name": "Meta Platforms Inc."},
    "nvidia": {"ticker": "NVDA", "domain": "nvidia.com", "name": "NVIDIA Corporation"},
    "intel": {"ticker": "INTC", "domain": "intel.com", "name": "Intel Corporation"},
    "amd": {"ticker": "AMD", "domain": "amd.com", "name": "Advanced Micro Devices"},
    "tesla": {"ticker": "TSLA", "domain": "tesla.com", "name": "Tesla Inc."},
    "oracle": {"ticker": "ORCL", "domain": "oracle.com", "name": "Oracle Corporation"},
    "ibm": {"ticker": "IBM", "domain": "ibm.com", "name": "IBM Corporation"},
    "salesforce": {"ticker": "CRM", "domain": "salesforce.com", "name": "Salesforce Inc."},
    "adobe": {"ticker": "ADBE", "domain": "adobe.com", "name": "Adobe Inc."},
    "vmware": {"ticker": "VMW", "domain": "vmware.com", "name": "VMware Inc."},
    "broadcom": {"ticker": "AVGO", "domain": "broadcom.com", "name": "Broadcom Inc."},
    
    # Cybersecurity
    "crowdstrike": {"ticker": "CRWD", "domain": "crowdstrike.com", "name": "CrowdStrike Holdings"},
    "cloudflare": {"ticker": "NET", "domain": "cloudflare.com", "name": "Cloudflare Inc."},
    "palo alto": {"ticker": "PANW", "domain": "paloaltonetworks.com", "name": "Palo Alto Networks"},
    "paloalto": {"ticker": "PANW", "domain": "paloaltonetworks.com", "name": "Palo Alto Networks"},
    "fortinet": {"ticker": "FTNT", "domain": "fortinet.com", "name": "Fortinet Inc."},
    "okta": {"ticker": "OKTA", "domain": "okta.com", "name": "Okta Inc."},
    "zscaler": {"ticker": "ZS", "domain": "zscaler.com", "name": "Zscaler Inc."},
    "sentinelone": {"ticker": "S", "domain": "sentinelone.com", "name": "SentinelOne Inc."},
    "cisco": {"ticker": "CSCO", "domain": "cisco.com", "name": "Cisco Systems Inc."},
    "splunk": {"ticker": "SPLK", "domain": "splunk.com", "name": "Splunk Inc."},
    
    # Social & Communication
    "twitter": {"ticker": "X", "domain": "x.com", "name": "X Corp"},
    "x": {"ticker": "X", "domain": "x.com", "name": "X Corp"},
    "snap": {"ticker": "SNAP", "domain": "snap.com", "name": "Snap Inc."},
    "snapchat": {"ticker": "SNAP", "domain": "snap.com", "name": "Snap Inc."},
    "discord": {"ticker": None, "domain": "discord.com", "name": "Discord Inc."},
    "zoom": {"ticker": "ZM", "domain": "zoom.us", "name": "Zoom Video Communications"},
    "slack": {"ticker": "CRM", "domain": "slack.com", "name": "Slack (Salesforce)"},
    
    # Crypto & Finance
    "coinbase": {"ticker": "COIN", "domain": "coinbase.com", "name": "Coinbase Global Inc."},
    "paypal": {"ticker": "PYPL", "domain": "paypal.com", "name": "PayPal Holdings Inc."},
    "stripe": {"ticker": None, "domain": "stripe.com", "name": "Stripe Inc."},
    
    # Others
    "samsung": {"ticker": "005930.KS", "domain": "samsung.com", "name": "Samsung Electronics"},
    "qualcomm": {"ticker": "QCOM", "domain": "qualcomm.com", "name": "Qualcomm Inc."},
    "dell": {"ticker": "DELL", "domain": "dell.com", "name": "Dell Technologies"},
    "hp": {"ticker": "HPQ", "domain": "hp.com", "name": "HP Inc."},
    "lenovo": {"ticker": "0992.HK", "domain": "lenovo.com", "name": "Lenovo Group"},
}

# Country codes for geo impact
COUNTRY_DATA = {
    "US": "United States",
    "GB": "United Kingdom", 
    "DE": "Germany",
    "FR": "France",
    "CN": "China",
    "RU": "Russia",
    "JP": "Japan",
    "KR": "South Korea",
    "IN": "India",
    "BR": "Brazil",
    "AU": "Australia",
    "CA": "Canada",
    "IL": "Israel",
    "NL": "Netherlands",
    "SG": "Singapore",
    "AE": "United Arab Emirates",
    "IR": "Iran",
    "KP": "North Korea",
}

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
