import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPb, type Article, type Category, type PillarPage, pbFileUrl } from '@/lib/pb';
import Image from 'next/image';
import type { Metadata } from 'next';

export const revalidate = 300;

async function getCategory(slug: string): Promise<Category | null> {
  const pb = getPb();
  try {
    return await pb.collection('blog_categories').getFirstListItem<Category>(`slug = "${slug}"`);
  } catch { return null; }
}

async function getArticles(categoryId: string): Promise<Article[]> {
  const pb = getPb();
  try {
    const r = await pb.collection('blog_articles').getList<Article>(1, 50, {
      filter: `status = "published" && category_id = "${categoryId}"`,
      sort: '-published_at',
      expand: 'category_id',
    });
    return r.items;
  } catch { return []; }
}

async function getPillar(categoryId: string): Promise<PillarPage | null> {
  const pb = getPb();
  try {
    return await pb.collection('blog_pillar_pages').getFirstListItem<PillarPage>(`status = "published" && category_id = "${categoryId}"`);
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategory(category);
  if (!cat) return { title: 'Nicht gefunden' };
  return {
    title: cat.meta_title || cat.name,
    description: cat.description || undefined,
    alternates: { canonical: `https://blog.kuiper-safety.de/${cat.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = await getCategory(category);
  if (!cat) notFound();
  const [articles, pillar] = await Promise.all([getArticles(cat.id), getPillar(cat.id)]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">{cat.name}</h1>
        {cat.description && <div className="text-lg text-slate-600" dangerouslySetInnerHTML={{ __html: cat.description }} />}
      </div>
      {pillar && (
        <div className="mb-10 p-6 rounded-xl bg-gradient-to-br from-brand/5 to-brand/10 border">
          <div className="text-xs font-semibold uppercase text-brand mb-2">Grundlagen</div>
          <h2 className="text-2xl font-bold mb-2">{pillar.title}</h2>
          <Link href={`/pillar/${pillar.slug}`} className="inline-block text-brand font-medium">Zur Übersicht →</Link>
        </div>
      )}
      {articles.length === 0 ? (
        <div className="border-2 border-dashed rounded-xl py-16 text-center text-slate-500">Keine Artikel in dieser Kategorie.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(a => {
            const img = pbFileUrl(a, a.hero_image);
            return (
              <Link key={a.id} href={`/${cat.slug}/${a.slug}`} className="group block">
                <article className="rounded-xl overflow-hidden border hover:shadow-lg transition-shadow h-full flex flex-col">
                  {img ? (
                    <div className="aspect-[16/9] relative bg-slate-100">
                      <Image src={img} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform" sizes="(max-width: 768px) 100vw, 33vw" />
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
      )}
    </div>
  );
}
