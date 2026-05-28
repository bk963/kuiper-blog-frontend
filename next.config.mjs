/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'pb.kuiper-safety.de' }] },
  async redirects() {
    // SEO-Migration: alte WP-PDF-URLs umleiten — fängt Backlinks/Bookmarks ab.
    // Phase-2-Schutz: zusätzlich zum Canonical auf brandschutzdozenten.de.
    return [
      // Brandklassen-Tabelle (139 Klicks/180T)
      { source: '/wp-content/uploads/2023/07/Brandklassen-Tabelle.pdf', destination: '/downloads/brandklassen-tabelle.pdf', permanent: true },
      // Brandschutzhelfer-Bestellung (541 Klicks/180T)
      { source: '/wp-content/uploads/2024/02/brandschutzhelfer-bestellung-vorlage.pdf', destination: '/downloads/brandschutzhelfer-bestellung-vorlage.pdf', permanent: true },
      // Brandschutzbeauftragter-Bestellung (163 Klicks/180T)
      { source: '/wp-content/uploads/2024/04/brandschutzbeauftragter-bestellung-bsb.pdf', destination: '/downloads/brandschutzbeauftragter-bestellung-bsb.pdf', permanent: true },
      // alte /blog/-URL-Struktur → neue /brandschutz/-Struktur
      { source: '/blog/:slug', destination: '/brandschutz/:slug', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};
export default nextConfig;
