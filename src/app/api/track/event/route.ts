import { NextRequest, NextResponse } from 'next/server';

// Endpoint für kuiper-tracking.v1.js Event-Batches (page_view, scroll_depth, etc.)
// Speichert in blog_events Collection (CF-Access-protected PB).
// Adblocker-resistent (first-party Domain, kein Pixel-Image).

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function pbHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json', ...extra };
  if (process.env.PB_CF_ACCESS_CLIENT_ID) h['CF-Access-Client-Id'] = process.env.PB_CF_ACCESS_CLIENT_ID;
  if (process.env.PB_CF_ACCESS_CLIENT_SECRET) h['CF-Access-Client-Secret'] = process.env.PB_CF_ACCESS_CLIENT_SECRET;
  return h;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const events: any[] = Array.isArray(body?.events) ? body.events : [];
    const tracking: Record<string, any> = body?.tracking || {};
    if (!events.length) return NextResponse.json({ ok: true, stored: 0 });

    const pbUrl = process.env.PB_INTERNAL_URL || process.env.NEXT_PUBLIC_PB_URL || 'https://pb.kuiper-safety.de';
    const ip = (req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || '').split(',')[0].trim();

    // Best-effort write to blog_events — Collection darf fehlen, wir schlucken Fehler stillschweigend
    let stored = 0;
    for (const ev of events) {
      const record = {
        event: String(ev?.event || 'unknown').slice(0, 80),
        page: String(ev?.page || tracking?.current_page || '').slice(0, 500),
        host: String(ev?.host || tracking?.current_host || '').slice(0, 120),
        clkid: String(ev?.clkid || '').slice(0, 80),
        data: ev?.data || {},
        tracking,
        ip_hash: ip ? simpleHash(ip) : '',
        ua: (tracking?.user_agent || '').slice(0, 200),
        ts: ev?.ts || Date.now(),
      };
      try {
        const r = await fetch(`${pbUrl}/api/collections/blog_events/records`, {
          method: 'POST', headers: pbHeaders(), body: JSON.stringify(record),
        });
        if (r.ok) stored++;
      } catch (_) { /* ignore single-event errors */ }
    }
    return NextResponse.json({ ok: true, stored });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message?.slice(0, 200) || 'error' }, { status: 200 });
  }
}

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
  return Math.abs(h).toString(36);
}

// 204 fast für sendBeacon — auch GET zulassen ohne Fehler (Pixel-Fallback ggf. später)
export async function GET() {
  return new NextResponse(null, { status: 204 });
}
