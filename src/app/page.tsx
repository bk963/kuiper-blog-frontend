import Link from 'next/link';
import Image from 'next/image';
import { getPb, type Article, type Category, pbFileUrl } from '@/lib/pb';
import { Flame, HardHat, Heart, Calculator, Sparkles, ArrowRight, Newspaper, TrendingUp } from 'lucide-react';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

type PillarStat = { slug: string; name: string; count: number; icon: any; color: string; gradient: string; description: string };

async function getPillarStats(): Promise<PillarStat[]> {
  const pb = getPb();
  const defaults: PillarStat[] = [
    { slug: 'brandschutz', name: 'Brandschutz', count: 0, icon: Flame, color: 'text-red-600', gradient: 'from-red-50 to-orange-50', description: 'Vorbeugend, abwehrend, organisatorisch. Von Brandschutzhelfer bis RWA.' },
    { slug: 'arbeitsschutz', name: 'Arbeitsschutz', count: 0, icon: HardHat, color: 'text-amber-600', gradient: 'from-amber-50 to-yellow-50', description: 'ArbSchG, Unterweisungen, Sifa, Gefährdungsbeurteilung.' },
    { slug: 'gesundheitsschutz', name: 'Gesundheitsschutz', count: 0, icon: Heart, color: 'text-emerald-600', gradient: 'from-emerald-50 to-teal-50', description: 'BGM, arbeitsmedizinische Vorsorge, Betriebsarzt.' },
  ];
  try {
    for (const p of defaults) {
      const cat = await pb.collection('blog_categories').getFirstListItem<Category>(`slug = "${p.slug}"`);
      const r = await pb.collection('blog_articles').getList(1, 1, { filter: `status = "published" && category_id = "${cat.id}"` });
      p.count = r.totalItems;
    }
  } catch {}
  return defaults;
}

async function getLatest(): Promise<Article[]> {
  const pb = getPb();
  try {
    const r = await pb.collection('blog_articles').getList<Article>(1, 3, {
      filter: 'status = "published"', sort: '-published_at',
      expand: 'category_id',
    });
    return r.items;
  } catch { return []; }
}

