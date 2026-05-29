import type { Metadata } from 'next';
import { Figtree, DM_Sans } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import { headers } from 'next/headers';
import './globals.css';
import Tracking from '@/components/Tracking';

const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree', display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Kuiper Safety Blog', template: '%s | Kuiper Safety' },
  description: 'Fachwissen rund um Brandschutz, Arbeitsschutz und Gesundheitsschutz',
  alternates: { canonical: 'https://blog.kuiper-safety.de' },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: 'Kuiper Safety Blog',
    url: 'https://blog.kuiper-safety.de',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: { icon: '/favicon.ico' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Admin hat eigenes Layout (Sidebar) — Public-Header/Footer hier weglassen
  const pathname = (await headers()).get('x-pathname') || '';
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <html lang="de" className={`${figtree.variable} ${dmSans.variable}`}>
        <body className="font-sans bg-white text-ink antialiased">{children}</body>
      </html>
    );
  }

  return (
    <html lang="de" className={`${figtree.variable} ${dmSans.variable}`}>
      <body className="font-sans bg-white text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Kuiper Safety Systems',
              url: 'https://kuiper-safety.de',
              logo: 'https://blog.kuiper-safety.de/brand/kss-logo.svg',
              sameAs: ['https://www.linkedin.com/company/kuiper-safety-systems'],
            }),
          }}
        />

        <Tracking />

        {/* Header: Navy-Hintergrund + Logo + Nav */}
        <header className="bg-navy text-white sticky top-0 z-30 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Kuiper Safety Blog">
              <Image
                src="/brand/kss-logo.svg"
                alt="Kuiper Safety Systems"
                width={180}
                height={36}
                priority
                className="h-9 w-auto"
              />
              <span className="hidden sm:inline text-xs uppercase tracking-[0.18em] font-semibold text-brand opacity-80 ml-1">
                Blog
              </span>
            </Link>
            <nav className="flex items-center gap-1 sm:gap-2 text-sm font-semibold">
              <Link href="/brandschutz" className="px-3 py-2 rounded-md hover:bg-white/10 hover:text-brand transition">
                Brandschutz
              </Link>
              <Link href="/arbeitsschutz" className="px-3 py-2 rounded-md hover:bg-white/10 hover:text-brand transition">
                Arbeitsschutz
              </Link>
              <Link href="/gesundheitsschutz" className="px-3 py-2 rounded-md hover:bg-white/10 hover:text-brand transition">
                Gesundheitsschutz
              </Link>
              <Link
                href="https://www.kuiper-safety.de"
                className="ml-2 px-4 py-2 rounded-md bg-brand text-navy hover:bg-brand-light font-bold transition"
              >
                Hauptseite →
              </Link>
            </nav>
          </div>
        </header>

        <main className="min-h-[60vh]">{children}</main>

        {/* Footer: Navy mit Logo + Links */}
        <footer className="bg-navy-dark text-white/85 mt-24 pt-12 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
              <div className="md:col-span-2">
                <Image src="/brand/kss-logo.svg" alt="Kuiper Safety Systems" width={210} height={40} className="h-10 w-auto mb-4" />
                <p className="text-sm text-white/70 max-w-md">
                  Fachwissen rund um Brandschutz, Arbeitsschutz und Gesundheitsschutz —
                  praxisnah, rechtssicher und sofort anwendbar.
                </p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-brand mb-3">Themen</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/brandschutz" className="hover:text-brand">Brandschutz</Link></li>
                  <li><Link href="/arbeitsschutz" className="hover:text-brand">Arbeitsschutz</Link></li>
                  <li><Link href="/gesundheitsschutz" className="hover:text-brand">Gesundheitsschutz</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-brand mb-3">Kuiper Safety</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="https://www.kuiper-safety.de" className="hover:text-brand">Hauptseite</Link></li>
                  <li><Link href="https://www.kuiper-safety.de/impressum" className="hover:text-brand">Impressum</Link></li>
                  <li><Link href="https://www.kuiper-safety.de/datenschutz" className="hover:text-brand">Datenschutz</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-6 text-xs text-white/60 flex flex-col sm:flex-row justify-between gap-3">
              <div>© {new Date().getFullYear()} Kuiper Safety Systems · Alle Rechte vorbehalten.</div>
              <div className="flex items-center gap-2">
                <Image src="/brand/kss-k-cyan.svg" alt="" width={16} height={16} className="opacity-80" />
                <span>Made in Germany</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
