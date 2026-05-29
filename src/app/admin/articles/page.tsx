import { requireAdmin, pbHeaders } from '@/lib/admin-auth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type ListArticle = {
  id: string;
  slug: string;
  title: string;
  status: string;
  meta_title?: string;
  updated: string;
  seo_score?: number;
};

async function fetchArticles(token: string): Promise<{ items: ListArticle[]; error?: string }> {
  const pbUrl = process.env.PB_INTERNAL_URL || process.env.NEXT_PUBLIC_PB_URL || 'https://pb.kuiper-safety.de';
  const url = `${pbUrl}/api/collections/blog_articles/records?perPage=200&sort=-updated`;
  try {
    const res = await fetch(url, {
      headers: pbHeaders({ Authorization: token }),
      cache: 'no-store',
    });
    if (!res.ok) {
      const txt = await res.text();
      return { items: [], error: `HTTP ${res.status}: ${txt.slice(0, 200)}` };
    }
    const data = await res.json();
    return { items: data.items || [] };
  } catch (e: any) {
    return { items: [], error: e?.message || 'Fetch-Fehler' };
  }
}

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const s = await requireAdmin();
  const sp = await searchParams;
  const { items: articles, error } = await fetchArticles(s.pbToken);
  const filtered = articles.filter(a => {
    if (sp.q && !((a.title || '').toLowerCase().includes(sp.q.toLowerCase()) || (a.slug || '').includes(sp.q.toLowerCase()))) return false;
    if (sp.status && a.status !== sp.status) return false;
    return true;
  });

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">Artikel</h1>
        <span className="text-sm text-slate-500">{filtered.length} / {articles.length}</span>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          <div className="font-bold mb-1">Fehler beim Laden:</div>
          <code className="text-xs">{error}</code>
        </div>
      )}

      <form action="/admin/articles" method="GET" className="mb-6 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={sp.q}
          placeholder="Suchen…"
          className="flex-1 px-3 py-2 rounded border border-slate-300"
        />
        <select name="status" defaultValue={sp.status || ''} className="px-3 py-2 rounded border border-slate-300">
          <option value="">Alle Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="archived">Archived</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded font-semibold">Filter</button>
      </form>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Titel / Slug</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-left px-4 py-3 font-semibold">SEO</th>
              <th className="text-left px-4 py-3 font-semibold">Geändert</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/articles/${a.id}`} className="font-semibold text-slate-900 hover:text-brand block">
                    {a.title || '(ohne Titel)'}
                  </Link>
                  <span className="text-xs text-slate-500">/{a.slug}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={
                    a.status === 'published' ? 'inline-block px-2 py-0.5 rounded text-xs bg-green-100 text-green-800' :
                    a.status === 'draft' ? 'inline-block px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800' :
                    a.status === 'review' ? 'inline-block px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800' :
                    'inline-block px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700'
                  }>{a.status}</span>
                </td>
                <td className="px-4 py-3 text-slate-700">{a.seo_score != null ? `${a.seo_score}/100` : '—'}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(a.updated).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
