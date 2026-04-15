#!/usr/bin/env node
/**
 * Phase 8: Bilder lokal speichern (kein Hotlinking mehr)
 * Downloaded Bilder gehen in public/migrated-images/
 * PB-Felder hero_image_url werden auf /migrated-images/<slug>.jpg umgestellt
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import PocketBase from 'pocketbase';

const OUT_DIR = path.resolve(process.cwd(), 'public', 'migrated-images');
const PB_URL = process.env.PB_INTERNAL_URL || 'http://pb-prod:8090';

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const pb = new PocketBase(PB_URL); pb.autoCancellation(false);
  const articles = await pb.collection('blog_articles').getFullList({
    filter: 'hero_image_url != "" && hero_image_url ~ "brandschutzdozenten.de"',
    $autoCancel: false,
  });
  console.log(`Downloading ${articles.length} images...`);
  let done = 0;
  for (const a of articles) {
    try {
      const url = a.hero_image_url;
      const ext = (url.match(/\.(jpg|jpeg|png|webp)(?:\?.*)?$/i) || [, 'jpg'])[1].toLowerCase();
      const localPath = `${OUT_DIR}/${a.slug}.${ext}`;
      const publicUrl = `/migrated-images/${a.slug}.${ext}`;
      const r = await fetch(url);
      if (!r.ok) { console.log(`  skip ${a.slug}: HTTP ${r.status}`); continue; }
      const buf = Buffer.from(await r.arrayBuffer());
      await fs.writeFile(localPath, buf);
      await pb.collection('blog_articles').update(a.id, { hero_image_url: publicUrl });
      done++;
      if (done % 5 === 0) console.log(`  ${done}/${articles.length}`);
      await new Promise(r => setTimeout(r, 300));
    } catch (e) { console.log(`  ${a.slug}: ${e.message}`); }
  }
  console.log(`Downloaded ${done} images → ${OUT_DIR}`);
}
main().catch(e => { console.error(e); process.exit(1); });
