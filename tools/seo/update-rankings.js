#!/usr/bin/env node
/**
 * Geht durch alle getrackten Keywords und aktualisiert:
 * - blog_rankings (historische Position)
 * - blog_serp_snapshots (Top-10 SERP)
 * - blog_keywords.last_position/best_position
 */
import PocketBase from 'pocketbase';
import { scrapeSerp } from './serp-scraper.js';
import { getSerp } from './dataforseo.js';

const PB_URL = process.env.PB_INTERNAL_URL || 'http://pb-prod:8090';
const OUR_DOMAIN = 'blog.kuiper-safety.de';

async function findOurPosition(results, domain) {
  for (const r of results) {
    if (r.domain && r.domain.includes(domain)) return { position: r.position, url: r.url };
  }
  return null;
}

async function main() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  // Superuser auth if available
  if (process.env.PB_SU_EMAIL && process.env.PB_SU_PW) {
    try { await pb.collection('_superusers').authWithPassword(process.env.PB_SU_EMAIL, process.env.PB_SU_PW); }
    catch (e) { console.warn('SU auth failed:', e.message); }
  }

  const keywords = await pb.collection('blog_keywords').getFullList({ filter: 'tracked = true', $autoCancel: false });
  if (!keywords.length) { console.log('No tracked keywords — nothing to do'); return; }

  console.log(`Tracking ${keywords.length} keywords...`);
  for (const kw of keywords) {
    try {
      // Try DataForSEO first
      let results;
      const df = await getSerp(kw.keyword);
      if (df && df.status !== 'skipped' && !df.error) {
        const items = df?.tasks?.[0]?.result?.[0]?.items || [];
        results = items.map(i => ({ position: i.rank_group, url: i.url, domain: i.domain, title: i.title }));
      } else {
        // Fallback: own scraper
        const s = await scrapeSerp(kw.keyword);
        results = s.results || [];
      }

      if (!results.length) { console.log(`  ${kw.keyword}: no SERP data`); continue; }

      // Save snapshot
      await pb.collection('blog_serp_snapshots').create({
        keyword_id: kw.id,
        scanned_at: new Date().toISOString(),
        device: 'desktop', country: 'de',
        results, total_results: results.length,
        source: df.status !== 'skipped' ? 'dataforseo' : 'serp_scraper',
      });

      // Find our position + save ranking
      const mine = await findOurPosition(results, OUR_DOMAIN);
      if (mine) {
        await pb.collection('blog_rankings').create({
          keyword_id: kw.id,
          position: mine.position, url: mine.url,
          checked_at: new Date().toISOString(),
          source: df.status !== 'skipped' ? 'dataforseo' : 'serp_scraper',
          device: 'desktop', country: 'de',
        });
        await pb.collection('blog_keywords').update(kw.id, {
          last_ranked_at: new Date().toISOString(),
          last_position: mine.position,
          best_position: Math.min(kw.best_position || 999, mine.position),
        });
        console.log(`  ${kw.keyword} → Position ${mine.position}`);
      } else {
        console.log(`  ${kw.keyword} → not in top 10`);
      }

      // Rate limit
      await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      console.error(`  ${kw.keyword}: ${e.message}`);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
