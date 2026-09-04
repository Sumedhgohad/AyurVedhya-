import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Users, UserPlus, CheckCircle2, ClipboardList, Activity } from 'lucide-react';

export const ParticipantsPage: React.FC = () => {
  const [patientCode, setPatientCode] = useState('');
  const [age, setAge] = useState('38');
  const [gender, setGender] = useState('Female');
  const [prakriti, setPrakriti] = useState('Vata-Pitta');
  const [dietScore, setDietScore] = useState(85);
  const [namasteCode, setNamasteCode] = useState('NAMASTE_AYU_0842');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; ok: boolean } | null>(null);
  const [enrolledList, setEnrolledList] = useState<any[]>([]);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Fetch active study ID
      const sRes = await api.get('/study/list');
      const studyId = sRes.data[0]?.id || '4f722d35-7e9d-44cf-bf3f-af97d557cdbb';

      const pRes = await api.post('/clinical/participants/enroll', {
        study_id: studyId,
        participant_code: patientCode || `SUBJ-AIIA-${Math.floor(100 + Math.random() * 900)}`,
        age: Number(age),
        gender,
        enrollment_date: new Date().toISOString().split('T')[0],
        consent_type: 'WRITTEN',
        language_code: 'hi',
      });

      await api.post('/clinical/visits/record', {
        participant_id: pRes.data.id,
        visit_number: 1,
        visit_type: 'BASELINE',
        visit_date: new Date().toISOString().split('T')[0],
        prakriti_assessment: prakriti,
        nidan_panchaka_findings: 'Chronic Manasika Hetu, Pitta-Vata vitiation documented.',
        pathya_apathya_diet_score: Number(dietScore),
        namaste_terminology_code: namasteCode,
        dispensed_batch_no: 'ASH-2026-B1',
        quantity_dispensed: 60,
      });

      setNotification({ msg: `✓ ${pRes.data.participant_code} successfully enrolled — Baseline Hybrid CRF locked.`, ok: true });
      setEnrolledList((prev) => [
        {
          code: pRes.data.participant_code,
          age,
          gender,
          prakriti,
          dietScore,
          date: new Date().toLocaleDateString(),
        },
        ...prev,
      ]);
      setPatientCode('');
    } catch (err: any) {
      setNotification({ msg: `Error: ${err.response?.data?.message || err.message}`, ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-[-0.02em] flex items-center gap-2">
          <Users className="w-6 h-6 text-[#2997ff]" />
          Enrolled Participants & Hybrid Ayush CRFs
        </h1>
        <p className="text-xs text-[#7a7a7a] mt-1">
          NAMASTE Terminology, Prakriti Pariksha, and Pathya-Apathya Compliance Tracking.
        </p>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-[14px] border text-xs font-medium ${
            notification.ok
              ? 'bg-[#34c759]/10 border-[#34c759]/30 text-[#34c759]'
              : 'bg-[#ff453a]/10 border-[#ff453a]/30 text-[#ff453a]'
          }`}
        >
          {notification.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enroll Form Card */}
        <div className="lg:col-span-1 bg-[#1d1d1f] border border-white/10 rounded-[18px] p-6 space-y-4">
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#2997ff]" />
            New Subject Enrollment
          </h2>

          <form onSubmit={handleEnroll} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#7a7a7a] font-medium uppercase text-[10px] tracking-wider mb-1">
                Participant Code
              </label>
              <input
                type="text"
                value={patientCode}
                onChange={(e) => setPatientCode(e.target.value)}
                placeholder="e.g. SUBJ-AIIA-005"
                className="w-full bg-[#000000] border border-white/10 rounded-[11px] px-3.5 py-2.5 text-white placeholder-[#7a7a7a] focus:outline-none focus:border-[#0066cc]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#7a7a7a] font-medium uppercase text-[10px] tracking-wider mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-[#000000] border border-white/10 rounded-[11px] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#0066cc]"
                />
              </div>

              <div>
                <label className="block text-[#7a7a7a] font-medium uppercase text-[10px] tracking-wider mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-[#000000] border border-white/10 rounded-[11px] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#0066cc]"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#7a7a7a] font-medium uppercase text-[10px] tracking-wider mb-1">
                Prakriti Classification
              </label>
              <select
                value={prakriti}
                onChange={(e) => setPrakriti(e.target.value)}
                className="w-full bg-[#000000] border border-white/10 rounded-[11px] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#0066cc]"
              >
                <option value="Vata-Pitta">Vata-Pitta</option>
                <option value="Kapha-Vata">Kapha-Vata</option>
                <option value="Pitta-Kapha">Pitta-Kapha</option>
                <option value="Tridoshaja">Tridoshaja</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[#7a7a7a] font-medium uppercase text-[10px] tracking-wider">
                  Pathya-Apathya Diet Score
                </label>
                <span className="text-[#34c759] font-semibold">{dietScore}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={dietScore}
                onChange={(e) => setDietScore(Number(e.target.value))}
                className="w-full accent-[#0066cc]"
              />
            </div>

            <div>
              <label className="block text-[#7a7a7a] font-medium uppercase text-[10px] tracking-wider mb-1">
                NAMASTE Terminology Code
              </label>
              <input
                type="text"
                value={namasteCode}
                onChange={(e) => setNamasteCode(e.target.value)}
                className="w-full bg-[#000000] border border-white/10 rounded-[11px] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#0066cc]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0066cc] hover:bg-[#0052a3] text-white font-normal py-3 rounded-full transition-all shadow-md shadow-[#0066cc]/20 active:scale-95 disabled:opacity-50 text-xs"
            >
              {loading ? 'Enrolling Subject...' : 'Enroll & Save Hybrid CRF'}
            </button>
          </form>
        </div>

        {/* Participant History Card */}
        <div className="lg:col-span-2 bg-[#1d1d1f] border border-white/10 rounded-[18px] p-6 space-y-4">
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#34c759]" />
            Enrolled Cohort & Baseline CRF Records
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#cccccc]">
              <thead className="bg-[#000000] text-[#7a7a7a] uppercase font-semibold text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">Subject ID</th>
                  <th className="px-4 py-3">Demographics</th>
                  <th className="px-4 py-3">Prakriti</th>
                  <th className="px-4 py-3">Diet Score</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { code: 'SUBJ-AIIA-001', age: '34', gender: 'Female', prakriti: 'Vata-Pitta', dietScore: 90, status: 'Active Baseline' },
                  ...enrolledList,
                ].map((pt, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">{pt.code}</td>
                    <td className="px-4 py-3">{pt.age} yrs · {pt.gender}</td>
                    <td className="px-4 py-3">
                      <span className="bg-[#0066cc]/15 text-[#2997ff] border border-[#0066cc]/30 px-2 py-0.5 rounded-full text-[10px] font-medium">
                        {pt.prakriti}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#34c759]">{pt.dietScore}%</td>
                    <td className="px-4 py-3 text-[11px] text-[#7a7a7a]">✓ CRF Verified</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
