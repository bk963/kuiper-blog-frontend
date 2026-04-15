import { NextResponse } from 'next/server';
import { getPb } from '@/lib/pb';

export async function POST(req: Request) {
  try {
    const ct = req.headers.get('content-type') || '';
    let email = ''; let name = '';
    if (ct.includes('application/json')) {
      const body = await req.json();
      email = body.email || ''; name = body.name || '';
    } else {
      const form = await req.formData();
      email = String(form.get('email') || ''); name = String(form.get('name') || '');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'E-Mail ungültig' }, { status: 400 });
    }
    const pb = getPb();
    await pb.collection('blog_leads').create({
      email, name, form_type: 'newsletter',
      consented: true, consent_ts: new Date().toISOString(),
      status: 'new',
      utm_source: 'homepage_newsletter',
      user_agent: req.headers.get('user-agent')?.slice(0, 500) || '',
    });
    // Return HTML redirect on form submit, JSON on fetch
    if (ct.includes('application/x-www-form-urlencoded')) {
      return NextResponse.redirect(new URL('/?subscribed=true', req.url), 303);
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Fehler' }, { status: 500 });
  }
}
