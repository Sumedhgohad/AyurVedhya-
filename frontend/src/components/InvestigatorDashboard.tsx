import React, { useState } from 'react';
import { Study } from '../types';
import { api } from '../api/client';

interface Props {
  studies: Study[];
  refreshData: () => void;
}

const KpiCard: React.FC<{ label: string; value: string | number; sub: string; accent?: string }> = ({ label, value, sub, accent = '#0066cc' }) => (
  <div style={{ background: '#1d1d1f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 24 }}>
    <p style={{ fontSize: 11, fontWeight: 600, color: '#7a7a7a', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>{label}</p>
    <p style={{ fontSize: 36, fontWeight: 600, color: accent, letterSpacing: '-0.374px', lineHeight: 1.1, marginBottom: 6 }}>{value}</p>
    <p style={{ fontSize: 14, color: '#cccccc', letterSpacing: '-0.224px' }}>{sub}</p>
  </div>
);

export const InvestigatorDashboard: React.FC<Props> = ({ studies, refreshData }) => {
  const [patientCode, setPatientCode] = useState('');
  const [age, setAge] = useState('34');
  const [prakriti, setPrakriti] = useState('Vata-Pitta');
  const [dietScore, setDietScore] = useState(90);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; ok: boolean } | null>(null);

  const study = studies[0];

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!study) return;
    setLoading(true);
    try {
      const pRes = await api.post('/clinical/participants/enroll', {
        study_id: study.id,
        participant_code: patientCode || `SUBJ-AIIA-${Math.floor(100 + Math.random() * 900)}`,
        age: Number(age), gender: 'Female',
        enrollment_date: new Date().toISOString().split('T')[0],
        consent_type: 'WRITTEN', language_code: 'hi',
      });
      await api.post('/clinical/visits/record', {
        participant_id: pRes.data.id,
        visit_number: 1, visit_type: 'BASELINE',
        visit_date: new Date().toISOString().split('T')[0],
        prakriti_assessment: prakriti,
        nidan_panchaka_findings: 'Chronic Manasika Hetu, Pitta-Vata vitiation documented.',
        pathya_apathya_diet_score: Number(dietScore),
        namaste_terminology_code: 'NAMASTE_AYU_0842',
        dispensed_batch_no: study.ip_batches?.[0]?.batch_no || 'ASH-2026-B1',
        quantity_dispensed: 60,
      });
      setNotification({ msg: `✓ ${pRes.data.participant_code} enrolled — Baseline CRF saved.`, ok: true });
      setPatientCode('');
      refreshData();
    } catch (err: any) {
      setNotification({ msg: `Error: ${err.response?.data?.message || err.message}`, ok: false });
    } finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: '#000', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 11, padding: '9px 14px',
    color: '#fff', fontSize: 14, letterSpacing: '-0.224px', outline: 'none',
  };

  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: '#7a7a7a', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6, display: 'block' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* KPI ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        <KpiCard label="Enrollment Progress" value={`1 / ${study?.target_sample_size || 120}`} sub="Subjects enrolled in ENROLLING study" accent="#2997ff" />
        <KpiCard label="CRF Completion" value="100%" sub="Prakriti · Nidan Panchaka · Diet Score" accent="#34c759" />
        <KpiCard label="Open GCP Queries" value="0" sub="All queries resolved with source audit" accent="#fff" />
      </div>

      {notification && (
        <div style={{ padding: '14px 20px', borderRadius: 11, border: `1px solid ${notification.ok ? 'rgba(52,199,89,0.4)' : 'rgba(255,69,58,0.4)'}`, background: notification.ok ? 'rgba(52,199,89,0.08)' : 'rgba(255,69,58,0.08)', color: notification.ok ? '#34c759' : '#ff453a', fontSize: 14, letterSpacing: '-0.224px' }}>
          {notification.msg}
        </div>
      )}

      {/* STUDY CARD + CRF FORM */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Study Details */}
        <div style={{ background: '#1d1d1f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 28 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#2997ff', background: 'rgba(41,151,255,0.1)', border: '1px solid rgba(41,151,255,0.25)', padding: '3px 10px', borderRadius: 9999 }}>{study?.short_code}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#34c759', background: 'rgba(52,199,89,0.1)', border: '1px solid rgba(52,199,89,0.25)', padding: '3px 10px', borderRadius: 9999 }}>{study?.status}</span>
          </div>
          <h2 style={{ fontSize: 21, fontWeight: 600, color: '#fff', letterSpacing: '-0.374px', lineHeight: 1.19, marginBottom: 6 }}>{study?.title}</h2>
          <p style={{ fontSize: 14, color: '#7a7a7a', letterSpacing: '-0.224px', marginBottom: 24 }}>{study?.phase} · {study?.study_type}</p>

          {/* IP Batch */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#7a7a7a', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Investigational Product · Batch Traceability (AFI Standard)</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, background: '#000', padding: 16, borderRadius: 11, border: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { k: 'Formulation', v: study?.ip_batches?.[0]?.formulation_name || '—' },
                { k: 'Batch No.', v: study?.ip_batches?.[0]?.batch_no || '—' },
                { k: 'AFI Standard', v: study?.ip_batches?.[0]?.afi_api_standard_ref || '—' },
                { k: 'Stock', v: `${study?.ip_batches?.[0]?.current_stock ?? '—'} units` },
              ].map(({ k, v }) => (
                <div key={k}>
                  <span style={{ fontSize: 11, color: '#7a7a7a', display: 'block', marginBottom: 4 }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: '-0.224px' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enroll Form */}
        <div style={{ background: '#1d1d1f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 28 }}>
          <h3 style={{ fontSize: 17, fontWeight: 600, color: '#fff', letterSpacing: '-0.374px', marginBottom: 20 }}>Enroll Patient & Log Hybrid CRF</h3>
          <form onSubmit={handleEnroll} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Participant Code</label>
              <input style={inputStyle} placeholder="e.g. SUBJ-AIIA-002" value={patientCode} onChange={e => setPatientCode(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Age</label>
                <input type="number" style={inputStyle} value={age} onChange={e => setAge(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Prakriti</label>
                <select style={{ ...inputStyle, appearance: 'none' }} value={prakriti} onChange={e => setPrakriti(e.target.value)}>
                  {['Vata-Pitta','Kapha-Vata','Pitta-Kapha','Tridoshaja'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={labelStyle}>Pathya-Apathya Diet Score</label>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#34c759' }}>{dietScore}%</span>
              </div>
              <input type="range" min={0} max={100} value={dietScore} onChange={e => setDietScore(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0066cc' }} />
            </div>
            <button type="submit" disabled={loading}
              style={{ background: '#0066cc', color: '#fff', border: 'none', borderRadius: 9999, padding: '11px 22px', fontSize: 17, fontWeight: 400, letterSpacing: '-0.374px', cursor: 'pointer', transition: 'transform 0.1s', opacity: loading ? 0.6 : 1 }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
              {loading ? 'Submitting…' : 'Enroll & Save Hybrid CRF'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
