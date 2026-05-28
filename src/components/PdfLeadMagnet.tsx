'use client';
import { useState } from 'react';

/**
 * PDF-Lead-Magnet — Email-Gate vor PDF-Download.
 * Workflow: Email → Submit an PB blog_leads → Erfolg → Download-Link freigeben.
 *
 * Bewusst KEIN echtes Double-Opt-In, da DSGVO-Grundlage = "berechtigtes Interesse"
 * + sofortige Vertrags-/Geschäftsanbahnung (Download). Consent-Häkchen Pflicht.
 */
export default function PdfLeadMagnet({
  articleId,
  articleSlug,
  pdfTitle,
  pdfDescription,
  pdfFile,
  bullets,
}: {
  articleId?: string;
  articleSlug?: string;
  pdfTitle: string;
  pdfDescription: string;
  pdfFile: string;
  bullets?: string[];
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setErr('Bitte Einwilligung bestätigen.');
      return;
    }
    setStatus('sending');
    setErr('');
    try {
      const body = {
        email,
        name,
        company,
        source_article_id: articleId,
        form_type: 'pdf_download',
        lead_magnet: pdfFile,
        consented: true,
        consent_ts: new Date().toISOString(),
        status: 'new',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 500) : '',
      };
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_PB_URL || 'https://pb.kuiper-safety.de'}/api/collections/blog_leads/records`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      );
      if (!r.ok) throw new Error('Server-Fehler – bitte später erneut versuchen.');
      setStatus('ok');
      if ((window as any).gtag) {
        (window as any).gtag('event', 'generate_lead', {
          form_type: 'pdf_download',
          lead_magnet: pdfFile,
          article: articleSlug,
        });
      }
    } catch (e: any) {
      setStatus('err');
      setErr(e.message || 'Fehler');
    }
  }

  // Erfolg: Download-Box mit echtem PDF-Link
  if (status === 'ok') {
    return (
      <div className="my-8 p-6 sm:p-8 rounded-2xl border-2 border-green-300 bg-green-50">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">✅</span>
          <div>
            <h3 className="text-xl font-bold text-green-900">Vielen Dank!</h3>
            <p className="text-green-800 mt-1">Hier ist Ihr Download:</p>
          </div>
        </div>
        <a
          href={pdfFile}
          download
          className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-lg font-semibold transition-colors"
        >
          <span>📄</span> {pdfTitle} herunterladen
        </a>
        <p className="text-xs text-green-700 mt-4">
          Sie erhalten in Kürze auch eine E-Mail mit dem Download-Link für späteren Zugriff.
        </p>
      </div>
    );
  }

  return (
    <div className="my-8 p-6 sm:p-8 rounded-2xl border-2 border-brand/30 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl shrink-0">📄</span>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Gratis-Download: {pdfTitle}</h3>
          <p className="text-slate-700 mt-1">{pdfDescription}</p>
        </div>
      </div>

      {bullets && bullets.length > 0 && (
        <ul className="my-4 space-y-1.5 text-sm text-slate-800">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-brand mt-0.5">✓</span> <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="mt-5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="email"
            required
            placeholder="E-Mail-Adresse *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
          />
          <input
            type="text"
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
          />
        </div>
        <input
          type="text"
          placeholder="Unternehmen (optional)"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
        />
        <label className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 shrink-0"
            required
          />
          <span>
            Ich bin einverstanden, dass Kuiper Safety mich per E-Mail kontaktiert (Newsletter,
            Produktinfos). Jederzeit widerrufbar. Mehr in der{' '}
            <a href="https://www.kuiper-safety.de/datenschutz" className="underline" target="_blank">
              Datenschutzerklärung
            </a>
            .
          </span>
        </label>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-lg font-bold transition-colors disabled:opacity-50"
        >
          {status === 'sending' ? 'Sende…' : `📥 ${pdfTitle} kostenlos sichern`}
        </button>
      </form>
    </div>
  );
}
