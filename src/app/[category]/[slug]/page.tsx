import { notFound } from 'next/navigation';
import LeadForm from '@/components/LeadForm';
import PdfLeadMagnet from '@/components/PdfLeadMagnet';
import Image from 'next/image';
import Link from 'next/link';
import { getPb, type Article, type Category, type InternalLink, pbFileUrl } from '@/lib/pb';
import type { Metadata } from 'next';

/**
 * PDF-Lead-Magnet-Mapping pro Artikel-Slug.
 * Email-Gate vor Download – Migrierte SEO-PDFs von brandschutzdozenten.de.
 */
const PDF_LEAD_MAGNETS: Record<string, { title: string; description: string; file: string; bullets: string[] }> = {
  'brandklassen-a-b-c-d-f-din-en-2': {
    title: 'Brandklassen-Tabelle (PDF)',
    description: 'Übersicht aller Brandklassen A-F nach DIN EN 2 mit Beispielen, Brennstoffen und passenden Feuerlöschern – zum Aushängen im Betrieb.',
    file: '/downloads/brandklassen-tabelle.pdf',
    bullets: ['Alle 5 Brandklassen kompakt erklärt', 'Mit Brennstoff-Beispielen pro Klasse', 'Empfohlene Löschmittel-Symbole', 'Druckfertig DIN A4'],
  },
  'ausbildung-zum-brandschutzhelfer': {
    title: 'Bestellung Brandschutzhelfer (Word-Vorlage)',
    description: 'Rechtssichere Bestellurkunde für Brandschutzhelfer nach ASR A2.2 – ausfüllen, ausdrucken, unterschreiben.',
    file: '/downloads/brandschutzhelfer-bestellung-vorlage.pdf',
    bullets: ['Nach ASR A2.2 + DGUV-konform', 'Sofort ausfüllbar', 'Mit Aufgaben-Übersicht für die Person', 'Rechtssicher dokumentiert'],
  },
  'brandschutzbeauftragter-fortbildung-externer': {
    title: 'Bestellung Brandschutzbeauftragter (Word-Vorlage)',
    description: 'Bestellurkunde für interne oder externe Brandschutzbeauftragte nach DGUV Information 205-003 – sofort einsetzbar.',
    file: '/downloads/brandschutzbeauftragter-bestellung-bsb.pdf',
    bullets: ['Nach DGUV-Info 205-003', 'Aufgabenkatalog enthalten', 'Für intern + extern verwendbar', 'Word + PDF kompatibel'],
  },
};

export const revalidate = 60;
export const dynamic = 'force-dynamic';

async function getArticle(slug: string): Promise<Article | null> {
  const pb = getPb();
  try {
    return await pb.collection('blog_articles').getFirstListItem<Article>(`slug = "${slug}" && status = "published"`, { expand: 'category_id,pillar_id' });
  } catch { return null; }
}

async function getRelatedArticles(articleId: string): Promise<Article[]> {
  const pb = getPb();
  try {
    // Direction 1: articles THIS mentions (outbound)
    const outbound = await pb.collection('blog_internal_links').getList<InternalLink>(1, 5, {
      filter: `source_article_id = "${articleId}"`,
      expand: 'target_article_id',
    });
    const outArt = outbound.items.map(l => l.expand?.target_article_id).filter(Boolean) as Article[];
    if (outArt.length >= 3) return outArt.slice(0, 5);
    // Fallback: articles that mention THIS (inbound)
    const inbound = await pb.collection('blog_internal_links').getList<any>(1, 10, {
      filter: `target_article_id = "${articleId}"`,
      expand: 'source_article_id',
    });
    const inArt = inbound.items.map(l => l.expand?.source_article_id).filter(Boolean) as Article[];
    // Merge, dedupe by id, max 5
    const merged: Article[] = [];
    const seen = new Set<string>();
    for (const a of [...outArt, ...inArt]) {
      if (a && !seen.has(a.id)) { seen.add(a.id); merged.push(a); }
      if (merged.length >= 5) break;
    }
    return merged;
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata> {
  const { slug, category } = await params;
  const a = await getArticle(slug);
  if (!a) return { title: 'Nicht gefunden' };
  return {
    title: a.meta_title || a.title,
    description: a.meta_description || a.excerpt,
    robots: { index: true, follow: true },
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
  const related = await getRelatedArticles(a.id);
  const img = a.hero_image_url || pbFileUrl(a, a.hero_image);
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
          <Image src={img} alt={a.title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 768px" unoptimized />
        </div>
      )}
      <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: a.content }} />

      {/* PDF-Lead-Magnet (nur wenn für diesen Slug konfiguriert) */}
      {PDF_LEAD_MAGNETS[a.slug] && (
        <PdfLeadMagnet
          articleId={a.id}
          articleSlug={a.slug}
          pdfTitle={PDF_LEAD_MAGNETS[a.slug].title}
          pdfDescription={PDF_LEAD_MAGNETS[a.slug].description}
          pdfFile={PDF_LEAD_MAGNETS[a.slug].file}
          bullets={PDF_LEAD_MAGNETS[a.slug].bullets}
        />
      )}

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

      {/* FAQ-Section + FAQPage-Schema (Featured-Snippet Chance bei "Was ist X?"-Queries) */}
      {a.faqs && Array.isArray(a.faqs) && a.faqs.length > 0 && (
        <>
          <section className="mt-12 pt-10 border-t" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-2xl font-bold mb-6">Häufige Fragen</h2>
            <div className="space-y-3">
              {a.faqs.map((f, i) => (
                <details key={i} className="group rounded-lg border bg-slate-50 px-4 py-3 open:bg-white open:shadow-sm">
                  <summary className="cursor-pointer font-semibold text-slate-900 list-none flex items-start gap-2">
                    <span className="text-brand mt-0.5">▸</span>
                    <span className="flex-1">{f.q}</span>
                  </summary>
                  <div className="mt-3 pl-6 text-slate-700 leading-relaxed">{f.a}</div>
                </details>
              ))}
            </div>
          </section>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: a.faqs.map(f => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }) }} />
        </>
      )}

      <div className="mt-12"><LeadForm articleId={a.id} articleSlug={a.slug} /></div>

      {related.length > 0 && (
        <section className="mt-16 pt-10 border-t">
          <h2 className="text-2xl font-bold mb-6">Das könnte dich auch interessieren</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related.map(r => (
              <Link key={r.id} href={`/${(r as any).expand?.category_id?.slug || 'brandschutz'}/${r.slug}`} className="group block p-4 rounded-xl border hover:shadow transition-shadow">
                <h3 className="font-bold text-base mb-1 group-hover:text-brand">{r.title}</h3>
                {r.excerpt && <p className="text-sm text-slate-600 line-clamp-2">{r.excerpt}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
