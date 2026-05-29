import { requireAdmin, pbHeaders } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

type Lead = {
  id: string;
  email: string;
  name?: string;
  company?: string;
  form_type?: string;
  lead_magnet?: string;
  source_article_id?: string;
  created: string;
};

async function fetchLeads(token: string): Promise<{ items: Lead[]; error?: string }> {
  const pbUrl = process.env.PB_INTERNAL_URL || process.env.NEXT_PUBLIC_PB_URL || 'https://pb.kuiper-safety.de';
  try {
    const res = await fetch(`${pbUrl}/api/collections/blog_leads/records?perPage=100&sort=-created`, {
      headers: pbHeaders({ Authorization: token }),
      cache: 'no-store',
    });
    if (!res.ok) return { items: [], error: `HTTP ${res.status}: ${(await res.text()).slice(0, 200)}` };
    const data = await res.json();
    return { items: data.items || [] };
  } catch (e: any) { return { items: [], error: e?.message || 'Fehler' }; }
}

export default async function LeadsPage() {
  const s = await requireAdmin();
  const { items: leads, error } = await fetchLeads(s.pbToken);

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-extrabold mb-6">Leads</h1>
      {error && <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>}
      {!leads.length && !error && (
        <div className="p-8 rounded-lg bg-slate-100 text-slate-600 text-center">
          Noch keine Leads. PDF-Downloads + Form-Submits landen hier automatisch.
        </div>
      )}
      {leads.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">E-Mail</th>
                <th className="text-left px-4 py-3 font-semibold">Name / Firma</th>
                <th className="text-left px-4 py-3 font-semibold">Quelle</th>
                <th className="text-left px-4 py-3 font-semibold">Erhalten</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(l => (
                <tr key={l.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">{l.email}</td>
                  <td className="px-4 py-3">{l.name || '—'} {l.company ? `· ${l.company}` : ''}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {l.form_type === 'pdf_download' ? `📄 ${l.lead_magnet?.split('/').pop()}` : (l.form_type || '—')}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(l.created).toLocaleString('de-DE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
