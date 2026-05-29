import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export default async function AiPage() {
  await requireAdmin();
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-extrabold mb-2">AI-Assistent</h1>
      <p className="text-slate-600 mb-8">Themen-Vorschläge und Draft-Generierung via Ollama (GEX44)</p>
      <div className="p-8 rounded-xl border bg-gradient-to-br from-slate-50 to-brand/5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">🤖</span>
          <h2 className="font-bold text-lg">In Vorbereitung</h2>
        </div>
        <ul className="space-y-2 text-slate-700 mb-4 list-disc list-inside text-sm">
          <li>Themen-Vorschläge aus GSC: ungenutzte Ranking-Chancen Pos 4-20</li>
          <li>AI-Draft-Generierung mit qwen2.5:32b auf GEX44 (DSGVO-konform, lokal)</li>
          <li>Konkurrenz-Analyse: Sub-Topics aus Top-Rankings extrahieren</li>
          <li>Auto-Internal-Links-Vorschläge basierend auf blog_internal_links</li>
          <li>SEO-Score Live während Schreiben</li>
          <li>Wochenplan: 3-5 priorisierte Artikel pro Woche</li>
        </ul>
        <div className="mt-6 text-xs text-slate-500">
          GEX44-Endpoint: <code className="bg-white px-2 py-0.5 rounded">https://gex44.kuiper-safety.de</code>
        </div>
      </div>
    </div>
  );
}
