#!/usr/bin/env node
/**
 * DataForSEO API Client (Phase 4)
 * Needs: DATAFORSEO_LOGIN + DATAFORSEO_PASSWORD env vars
 * Falls back to no-op if not configured.
 */
const LOGIN = process.env.DATAFORSEO_LOGIN;
const PASSWORD = process.env.DATAFORSEO_PASSWORD;
const BASE = 'https://api.dataforseo.com/v3';

function auth() {
  if (!LOGIN || !PASSWORD) return null;
  return 'Basic ' + Buffer.from(`${LOGIN}:${PASSWORD}`).toString('base64');
}

export async function apiCall(endpoint, data) {
  const a = auth();
  if (!a) return { status: 'skipped', reason: 'no DATAFORSEO credentials' };
  const r = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Authorization': a, 'Content-Type': 'application/json' },
    body: JSON.stringify(Array.isArray(data) ? data : [data]),
  });
  return r.json();
}

// --- High-level methods ---

export async function getSerp(keyword, opts = {}) {
  const { language = 'de', location = 'Germany', device = 'desktop' } = opts;
  return apiCall('/serp/google/organic/live/regular', {
    keyword, language_code: language, location_name: location, device, depth: 10,
  });
}

export async function getKeywordData(keywords, opts = {}) {
  const { language = 'de', location = 'Germany' } = opts;
  return apiCall('/keywords_data/google_ads/search_volume/live', {
    keywords: Array.isArray(keywords) ? keywords : [keywords],
    language_code: language, location_name: location,
  });
}

export async function getCompetitorDomains(keyword, opts = {}) {
  const serp = await getSerp(keyword, opts);
  if (serp?.status === 'skipped') return serp;
  const items = serp?.tasks?.[0]?.result?.[0]?.items || [];
  return items.map(i => ({ position: i.rank_group, domain: i.domain, url: i.url, title: i.title }));
}

// CLI entry
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, cmd, ...args] = process.argv;
  (async () => {
    if (cmd === 'serp') console.log(JSON.stringify(await getSerp(args[0] || 'brandschutz'), null, 2));
    else if (cmd === 'keywords') console.log(JSON.stringify(await getKeywordData(args), null, 2));
    else if (cmd === 'test') console.log('DataForSEO credentials:', auth() ? 'configured' : 'missing');
    else console.log('Usage: node dataforseo.js [serp|keywords|test] [args]');
  })().catch(e => { console.error(e); process.exit(1); });
}
