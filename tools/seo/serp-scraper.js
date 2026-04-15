#!/usr/bin/env node
/**
 * Eigener SERP-Scraper (Phase 4) — Google HTML-Scraping, Fallback für DataForSEO.
 * Achtung: Google-Scraping ist fragil. Für Produktion besser DataForSEO.
 * Dieser Scraper ist der "selbst nachbaubare" Teil.
 */
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36';

export async function scrapeSerp(keyword, opts = {}) {
  const { gl = 'de', hl = 'de', num = 10 } = opts;
  const url = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&gl=${gl}&hl=${hl}&num=${num}&pws=0`;
  const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'de-DE,de;q=0.9' }, redirect: 'follow' });
  const html = await r.text();
  if (html.includes('/sorry/')) return { error: 'rate_limited', keyword };
  return parseSerp(html, keyword);
}

function parseSerp(html, keyword) {
  const results = [];
  // Naive regex — extract result blocks
  const re = /<a href="([^"]+)"[^>]*><h3[^>]*>([^<]+)<\/h3>/g;
  let m; let pos = 0;
  while ((m = re.exec(html)) !== null && pos < 10) {
    let url = m[1];
    if (url.startsWith('/url?')) {
      const u = new URL('https://google.com' + url);
      url = u.searchParams.get('q') || url;
    }
    if (url.startsWith('http') && !url.includes('google.com')) {
      pos++;
      try {
        results.push({ position: pos, url, domain: new URL(url).hostname, title: m[2] });
      } catch {}
    }
  }
  return { keyword, results, scraped_at: new Date().toISOString() };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, kw = 'brandschutz'] = process.argv;
  scrapeSerp(kw).then(r => console.log(JSON.stringify(r, null, 2)));
}
