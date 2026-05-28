import { getAdminSession } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';

export const metadata = {
  title: 'Login · KS Admin',
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  // Wenn schon eingeloggt → direkt zum Dashboard
  if (await getAdminSession()) redirect('/admin');
  const sp = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <div className="font-extrabold text-2xl text-slate-900">KS Admin</div>
          <p className="text-sm text-slate-500 mt-1">blog.kuiper-safety.de</p>
        </div>
        <LoginForm error={sp.error} />
      </div>
    </div>
  );
}
