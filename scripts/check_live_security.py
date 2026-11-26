"""Bounded public-only checks; never submits the Fleet form or reads customer data."""
from html.parser import HTMLParser
import urllib.request
import urllib.error


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


opener = urllib.request.build_opener(NoRedirect())
request = urllib.request.Request('http://bcsm1989.com/', method='HEAD')
try:
    response = opener.open(request, timeout=15)
except urllib.error.HTTPError as error:
    response = error
with response:
    assert response.status in (301, 302, 307, 308), 'HTTP must redirect to HTTPS'
    assert response.headers.get('Location') == 'https://bcsm1989.com/', 'Unexpected redirect'


class Policy(HTMLParser):
    def __init__(self):
        super().__init__()
        self.content = ''

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta' and attrs.get('http-equiv', '').lower() == 'content-security-policy':
            self.content = attrs.get('content', '')


for path in ('/', '/fleet/', '/location/'):
    with opener.open('https://bcsm1989.com' + path, timeout=15) as response:
        assert response.status == 200, path
        assert 'max-age=' in response.headers.get('Strict-Transport-Security', ''), 'Missing HSTS'
        policy = Policy()
        policy.feed(response.read(200_000).decode('utf-8'))
        assert "script-src 'self'" in policy.content, 'Missing script policy: ' + path
        assert "object-src 'none'" in policy.content, 'Missing object policy: ' + path
    print('PASS:', path, 'HTTPS, HSTS, CSP')
