import React, { useState } from 'react';
import { api } from '../api/client';

const T = {
  tile: '#1d1d1f',
  bg: '#000000',
  border: 'rgba(255,255,255,0.08)',
  ink: '#ffffff',
  muted: '#cccccc',
  dim: '#7a7a7a',
  primary: '#0066cc',
  primaryFocus: '#0071e3',
  primaryOnDark: '#2997ff',
  success: '#34c759',
  danger: '#ff453a',
};

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: T.bg, border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 11, padding: '9px 14px',
  color: T.ink, fontSize: 14, letterSpacing: '-0.224px',
  outline: 'none', fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: T.dim, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6,
};

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
      const sRes = await api.get('/study/list');
      const studyId = sRes.data[0]?.id || '4f722d35-7e9d-44cf-bf3f-af97d557cdbb';
      const pRes = await api.post('/clinical/participants/enroll', {
        study_id: studyId,
        participant_code: patientCode || `SUBJ-AIIA-${Math.floor(100 + Math.random() * 900)}`,
        age: Number(age), gender,
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
        namaste_terminology_code: namasteCode,
        dispensed_batch_no: 'ASH-2026-B1',
        quantity_dispensed: 60,
      });
      setNotification({ msg: `${pRes.data.participant_code} successfully enrolled — Baseline Hybrid CRF locked.`, ok: true });
      setEnrolledList((prev) => [
        { code: pRes.data.participant_code, age, gender, prakriti, dietScore, date: new Date().toLocaleDateString() },
        ...prev,
      ]);
      setPatientCode('');
    } catch (err: any) {
      setNotification({ msg: `Error: ${err.response?.data?.message || err.message}`, ok: false });
    } finally {
      setLoading(false);
    }
  };

  const allParticipants = [
    { code: 'SUBJ-AIIA-001', age: '34', gender: 'Female', prakriti: 'Vata-Pitta', dietScore: 90, status: 'Active Baseline' },
    ...enrolledList,
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page header */}
      <div>
        <h1
          style={{
            fontSize: 34, fontWeight: 600, color: T.ink,
            letterSpacing: '-0.374px', lineHeight: 1.1, margin: '0 0 6px',
          }}
        >
          Enrolled Participants &amp; Hybrid Ayush CRFs
        </h1>
        <p style={{ fontSize: 14, color: T.dim, letterSpacing: '-0.224px', margin: 0 }}>
          NAMASTE Terminology, Prakriti Pariksha, and Pathya-Apathya Compliance Tracking.
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div
          style={{
            padding: '14px 20px', borderRadius: 11,
            border: `1px solid ${notification.ok ? 'rgba(52,199,89,0.35)' : 'rgba(255,69,58,0.35)'}`,
            background: notification.ok ? 'rgba(52,199,89,0.07)' : 'rgba(255,69,58,0.07)',
            color: notification.ok ? T.success : T.danger,
            fontSize: 14, letterSpacing: '-0.224px',
          }}
        >
          {notification.msg}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: 20,
          alignItems: 'start',
        }}
      >
        {/* Enroll form */}
        <div
          style={{
            background: T.tile, border: `1px solid ${T.border}`,
            borderRadius: 18, padding: 28,
          }}
        >
          <h2
            style={{
              fontSize: 17, fontWeight: 600, color: T.ink,
              letterSpacing: '-0.374px', marginBottom: 20,
            }}
          >
            New Subject Enrollment
          </h2>

          <form onSubmit={handleEnroll} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Participant Code</label>
              <input
                style={inputStyle} placeholder="e.g. SUBJ-AIIA-005"
                value={patientCode} onChange={(e) => setPatientCode(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Age</label>
                <input type="number" style={inputStyle} value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Gender</label>
                <select
                  style={{ ...inputStyle, appearance: 'none' }}
                  value={gender} onChange={(e) => setGender(e.target.value)}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Prakriti Classification</label>
              <select
                style={{ ...inputStyle, appearance: 'none' }}
                value={prakriti} onChange={(e) => setPrakriti(e.target.value)}
              >
                {['Vata-Pitta', 'Kapha-Vata', 'Pitta-Kapha', 'Tridoshaja'].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Pathya-Apathya Diet Score</label>
                <span style={{ fontSize: 14, fontWeight: 600, color: T.success }}>{dietScore}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={dietScore}
                onChange={(e) => setDietScore(Number(e.target.value))}
                style={{ width: '100%', accentColor: T.primary }}
              />
            </div>

            <div>
              <label style={labelStyle}>NAMASTE Terminology Code</label>
              <input
                style={inputStyle} value={namasteCode}
                onChange={(e) => setNamasteCode(e.target.value)}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: T.primary, color: '#ffffff', border: 'none',
                borderRadius: 9999, padding: '11px 22px',
                fontSize: 17, fontWeight: 400, letterSpacing: '-0.374px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'transform 0.1s ease', fontFamily: 'inherit',
              }}
              onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {loading ? 'Enrolling Subject…' : 'Enroll & Save Hybrid CRF'}
            </button>
          </form>
        </div>

        {/* Cohort table */}
        <div
          style={{
            background: T.tile, border: `1px solid ${T.border}`,
            borderRadius: 18, overflow: 'hidden',
          }}
        >
          <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${T.border}` }}>
            <h2
              style={{
                fontSize: 17, fontWeight: 600, color: T.ink,
                letterSpacing: '-0.374px', margin: 0,
              }}
            >
              Enrolled Cohort &amp; Baseline CRF Records
            </h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%', borderCollapse: 'collapse',
                fontSize: 14, letterSpacing: '-0.224px',
              }}
            >
              <thead>
                <tr style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                  {['Subject ID', 'Demographics', 'Prakriti', 'Diet Score', 'Status'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '12px 20px', textAlign: 'left',
                        fontSize: 11, fontWeight: 600, color: T.dim,
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allParticipants.map((pt, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: T.ink }}>{pt.code}</td>
                    <td style={{ padding: '14px 20px', color: T.muted }}>
                      {pt.age} yrs · {pt.gender}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          fontSize: 11, fontWeight: 600,
                          color: T.primaryOnDark,
                          background: 'rgba(41,151,255,0.1)',
                          border: '1px solid rgba(41,151,255,0.25)',
                          padding: '2px 9px', borderRadius: 9999,
                        }}
                      >
                        {pt.prakriti}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: T.success }}>
                      {pt.dietScore}%
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 12, color: T.dim }}>
                      CRF Verified
                    </td>
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
