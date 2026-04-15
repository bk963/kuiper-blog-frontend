import RechnerClient from './Client';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Brandschutzhelfer-Rechner',
  description: 'Wie viele Brandschutzhelfer braucht dein Betrieb? Nach DGUV 205-023 — live ausgerechnet.',
  robots: { index: false, follow: true },
};
export default function Page() { return <RechnerClient />; }
