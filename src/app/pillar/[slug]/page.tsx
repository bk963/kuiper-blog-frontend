import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPb, type Article, type PillarPage, type Category, pbFileUrl } from '@/lib/pb';
import type { Metadata } from 'next';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

async function getPillar(slug: string): Promise<(PillarPage & { expand?: { category_id?: Category } }) | null> {
  const pb = getPb();
  try {
    return await pb.collection('blog_pillar_pages').getFirstListItem(`slug = "${slug}" && status = "published"`, { expand: 'category_id' }) as any;
  } catch { return null; }
}

async function getArticles(pillarId: string): Promise<Article[]> {
  const pb = getPb();
  try {
    const r = await pb.collection('blog_articles').getList<Article>(1, 100, {
      filter: `status = "published" && pillar_id = "${pillarId}"`,
      sort: '-published_at',
      expand: 'category_id',
    });
    return r.items;
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPillar(slug);
  if (!p) return { title: 'Nicht gefunden' };
  return {
    title: p.meta_title || p.title,
    description: p.meta_description,
    robots: { index: true, follow: true },
    alternates: { canonical: `https://blog.kuiper-safety.de/pillar/${p.slug}` },
  };
}

export default async function PillarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPillar(slug);
  if (!p) notFound();
  const articles = await getArticles(p.id);
  const cat = p.expand?.category_id;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {cat && <Link href={`/${cat.slug}`} className="text-brand font-semibold text-sm uppercase tracking-wide">{cat.name}</Link>}
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-2 mb-4">{p.title}</h1>
      {p.intro && <div className="text-lg text-slate-600 mb-8 prose prose-lg" dangerouslySetInnerHTML={{ __html: p.intro }} />}
      {p.content && <div className="prose prose-lg max-w-none mb-12" dangerouslySetInnerHTML={{ __html: p.content }} />}

      {articles.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mt-12 mb-6">Alle Artikel zu diesem Thema ({articles.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(a => {
              const img = a.hero_image_url || pbFileUrl(a, a.hero_image);
              const catSlug = a.expand?.category_id?.slug || 'blog';
              return (
                <Link key={a.id} href={`/${catSlug}/${a.slug}`} className="group block">
                  <article className="rounded-xl overflow-hidden border hover:shadow-lg transition-shadow h-full flex flex-col">
                    {img ? (
                      <div className="aspect-[16/9] relative bg-slate-100">
                        <Image src={img} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform" sizes="(max-width: 768px) 100vw, 33vw" unoptimized />
                      </div>
                    ) : (<div className="aspect-[16/9] bg-gradient-to-br from-brand/10 to-brand/20" />)}
                    <div className="p-5 flex-1">
                      <h3 className="text-lg font-bold leading-snug mb-2 group-hover:text-brand">{a.title}</h3>
                      {a.excerpt && <p className="text-sm text-slate-600 line-clamp-3">{a.excerpt}</p>}
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
