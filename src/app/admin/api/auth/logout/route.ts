import { NextResponse } from 'next/server';
import { adminLogout } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  await adminLogout();
  return NextResponse.redirect(new URL('/admin/login', req.url), { status: 303 });
}
