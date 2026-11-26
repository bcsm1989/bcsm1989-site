"""Apply a browser policy to every built page, including hand-maintained Fleet pages."""
import base64
import hashlib
import re
from html import escape
from pathlib import Path

DIST = Path(__file__).resolve().parents[1] / 'dist'
SCRIPT = re.compile(r'<script\b([^>]*)>(.*?)</script\s*>', re.I | re.S)
OLD_META = re.compile(r'<meta\b[^>]*(?:http-equiv=[\"\']Content-Security-Policy[\"\']|name=[\"\']referrer[\"\'])[^>]*>', re.I)


def protect(text):
    text = OLD_META.sub('', text)
    hashes = sorted({"'sha256-" + base64.b64encode(hashlib.sha256(body.encode('utf-8')).digest()).decode() + "'"
                     for attrs, body in SCRIPT.findall(text) if not re.search(r'\bsrc\s*=', attrs, re.I)})
    # Google Maps and the existing Fleet form are the only external resources.
    policy = "; ".join([
        "default-src 'self'", "base-uri 'none'", "object-src 'none'",
        "script-src 'self'" + ((' ' + ' '.join(hashes)) if hashes else ''),
        "script-src-attr 'none'", "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:", "font-src 'self'", "frame-src https://www.google.com",
        "connect-src 'self' https://docs.google.com",
        "form-action 'self' https://docs.google.com", "upgrade-insecure-requests",
    ])
    meta = '<meta http-equiv="Content-Security-Policy" content="' + escape(policy, quote=True) + '">'
    meta += '<meta name="referrer" content="strict-origin-when-cross-origin">'
    return re.sub(r'(<head>\s*<meta charset="utf-8">)', lambda m: m[1] + meta, text, count=1, flags=re.I)


def apply():
    for path in DIST.rglob('*.html'):
        path.write_text(protect(path.read_text(encoding='utf-8')), encoding='utf-8')


if __name__ == '__main__':
    apply()
