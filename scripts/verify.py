from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import re
LANGS=['th','en','zh','ja']
ZHJA=re.compile(r'<span lang="(?:zh|ja)">.*?</span>',re.S)

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
class Document(HTMLParser):
    def __init__(self,text):
        super().__init__(); self.refs=[];self.ids=[];self.images=[];self.h1=0;self.langs=set();self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if 'lang' in a:self.langs.add(a['lang'])
        if tag=='h1':self.h1+=1
        if tag=='img':self.images.append(a)
        for key in ['href','src']:
            if key in a:self.refs.append((key,a[key]))

docs={p:Document(p.read_text()) for p in DIST.rglob('*.html')}
errors=[];nrefs=0
for path,doc in docs.items():
    if doc.h1!=1:errors.append(f'{path}: expected one h1')
    if len(set(doc.ids))!=len(doc.ids):errors.append(f'{path}: duplicate IDs')
    if not set(LANGS)<=doc.langs:errors.append(f'{path}: language missing')
    raw=path.read_text()
    counts={l:raw.count(f'<span lang="{l}">') for l in LANGS[1:]}
    if len(set(counts.values()))!=1:errors.append(f'{path}: unequal en/zh/ja spans {counts}')
    for im in doc.images:
        if 'alt' not in im:errors.append(f'{path}: image missing alt')
    for kind,url in doc.refs:
        nrefs+=1
        parsed=urlsplit(url)
        if parsed.scheme or parsed.netloc:continue
        p=unquote(parsed.path)
        target=DIST/p.lstrip('/') if p.startswith('/') else path.parent/p if p else path
        if target.is_dir():target=target/'index.html'
        if not target.exists():errors.append(f'{path}: missing {url}')
        elif parsed.fragment and target in docs and parsed.fragment not in docs[target].ids:errors.append(f'{path}: missing fragment {url}')
for slug in ['terms','privacy','delete-account']:
    original=(ROOT/'source-original'/f'{slug}.html').read_text()
    body=re.search(r'<main><div class="wrap">(.*?)</div></main>',original,re.S).group(1)
    if body not in ZHJA.sub('',(DIST/slug/'index.html').read_text()):errors.append(f'{slug}: source content changed')
if errors:raise SystemExit('\n'.join(errors))
print(f'PASS: {len(docs)} pages in Thai, English, Chinese and Japanese, {nrefs} references, all local paths and anchors, image alt text, unique IDs, single h1 per page; terms, privacy and deletion bodies unchanged.')
