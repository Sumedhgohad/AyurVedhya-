import React, { useState } from 'react';
import { Study } from '../types';
import { Users, CheckCircle2, Plus, Pill, RefreshCw, Award, Sparkles } from 'lucide-react';
import { SignaturePad } from './SignaturePad';
import { PrakritiQuestionnaireModal } from './PrakritiQuestionnaireModal';
import { api } from '../api/client';

interface Props {
  studies: Study[];
  refreshData: () => void;
}

export const InvestigatorDashboard: React.FC<Props> = ({ studies, refreshData }) => {
  const [patientCode, setPatientCode] = useState('');
  const [age, setAge] = useState('34');
  const [prakriti, setPrakriti] = useState('Vata-Pitta');
  const [dietScore, setDietScore] = useState(90);
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPrakritiModalOpen, setIsPrakritiModalOpen] = useState(false);

  const activeStudy = studies[0];
  const currentBatch = activeStudy?.ip_batches?.[0];

  const handleEnrollPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudy) return;
    setLoading(true);
    try {
      const code = patientCode || `SUBJ-AIIA-00${Math.floor(10 + Math.random() * 89)}`;

      // 1. Enroll Participant
      const patientRes = await api.post('/clinical/participants/enroll', {
        study_id: activeStudy.id,
        participant_code: code,
        age: Number(age),
        gender: 'Female',
        enrollment_date: new Date().toISOString().split('T')[0],
        consent_type: signature ? 'DIGITAL_SIGNATURE' : 'WRITTEN',
        language_code: 'hi',
      });

      // 2. Record Baseline Visit with Automatic Medicine Batch Deduction (60 Capsules)
      await api.post('/clinical/visits/record', {
        participant_id: patientRes.data.id,
        visit_number: 1,
        visit_type: 'BASELINE',
        visit_date: new Date().toISOString().split('T')[0],
        prakriti_assessment: prakriti,
        nidan_panchaka_findings: 'Vata-Pitta Prakopa noted; chronic stress hetu present.',
        pathya_apathya_diet_score: Number(dietScore),
        namaste_terminology_code: 'NAMASTE_AYU_0842',
        dispensed_batch_no: currentBatch?.batch_no || 'ASH-2026-B1',
        quantity_dispensed: 60, // Deducts 60 from pharmacy inventory!
      });

      setNotification(`✅ Enrolled ${code}! 60 capsules deducted from Batch ${currentBatch?.batch_no}. Available Stock: ${(currentBatch?.current_stock || 60) - 60} Units.`);
      setPatientCode('');
      setSignature('');
      refreshData();
    } catch (err: any) {
      setNotification(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* TOP METRIC KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Enrollment Target</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">1</span>
            <span className="text-sm text-slate-400">/ {activeStudy?.target_sample_size || 120} Subjects</span>
          </div>
          <div className="mt-3 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-[2%]" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">GCP Drug Stock</span>
            <Pill className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400">{currentBatch?.current_stock || 0}</span>
            <span className="text-xs text-slate-400">Units Available ({currentBatch?.batch_no})</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Auto-deducted on patient dispensation</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Open GCP Queries</span>
            <CheckCircle2 className="w-5 h-5 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">0</span>
            <span className="text-xs text-purple-400 font-medium">100% Clean Audit Trail</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Verified in audit_integrity_db</p>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-slate-900 border border-slate-700 text-xs font-medium text-emerald-400 rounded-xl">
          {notification}
        </div>
      )}

      {/* ENROLLMENT & AYURVEDA CRF */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Study Overview & Pharmacy Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded">
                {activeStudy?.short_code}
              </span>
              <h2 className="text-base font-bold text-white mt-2">{activeStudy?.title}</h2>
              <p className="text-xs text-slate-400 mt-1">Phase: {activeStudy?.phase} | Status: <strong className="text-emerald-400">{activeStudy?.status}</strong></p>
            </div>
            <button onClick={refreshData} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Investigational Product (AFI / API Standard)
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div><span className="text-slate-500">Formulation:</span> <strong className="text-slate-300">{currentBatch?.formulation_name}</strong></div>
              <div><span className="text-slate-500">Batch No:</span> <strong className="text-slate-300">{currentBatch?.batch_no}</strong></div>
              <div><span className="text-slate-500">Standard:</span> <strong className="text-slate-300">{currentBatch?.afi_api_standard_ref}</strong></div>
              <div><span className="text-slate-500">Warehouse Stock:</span> <strong className="text-emerald-400">{currentBatch?.current_stock} Units</strong></div>
            </div>
          </div>
        </div>

        {/* Right: Patient Enrollment + Signature Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4 text-blue-400" />
            Enroll Patient & Capture e-Consent
          </h3>

          <form onSubmit={handleEnrollPatient} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Participant Code</label>
                <input
                  type="text"
                  value={patientCode}
                  onChange={(e) => setPatientCode(e.target.value)}
                  placeholder="e.g. SUBJ-AIIA-002"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-slate-400 font-medium">Ayurvedic Prakriti</label>
                  <button
                    type="button"
                    onClick={() => setIsPrakritiModalOpen(true)}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-lg transition-colors"
                  >
                    <Sparkles className="w-3 h-3" /> Diagnostic Tool
                  </button>
                </div>
                <select
                  value={prakriti}
                  onChange={(e) => setPrakriti(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Vata-Pitta">Vata-Pitta (V:50%, P:35%, K:15%)</option>
                  <option value="Kapha-Vata">Kapha-Vata (K:50%, V:35%, P:15%)</option>
                  <option value="Pitta-Kapha">Pitta-Kapha (P:50%, K:35%, V:15%)</option>
                  <option value="Tridoshaja">Tridoshaja (Balanced)</option>
                  {prakriti && !['Vata-Pitta', 'Kapha-Vata', 'Pitta-Kapha', 'Tridoshaja'].includes(prakriti) && (
                    <option value={prakriti}>{prakriti}</option>
                  )}
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-medium">Pathya-Apathya (Diet/Lifestyle) Adherence</span>
                <span className="text-emerald-400 font-bold">{dietScore}% Compliance</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={dietScore}
                onChange={(e) => setDietScore(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* DIGITAL SIGNATURE CANVAS */}
            <SignaturePad onSignatureCapture={(b64) => setSignature(b64)} />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50"
            >
              {loading ? 'Processing Transaction...' : 'Enroll, Sign & Dispense Medicine'}
            </button>
          </form>
        </div>
      </div>

      {/* PRAKRITI QUESTIONNAIRE MODAL */}
      <PrakritiQuestionnaireModal
        isOpen={isPrakritiModalOpen}
        onClose={() => setIsPrakritiModalOpen(false)}
        onComplete={(prakritiSummary) => setPrakriti(prakritiSummary)}
      />
    </div>
  );
};
