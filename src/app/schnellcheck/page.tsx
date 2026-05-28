import SchnellcheckClient from './Client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brandschutz-Schnellcheck',
  description: '5 Fragen. 30 Sekunden. KI-Bewertung deines Brandschutz-Status.',
  robots: { index: true, follow: true },
};

export default function Page() { return <SchnellcheckClient />; }
