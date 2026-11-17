"""Chinese (Simplified) and Japanese layer for bcsm1989.com.

Pages are authored in Thai + English with t(th, en), which writes
<span lang="th">…</span><span lang="en">…</span>. localize() finds every such
pair and appends <span lang="zh">…</span><span lang="ja">…</span>, looked up by
the English text in scripts/translations.json. Running it again replaces the
zh/ja spans, so it is safe on hand-maintained pages (dist/fleet/).

To change a translation: edit translations.json and run scripts/build.py.
A new English string without a translation stops the build and is listed.
"""
from pathlib import Path
import json, re, html

ROOT = Path(__file__).resolve().parents[1]
LANGS = ['th', 'en', 'zh', 'ja']
LABELS = {'th': 'ไทย', 'en': 'English', 'zh': '简体中文', 'ja': '日本語'}
SHORT = {'th': 'TH', 'en': 'EN', 'zh': '中文', 'ja': '日本語'}

_data = json.loads((ROOT / 'scripts' / 'translations.json').read_text(encoding='utf-8'))
STRINGS = _data['strings']   # english -> {"zh": ..., "ja": ...}
TITLES = _data['titles']     # canonical path -> {"en": ..., "zh": ..., "ja": ...}
missing = []

def tr(en):
    """(zh, ja) for an English string; records it if missing."""
    hit = STRINGS.get(en)
    if not hit or not hit.get('zh') or not hit.get('ja'):
        if en not in missing: missing.append(en)
        return en, en
    return hit['zh'], hit['ja']

PAIR = re.compile(r'<span lang="th">(.*?)</span>(\s*)<span lang="en">(.*?)</span>'
                  r'(?:<span lang="zh">.*?</span><span lang="ja">.*?</span>)?', re.S)

def localize(page):
    def repl(m):
        th, gap, en = m.groups()
        zh, ja = tr(en)
        return (f'<span lang="th">{th}</span>{gap}<span lang="en">{en}</span>'
                f'<span lang="zh">{zh}</span><span lang="ja">{ja}</span>')
    return PAIR.sub(repl, page)

GLOBE = ('<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" '
         'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/>'
         '<path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"/></svg>')

def switcher():
    # Order en, zh, ja, th so this is never mistaken for a th+en pair by localize().
    current = ''.join(f'<span lang="{l}">{SHORT[l]}</span>' for l in ('en', 'zh', 'ja', 'th'))
    items = ''.join(f'<li><button type="button" data-lang="{l}" lang="{l}">{LABELS[l]}</button></li>' for l in LANGS)
    return (f'<div class="lang-switch"><button id="langBtn" class="lang-button" type="button" aria-haspopup="true" '
            f'aria-expanded="false" aria-controls="langMenu" aria-label="ภาษา / Language / 语言 / 言語">{GLOBE}{current}</button>'
            f'<ul class="lang-menu" id="langMenu" hidden>{items}</ul></div>')

def title_meta(canon, th_title):
    """Per-language document titles, read by app.js when the language changes."""
    entry = TITLES.get(canon)
    if not entry:
        missing.append(f'title for {canon}')
        return ''
    out = f'<meta name="bcsm:title:th" content="{html.escape(th_title)} · BCSM 1989">'
    for l in ('en', 'zh', 'ja'):
        out += f'<meta name="bcsm:title:{l}" content="{html.escape(entry[l])} · BCSM 1989">'
    return out

def check():
    if missing:
        raise SystemExit('Missing Chinese/Japanese translations in scripts/translations.json:\n  - '
                         + '\n  - '.join(missing))
