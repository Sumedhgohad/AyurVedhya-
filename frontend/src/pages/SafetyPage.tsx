import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { SaeClock, Study } from '../types';
import { ShieldAlert, AlertTriangle, Clock, Download, Plus, CheckCircle2, X } from 'lucide-react';

export const SafetyPage: React.FC = () => {
  const [saeClocks, setSaeClocks] = useState<SaeClock[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [eventTerm, setEventTerm] = useState('');
  const [severity, setSeverity] = useState('SEVERE');
  const [isSerious, setIsSerious] = useState(true);
  const [causality, setCausality] = useState('PROBABLE');
  const [actionTaken, setActionTaken] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const loadSafetyData = async () => {
    try {
      const [saeRes, studyRes] = await Promise.all([
        api.get('/safety/sae/active-clocks'),
        api.get('/study/list'),
      ]);
      setSaeClocks(saeRes.data);
      setStudies(studyRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSafetyData();
    const interval = setInterval(loadSafetyData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogAe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studies[0]) return;
    setLoading(true);
    try {
      await api.post('/safety/ae/log', {
        study_id: studies[0].id,
        participant_id: '00000000-0000-0000-0000-000000000000',
        participant_code: `SUBJ-AIIA-00${Math.floor(1 + Math.random() * 9)}`,
        event_term: eventTerm,
        severity,
        is_serious: isSerious,
        onset_date: new Date().toISOString().split('T')[0],
        causality,
        compensation_status: 'UNDER_REVIEW',
        action_taken: actionTaken || 'Investigational medicine withheld; participant placed on clinical monitoring.',
        outcome: 'Under Observation in AIIA Clinical Ward',
      });
      setNotification('✅ Adverse Event logged! If serious, 24-hour statutory countdown clock is live.');
      setEventTerm('');
      setActionTaken('');
      setShowLogForm(false);
      loadSafetyData();
    } catch (err: any) {
      setNotification(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadNpvcc = async (aeId: string) => {
    try {
      const res = await api.get(`/safety/export/npvcc/${aeId}`);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NPvCC_ASUH_Safety_Report_${aeId}.json`;
      a.click();
    } catch (err) {
      alert('NPvCC Export failed.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-[-0.02em] flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[#ff453a]" />
            Pharmacovigilance & 24-Hour Statutory Safety Center
          </h1>
          <p className="text-xs text-[#7a7a7a] mt-1">
            Mandatory Adverse Event Following Ayurveda (AEFA) tracking under NDCT Rules 2019 and Ministry of Ayush NPvCC.
          </p>
        </div>

        <button
          onClick={() => setShowLogForm(!showLogForm)}
          className="bg-[#ff453a] hover:bg-[#d73a30] text-white font-normal text-xs px-5 py-2.5 rounded-full transition-all shadow-md active:scale-95 flex items-center gap-2"
        >
          {showLogForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showLogForm ? 'Close Form' : 'Log New Adverse Event'}
        </button>
      </div>

      {notification && (
        <div className="p-4 bg-[#1d1d1f] border border-white/10 text-xs font-medium text-[#cccccc] rounded-[14px]">
          {notification}
        </div>
      )}

      {/* NEW ADVERSE EVENT INTAKE FORM */}
      {showLogForm && (
        <div className="bg-[#1d1d1f] border border-[#ff453a]/40 rounded-[18px] p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#ff453a]" />
            Official NPvCC Adverse Event Intake Form
          </h2>

          <form onSubmit={handleLogAe} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#7a7a7a] font-medium uppercase text-[10px] tracking-wider mb-1">
                Adverse Event / Reaction Term
              </label>
              <input
                type="text"
                value={eventTerm}
                onChange={(e) => setEventTerm(e.target.value)}
                placeholder="e.g. Acute Gastric Irritation with Papular Rash"
                className="w-full bg-[#000000] border border-white/10 rounded-[11px] px-3.5 py-2.5 text-white placeholder-[#7a7a7a] focus:outline-none focus:border-[#0066cc]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#7a7a7a] font-medium uppercase text-[10px] tracking-wider mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-[#000000] border border-white/10 rounded-[11px] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#0066cc]"
                >
                  <option value="MILD">Mild</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="SEVERE">Severe</option>
                </select>
              </div>

              <div>
                <label className="block text-[#7a7a7a] font-medium uppercase text-[10px] tracking-wider mb-1">WHO-UMC Causality</label>
                <select
                  value={causality}
                  onChange={(e) => setCausality(e.target.value)}
                  className="w-full bg-[#000000] border border-white/10 rounded-[11px] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#0066cc]"
                >
                  <option value="CERTAIN">Certain</option>
                  <option value="PROBABLE">Probable</option>
                  <option value="POSSIBLE">Possible</option>
                  <option value="UNLIKELY">Unlikely</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#7a7a7a] font-medium uppercase text-[10px] tracking-wider mb-1">
                Clinical Action Taken
              </label>
              <input
                type="text"
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                placeholder="e.g. Medicine suspended, antacid and observation"
                className="w-full bg-[#000000] border border-white/10 rounded-[11px] px-3.5 py-2.5 text-white placeholder-[#7a7a7a] focus:outline-none focus:border-[#0066cc]"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <label className="flex items-center gap-2 text-white font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSerious}
                  onChange={(e) => setIsSerious(e.target.checked)}
                  className="w-4 h-4 accent-[#ff453a] rounded"
                />
                Mark as Serious Adverse Event (SAE) — Triggers 24-Hr Clock
              </label>
            </div>

            <div className="md:col-span-2 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff453a] hover:bg-[#d73a30] text-white font-normal py-3 rounded-full transition-all shadow-md active:scale-95 disabled:opacity-50 text-xs"
              >
                {loading ? 'Submitting & Broadcasting...' : 'Save & Publish to Safety Queue'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ACTIVE SAE EMERGENCY CARDS */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#7a7a7a] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#ff453a]" />
          Active Statutory 24-Hour Countdown Clocks ({saeClocks.length})
        </h2>

        {saeClocks.length === 0 ? (
          <div className="bg-[#1d1d1f] border border-white/10 rounded-[18px] p-8 text-center text-[#7a7a7a] text-xs">
            <CheckCircle2 className="w-8 h-8 text-[#34c759] mx-auto mb-2" />
            No active Serious Adverse Events. All trials 100% compliant with NDCT safety guidelines.
          </div>
        ) : (
          saeClocks.map((sae) => (
            <div
              key={sae.id}
              className="bg-[#1d1d1f] border border-[#ff453a]/50 rounded-[18px] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff453a] to-[#ff9f0a]" />

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-[#ff453a] text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase animate-pulse">
                    🚨 24H STATUTORY CLOCK ACTIVE
                  </span>
                  <span className="text-xs text-[#cccccc] font-mono">
                    Participant: <strong className="text-white">{sae.participant_code}</strong>
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mt-1">{sae.event_term}</h3>
                <p className="text-xs text-[#7a7a7a]">
                  Statutory Deadline: <strong className="text-[#ff453a]">{new Date(sae.statutory_24h_deadline).toLocaleString()}</strong>
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="bg-[#000000] px-4 py-2 rounded-[11px] border border-[#ff453a]/30 text-right">
                  <span className="text-[10px] text-[#7a7a7a] uppercase block font-semibold">Time Remaining</span>
                  <span className="text-2xl font-bold text-[#ff453a] font-mono">{sae.status_label}</span>
                </div>

                <button
                  onClick={() => downloadNpvcc(sae.id)}
                  className="bg-[#ff453a] hover:bg-[#d73a30] text-white text-xs font-normal px-5 py-3 rounded-full flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  NPvCC Report
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
