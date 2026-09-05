import React, { useState } from 'react';
import { Study } from '../types';
import { api } from '../api/client';
import { Users, Package, CheckCircle2, Plus, RefreshCw } from 'lucide-react';
import { SignaturePad } from './SignaturePad';
import {
  FONT_STACK, FONT_MONO, CANVAS, PARCHMENT, HAIRLINE,
  INK, INK_48, INK_80, PRIMARY, PRIMARY_ON_DARK,
  SUCCESS, DANGER, TILE_1, BORDER_DARK,
  R_MD, R_LG, R_PILL,
  TYPE, BADGE, btnPrimary, inputField, labelOverline,
  PRODUCT_SHADOW,
} from '../design';

interface Props { studies: Study[]; refreshData: () => void; }

/* ─ Shared sub-components ─ */
const KPI: React.FC<{
  label: string; value: React.ReactNode; sub: string;
  accent?: string; icon?: React.ReactNode;
}> = ({ label, value, sub, accent = INK, icon }) => (
  <div style={{
    background: CANVAS, border: `1px solid ${HAIRLINE}`,
    borderRadius: R_LG, padding: 24,
    display: 'flex', flexDirection: 'column', gap: 0,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <span style={{ ...TYPE.label, color: INK_48 }}>{label}</span>
      {icon}
    </div>
    <div style={{ fontSize: 36, fontWeight: 600, color: accent, letterSpacing: '-0.374px', lineHeight: 1.1, marginBottom: 6 }}>
      {value}
    </div>
    <p style={{ ...TYPE.caption, color: INK_80, margin: 0 }}>{sub}</p>
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label style={labelOverline()}>{label}</label>
    {children}
  </div>
);

const IS: React.CSSProperties = inputField(false);

export const InvestigatorDashboard: React.FC<Props> = ({ studies, refreshData }) => {
  const [patientCode, setPatientCode] = useState('');
  const [age,   setAge]   = useState('34');
  const [prakriti, setPrakriti] = useState('Vata-Pitta');
  const [dietScore, setDietScore] = useState(90);
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<{ msg: string; ok: boolean } | null>(null);

  const study = studies[0];
  const batch = study?.ip_batches?.[0];

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!study) return;
    setLoading(true);
    try {
      const code = patientCode || `SUBJ-AIIA-${Math.floor(10 + Math.random() * 89)}`;
      const pRes = await api.post('/clinical/participants/enroll', {
        study_id: study.id, participant_code: code,
        age: Number(age), gender: 'Female',
        enrollment_date: new Date().toISOString().split('T')[0],
        consent_type: signature ? 'DIGITAL_SIGNATURE' : 'WRITTEN',
        language_code: 'hi',
      });
      await api.post('/clinical/visits/record', {
        participant_id: pRes.data.id,
        visit_number: 1, visit_type: 'BASELINE',
        visit_date: new Date().toISOString().split('T')[0],
        prakriti_assessment: prakriti,
        nidan_panchaka_findings: 'Vata-Pitta Prakopa noted; chronic stress hetu present.',
        pathya_apathya_diet_score: Number(dietScore),
        namaste_terminology_code: 'NAMASTE_AYU_0842',
        dispensed_batch_no: batch?.batch_no || 'ASH-2026-B1',
        quantity_dispensed: 60,
      });
      setNote({ msg: `${pRes.data.participant_code} enrolled. 60 capsules deducted from Batch ${batch?.batch_no}.`, ok: true });
      setPatientCode(''); setSignature('');
      refreshData();
    } catch (err: any) {
      setNote({ msg: `Error: ${err.response?.data?.message || err.message}`, ok: false });
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── KPI row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        <KPI label="Enrollment Progress"
          value={`1 / ${study?.target_sample_size || 120}`}
          sub="Subjects enrolled in active study"
          accent={PRIMARY} icon={<Users size={16} color={PRIMARY} />}
        />
        <KPI label="CRF Completion"
          value="100%" sub="Prakriti · Nidan Panchaka · Diet Score"
          accent={SUCCESS} icon={<CheckCircle2 size={16} color={SUCCESS} />}
        />
        <KPI label="Open GCP Queries"
          value="0" sub="All queries resolved with source audit"
          accent={INK} icon={<Package size={16} color={INK_48} />}
        />
      </div>

      {/* ── Notification ── */}
      {note && (
        <div style={{
          padding: '13px 18px', borderRadius: R_MD,
          border: `1px solid ${note.ok ? 'rgba(52,199,89,0.30)' : 'rgba(255,69,58,0.30)'}`,
          background: note.ok ? 'rgba(52,199,89,0.06)' : 'rgba(255,69,58,0.06)',
          fontSize: 14, color: note.ok ? SUCCESS : DANGER, letterSpacing: '-0.224px',
        }}>
          {note.msg}
        </div>
      )}

      {/* ── Study card + Enroll form ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Study details — light canvas card */}
        <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ ...BADGE.blue, marginBottom: 10, display: 'inline-flex' }}>
                {study?.short_code || 'AIIA-ASH-2026'}
              </span>
              <h2 style={{ ...TYPE.bodyStrong, color: INK, margin: '10px 0 4px', fontSize: 17 }}>
                {study?.title || 'Loading protocol…'}
              </h2>
              <p style={{ ...TYPE.caption, color: INK_48, margin: 0 }}>
                {study?.phase} · Status: <span style={{ color: SUCCESS, fontWeight: 600 }}>{study?.status}</span>
              </p>
            </div>
            <button onClick={refreshData} title="Refresh"
              style={{ width: 32, height: 32, borderRadius: 8, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: INK_48, transition: 'transform 0.1s', flexShrink: 0 }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <RefreshCw size={13} />
            </button>
          </div>

          {/* IP Batch grid — parchment inner box */}
          <div style={{ background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '16px 20px' }}>
            <p style={{ ...TYPE.label, color: INK_48, margin: '0 0 12px' }}>
              Investigational Product — AFI / API Standard
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
              {[
                { k: 'Formulation', v: batch?.formulation_name || 'Ashwagandha Ghanvati' },
                { k: 'Batch No',    v: batch?.batch_no || 'ASH-2026-B1' },
                { k: 'AFI Standard',v: batch?.afi_api_standard_ref || 'AFI-API-V2-882' },
                { k: 'Stock',       v: `${batch?.current_stock ?? 450} units`, color: SUCCESS },
              ].map(({ k, v, color }) => (
                <div key={k}>
                  <span style={{ fontSize: 11, color: INK_48 }}>{k}</span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: color || INK, margin: '3px 0 0', letterSpacing: '-0.12px' }}>{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Enrollment progress bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ ...TYPE.label, color: INK_48 }}>Enrollment Progress</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: PRIMARY }}>
                1 / {study?.target_sample_size || 120}
              </span>
            </div>
            <div style={{ height: 5, background: 'rgba(0,0,0,0.08)', borderRadius: 9999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.max(1, Math.round(1 / (study?.target_sample_size || 120) * 100))}%`, background: PRIMARY, borderRadius: 9999, transition: 'width 0.8s ease' }} />
            </div>
          </div>
        </div>

        {/* Enrollment form — parchment card */}
        <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 28 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, ...TYPE.bodyStrong, color: INK, margin: '0 0 20px' }}>
            <Plus size={15} color={PRIMARY} />
            Enroll Patient &amp; Baseline CRF
          </h3>

          <form onSubmit={handleEnroll} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Participant Code">
                <input style={IS} placeholder="e.g. SUBJ-AIIA-002" value={patientCode} onChange={e => setPatientCode(e.target.value)} />
              </Field>
              <Field label="Age">
                <input type="number" style={IS} value={age} onChange={e => setAge(e.target.value)} />
              </Field>
            </div>

            <Field label="Ayurvedic Prakriti">
              <select style={{ ...IS, appearance: 'none' }} value={prakriti} onChange={e => setPrakriti(e.target.value)}>
                {['Vata-Pitta','Kapha-Vata','Pitta-Kapha','Tridoshaja'].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={labelOverline()}>Pathya-Apathya Diet Score</label>
                <span style={{ fontSize: 13, fontWeight: 600, color: SUCCESS }}>{dietScore}%</span>
              </div>
              <input type="range" min="0" max="100" value={dietScore}
                onChange={e => setDietScore(Number(e.target.value))}
                style={{ width: '100%', accentColor: PRIMARY }} />
            </div>

            <SignaturePad onSignatureCapture={setSignature} />

            <button type="submit" disabled={loading}
              style={{ ...btnPrimary(loading), width: '100%', marginTop: 4 }}
              onMouseDown={e => !loading && (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {loading ? 'Processing…' : 'Enroll & Dispense Medicine'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
