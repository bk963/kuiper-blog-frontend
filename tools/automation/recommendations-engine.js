#!/usr/bin/env node
/**
 * Automatische Maßnahmen-Engine
 * - Scant Rankings der letzten 7 Tage
 * - Erkennt Ranking-Verluste → erzeugt blog_recommendations
 * - Findet unverlinkte Artikel → schlägt interne Verlinkungen vor
 * - Erkennt fehlende Meta-Tags → schlägt Optimierungen vor
 */
import PocketBase from 'pocketbase';
const PB_URL = process.env.PB_INTERNAL_URL || 'http://pb-prod:8090';

async function main() {
  const pb = new PocketBase(PB_URL); pb.autoCancellation(false);
  let created = 0;

  // 1. Ranking-Verluste
  const keywords = await pb.collection('blog_keywords').getFullList({ filter: 'tracked = true', $autoCancel: false });
  for (const kw of keywords) {
    if (!kw.best_position || !kw.last_position) continue;
    const drop = kw.last_position - kw.best_position;
    if (drop >= 3) {
      try {
        await pb.collection('blog_recommendations').create({
          kind: 'optimize_article', priority: drop > 5 ? 'high' : 'medium',
          title: `Ranking-Verlust für "${kw.keyword}" (${kw.best_position} → ${kw.last_position})`,
          reason: `Position um ${drop} Plätze gefallen. Content prüfen + aktualisieren.`,
          article_id: kw.target_article_id, keyword_id: kw.id,
          status: 'open', generated_by: 'rule_engine',
        }); created++;
      } catch {}
    }
  }

  // 2. Artikel ohne Meta
  const noMeta = await pb.collection('blog_articles').getFullList({
    filter: 'status = "published" && (meta_title = "" || meta_description = "")',
    $autoCancel: false,
  });
  for (const a of noMeta) {
    try {
      await pb.collection('blog_recommendations').create({
        kind: 'fix_meta', priority: 'medium',
        title: `Meta-Tags fehlen: ${a.title.slice(0, 60)}`,
        reason: 'meta_title oder meta_description leer',
        article_id: a.id, status: 'open', generated_by: 'rule_engine',
      }); created++;
    } catch {}
  }

  // 3. Artikel ohne FAQs
  const noFaq = await pb.collection('blog_articles').getFullList({
    filter: 'status = "published" && source = "imported" && seo_score < 50',
    $autoCancel: false,
  });
  for (const a of noFaq.slice(0, 10)) {
    try {
      await pb.collection('blog_recommendations').create({
        kind: 'add_faq', priority: 'low',
        title: `FAQ ergänzen: ${a.title.slice(0, 60)}`,
        reason: 'Importierter Artikel ohne FAQ-Sektion',
        article_id: a.id, status: 'open', generated_by: 'rule_engine',
      }); created++;
    } catch {}
  }

  console.log(`Created ${created} recommendations`);

  // 4. Telegram alert for high-priority recommendations
  const highPriority = await pb.collection('blog_recommendations').getFullList({
    filter: 'status = "open" && priority IN ("high", "critical")',
    $autoCancel: false, sort: '-created',
  });
  if (highPriority.length > 0 && process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    const msg = `🚨 SEO: ${highPriority.length} hochpriorisierte Maßnahmen offen\n\n` +
      highPriority.slice(0, 5).map(r => `• ${r.title}`).join('\n') +
      `\n\n→ https://app.kuiper-safety.de/admin/seo-intel/recommendations`;
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: msg, parse_mode: 'Markdown', disable_web_page_preview: true }),
    });
    console.log('Telegram alert sent');
  }
}
main().catch(e => { console.error(e); process.exit(1); });
