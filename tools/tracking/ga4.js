/**
 * GA4 Measurement Protocol Client (Phase 6)
 * Server-side events to Google Analytics 4
 */
const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID;
const GA4_API_SECRET = process.env.GA4_API_SECRET;

export async function sendEvent(clientId, event, params = {}) {
  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) {
    return { status: 'skipped', reason: 'GA4 not configured' };
  }
  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;
  const body = { client_id: clientId, events: [{ name: event, params }] };
  const r = await fetch(url, { method: 'POST', body: JSON.stringify(body) });
  return { ok: r.ok, status: r.status };
}
