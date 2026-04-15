import Link from 'next/link';
import Image from 'next/image';
import { getPb, type Article, pbFileUrl } from '@/lib/pb';

export const revalidate = 60;
export const dynamic = 'force-dynamic'; // ISR: 5 minutes

async function getArticles(): Promise<Article[]> {
  const pb = getPb();
  try {
    const result = await pb.collection('blog_articles').getList<Article>(1, 24, {
      filter: 'status = "published"',
      sort: '-published_at',
      expand: 'category_id,pillar_id',
    });
    return result.items;
  } catch (e) {
    console.error('[blog] fetch failed', e);
    return [];
  }
}

export default async function HomePage() {
  const articles = await getArticles();
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Sicherheit. Klar erklärt.</h1>
        <p className="text-lg text-slate-600">Fachwissen rund um Brand-, Arbeits- und Gesundheitsschutz — verständlich, aktuell, praxiserprobt.</p>
      </div>
      {articles.length === 0 ? (
        <div className="border-2 border-dashed rounded-xl py-16 text-center text-slate-500">
          Noch keine Artikel veröffentlicht.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(a => {
            const img = a.hero_image_url || pbFileUrl(a, a.hero_image);
            return (
              <Link key={a.id} href={`/${a.expand?.category_id?.slug || 'blog'}/${a.slug}`} className="group block">
                <article className="rounded-xl overflow-hidden border hover:shadow-lg transition-shadow h-full flex flex-col">
                  {img ? (
                    <div className="aspect-[16/9] relative bg-slate-100">
                      <Image src={img} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform" sizes="(max-width: 768px) 100vw, 33vw" unoptimized />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-gradient-to-br from-brand/10 to-brand/20" />
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    {a.expand?.category_id && (
                      <div className="text-xs font-semibold uppercase tracking-wide text-brand mb-2">{a.expand.category_id.name}</div>
                    )}
                    <h2 className="text-lg font-bold leading-snug mb-2 group-hover:text-brand">{a.title}</h2>
                    {a.excerpt && <p className="text-sm text-slate-600 line-clamp-3">{a.excerpt}</p>}
                    <div className="mt-auto pt-3 text-xs text-slate-500">
                      {a.reading_time_min ? `${a.reading_time_min} Min. Lesezeit` : null}
                    </div>
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
