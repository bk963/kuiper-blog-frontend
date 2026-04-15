import type { MetadataRoute } from 'next';
import { getPb, type Article, type Category } from '@/lib/pb';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://blog.kuiper-safety.de';
  const pb = getPb();
  const entries: MetadataRoute.Sitemap = [{ url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 }];
  try {
    const cats = await pb.collection('blog_categories').getFullList<Category>({ $autoCancel: false });
    for (const c of cats) entries.push({ url: `${base}/${c.slug}`, changeFrequency: 'weekly', priority: 0.8 });
  } catch {}
  try {
    const pillars = await pb.collection('blog_pillar_pages').getFullList<{slug:string,updated:string}>({ filter: 'status = "published"', $autoCancel: false });
    for (const p of pillars) entries.push({ url: `${base}/pillar/${p.slug}`, lastModified: new Date(p.updated), changeFrequency: 'weekly', priority: 0.9 });
  } catch {}
  try {
    const arts = await pb.collection('blog_articles').getFullList<Article>({ filter: 'status = "published"', expand: 'category_id', $autoCancel: false });
    for (const a of arts) {
      const catSlug = (a as any).expand?.category_id?.slug || 'blog';
      entries.push({ url: `${base}/${catSlug}/${a.slug}`, lastModified: new Date(a.updated), changeFrequency: 'monthly', priority: 0.7 });
    }
  } catch {}
  return entries;
}
