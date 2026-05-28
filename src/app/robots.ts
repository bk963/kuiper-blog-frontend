import type { MetadataRoute } from 'next';

/**
 * SEO-Go-Live (Phase 2 Soft-Cutover, 2026-05-28)
 *
 * Aktiviert: alle Inhalte sind erlaubt + Sitemap referenziert.
 * Migration brandschutzdozenten.de → blog.kuiper-safety.de läuft mit
 * Canonical-Tags auf der alten Domain (zeigen auf diese Domain als Master).
 * Google folgt den Canonicals und übernimmt die Rankings über 4-8 Wochen.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://blog.kuiper-safety.de/sitemap.xml',
    host: 'https://blog.kuiper-safety.de',
  };
}
