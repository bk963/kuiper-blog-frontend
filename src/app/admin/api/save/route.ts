import { NextResponse } from 'next/server';
import { getAdminSession, pbHeaders } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });

  const body = await req.json();
  const pbUrl = process.env.PB_INTERNAL_URL || process.env.NEXT_PUBLIC_PB_URL || 'https://pb.kuiper-safety.de';

  const res = await fetch(`${pbUrl}/api/collections/blog_articles/records/${id}`, {
    method: 'PATCH',
    headers: pbHeaders({ Authorization: s.pbToken }),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err || 'pb error' }, { status: res.status });
  }
  const data = await res.json();
  return NextResponse.json({ ok: true, id: data.id });
}
