import React, { useState } from 'react';
import { Study } from '../types';
import { api } from '../api/client';

interface Props {
  studies: Study[];
  refreshData: () => void;
}

/* ── Design tokens ── */
const T = {
  tile: '#1d1d1f',
  tileDark: '#000000',
  border: 'rgba(255,255,255,0.08)',
  ink: '#ffffff',
  muted: '#cccccc',
  dim: '#7a7a7a',
  primary: '#0066cc',
  primaryOnDark: '#2997ff',
  success: '#34c759',
  danger: '#ff453a',
};

const Section: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      background: T.tile,
      border: `1px solid ${T.border}`,
      borderRadius: 18,
      padding: 28,
      ...style,
    }}
  >
    {children}
  </div>
);

const KpiCard: React.FC<{ label: string; value: React.ReactNode; sub: string; accent?: string }> = ({
  label, value, sub, accent = '#ffffff',
}) => (
  <Section>
    <p
      style={{
        fontSize: 11, fontWeight: 600, color: T.dim,
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14,
      }}
    >
      {label}
    </p>
    <div
      style={{
        fontSize: 36, fontWeight: 600, color: accent,
        letterSpacing: '-0.374px', lineHeight: 1.1, marginBottom: 6,
      }}
    >
      {value}
    </div>
    <p style={{ fontSize: 14, color: T.muted, letterSpacing: '-0.224px', margin: 0 }}>
      {sub}
    </p>
  </Section>
);

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: T.tileDark, border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 11,
  padding: '9px 14px', color: T.ink,
  fontSize: 14, letterSpacing: '-0.224px',
  outline: 'none', fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: T.dim, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6,
};

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        <KpiCard
          label="Enrollment Progress"
          value={`1 / ${study?.target_sample_size || 120}`}
          sub="Subjects enrolled in active study"
          accent={T.primaryOnDark}
        />
        <KpiCard
          label="CRF Completion"
          value="100%"
          sub="Prakriti · Nidan Panchaka · Diet Score"
          accent={T.success}
        />
        <KpiCard
          label="Open GCP Queries"
          value="0"
          sub="All queries resolved with source audit"
          accent={T.ink}
        />
      </div>

      {/* Notification */}
      {notification && (
        <div
          style={{
            padding: '14px 20px', borderRadius: 11,
            border: `1px solid ${notification.ok ? 'rgba(52,199,89,0.4)' : 'rgba(255,69,58,0.4)'}`,
            background: notification.ok ? 'rgba(52,199,89,0.08)' : 'rgba(255,69,58,0.08)',
            color: notification.ok ? T.success : T.danger,
            fontSize: 14, letterSpacing: '-0.224px',
          }}
        >
          {notification.msg}
        </div>
      )}

      {/* Study card + Enroll form */}
      <div style={{ display: 'grid', gridTemplateColumns: '5fr 3fr', gap: 20 }}>
        {/* Study Details */}
        <Section>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <span
              style={{
                fontSize: 11, fontWeight: 600, color: T.primaryOnDark,
                background: 'rgba(41,151,255,0.1)', border: '1px solid rgba(41,151,255,0.25)',
                padding: '3px 10px', borderRadius: 9999,
              }}
            >
              {study?.short_code || '—'}
            </span>
            <span
              style={{
                fontSize: 11, fontWeight: 600, color: T.success,
                background: 'rgba(52,199,89,0.1)', border: '1px solid rgba(52,199,89,0.25)',
                padding: '3px 10px', borderRadius: 9999,
              }}
            >
              {study?.status || 'LOADING'}
            </span>
          </div>
          <h2
            style={{
              fontSize: 21, fontWeight: 600, color: T.ink,
              letterSpacing: '-0.374px', lineHeight: 1.19, marginBottom: 6,
            }}
          >
            {study?.title || 'Loading study…'}
          </h2>
          <p style={{ fontSize: 14, color: T.dim, letterSpacing: '-0.224px', marginBottom: 28 }}>
            {study?.phase} · {study?.study_type}
          </p>

          {/* IP Batch grid */}
          <div
            style={{
              borderTop: `1px solid rgba(255,255,255,0.06)`,
              paddingTop: 20,
            }}
          >
            <p
              style={{
                fontSize: 11, fontWeight: 600, color: T.dim,
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14,
              }}
            >
              Investigational Product · Batch Traceability (AFI Standard)
            </p>
            <div
              style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
                background: T.tileDark, padding: 16, borderRadius: 11,
                border: `1px solid rgba(255,255,255,0.06)`,
              }}
            >
              {[
                { k: 'Formulation', v: study?.ip_batches?.[0]?.formulation_name || '—' },
                { k: 'Batch No.', v: study?.ip_batches?.[0]?.batch_no || '—' },
                { k: 'AFI Standard', v: study?.ip_batches?.[0]?.afi_api_standard_ref || '—' },
                { k: 'Stock', v: `${study?.ip_batches?.[0]?.current_stock ?? '—'} units` },
              ].map(({ k, v }) => (
                <div key={k}>
                  <span style={{ fontSize: 11, color: T.dim, display: 'block', marginBottom: 4 }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.ink, letterSpacing: '-0.224px' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Enroll Form */}
        <Section>
          <h3
            style={{
              fontSize: 17, fontWeight: 600, color: T.ink,
              letterSpacing: '-0.374px', marginBottom: 20,
            }}
          >
            Enroll Patient &amp; Log Hybrid CRF
          </h3>

          <form onSubmit={handleEnroll} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Participant Code</label>
              <input
                style={inputStyle}
                placeholder="e.g. SUBJ-AIIA-002"
                value={patientCode}
                onChange={(e) => setPatientCode(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Age</label>
                <input type="number" style={inputStyle} value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Prakriti</label>
                <select
                  style={{ ...inputStyle, appearance: 'none' }}
                  value={prakriti}
                  onChange={(e) => setPrakriti(e.target.value)}
                >
                  {['Vata-Pitta', 'Kapha-Vata', 'Pitta-Kapha', 'Tridoshaja'].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Pathya-Apathya Diet Score</label>
                <span style={{ fontSize: 14, fontWeight: 600, color: T.success }}>{dietScore}%</span>
              </div>
              <input
                type="range" min={0} max={100} value={dietScore}
                onChange={(e) => setDietScore(Number(e.target.value))}
                style={{ width: '100%', accentColor: T.primary }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: T.primary, color: '#ffffff', border: 'none',
                borderRadius: 9999, padding: '11px 22px',
                fontSize: 17, fontWeight: 400, letterSpacing: '-0.374px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'transform 0.1s ease',
                fontFamily: 'inherit',
              }}
              onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {loading ? 'Submitting…' : 'Enroll & Save Hybrid CRF'}
            </button>
          </form>
        </Section>
      </div>
    </div>
  );
};
