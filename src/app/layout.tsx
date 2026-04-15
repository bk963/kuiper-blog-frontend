import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import Tracking from '@/components/Tracking';

const inter = Inter({ subsets: ['latin'] });

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
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Kuiper Safety Systems',
          url: 'https://kuiper-safety.de',
          logo: 'https://blog.kuiper-safety.de/favicon.svg',
          sameAs: ['https://www.linkedin.com/company/kuiper-safety-systems']
        }) }} />

        <Tracking />
        <header className="border-b bg-white sticky top-0 z-20">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="font-extrabold text-xl tracking-tight">
              Kuiper <span className="text-brand">Safety</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link href="/brandschutz" className="hover:text-brand">Brandschutz</Link>
              <Link href="/arbeitsschutz" className="hover:text-brand">Arbeitsschutz</Link>
              <Link href="/gesundheitsschutz" className="hover:text-brand">Gesundheitsschutz</Link>
              <Link href="https://kuiper-safety.de" className="hover:text-brand">Hauptseite</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t mt-20 py-8 text-sm text-slate-500">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between gap-3">
            <div>© {new Date().getFullYear()} Kuiper Safety Systems</div>
            <div className="flex gap-4">
              <Link href="https://kuiper-safety.de/impressum">Impressum</Link>
              <Link href="https://kuiper-safety.de/datenschutz">Datenschutz</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
