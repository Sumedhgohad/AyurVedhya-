import React, { useState } from 'react';
import { Sparkles, Check, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (prakritiSummary: string, vata: number, pitta: number, kapha: number) => void;
}

const QUESTIONS = [
  { id: 'frame', label: 'Body Frame & Structure', v: 'Thin, Lean, Prominent joints', p: 'Medium build, Athletic', k: 'Broad, Heavy, Well-built' },
  { id: 'skin', label: 'Skin Texture & Complexion', v: 'Dry, Rough, Cool', p: 'Warm, Reddish, Sensitive', k: 'Oily, Smooth, Cool, Thick' },
  { id: 'appetite', label: 'Appetite & Digestion', v: 'Irregular, Variable (Vishamagni)', p: 'Strong, Intense (Tikshnagni)', k: 'Slow, Constant (Mandagni)' },
  { id: 'sleep', label: 'Sleep Quality', v: 'Light, Interrupted (4-6 hrs)', p: 'Moderate, Sound (6-7 hrs)', k: 'Deep, Heavy (>8 hrs)' },
  { id: 'mind', label: 'Mental Activity & Decisions', v: 'Quick to start, Restless', p: 'Sharp, Critical, Goal-driven', k: 'Calm, Steady, Slow to change' },
];

export const PrakritiQuestionnaireModal: React.FC<Props> = ({ isOpen, onClose, onComplete }) => {
  const [answers, setAnswers] = useState<Record<string, 'v' | 'p' | 'k'>>({
    frame: 'v',
    skin: 'v',
    appetite: 'p',
    sleep: 'v',
    mind: 'p',
  });

  if (!isOpen) return null;

  const calculateResult = () => {
    let vCount = 0, pCount = 0, kCount = 0;
    Object.values(answers).forEach((val) => {
      if (val === 'v') vCount++;
      if (val === 'p') pCount++;
      if (val === 'k') kCount++;
    });

    const total = vCount + pCount + kCount;
    const vPct = Math.round((vCount / total) * 100);
    const pPct = Math.round((pCount / total) * 100);
    const kPct = Math.round((kCount / total) * 100);

    let dominant = 'Vata-Pitta';
    if (vPct >= 40 && pPct >= 30) dominant = `Vata-Pitta (V:${vPct}%, P:${pPct}%, K:${kPct}%)`;
    else if (pPct >= 40 && kPct >= 30) dominant = `Pitta-Kapha (P:${pPct}%, K:${kPct}%, V:${vPct}%)`;
    else if (kPct >= 40 && vPct >= 30) dominant = `Kapha-Vata (K:${kPct}%, V:${vPct}%, P:${pPct}%)`;
    else dominant = `Tridoshaja (V:${vPct}%, P:${pPct}%, K:${kPct}%)`;

    onComplete(dominant, vPct, pPct, kPct);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Standardized Sharirika &amp; Manasika Prakriti Diagnostic Assessment
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {QUESTIONS.map((q) => (
            <div key={q.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-200 block">{q.label}</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setAnswers({ ...answers, [q.id]: 'v' })}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    answers[q.id] === 'v' ? 'bg-blue-950/80 border-blue-600 text-blue-300 font-bold' : 'border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-[9px] uppercase block font-mono text-blue-400">Vata Trait</span>
                  {q.v}
                </button>

                <button
                  type="button"
                  onClick={() => setAnswers({ ...answers, [q.id]: 'p' })}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    answers[q.id] === 'p' ? 'bg-amber-950/80 border-amber-600 text-amber-300 font-bold' : 'border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-[9px] uppercase block font-mono text-amber-400">Pitta Trait</span>
                  {q.p}
                </button>

                <button
                  type="button"
                  onClick={() => setAnswers({ ...answers, [q.id]: 'k' })}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    answers[q.id] === 'k' ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 font-bold' : 'border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-[9px] uppercase block font-mono text-emerald-400">Kapha Trait</span>
                  {q.k}
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={calculateResult}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-950/50 text-xs flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          Calculate &amp; Lock Tri-Dosha Assessment
        </button>
      </div>
    </div>
  );
};
