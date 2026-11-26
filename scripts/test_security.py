"""Check real HTML resources against the policy, including short-link scripts."""
import base64
import hashlib
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import unittest
import security


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


class SecurityTests(unittest.TestCase):
    def test_all_pages_allow_existing_resources_and_deny_arbitrary_scripts(self):
        paths = list(security.DIST.rglob('*.html'))
        self.assertGreaterEqual(len(paths), 14)
        for path in paths:
            with self.subTest(page=str(path)):
                text = path.read_text(encoding='utf-8')
                tags = Page(text).tags
                policies = [(i, a['content']) for i, (t, a) in enumerate(tags)
                            if t == 'meta' and a.get('http-equiv', '').lower() == 'content-security-policy']
                self.assertEqual(len(policies), 1)
                position, policy = policies[0]
                directives = dict((parts[0], parts[1:]) for item in policy.split(';') if (parts := item.split()))
                self.assertNotIn("'unsafe-inline'", directives['script-src'])
                self.assertNotIn("'unsafe-eval'", directives['script-src'])
                self.assertEqual(directives['script-src-attr'], ["'none'"])
                self.assertEqual(directives['object-src'], ["'none'"])
                self.assertEqual(directives['base-uri'], ["'none'"])
                # These cannot be enforced by a meta policy; don't imply they are.
                self.assertNotIn('frame-ancestors', directives)
                self.assertNotIn('report-uri', directives)
                for i, (tag, attrs) in enumerate(tags):
                    self.assertFalse(any(name.startswith('on') for name in attrs), attrs)
                    if tag in ('script', 'link', 'img', 'iframe', 'style'):
                        self.assertLess(position, i)
                    for attr in ('src', 'href', 'action'):
                        self.assertFalse(attrs.get(attr, '').lower().startswith(('javascript:', 'http:')))
                    directive = {'script': 'script-src', 'iframe': 'frame-src', 'img': 'img-src', 'form': 'form-action'}.get(tag)
                    src = attrs.get('action' if tag == 'form' else 'src', '')
                    if directive and src.startswith('https://'):
                        parsed = urlsplit(src)
                        self.assertIn(f'{parsed.scheme}://{parsed.netloc}', directives[directive])
                for attrs, body in security.SCRIPT.findall(text):
                    if 'src=' not in attrs:
                        digest = base64.b64encode(hashlib.sha256(body.encode()).digest()).decode()
                        self.assertIn("'sha256-" + digest + "'", directives['script-src'])
                self.assertEqual(security.protect(text), text)

    def test_injected_script_does_not_match_published_allowlist(self):
        text = (security.DIST / 'fleet/line/index.html').read_text(encoding='utf-8')
        digest = base64.b64encode(hashlib.sha256(b'alert(document.cookie)').digest()).decode()
        self.assertNotIn('sha256-' + digest, text)


if __name__ == '__main__':
    unittest.main()
