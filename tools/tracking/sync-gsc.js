#!/usr/bin/env node
import PocketBase from 'pocketbase';
import { queryPerformance } from './search-console.js';

const PB_URL = process.env.PB_INTERNAL_URL || 'http://pb-prod:8090';

async function main() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  const end = new Date(); const start = new Date(); start.setDate(start.getDate() - 2);
  const fmt = d => d.toISOString().slice(0, 10);
  const result = await queryPerformance({ startDate: fmt(start), endDate: fmt(end), dimensions: ['page', 'date'] });
  if (result.status === 'skipped') { console.log('Skipped:', result.reason); return; }
  const articles = await pb.collection('blog_articles').getFullList({ $autoCancel: false });
  const bySlug = new Map();
  for (const a of articles) bySlug.set(a.slug, a);
  let inserted = 0;
  for (const row of result.rows || []) {
    const page = row.keys[0];
    const date = row.keys[1];
    const slug = page.split('/').filter(Boolean).pop();
    const article = bySlug.get(slug);
    if (!article) continue;
    try {
      await pb.collection('blog_analytics').create({
        article_id: article.id, date, source: 'search_console',
        impressions: row.impressions || 0, clicks: row.clicks || 0,
        avg_position: row.position || 0,
      });
      inserted++;
    } catch (e) { /* dupe or error, skip */ }
  }
  console.log(`Inserted ${inserted} GSC rows`);
}
main().catch(e => { console.error(e); process.exit(1); });
