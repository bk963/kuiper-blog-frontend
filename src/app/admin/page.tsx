import { requireAdmin } from '@/lib/admin-auth';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await requireAdmin();
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-extrabold mb-2">Dashboard</h1>
      <p className="text-slate-600 mb-8">Angemeldet als <span className="font-mono">{session.email}</span></p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/articles" className="block p-6 bg-white rounded-xl border hover:shadow-md transition">
          <div className="font-bold text-lg mb-1">📝 Artikel verwalten</div>
          <p className="text-sm text-slate-600">Bearbeiten, neu anlegen, SEO optimieren</p>
        </Link>
        <div className="block p-6 bg-white rounded-xl border opacity-50 cursor-not-allowed">
          <div className="font-bold text-lg mb-1">📊 SEO-Monitor</div>
          <p className="text-sm text-slate-600">Position-Tracking, GSC-Daten · bald</p>
        </div>
        <div className="block p-6 bg-white rounded-xl border opacity-50 cursor-not-allowed">
          <div className="font-bold text-lg mb-1">📋 Lead-Liste</div>
          <p className="text-sm text-slate-600">PDF-Downloads, Form-Submits · bald</p>
        </div>
        <div className="block p-6 bg-white rounded-xl border opacity-50 cursor-not-allowed">
          <div className="font-bold text-lg mb-1">🤖 AI-Assistent</div>
          <p className="text-sm text-slate-600">Drafts via Ollama, SEO-Vorschläge · bald</p>
        </div>
      </div>
    </div>
  );
}
