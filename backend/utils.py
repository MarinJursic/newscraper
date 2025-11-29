from urllib.parse import urlparse

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
