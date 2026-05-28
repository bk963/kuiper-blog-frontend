import { NextResponse } from 'next/server';
import { adminLogin } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get('email') || '');
  const password = String(form.get('password') || '');
  const res = await adminLogin(email, password);
  if (!res.ok) {
    const url = new URL('/admin/login', req.url);
    url.searchParams.set('error', res.error);
    return NextResponse.redirect(url, { status: 303 });
  }
  return NextResponse.redirect(new URL('/admin', req.url), { status: 303 });
}
