import { requireAdmin, pbHeaders } from '@/lib/admin-auth';
import { notFound } from 'next/navigation';
import EditorClient from './EditorClient';

export const dynamic = 'force-dynamic';

async function getArticle(id: string, token: string) {
  const pbUrl = process.env.PB_INTERNAL_URL || process.env.NEXT_PUBLIC_PB_URL || 'https://pb.kuiper-safety.de';
  const res = await fetch(`${pbUrl}/api/collections/blog_articles/records/${id}`, {
    headers: pbHeaders({ Authorization: token }),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireAdmin();
  const { id } = await params;
  const a = await getArticle(id, s.pbToken);
  if (!a) notFound();
  return <EditorClient article={a} pbToken={s.pbToken} />;
}
