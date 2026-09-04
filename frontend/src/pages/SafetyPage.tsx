import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { SaeClock, Study } from '../types';
import { ShieldAlert, Clock, Download, Plus, CheckCircle2, X, AlertTriangle } from 'lucide-react';

const T = {
  tile: '#1d1d1f',
  tileDark2: '#272729',
  bg: '#000000',
  border: 'rgba(255,255,255,0.08)',
  ink: '#ffffff',
  muted: '#cccccc',
  dim: '#7a7a7a',
  primary: '#0066cc',
  success: '#34c759',
  warning: '#ff9f0a',
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
      setNotification('✅ Adverse Event logged. If serious, 24-hour statutory countdown clock is now live.');
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
    } catch {
      alert('NPvCC Export failed.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page header */}
      <div
        style={{
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'space-between', alignItems: 'flex-start', gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 34, fontWeight: 600, color: T.ink,
              letterSpacing: '-0.374px', lineHeight: 1.1, margin: '0 0 6px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <ShieldAlert size={28} color={T.danger} />
            Pharmacovigilance &amp; 24-Hour Statutory Safety Center
          </h1>
          <p style={{ fontSize: 14, color: T.dim, letterSpacing: '-0.224px', margin: 0 }}>
            Mandatory Adverse Event Following Ayurveda (AEFA) tracking under NDCT Rules 2019 and Ministry of Ayush NPvCC.
          </p>
        </div>

        <button
          onClick={() => setShowLogForm(!showLogForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: showLogForm ? T.tile : T.danger,
            color: T.ink, border: showLogForm ? `1px solid ${T.border}` : 'none',
            borderRadius: 9999, padding: '11px 22px',
            fontSize: 14, fontWeight: 600, letterSpacing: '-0.224px',
            cursor: 'pointer', transition: 'transform 0.1s ease',
            fontFamily: 'inherit', flexShrink: 0,
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {showLogForm ? <X size={14} /> : <Plus size={14} />}
          {showLogForm ? 'Close Form' : 'Log New Adverse Event'}
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div
          style={{
            padding: '14px 20px', borderRadius: 11,
            background: T.tile, border: `1px solid ${T.border}`,
            fontSize: 14, color: T.muted, letterSpacing: '-0.224px',
          }}
        >
          {notification}
        </div>
      )}

      {/* AE Intake Form */}
      {showLogForm && (
        <div
          style={{
            background: T.tile,
            border: '1px solid rgba(255,69,58,0.35)',
            borderRadius: 18, padding: 28,
          }}
        >
          <h2
            style={{
              fontSize: 17, fontWeight: 600, color: T.ink,
              letterSpacing: '-0.374px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <AlertTriangle size={16} color={T.danger} />
            Official NPvCC Adverse Event Intake Form
          </h2>

          <form
            onSubmit={handleLogAe}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
          >
            <div>
              <label style={labelStyle}>Adverse Event / Reaction Term</label>
              <input
                type="text" value={eventTerm}
                onChange={(e) => setEventTerm(e.target.value)}
                placeholder="e.g. Acute Gastric Irritation with Papular Rash"
                style={inputStyle} required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  style={{ ...inputStyle, appearance: 'none' }}
                >
                  <option value="MILD">Mild</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="SEVERE">Severe</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>WHO-UMC Causality</label>
                <select
                  value={causality}
                  onChange={(e) => setCausality(e.target.value)}
                  style={{ ...inputStyle, appearance: 'none' }}
                >
                  <option value="CERTAIN">Certain</option>
                  <option value="PROBABLE">Probable</option>
                  <option value="POSSIBLE">Possible</option>
                  <option value="UNLIKELY">Unlikely</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Clinical Action Taken</label>
              <input
                type="text" value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                placeholder="e.g. Medicine suspended, antacid and observation"
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  cursor: 'pointer', fontSize: 14, color: T.muted, letterSpacing: '-0.224px',
                }}
              >
                <input
                  type="checkbox" checked={isSerious}
                  onChange={(e) => setIsSerious(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: T.danger }}
                />
                Mark as Serious Adverse Event (SAE) — Triggers 24-Hr Clock
              </label>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: T.danger, color: T.ink, border: 'none',
                  borderRadius: 9999, padding: '11px 22px',
                  fontSize: 17, fontWeight: 400, letterSpacing: '-0.374px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'transform 0.1s ease', fontFamily: 'inherit',
                }}
                onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {loading ? 'Submitting & Broadcasting…' : 'Save & Publish to Safety Queue'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active SAE clocks */}
      <div>
        <p
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 11, fontWeight: 600, color: T.dim,
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14,
          }}
        >
          <Clock size={13} color={T.danger} />
          Active Statutory 24-Hour Countdown Clocks ({saeClocks.length})
        </p>

        {saeClocks.length === 0 ? (
          <div
            style={{
              background: T.tile, border: `1px solid ${T.border}`,
              borderRadius: 18, padding: 48, textAlign: 'center',
            }}
          >
            <CheckCircle2 size={32} color={T.success} style={{ margin: '0 auto 10px' }} />
            <p
              style={{
                fontSize: 17, fontWeight: 600, color: T.success,
                letterSpacing: '-0.374px', marginBottom: 6,
              }}
            >
              All SAE Clocks Clear
            </p>
            <p style={{ fontSize: 14, color: T.dim, letterSpacing: '-0.224px', margin: 0 }}>
              No active Serious Adverse Events. All trials 100% compliant with NDCT safety guidelines.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {saeClocks.map((sae) => (
              <div
                key={sae.id}
                style={{
                  background: T.tileDark2,
                  border: '1px solid rgba(255,69,58,0.45)',
                  borderRadius: 18,
                  padding: '28px 32px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Top accent bar */}
                <div
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: 'linear-gradient(90deg, #ff453a, #ff9f0a)',
                  }}
                />

                <div
                  style={{
                    display: 'flex', flexWrap: 'wrap',
                    justifyContent: 'space-between', alignItems: 'center', gap: 20,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span
                        style={{
                          fontSize: 10, fontWeight: 700, color: T.danger,
                          background: 'rgba(255,69,58,0.12)',
                          border: '1px solid rgba(255,69,58,0.4)',
                          padding: '3px 10px', borderRadius: 9999,
                          letterSpacing: '0.06em', textTransform: 'uppercase',
                        }}
                      >
                        🚨 24H Statutory Clock Active
                      </span>
                      <span style={{ fontSize: 12, color: T.dim, fontFamily: 'inherit' }}>
                        Participant:{' '}
                        <strong style={{ color: T.ink, fontWeight: 600 }}>
                          {sae.participant_code}
                        </strong>
                      </span>
                    </div>
                    <h3
                      style={{
                        fontSize: 21, fontWeight: 600, color: T.ink,
                        letterSpacing: '-0.374px', lineHeight: 1.19, marginBottom: 6,
                      }}
                    >
                      {sae.event_term}
                    </h3>
                    <p style={{ fontSize: 14, color: '#ff6961', letterSpacing: '-0.224px', margin: 0 }}>
                      Statutory Deadline:{' '}
                      <strong>{new Date(sae.statutory_24h_deadline).toLocaleString()}</strong>
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                    <div
                      style={{
                        background: T.bg,
                        border: '1px solid rgba(255,69,58,0.3)',
                        borderRadius: 11,
                        padding: '12px 20px',
                        textAlign: 'right',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10, color: T.dim,
                          display: 'block', textTransform: 'uppercase',
                          letterSpacing: '0.06em', marginBottom: 4,
                        }}
                      >
                        Time Remaining
                      </span>
                      <span
                        style={{
                          fontSize: 28, fontWeight: 700,
                          color: sae.is_overdue ? T.danger : T.warning,
                          letterSpacing: '-0.374px',
                          fontFamily: 'SF Mono, ui-monospace, monospace',
                        }}
                      >
                        {sae.status_label}
                      </span>
                    </div>

                    <button
                      onClick={() => downloadNpvcc(sae.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: T.danger, color: T.ink, border: 'none',
                        borderRadius: 9999, padding: '11px 22px',
                        fontSize: 14, fontWeight: 600, letterSpacing: '-0.224px',
                        cursor: 'pointer', transition: 'transform 0.1s',
                        fontFamily: 'inherit',
                      }}
                      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <Download size={14} />
                      NPvCC Report
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
