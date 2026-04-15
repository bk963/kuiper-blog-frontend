import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-6xl font-extrabold mb-4">404</h1>
      <p className="text-slate-600 mb-6">Diese Seite gibt es nicht (mehr).</p>
      <Link href="/" className="inline-block bg-brand text-white px-6 py-3 rounded-xl font-semibold">Zur Startseite</Link>
    </div>
  );
}
