'use client';
import { useState } from 'react';

export default function LeadForm({ articleId, articleSlug }: { articleId?: string; articleSlug?: string }) {
  const [email, setEmail] = useState(''); const [name, setName] = useState(''); const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle'|'sending'|'ok'|'err'>('idle'); const [err, setErr] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) return setErr('Bitte Einwilligung bestätigen.');
    setStatus('sending'); setErr('');
    try {
      const body = {
        email, name, source_article_id: articleId, form_type: 'newsletter',
        consented: true, consent_ts: new Date().toISOString(), status: 'new',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0,500) : '',
      };
      const r = await fetch(`${process.env.NEXT_PUBLIC_PB_URL || 'https://pb.kuiper-safety.de'}/api/collections/blog_leads/records`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error('Server-Fehler');
      setStatus('ok'); setEmail(''); setName('');
      if ((window as any).gtag) (window as any).gtag('event', 'generate_lead', { article: articleSlug });
    } catch (e: any) { setStatus('err'); setErr(e.message || 'Fehler'); }
  }
  if (status === 'ok') return <div className="p-6 bg-green-50 rounded-xl text-green-900">Danke! Wir melden uns in Kürze.</div>;
  return (
    <form onSubmit={submit} className="p-6 bg-slate-50 rounded-xl space-y-3">
      <h3 className="text-lg font-bold">Kostenfreie Checkliste anfordern</h3>
      <p className="text-sm text-slate-600">Tragen Sie Ihre E-Mail ein — wir schicken Ihnen Unterlagen zum Thema.</p>
      <input type="email" required placeholder="E-Mail" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-3 py-2 rounded border" />
      <input type="text" placeholder="Name (optional)" value={name} onChange={e=>setName(e.target.value)} className="w-full px-3 py-2 rounded border" />
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1" />
        <span>Ich bin einverstanden, dass Kuiper Safety mich per E-Mail kontaktiert. Widerruf jederzeit möglich.</span>
      </label>
      {err && <div className="text-sm text-red-600">{err}</div>}
      <button type="submit" disabled={status === 'sending'} className="bg-brand text-white px-5 py-2 rounded font-semibold hover:bg-brand-dark disabled:opacity-50">
        {status === 'sending' ? 'Sende...' : 'Jetzt anfordern'}
      </button>
    </form>
  );
}
