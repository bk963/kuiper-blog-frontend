#!/usr/bin/env python3
"""
Phase 3: Keyword-based internal linking engine

Für jeden Artikel extrahiert das Skript die Titel-Terme (kapitalisierte deutsche
Substantive mit min. 6 Zeichen) und sucht in allen anderen Artikeln nach diesen
Termen. Findet es einen Treffer, wird ein internal_link von jenem Artikel zum
ursprünglichen Artikel angelegt (quasi: "wer über X spricht, bekommt einen Link
zum Hauptartikel über X").

Max 5 outbound links pro Artikel, priorisiert nach Term-Länge (längere = spezifischer).
"""
import subprocess, re, html, sys

STOPWORDS = set('ist sind war waren wird werden'.split())
PB_CONTAINERS = {
    'prod': 'tcbnib1hhrx3qtw0kjo9neqo',
    'staging': 'fzwuk4fn3lome0lwdveaefrf',
    'dev': 't9j3cxtv5ercczronqi6zurs',
}

def extract_terms(text):
    text = re.sub(r'<[^>]+>', ' ', html.unescape(text or ''))
    return [w for w in re.findall(r'\b[A-ZÄÖÜ][a-zäöüß]{5,30}\b', text) if w.lower() not in STOPWORDS]

def run_sqlite(C, sql):
    r = subprocess.run(['docker','exec','-i',C,'sqlite3','/data/data.db'], input=sql, capture_output=True, text=True)
    return r.stdout, r.stderr, r.returncode

def process(env_name, prefix):
    r = subprocess.run(['docker','ps','--format','{{.Names}}'], capture_output=True, text=True)
    containers = [n for n in r.stdout.split() if n.startswith(f'pocketbase-{prefix}')]
    if not containers:
        print(f'{env_name}: no container')
        return
    C = containers[0]
    run_sqlite(C, "DELETE FROM blog_internal_links WHERE automatic=1;")
    out, _, _ = run_sqlite(C, "SELECT CHAR(31)||id||CHAR(30)||slug||CHAR(30)||title||CHAR(30)||content FROM blog_articles WHERE status='published';")
    articles = [{'id':x[0],'slug':x[1],'title':x[2],'content':x[3]}
                for x in (p.split(chr(30),3) for p in out.split(chr(31))[1:]) if len(x)==4]
    total = 0
    for i, a in enumerate(articles):
        terms = list(dict.fromkeys(extract_terms(a['title'])))
        picked = set(); link_cnt = 0
        for term in sorted(terms, key=len, reverse=True)[:8]:
            if link_cnt >= 5: break
            tl = term.lower()
            for b in articles:
                if b['id'] == a['id'] or b['id'] in picked: continue
                if tl in b['content'].lower():
                    pid = f"ln{i:02d}{link_cnt:02d}{hash(b['id'])%10000:04d}"[:15]
                    run_sqlite(C, f"INSERT INTO blog_internal_links (id,source_article_id,target_article_id,anchor_text,position,automatic,created) VALUES ('{pid}','{b['id']}','{a['id']}','{term.replace(chr(39),chr(39)*2)}','body',1,datetime('now'));")
                    picked.add(b['id']); link_cnt += 1; total += 1
                    if link_cnt >= 5: break
    print(f'{env_name}: {total} links')

if __name__ == '__main__':
    for env, pref in PB_CONTAINERS.items():
        process(env, pref)
