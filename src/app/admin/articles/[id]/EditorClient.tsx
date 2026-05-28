'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// TipTap NUR client-side via dynamic import → kein SSR-Bundle-Bloat
const RichEditor = dynamic(() => import('./RichEditor'), { ssr: false, loading: () => <div className="h-64 bg-slate-100 rounded animate-pulse" /> });

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  status: string;
  meta_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  secondary_keywords?: string[];
  faqs?: Array<{ q: string; a: string }>;
};

export default function EditorClient({ article, pbToken }: { article: Article; pbToken: string }) {
  const [a, setA] = useState<Article>(article);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function save() {
    setSaving(true); setError('');
    try {
      const res = await fetch(`/admin/api/save?id=${a.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: a.title, excerpt: a.excerpt, content: a.content,
          status: a.status, meta_title: a.meta_title,
          meta_description: a.meta_description, focus_keyword: a.focus_keyword,
          secondary_keywords: a.secondary_keywords, faqs: a.faqs,
        }),
      });
      if (!res.ok) throw new Error('Speichern fehlgeschlagen');
      setSavedAt(new Date().toLocaleTimeString('de-DE'));
    } catch (e: any) { setError(e?.message || 'Fehler'); } finally { setSaving(false); }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold mb-1">{a.title || '(ohne Titel)'}</h1>
          <p className="text-xs text-slate-500 font-mono">/{a.slug}</p>
        </div>
        <div className="flex gap-2 items-center">
          {savedAt && <span className="text-xs text-green-700">✓ {savedAt}</span>}
          {error && <span className="text-xs text-red-600">{error}</span>}
          <a href={`https://blog.kuiper-safety.de/brandschutz/${a.slug}`} target="_blank" className="px-3 py-2 text-sm border rounded hover:bg-slate-50">↗ Vorschau</a>
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-brand text-white rounded font-bold disabled:opacity-50">{saving ? 'Speichere…' : '💾 Speichern'}</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-5 rounded-xl border">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">Titel (H1 + meta_title-Fallback)</label>
            <input type="text" value={a.title} onChange={e => setA({ ...a, title: e.target.value })} className="w-full px-3 py-2 rounded border" />
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1 mt-4">Excerpt (Listen + OG)</label>
            <textarea rows={2} value={a.excerpt || ''} onChange={e => setA({ ...a, excerpt: e.target.value })} className="w-full px-3 py-2 rounded border" />
          </section>

          <section className="bg-white p-5 rounded-xl border">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">Inhalt</label>
            <RichEditor html={a.content} onChange={(html: string) => setA({ ...a, content: html })} />
          </section>

          <section className="bg-white p-5 rounded-xl border">
            <h3 className="font-bold mb-3">FAQs (für Featured Snippets)</h3>
            <div className="space-y-3">
              {(a.faqs || []).map((f, i) => (
                <div key={i} className="border rounded p-3 bg-slate-50">
                  <input type="text" value={f.q} onChange={e => { const nf = [...(a.faqs || [])]; nf[i] = { ...nf[i], q: e.target.value }; setA({ ...a, faqs: nf }); }} placeholder="Frage" className="w-full px-2 py-1.5 rounded border mb-2 font-semibold" />
                  <textarea rows={2} value={f.a} onChange={e => { const nf = [...(a.faqs || [])]; nf[i] = { ...nf[i], a: e.target.value }; setA({ ...a, faqs: nf }); }} placeholder="Antwort" className="w-full px-2 py-1.5 rounded border text-sm" />
                  <button onClick={() => setA({ ...a, faqs: (a.faqs || []).filter((_, j) => j !== i) })} className="mt-2 text-xs text-red-600">Löschen</button>
                </div>
              ))}
              <button onClick={() => setA({ ...a, faqs: [...(a.faqs || []), { q: '', a: '' }] })} className="text-sm font-semibold text-brand">+ FAQ hinzufügen</button>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="bg-white p-5 rounded-xl border">
            <h3 className="font-bold mb-3">Status</h3>
            <select value={a.status} onChange={e => setA({ ...a, status: e.target.value })} className="w-full px-3 py-2 rounded border">
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </section>

          <section className="bg-white p-5 rounded-xl border">
            <h3 className="font-bold mb-3">SEO</h3>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">Meta-Title <span className="font-normal text-slate-400">({(a.meta_title || '').length}/60)</span></label>
            <input type="text" value={a.meta_title || ''} onChange={e => setA({ ...a, meta_title: e.target.value })} className="w-full px-3 py-2 rounded border mb-3" />
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">Meta-Description <span className="font-normal text-slate-400">({(a.meta_description || '').length}/155)</span></label>
            <textarea rows={3} value={a.meta_description || ''} onChange={e => setA({ ...a, meta_description: e.target.value })} className="w-full px-3 py-2 rounded border mb-3" />
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">Focus-Keyword</label>
            <input type="text" value={a.focus_keyword || ''} onChange={e => setA({ ...a, focus_keyword: e.target.value })} className="w-full px-3 py-2 rounded border mb-3" />
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">Secondary Keywords (komma-getrennt)</label>
            <input type="text" value={(a.secondary_keywords || []).join(', ')} onChange={e => setA({ ...a, secondary_keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="w-full px-3 py-2 rounded border" />
          </section>
        </aside>
      </div>
    </div>
  );
}
