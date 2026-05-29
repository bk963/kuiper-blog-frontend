import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'Admin · Kuiper Safety Blog',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

// PageSpeed-Trennung: Admin ist komplett dynamisch + getrennt
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get('x-pathname') || '';
  // Login-Page hat eigenes Vollbild-Layout — kein Sidebar
  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-60 bg-navy text-white p-5 flex flex-col">
        <Link href="/admin" className="flex items-center gap-2 mb-8 hover:opacity-80">
          <Image src="/brand/kss-k-cyan.svg" alt="KS" width={28} height={28} />
          <span className="font-bold text-sm uppercase tracking-wider text-brand">Admin</span>
        </Link>
        <nav className="space-y-1 text-sm">
          <Link href="/admin" className="block px-3 py-2 rounded hover:bg-white/10 transition">📊 Dashboard</Link>
          <Link href="/admin/articles" className="block px-3 py-2 rounded hover:bg-white/10 transition">📝 Artikel</Link>
          <Link href="/admin/leads" className="block px-3 py-2 rounded hover:bg-white/10 transition">👥 Leads</Link>
          <Link href="/admin/seo" className="block px-3 py-2 rounded hover:bg-white/10 transition">📈 SEO-Monitor</Link>
          <Link href="/admin/ai" className="block px-3 py-2 rounded hover:bg-white/10 transition">🤖 AI-Assistent</Link>
        </nav>
        <div className="mt-auto pt-6 space-y-2 text-xs text-white/60">
          <a href="https://blog.kuiper-safety.de" target="_blank" className="block hover:text-brand">↗ Blog Live ansehen</a>
          <form action="/admin/api/auth/logout" method="POST">
            <button type="submit" className="hover:text-white">Abmelden</button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