export default async function HomePage() {
  const [pillars, latest] = await Promise.all([getPillarStats(), getLatest()]);
  const totalArticles = pillars.reduce((s, p) => s + p.count, 0);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-brand/5 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-brand/10 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 pt-16 sm:pt-24 pb-12 sm:pb-16 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" /> Kuiper Safety Wissensbasis
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.05] mb-6">
              Sicherheit.<br /><span className="text-brand">Klar erklärt.</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
              Praxisnahe Antworten zu Brand-, Arbeits- und Gesundheitsschutz. Für Sicherheitsbeauftragte, Brandschutzhelfer und Geschäftsführer — ohne Jura-Geschwurbel.
            </p>
          </div>
        </div>
      </section>

      {/* 3 PILLARS */}
      <section className="container mx-auto px-4 pb-16 sm:pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Wozu brauchst du Antworten?</h2>
          <span className="text-sm text-slate-500">{totalArticles} Artikel</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map(p => {
            const Icon = p.icon;
            return (
              <Link key={p.slug} href={`/pillar/${p.slug}`} className="group block">
                <div className={`relative p-8 rounded-2xl bg-gradient-to-br ${p.gradient} border border-slate-200/60 hover:border-brand/40 hover:shadow-xl transition-all overflow-hidden h-full`}>
                  <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-5 ${p.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight mb-2">{p.name}</h3>
                  <p className="text-slate-700 text-sm mb-5">{p.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-900">{p.count} {p.count === 1 ? 'Artikel' : 'Artikel'}</span>
                    <span className="flex items-center gap-1 text-brand font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Entdecken <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* KILLER: Brandschutz-Schnellcheck */}
      <section className="bg-slate-900 text-white py-16 sm:py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/20 text-brand text-sm font-semibold mb-4">
                <Sparkles className="w-4 h-4" /> KI-gestützt · 30 Sekunden
              </div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-tight mb-4">
                Wie sicher ist<br />dein Unternehmen<br /><span className="text-brand">wirklich?</span>
              </h2>
              <p className="text-slate-300 text-lg mb-6">
                Unser Brandschutz-Schnellcheck beantwortet in 5 Fragen, wo du Nachholbedarf hast — individuell, ohne Anmeldung.
              </p>
              <Link href="/schnellcheck" className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-dark transition-colors">
                Schnellcheck starten <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-brand to-brand-dark shadow-2xl">
                <div className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-4">Frage 1 von 5</div>
                <div className="text-2xl font-bold leading-snug mb-6">Wie viele Brandschutzhelfer sind in deinem Betrieb geschult?</div>
                <div className="space-y-2">
                  {['Keine', 'Weniger als 5 %', '5 % oder mehr'].map((opt, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer font-medium">{opt}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LATEST ARTICLES */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-3">
              <TrendingUp className="w-4 h-4" /> Neu diese Woche
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Frische Artikel</h2>
          </div>
          <Link href="/brandschutz" className="hidden sm:flex items-center gap-1 text-brand font-semibold hover:underline">
            Alle Artikel <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {latest.length === 0 ? (
          <div className="text-center py-16 text-slate-500 border-2 border-dashed rounded-xl">Demnächst hier.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latest.map((a, i) => {
              const img = a.hero_image_url || pbFileUrl(a, a.hero_image);
              const cat = a.expand?.category_id;
              return (
                <Link key={a.id} href={`/${cat?.slug || 'brandschutz'}/${a.slug}`} className="group block">
                  <article className={`rounded-2xl overflow-hidden border hover:shadow-xl transition-all h-full flex flex-col ${i === 0 ? 'md:col-span-1' : ''}`}>
                    {img ? (
                      <div className="aspect-[16/10] relative bg-slate-100">
                        <Image src={img} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" unoptimized />
                      </div>
                    ) : (<div className="aspect-[16/10] bg-gradient-to-br from-brand/10 to-brand/20" />)}
                    <div className="p-6 flex-1 flex flex-col">
                      {cat && <div className="text-xs font-bold uppercase tracking-wider text-brand mb-2">{cat.name}</div>}
                      <h3 className="text-xl font-bold leading-snug mb-3 group-hover:text-brand transition-colors">{a.title}</h3>
                      {a.excerpt && <p className="text-sm text-slate-600 line-clamp-2">{a.excerpt}</p>}
                      <div className="mt-auto pt-4 flex items-center gap-3 text-xs text-slate-500">
                        {a.reading_time_min && <span>⏱ {a.reading_time_min} Min.</span>}
                        {a.published_at && <span>{new Date(a.published_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}</span>}
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* RECHNER Box */}
      <section className="bg-gradient-to-br from-slate-50 to-white py-16 sm:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 items-center p-8 md:p-12 rounded-3xl bg-white shadow-xl border">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-4">
                <Calculator className="w-7 h-7" />
              </div>
              <h3 className="text-3xl font-black tracking-tight mb-3">Wie viele Brandschutz&shy;helfer brauchst du?</h3>
              <p className="text-slate-600 mb-6">Nach DGUV 205-023: min. 5 % der Belegschaft. Wir rechnen's live aus — inklusive Schichten und Urlaub.</p>
              <Link href="/rechner/brandschutzhelfer" className="inline-flex items-center gap-2 text-brand font-bold hover:underline">
                Zum Rechner <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 text-white">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-3">Beispiel</div>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-white/70">Mitarbeiter:</span><span className="font-bold">120</span></div>
                <div className="flex justify-between"><span className="text-white/70">Minimum 5 %:</span><span className="font-bold">6</span></div>
                <div className="flex justify-between"><span className="text-white/70">+ Urlaub/Krankheit:</span><span className="font-bold">+2</span></div>
                <div className="h-px bg-white/20 my-2" />
                <div className="flex justify-between text-lg"><span>Empfohlen:</span><span className="font-black text-brand">8</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16 sm:py-20 max-w-3xl">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-8">Häufig gefragt</h2>
        <div className="space-y-3">
          {[
            { q: 'Wie oft muss ich Brandschutzhelfer schulen lassen?', a: 'Alle 3–5 Jahre Auffrischung, jährlich Unterweisung am Arbeitsplatz (DGUV 205-023).' },
            { q: 'Muss jedes Unternehmen eine Brandschutzordnung haben?', a: 'Ja, DIN 14096 fordert bei Gebäuden mit mehr als 10 Personen mindestens Teil A + B.' },
            { q: 'Was unterscheidet Sifa von Brandschutzbeauftragtem?', a: 'Die Sifa berät allgemein zum Arbeitsschutz, der Brandschutzbeauftragte speziell zum vorbeugenden Brandschutz.' },
            { q: 'Bin ich verpflichtet, Sicherheitsbeleuchtung zu installieren?', a: 'Bei Flucht- und Rettungswegen in Arbeitsstätten ab bestimmten Größen — ja (ASR A2.3).' },
            { q: 'Wie finde ich passende Feuerlöscher?', a: 'Nach ASR A2.2 abhängig von Grundfläche, Brandklassen und spezifischer Nutzung.' },
          ].map((f, i) => (
            <details key={i} className="group p-5 rounded-xl border hover:border-brand/40 transition-colors">
              <summary className="font-bold cursor-pointer flex items-center justify-between gap-4">
                <span>{f.q}</span>
                <span className="text-brand group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
              </summary>
              <p className="mt-3 text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-gradient-to-br from-brand to-brand-dark text-white py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">Neue Vorschriften?</h2>
          <p className="text-white/90 text-lg mb-6">Wir mailen dir einmal im Monat, was sich ändert — kurz, ohne Werbung.</p>
          <form action="/api/subscribe" method="post" className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" name="email" required placeholder="deine@email.de" className="flex-1 px-4 py-3 rounded-xl text-slate-900" />
            <button type="submit" className="bg-white text-brand px-6 py-3 rounded-xl font-bold hover:bg-slate-100">Abonnieren</button>
          </form>
          <p className="text-xs text-white/70 mt-3">DSGVO-konform · jederzeit abmeldbar</p>
        </div>
      </section>
    </>
  );
}
