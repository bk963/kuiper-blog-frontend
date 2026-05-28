import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin · Kuiper Safety Blog',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

// PageSpeed-Trennung: Admin ist komplett dynamisch + getrennt
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-56 bg-slate-900 text-slate-100 p-5 flex flex-col">
        <div className="font-extrabold text-lg mb-6">KS Admin</div>
        <nav className="space-y-1 text-sm">
          <Link href="/admin" className="block px-3 py-2 rounded hover:bg-slate-800">Dashboard</Link>
          <Link href="/admin/articles" className="block px-3 py-2 rounded hover:bg-slate-800">Artikel</Link>
          <Link href="/admin/leads" className="block px-3 py-2 rounded hover:bg-slate-800 opacity-50">Leads (bald)</Link>
          <Link href="/admin/seo" className="block px-3 py-2 rounded hover:bg-slate-800 opacity-50">SEO-Monitor (bald)</Link>
        </nav>
        <form action="/admin/api/auth/logout" method="POST" className="mt-auto pt-6">
          <button type="submit" className="text-xs text-slate-400 hover:text-white">Abmelden</button>
        </form>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
