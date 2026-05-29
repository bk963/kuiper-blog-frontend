import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export default async function SeoPage() {
  await requireAdmin();
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-extrabold mb-2">SEO-Monitor</h1>
      <p className="text-slate-600 mb-8">Tägliches Position-Tracking via Google Search Console</p>
      <div className="p-8 rounded-xl border bg-slate-50">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">⏳</span>
          <h2 className="font-bold text-lg">Demnächst</h2>
        </div>
        <p className="text-slate-700 mb-4">
          Der GSC-Tracker läuft im Hintergrund (Cron 07:00 täglich) und sammelt seit 2026-05-28 Tageswerte für Tier-1+2-Artikel auf beiden Properties.
        </p>
        <p className="text-sm text-slate-600">
          Hier wird das Dashboard sein: Position-Verlauf pro Artikel, Klicks-Trend, Top-Gewinner/-Verlierer, Anomalie-Alerts.
        </p>
        <div className="mt-6 text-xs text-slate-500">
          Aktuelle Datenquelle: <code className="bg-white px-2 py-0.5 rounded">/root/.kuiper-secrets/migration-data/seo-tracking/</code>
        </div>
      </div>
    </div>
  );
}
