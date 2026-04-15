#!/usr/bin/env node
// Fetch all 36 posts from brandschutzdozenten.de WP REST API + dump raw JSON
import fs from 'node:fs/promises';

const BASE = 'https://brandschutzdozenten.de/wp-json/wp/v2';

async function fetchAll() {
  const posts = [];
  let page = 1;
  while (true) {
    const r = await fetch(`${BASE}/posts?per_page=100&page=${page}&_fields=id,date,modified,slug,status,title,content,excerpt,author,featured_media,categories,tags,link,meta`);
    if (!r.ok) break;
    const data = await r.json();
    if (!data.length) break;
    posts.push(...data);
    page++;
    if (data.length < 100) break;
  }
  return posts;
}

async function fetchMedia(ids) {
  const out = {};
  for (const id of ids) {
    try {
      const r = await fetch(`${BASE}/media/${id}?_fields=id,source_url,alt_text,media_details`);
      if (r.ok) out[id] = await r.json();
    } catch (e) {}
  }
  return out;
}

(async () => {
  console.log('Fetching posts...');
  const posts = await fetchAll();
  console.log(`Got ${posts.length} posts`);
  const mediaIds = [...new Set(posts.map(p => p.featured_media).filter(Boolean))];
  console.log(`Fetching ${mediaIds.length} media items...`);
  const media = await fetchMedia(mediaIds);
  const out = { posts, media };
  await fs.writeFile('/root/blog-migration/wp-dump.json', JSON.stringify(out, null, 2));
  console.log('Saved to wp-dump.json');
})();
