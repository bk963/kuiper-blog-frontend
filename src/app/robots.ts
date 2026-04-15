import type { MetadataRoute } from 'next';
// Phase 9: noindex wegen duplicate content (Artikel stammen von brandschutzdozenten.de)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', disallow: '/' },
    // Sitemap explizit weg — wir wollen NICHT indiziert werden
  };
}
