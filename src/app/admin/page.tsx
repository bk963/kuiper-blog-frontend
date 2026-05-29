import { requireAdmin, pbHeaders } from '@/lib/admin-auth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getCounts(token: string) {
  const pbUrl = process.env.PB_INTERNAL_URL || process.env.NEXT_PUBLIC_PB_URL || 'https://pb.kuiper-safety.de';
  async function count(collection: string, filter = ''): Promise<number> {
    try {
      const f = filter ? `&filter=${encodeURIComponent(filter)}` : '';
      const r = await fetch(`${pbUrl}/api/collections/${collection}/records?perPage=1${f}`, {
        headers: pbHeaders({ Authorization: token }),
        cache: 'no-store',
      });
      if (!r.ok) return 0;
      const d = await r.json();
      return d.totalItems || 0;
    } catch { return 0; }
  }
  return {
    total: await count('blog_articles'),
    published: await count('blog_articles', 'status="published"'),
    draft: await count('blog_articles', 'status="draft"'),
    leads: await count('blog_leads'),
  };
}

export default async function AdminDashboard() {
  const session = await requireAdmin();
  const c = await getCounts(session.pbToken);

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-extrabold mb-2">Dashboard</h1>
      <p className="text-slate-600 mb-8">Angemeldet als <span className="font-mono text-slate-900">{session.email}</span></p>

      {/* Stat-Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="p-5 bg-white rounded-xl border">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Artikel</div>
          <div className="text-3xl font-extrabold mt-1">{c.total}</div>
        </div>
        <div className="p-5 bg-white rounded-xl border">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Veröffentlicht</div>
          <div className="text-3xl font-extrabold mt-1 text-green-700">{c.published}</div>
        </div>
        <div className="p-5 bg-white rounded-xl border">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Drafts</div>
          <div className="text-3xl font-extrabold mt-1 text-amber-700">{c.draft}</div>
        </div>
        <div className="p-5 bg-white rounded-xl border">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Leads</div>
          <div className="text-3xl font-extrabold mt-1 text-brand-deep">{c.leads}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/articles" className="block p-6 bg-white rounded-xl border hover:shadow-md hover:border-brand transition">
          <div className="font-bold text-lg mb-1">📝 Artikel verwalten</div>
          <p className="text-sm text-slate-600">Bearbeiten, SEO-Optimierung, Status-Wechsel</p>
        </Link>
        <Link href="/admin/leads" className="block p-6 bg-white rounded-xl border hover:shadow-md hover:border-brand transition">
          <div className="font-bold text-lg mb-1">👥 Lead-Liste</div>
          <p className="text-sm text-slate-600">PDF-Downloads + Form-Submits ansehen</p>
        </Link>
        <Link href="/admin/seo" className="block p-6 bg-white rounded-xl border hover:shadow-md hover:border-brand transition">
          <div className="font-bold text-lg mb-1">📈 SEO-Monitor</div>
          <p className="text-sm text-slate-600">Position-Tracking, GSC-Daten (in Vorbereitung)</p>
        </Link>
        <Link href="/admin/ai" className="block p-6 bg-white rounded-xl border hover:shadow-md hover:border-brand transition">
          <div className="font-bold text-lg mb-1">🤖 AI-Assistent</div>
          <p className="text-sm text-slate-600">Themen + Drafts via Ollama (in Vorbereitung)</p>
        </Link>
      </div>
    </div>
  );
}
