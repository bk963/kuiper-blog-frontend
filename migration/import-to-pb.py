#!/usr/bin/env python3
"""
Import WP posts into blog_articles across all 3 PB instances.
- Fetches wp-dump.json
- Strips WP shortcodes + captures first h2s
- Generates meta_title + meta_description via simple heuristics (Phase 5 later upgrades with Claude)
- Inserts into blog_articles
"""
import json, subprocess, re, html, sys
from datetime import datetime

DUMP = '/root/blog-migration/wp-dump.json'
BRANDSCHUTZ_CAT_ID = 'catbrand11111115'
PB_CONTAINERS = {
    'prod': 'tcbnib1hhrx3qtw0kjo9neqo',
    'staging': 'fzwuk4fn3lome0lwdveaefrf',
    'dev': 't9j3cxtv5ercczronqi6zurs',
}

def clean_content(html_content):
    # Remove WP shortcodes
    c = re.sub(r'\[[^\]]+\]', '', html_content)
    # Strip comments
    c = re.sub(r'<!--.*?-->', '', c, flags=re.DOTALL)
    # Clean up excessive whitespace
    c = re.sub(r'\n\s*\n', '\n\n', c)
    # Remove featured image header if inline at top
    return c.strip()

def strip_tags(h):
    return re.sub(r'<[^>]+>', '', html.unescape(h)).strip()

def meta_description(excerpt, content_text, max_len=160):
    text = strip_tags(excerpt) if excerpt else strip_tags(content_text)[:400]
    # First sentence, max 160 chars
    if len(text) <= max_len:
        return text
    cut = text[:max_len].rsplit(' ', 1)[0].rstrip('.,;:')
    return cut + '…'

def focus_keyword_from_title(title):
    # Remove "Was ist" etc., pick 2-3 most distinctive words
    t = strip_tags(title).strip()
    # Simple: first 3 content words
    words = [w for w in re.split(r'\s+', t) if len(w) > 3 and w[0].isupper()][:3]
    return ' '.join(words) if words else t[:60]

def word_count(html_content):
    return len(re.findall(r'\b\w{2,}\b', strip_tags(html_content)))

def reading_time(wc):
    return max(1, round(wc / 220))  # 220 wpm

def sqlite_escape(s):
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def insert_post(container, post_data):
    p = post_data['post']
    m = post_data['media']
    pid = p['id']
    slug = p['slug'][:250]
    title = strip_tags(p['title']['rendered'])[:300]
    content = clean_content(p['content']['rendered'])
    excerpt = strip_tags(p.get('excerpt', {}).get('rendered', ''))[:500]
    wc = word_count(content)
    rt = reading_time(wc)
    meta_d = meta_description(p.get('excerpt', {}).get('rendered', ''), content)[:500]
    meta_t = (title + ' | Kuiper Safety')[:200]
    focus = focus_keyword_from_title(title)[:200]
    hero = m.get('source_url', '') if m else ''
    original = p.get('link', '')
    date = p.get('date', '').replace('T', ' ').replace('Z', '') or datetime.now().isoformat()
    pb_id = f"wp{pid:013d}"[:15]

    cmd = f"""INSERT OR REPLACE INTO blog_articles (
        id, slug, title, excerpt, content, category_id, pillar_id, author, meta_title, meta_description,
        focus_keyword, hero_image, hero_image_url, last_seo_check, published_at,
        reading_time_min, word_count, source, source_url, original_url, status, seo_score, created, updated
    ) VALUES (
        {sqlite_escape(pb_id)}, {sqlite_escape(slug)}, {sqlite_escape(title)}, {sqlite_escape(excerpt)}, {sqlite_escape(content)},
        {sqlite_escape(BRANDSCHUTZ_CAT_ID)}, '', 'Brandschutzdozenten', {sqlite_escape(meta_t)}, {sqlite_escape(meta_d)},
        {sqlite_escape(focus)}, '', {sqlite_escape(hero)}, '', {sqlite_escape(date)},
        {rt}, {wc}, 'imported', {sqlite_escape(original)}, {sqlite_escape(original)},
        'published', 0, datetime('now'), datetime('now')
    );"""

    result = subprocess.run(['docker','exec','-i', container, 'sqlite3', '/data/data.db'], input=cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f'  FAIL {slug}: {result.stderr[:200]}', file=sys.stderr)
        return False
    return True

def main():
    with open(DUMP) as f:
        dump = json.load(f)
    posts = dump['posts']
    media = {str(k): v for k, v in dump['media'].items()}
    print(f'Importing {len(posts)} posts to all 3 PBs...')

    for env, prefix in PB_CONTAINERS.items():
        r = subprocess.run(['docker','ps','--format','{{.Names}}'], capture_output=True, text=True)
        containers = [n for n in r.stdout.split() if n.startswith(f'pocketbase-{prefix}')]
        if not containers:
            print(f'{env}: no container'); continue
        container = containers[0]
        print(f'\n=== {env} ({container}) ===')
        ok, fail = 0, 0
        for p in posts:
            m = media.get(str(p['featured_media'])) if p.get('featured_media') else None
            if insert_post(container, {'post': p, 'media': m}):
                ok += 1
            else:
                fail += 1
        print(f'{env}: {ok} imported, {fail} failed')

if __name__ == '__main__':
    main()
