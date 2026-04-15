#!/usr/bin/env node
/**
 * Geht alle imported Artikel durch und ergänzt fehlende SEO-Daten via Claude
 */
import PocketBase from 'pocketbase';
import { enhanceSeo } from './claude-client.js';

const PB_URL = process.env.PB_INTERNAL_URL || 'http://localhost:8090';
const LIMIT = parseInt(process.env.LIMIT || '5');

async function main() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  // List articles where meta_description is default (heuristic) — flag by short excerpt content
  const arts = await pb.collection('blog_articles').getList(1, LIMIT, {
    filter: 'status = "published" && source = "imported" && seo_score = 0',
    sort: 'last_seo_check,-published_at',
  });
  console.log(`Found ${arts.items.length}/${arts.totalItems} articles needing enhancement`);

  for (const a of arts.items) {
    try {
      console.log(`\n→ ${a.slug}`);
      const out = await enhanceSeo({ title: a.title, content: a.content });
      if (out.error) { console.log('  ERR:', out.error); continue; }
      const update = {
        meta_title: out.meta_title || a.meta_title,
        meta_description: out.meta_description || a.meta_description,
        focus_keyword: out.focus_keyword || a.focus_keyword,
        secondary_keywords: out.secondary_keywords || [],
        faqs: out.faqs || [],
        last_seo_check: new Date().toISOString(),
        seo_score: 50, // Mark as enhanced
      };
      await pb.collection('blog_articles').update(a.id, update);
      console.log(`  ✓ ${out.focus_keyword} — ${out.secondary_keywords?.length||0} kws, ${out.faqs?.length||0} FAQs`);
    } catch (e) { console.error('  ERR:', e.message); }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
