'use client';
import { useState } from 'react';
import { Flame, Check, ArrowRight, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';

const QUESTIONS = [
  {
    q: 'Wie viele Brandschutzhelfer sind in deinem Betrieb geschult?',
    options: [
      { label: 'Keine', value: 0 },
      { label: 'Weniger als 5 % der Belegschaft', value: 1 },
      { label: '5 % oder mehr (DGUV-Minimum erfüllt)', value: 3 },
      { label: 'Deutlich mehr als 5 % + regelmäßige Auffrischung', value: 4 },
    ],
  },
  {
    q: 'Wie aktuell ist deine Brandschutzordnung (DIN 14096)?',
    options: [
      { label: 'Gibt es nicht', value: 0 },
      { label: 'Älter als 3 Jahre, nicht geprüft', value: 1 },
      { label: 'Innerhalb der letzten 2 Jahre geprüft', value: 3 },
      { label: 'Jährlich überprüft und dokumentiert', value: 4 },
    ],
  },
  {
    q: 'Wie werden Flucht- und Rettungswege überwacht?',
    options: [
      { label: 'Gar nicht', value: 0 },
      { label: 'Gelegentlich (nach Bedarf)', value: 1 },
      { label: 'Regelmäßige Begehung + Dokumentation', value: 3 },
      { label: 'Monatliche Begehung + Sicherheitsbeleuchtung-Prüfung', value: 4 },
    ],
  },
  {
    q: 'Werden Räumungsübungen durchgeführt?',
    options: [
      { label: 'Nie', value: 0 },
      { label: 'Seltener als alle 2 Jahre', value: 1 },
      { label: 'Alle 1-2 Jahre', value: 3 },
      { label: 'Jährlich, mit Evakuierungshelfern', value: 4 },
    ],
  },
  {
    q: 'Wie oft werden Feuerlöscher geprüft und gewartet?',
    options: [
      { label: 'Selten / unklar', value: 0 },
      { label: 'Alle paar Jahre', value: 1 },
      { label: 'Alle 2 Jahre (Sachkundiger)', value: 3 },
      { label: 'Alle 2 Jahre + monatliche Sichtprüfung', value: 4 },
    ],
  },
];

type Rating = { score: number; level: 'kritisch' | 'handlungsbedarf' | 'gut' | 'vorbildlich'; text: string; actions: string[] };

function evaluate(answers: number[]): Rating {
  const score = answers.reduce((s, a) => s + a, 0);
  const maxScore = QUESTIONS.length * 4;
  const pct = (score / maxScore) * 100;
  if (pct < 25) return { score, level: 'kritisch',
    text: 'Im Ernstfall ist dein Betrieb kaum geschützt. Höchste Priorität: Brandschutzhelfer schulen und Brandschutzordnung erstellen.',
    actions: ['Brandschutzhelfer-Schulung innerhalb von 4 Wochen', 'Brandschutzordnung Teil A + B nach DIN 14096 erstellen', 'Gefährdungsbeurteilung Brandschutz durchführen', 'Flucht- und Rettungsplan aushängen'],
  };
  if (pct < 50) return { score, level: 'handlungsbedarf',
    text: 'Grundschutz vorhanden, aber deutliche Lücken. Mehrere Punkte entsprechen nicht DGUV-Anforderungen.',
    actions: ['Brandschutzordnung aktualisieren', 'Räumungsübung innerhalb von 6 Monaten', 'Feuerlöscher-Prüfzyklus prüfen', 'Unterweisung aller Mitarbeitenden dokumentieren'],
  };
  if (pct < 75) return { score, level: 'gut',
    text: 'Solider Brandschutz nach Standard. Feintuning möglich, Pflichtfragen erfüllt.',
    actions: ['Jährliche Auffrischung Brandschutzhelfer', 'Evakuierungshelfer benennen', 'Sicherheitsbeleuchtung zertifizieren'],
  };
  return { score, level: 'vorbildlich',
    text: 'Sehr gut. Du liegst über dem gesetzlichen Minimum — so soll es sein. Weiter so.',
    actions: ['Rezertifizierung + externer Audit alle 2 Jahre', 'Brandschutzhelfer-Fortbildung nach 3-5 Jahren'],
  };
}

const LEVEL_STYLES = {
  kritisch: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-900', badge: 'bg-red-600', icon: AlertTriangle },
  handlungsbedarf: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-900', badge: 'bg-amber-600', icon: AlertTriangle },
  gut: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-900', badge: 'bg-emerald-600', icon: ShieldCheck },
  vorbildlich: { bg: 'bg-brand/10', border: 'border-brand/40', text: 'text-brand-dark', badge: 'bg-brand', icon: ShieldCheck },
};

export default function SchnellcheckClient() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [email, setEmail] = useState(''); const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false); const [leadSaved, setLeadSaved] = useState(false);

  const done = step >= QUESTIONS.length;
  const rating = done ? evaluate(answers) : null;

  function pick(v: number) {
    const next = [...answers]; next[step] = v;
    setAnswers(next);
    setTimeout(() => setStep(step + 1), 200);
  }

  async function saveLead(e: React.FormEvent) {
    e.preventDefault(); if (!consent || !email || !rating) return;
    setSending(true);
    try {
      const pbUrl = process.env.NEXT_PUBLIC_PB_URL || 'https://pb.kuiper-safety.de';
      await fetch(`${pbUrl}/api/collections/blog_leads/records`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, form_type: 'consultation', consented: true, consent_ts: new Date().toISOString(),
          status: 'new',
          utm_campaign: 'schnellcheck', utm_source: 'homepage',
          user_agent: navigator.userAgent.slice(0, 500),
          referrer: document.referrer,
          notes: `Score: ${rating.score}/${QUESTIONS.length * 4} — Level: ${rating.level}`,
        } as any),
      });
      setLeadSaved(true);
    } catch { alert('Fehler beim Speichern'); }
    setSending(false);
  }

  if (done && rating) {
    const s = LEVEL_STYLES[rating.level]; const Icon = s.icon;
    return (
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className={`rounded-2xl border-2 ${s.border} ${s.bg} p-8 mb-8`}>
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl ${s.badge} text-white flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <div className={`text-xs font-bold uppercase tracking-wider ${s.text} opacity-70 mb-1`}>Dein Status</div>
              <h1 className={`text-3xl font-black tracking-tight ${s.text} mb-2 capitalize`}>{rating.level}</h1>
              <div className={`text-sm ${s.text} mb-4`}>Score {rating.score} von {QUESTIONS.length * 4}</div>
              <p className={`${s.text} leading-relaxed`}>{rating.text}</p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Empfohlene Maßnahmen</h2>
        <ul className="space-y-2 mb-10">
          {rating.actions.map((a, i) => (
            <li key={i} className="flex items-start gap-3 p-4 rounded-xl border">
              <div className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">{i + 1}</div>
              <span>{a}</span>
            </li>
          ))}
        </ul>

        {!leadSaved ? (
          <form onSubmit={saveLead} className="p-6 rounded-2xl bg-slate-900 text-white">
            <h3 className="text-xl font-bold mb-2">Detaillierter Report per E-Mail?</h3>
            <p className="text-sm text-white/70 mb-4">Wir schicken dir eine ausführliche Analyse mit konkreten Umsetzungs-Tipps.</p>
            <div className="space-y-3">
              <input type="email" required placeholder="deine@email.de" value={email} onChange={e=>setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-slate-900" />
              <label className="flex items-start gap-2 text-sm text-white/90">
                <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1" />
                <span>Ich bin einverstanden, dass Kuiper Safety mich zum Brandschutz kontaktiert.</span>
              </label>
              <button type="submit" disabled={sending || !consent} className="bg-brand text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-dark disabled:opacity-50 flex items-center gap-2">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Report anfordern
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300">
            <Check className="w-10 h-10 text-emerald-600 mb-3" />
            <h3 className="text-xl font-bold text-emerald-900">Danke! Wir melden uns in Kürze.</h3>
          </div>
        )}
      </div>
    );
  }

  const q = QUESTIONS[step];
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center mb-8">
        <Flame className="w-10 h-10 text-brand mx-auto mb-3" />
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Frage {step + 1} von {QUESTIONS.length}</div>
        <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
          <div className="bg-brand h-2 rounded-full transition-all" style={{ width: `${((step) / QUESTIONS.length) * 100}%` }} />
        </div>
        <h1 className="text-3xl font-black tracking-tight leading-tight">{q.q}</h1>
      </div>
      <div className="space-y-3">
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => pick(opt.value)}
            className="w-full p-5 rounded-xl border-2 hover:border-brand hover:bg-brand/5 transition-all text-left font-medium flex items-center justify-between group">
            <span>{opt.label}</span>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}
