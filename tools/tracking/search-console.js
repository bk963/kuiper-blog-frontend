/**
 * Search Console API Client (Phase 6)
 * Uses OAuth service account or refresh token.
 */
const REFRESH_TOKEN = process.env.GSC_REFRESH_TOKEN;
const CLIENT_ID = process.env.GSC_CLIENT_ID;
const CLIENT_SECRET = process.env.GSC_CLIENT_SECRET;
const SITE = process.env.GSC_SITE || 'https://blog.kuiper-safety.de/';

let cachedToken = null; let cachedExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < cachedExpiry) return cachedToken;
  if (!REFRESH_TOKEN || !CLIENT_ID || !CLIENT_SECRET) return null;
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN, grant_type: 'refresh_token',
    }),
  });
  const j = await r.json();
  if (!j.access_token) return null;
  cachedToken = j.access_token;
  cachedExpiry = Date.now() + (j.expires_in - 60) * 1000;
  return cachedToken;
}

export async function queryPerformance({ startDate, endDate, dimensions = ['query'], rowLimit = 1000 }) {
  const token = await getAccessToken();
  if (!token) return { status: 'skipped', reason: 'GSC not configured' };
  const url = `https://searchconsole.googleapis.com/v1/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate, endDate, dimensions, rowLimit }),
  });
  return r.json();
}
