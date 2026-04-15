import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPb, type Article, type Category, pbFileUrl } from '@/lib/pb';
import type { Metadata } from 'next';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

async function getArticle(slug: string): Promise<Article | null> {
  const pb = getPb();
  try {
    return await pb.collection('blog_articles').getFirstListItem<Article>(`slug = "${slug}" && status = "published"`, { expand: 'category_id,pillar_id' });
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata> {
  const { slug, category } = await params;
  const a = await getArticle(slug);
  if (!a) return { title: 'Nicht gefunden' };
  return {
    title: a.meta_title || a.title,
    description: a.meta_description || a.excerpt,
    alternates: { canonical: `https://blog.kuiper-safety.de/${category}/${a.slug}` },
    openGraph: {
      title: a.meta_title || a.title,
      description: a.meta_description || a.excerpt,
      type: 'article',
      publishedTime: a.published_at,
      authors: a.author ? [a.author] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  const a = await getArticle(slug);
  if (!a) notFound();
  const img = pbFileUrl(a, a.hero_image);
  const cat = a.expand?.category_id;

  return (
    <article className="container mx-auto px-4 py-10 max-w-3xl">
      {cat && <Link href={`/${cat.slug}`} className="text-brand font-semibold text-sm uppercase tracking-wide">{cat.name}</Link>}
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-2 mb-4">{a.title}</h1>
      <div className="flex items-center gap-4 text-sm text-slate-500 mb-8">
        {a.author && <span>Von {a.author}</span>}
        {a.published_at && <time dateTime={a.published_at}>{new Date(a.published_at).toLocaleDateString('de-DE')}</time>}
        {a.reading_time_min && <span>{a.reading_time_min} Min.</span>}
      </div>
      {img && (
        <div className="relative aspect-[16/9] mb-8 rounded-xl overflow-hidden">
          <Image src={img} alt={a.title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 768px" />
        </div>
      )}
      <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: a.content }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: a.title,
        description: a.excerpt,
        image: img ? [img] : undefined,
        datePublished: a.published_at,
        dateModified: a.updated,
        author: a.author ? { '@type': 'Person', name: a.author } : { '@type': 'Organization', name: 'Kuiper Safety' },
        publisher: { '@type': 'Organization', name: 'Kuiper Safety Systems' },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `https://blog.kuiper-safety.de/${category}/${a.slug}` },
      }) }} />
    </article>
  );
}
