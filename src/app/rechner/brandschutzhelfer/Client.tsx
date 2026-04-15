'use client';
import { useState, useMemo } from 'react';
import { Calculator, Info, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RechnerClient() {
  const [employees, setEmployees] = useState(100);
  const [shifts, setShifts] = useState(1);
  const [absenceRate, setAbsenceRate] = useState(15);
  const [highRisk, setHighRisk] = useState(false);

  const result = useMemo(() => {
    // DGUV 205-023: min 5% oder 10% bei erhöhter Brandgefährdung
    const minPct = highRisk ? 10 : 5;
    const basePerShift = Math.ceil(employees * (minPct / 100));
    // + Puffer für Ausfall/Urlaub
    const buffer = Math.ceil(basePerShift * (absenceRate / 100));
    const perShift = basePerShift + buffer;
    const total = perShift * shifts;
    // Schulungskosten (Kuiper-Standard: 89€/Person)
    const cost = total * 89;
    return { minPct, basePerShift, buffer, perShift, total, cost };
  }, [employees, shifts, absenceRate, highRisk]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-10">
        <div className="flex items-center gap-2 text-brand font-semibold text-sm uppercase tracking-wider mb-3">
          <Calculator className="w-4 h-4" /> Rechner nach DGUV 205-023
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">Brandschutzhelfer-Rechner</h1>
        <p className="text-lg text-slate-600">Gib deine Kennzahlen ein — wir rechnen live die benötigte Anzahl aus, inklusive Puffer für Urlaub und Schichten.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="text-sm font-bold mb-2 block">Mitarbeiter gesamt</label>
            <input type="number" min={1} value={employees} onChange={e=>setEmployees(Math.max(1, Number(e.target.value) || 1))}
              className="w-full px-4 py-3 rounded-xl border-2 focus:border-brand outline-none text-lg font-semibold" />
          </div>
          <div>
            <label className="text-sm font-bold mb-2 block">Anzahl Schichten</label>
            <div className="flex gap-2">
              {[1, 2, 3].map(s => (
                <button key={s} onClick={()=>setShifts(s)} className={`flex-1 py-3 rounded-xl border-2 font-bold ${shifts===s ? 'border-brand bg-brand/10 text-brand' : 'border-slate-200 hover:border-slate-300'}`}>
                  {s} Schicht{s>1?'en':''}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-bold mb-2 block">Urlaub/Krankheits-Puffer: <span className="text-brand">{absenceRate} %</span></label>
            <input type="range" min={0} max={30} value={absenceRate} onChange={e=>setAbsenceRate(Number(e.target.value))}
              className="w-full accent-[#00b0f0]" />
          </div>
          <label className="flex items-start gap-3 p-4 rounded-xl border-2 hover:border-brand cursor-pointer">
            <input type="checkbox" checked={highRisk} onChange={e=>setHighRisk(e.target.checked)} className="mt-1 accent-[#00b0f0]" />
            <div>
              <div className="font-bold">Erhöhte Brandgefährdung</div>
              <div className="text-sm text-slate-600">z.B. Gastronomie, Lagerhallen mit brennbaren Materialien, Pyrotechnik</div>
            </div>
          </label>
        </div>

        {/* Result */}
        <div className="bg-slate-900 text-white rounded-2xl p-8">
          <div className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2">Ergebnis</div>
          <div className="text-6xl font-black tracking-tighter mb-1">{result.total}</div>
          <div className="text-white/80 mb-6">geschulte Brandschutzhelfer</div>

          <div className="space-y-2 text-sm pb-4 border-b border-white/10">
            <div className="flex justify-between"><span className="text-white/70">Minimum nach DGUV ({result.minPct} %):</span><span className="font-bold">{result.basePerShift}</span></div>
            <div className="flex justify-between"><span className="text-white/70">+ Puffer ({absenceRate} %):</span><span className="font-bold">+{result.buffer}</span></div>
            <div className="flex justify-between"><span className="text-white/70">× Schichten:</span><span className="font-bold">×{shifts}</span></div>
          </div>
          <div className="pt-4">
            <div className="text-xs text-white/60 mb-1">Schulungskosten (ca.)</div>
            <div className="text-3xl font-black text-brand">{result.cost.toLocaleString('de-DE')} €</div>
            <div className="text-xs text-white/60 mt-1">bei 89 € pro Person</div>
          </div>

          <Link href="/schnellcheck" className="mt-6 inline-flex items-center gap-2 bg-brand text-white px-5 py-3 rounded-xl font-bold hover:bg-brand-dark w-full justify-center">
            Brandschutz-Check machen <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="mt-10 p-6 rounded-2xl bg-blue-50 border border-blue-200 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <strong>Rechtliche Grundlage:</strong> DGUV Information 205-023 empfiehlt mindestens 5 % der Belegschaft als Brandschutzhelfer. Bei erhöhter Brandgefährdung steigt der Wert auf 10 %. Die Puffer-Empfehlung kommt aus der Praxis: Urlaub + Krankheit führen zu Ausfällen, die bei Minimal-Besetzung zur Lücke werden.
        </div>
      </div>
    </div>
  );
}
