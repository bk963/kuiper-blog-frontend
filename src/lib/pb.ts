import PocketBase from 'pocketbase';

// Server-side fetches use PB_INTERNAL_URL (bypasses Cloudflare Access via Docker network)
// Client-side (browser) uses NEXT_PUBLIC_PB_URL (public https URL)
const PB_URL = (typeof window === 'undefined'
  ? process.env.PB_INTERNAL_URL
  : process.env.NEXT_PUBLIC_PB_URL) || 'https://pb.kuiper-safety.de';

export function getPb() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  return pb;
}

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  category_id?: string;
  pillar_id?: string;
  author?: string;
  meta_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  hero_image?: string;
  reading_time_min?: number;
  word_count?: number;
  status: 'draft' | 'review' | 'published' | 'archived';
  published_at?: string;
  created: string;
  updated: string;
  collectionId: string;
  expand?: {
    category_id?: Category;
    pillar_id?: PillarPage;
  };
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parent_id?: string;
  meta_title?: string;
  meta_description?: string;
  sort_order?: number;
};

export type PillarPage = {
  id: string;
  slug: string;
  title: string;
  category_id: string;
  intro?: string;
  content?: string;
  meta_title?: string;
  meta_description?: string;
  hero_image?: string;
  collectionId: string;
};

export function pbFileUrl(record: { id: string; collectionId: string }, file?: string) {
  if (!file) return null;
  return `${PB_URL}/api/files/${record.collectionId}/${record.id}/${file}`;
}
