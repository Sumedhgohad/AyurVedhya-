import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { Study } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2, ShieldAlert, Lock, FileCheck, Award,
  Scale, Calendar, ChevronDown, FileText, Download,
  AlertCircle, Users, FlaskConical, ExternalLink, ClipboardCheck,
} from 'lucide-react';
import {
  CANVAS, PARCHMENT, HAIRLINE, INK, INK_48, INK_80,
  PRIMARY, PRIMARY_ON_DARK, SUCCESS, WARNING, DANGER, PURPLE,
  FONT_STACK, FONT_MONO, R_MD, R_LG, R_PILL, R_SM,
  TYPE, BADGE, btnPrimary, inputField, labelOverline,
} from '../design';

/* ─────────────────────────────────────────────────────────────────
   SMALL HELPERS
───────────────────────────────────────────────────────────────────*/

/** Simple label / value row used inside info boxes */
const Row: React.FC<{ label: string; value: React.ReactNode; accent?: string }> = ({
  label, value, accent = INK_80,
}) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '10px 0', borderBottom: `1px solid ${HAIRLINE}`, gap: 12,
  }}>
    <span style={{ fontSize: 13, color: INK_48, letterSpacing: '-0.12px', flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: accent, letterSpacing: '-0.224px', textAlign: 'right' }}>{value}</span>
  </div>
);

/** Days-remaining countdown from today to a target date string */
const daysUntil = (dateStr: string): number => {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
};

/** Humanise a document_type slug into a readable label */
const docTypeLabel = (t: string): string =>
  t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

/** File-size bytes → human-readable string */
const fmtBytes = (n: number): string => {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
};

/* ─────────────────────────────────────────────────────────────────
   STATUS-AWARE IEC CARD
───────────────────────────────────────────────────────────────────*/
const IecCard: React.FC<{
  study: Study;
  isOfficer: boolean;
  loading: boolean;
  onDecision: (e: React.FormEvent) => void;
  iecDecision: string; setIecDecision: (v: any) => void;
  decisionDate: string; setDecisionDate: (v: string) => void;
  validUntil: string; setValidUntil: (v: string) => void;
  remarks: string; setRemarks: (v: string) => void;
}> = ({
  study, isOfficer, loading, onDecision,
  iecDecision, setIecDecision,
  decisionDate, setDecisionDate,
  validUntil, setValidUntil,
  remarks, setRemarks,
}) => {
  const approvedIec = study.iec_submissions?.find(s => s.decision === 'APPROVED');
  const anyIec      = study.iec_submissions?.[0];
  const status      = study.status;

  // States where IEC is already done — show certificate
  const isCertified = ['IEC_APPROVED', 'ENROLLING', 'ONGOING', 'DATA_LOCK', 'CLOSED', 'TERMINATED'].includes(status);
  // States where form is actionable
  const isActionable = status === 'IEC_SUBMITTED' && isOfficer;

  return (
    <div style={{
      background: CANVAS, border: `1px solid ${isCertified ? 'rgba(52,199,89,0.30)' : HAIRLINE}`,
      borderRadius: R_LG, overflow: 'hidden',
    }}>
      {/* Card header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 24px', borderBottom: `1px solid ${HAIRLINE}`,
        background: isCertified ? 'rgba(52,199,89,0.04)' : PARCHMENT,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: INK }}>
          <FileCheck size={15} color={isCertified ? SUCCESS : PRIMARY} />
          Institutional Ethics Committee (IEC)
        </span>
        <span style={isCertified ? BADGE.green : anyIec ? BADGE.amber : BADGE.ink}>
          {isCertified ? 'ETHICS CLEARED' : anyIec?.decision || 'NOT SUBMITTED'}
        </span>
      </div>

      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── CONDITION 1: DRAFT — awaiting PI submission ── */}
        {status === 'DRAFT' && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            background: 'rgba(255,159,10,0.06)', border: `1px solid rgba(255,159,10,0.25)`,
            borderRadius: R_MD, padding: '14px 16px',
          }}>
            <AlertCircle size={16} color={WARNING} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: WARNING, margin: '0 0 3px' }}>
                Awaiting Protocol Submission
              </p>
              <p style={{ fontSize: 13, color: INK_48, margin: 0, lineHeight: 1.5 }}>
                Awaiting formal protocol submission from the Principal Investigator. The study must be submitted to the Ethics Secretariat before an IEC decision can be recorded.
              </p>
            </div>
          </div>
        )}

        {/* ── CONDITION 2: IEC_SUBMITTED — show decision form (officer only) ── */}
        {isActionable && (
          <form onSubmit={onDecision} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelOverline()}>IEC Decision Outcome</label>
              <select value={iecDecision} onChange={e => setIecDecision(e.target.value)} style={inputField()}>
                <option value="APPROVED">APPROVED — Full Unanimous Clearance</option>
                <option value="CONDITIONAL_APPROVAL">CONDITIONAL APPROVAL — Minor Revisions Required</option>
                <option value="MAJOR_REVISIONS_REQUIRED">MAJOR REVISIONS REQUIRED — Re-submission Needed</option>
                <option value="REJECTED">REJECTED — Protocol Re-submission Required</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelOverline()}>Decision Date</label>
                <input type="date" value={decisionDate} onChange={e => setDecisionDate(e.target.value)} style={inputField()} required />
              </div>
              <div>
                <label style={labelOverline()}>Approval Valid Until</label>
                <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} style={inputField()} required />
              </div>
            </div>
            <div>
              <label style={labelOverline()}>Committee Remarks / Reference Meeting Minutes</label>
              <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3}
                style={{ ...inputField(), resize: 'vertical' as const }} required />
            </div>
            <div>
              <label style={labelOverline()}>Attach IEC Clearance Letter (PDF) — Optional</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={e => setIecFile(e.target.files?.[0] ?? null)}
                style={{
                  width: '100%', boxSizing: 'border-box' as const,
                  background: PARCHMENT, border: `1px solid ${HAIRLINE}`,
                  borderRadius: R_MD, padding: '8px 12px',
                  fontSize: 13, color: INK_80, cursor: 'pointer',
                }}
              />
              {iecFile && (
                <p style={{ fontSize: 11, color: SUCCESS, margin: '4px 0 0' }}>
                  Ready to upload: {iecFile.name}
                </p>
              )}
            </div>
            <button type="submit" disabled={loading} style={btnPrimary(loading)}>
              <ClipboardCheck size={14} />
              Record Statutory IEC Decision
            </button>
          </form>
        )}

        {/* IEC submitted but not an officer — show lock */}
        {status === 'IEC_SUBMITTED' && !isOfficer && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'rgba(255,159,10,0.06)', border: `1px solid rgba(255,159,10,0.25)`,
            borderRadius: R_MD, padding: '14px 16px',
          }}>
            <Lock size={15} color={WARNING} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: INK_80, margin: 0 }}>
              Protocol submitted. Awaiting Compliance Officer to record the IEC committee decision.
            </p>
          </div>
        )}

        {/* ── CONDITION 3: IEC CERTIFIED — show clearance certificate ── */}
        {isCertified && approvedIec && (
          <>
            {/* Clearance certificate box */}
            <div style={{
              background: 'rgba(52,199,89,0.05)', border: `1px solid rgba(52,199,89,0.22)`,
              borderRadius: R_MD, padding: '16px 20px',
              display: 'flex', alignItems: 'flex-start', gap: 14,
            }}>
              <Award size={22} color={SUCCESS} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: SUCCESS, margin: '0 0 4px', letterSpacing: '-0.224px' }}>
                  Verified Ethics Clearance Certificate
                </p>
                <p style={{ fontSize: 12, color: INK_48, margin: 0 }}>
                  APPROVED (Full Clearance) — ICMR 2017 Guidelines Compliant
                </p>
              </div>
            </div>

            {/* Clearance details */}
            <div style={{ background: PARCHMENT, borderRadius: R_MD, border: `1px solid ${HAIRLINE}`, padding: '4px 16px' }}>
              <Row label="Decision Date" value={approvedIec.decision_date || '—'} />
              <Row
                label="Valid Until"
                value={
                  <span>
                    {approvedIec.valid_until}
                    {approvedIec.valid_until && (
                      <span style={{
                        marginLeft: 8, fontSize: 11, fontWeight: 600,
                        color: daysUntil(approvedIec.valid_until) < 30 ? DANGER : SUCCESS,
                      }}>
                        ({daysUntil(approvedIec.valid_until)} days remaining)
                      </span>
                    )}
                  </span>
                }
                accent={SUCCESS}
              />
              <Row label="Reference Meeting Minutes" value={approvedIec.remarks || '—'} />
              <Row label="Statutory Status" value="Ethics Cleared" accent={SUCCESS} />
            </div>

            {/* Download approval letter */}
            <button
              onClick={() => {
                const content = JSON.stringify({
                  title: 'IEC Approval Letter',
                  study: study.short_code,
                  decision: 'APPROVED',
                  decision_date: approvedIec.decision_date,
                  valid_until: approvedIec.valid_until,
                  remarks: approvedIec.remarks,
                  generated: new Date().toISOString(),
                }, null, 2);
                const blob = new Blob([content], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `IEC_Approval_${study.short_code}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'rgba(52,199,89,0.08)', color: SUCCESS,
                border: `1px solid rgba(52,199,89,0.30)`,
                borderRadius: R_PILL, padding: '9px 18px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: FONT_STACK, transition: 'transform 0.1s',
                alignSelf: 'flex-start' as const,
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Download size={13} />
              Download Formal Approval Letter
            </button>
          </>
        )}

        {/* Certified but no approved IEC record found (edge case) */}
        {isCertified && !approvedIec && (
          <div style={{ background: PARCHMENT, borderRadius: R_MD, border: `1px solid ${HAIRLINE}`, padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: INK_48, margin: 0 }}>
              IEC clearance on file. No detailed submission record available.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   STATUS-AWARE CTRI CARD
───────────────────────────────────────────────────────────────────*/
const CtriCard: React.FC<{
  study: Study;
  isOfficer: boolean;
  loading: boolean;
  onLink: (e: React.FormEvent) => void;
  ctriId: string; setCtriId: (v: string) => void;
  regDate: string; setRegDate: (v: string) => void;
}> = ({ study, isOfficer, loading, onLink, ctriId, setCtriId, regDate, setRegDate }) => {
  const status = study.status;
  const isLinked = !!study.ctri_registration?.ctri_id;

  // States where CTRI is already linked — show verified card
  const isVerified = isLinked && ['ENROLLING', 'ONGOING', 'DATA_LOCK', 'CLOSED', 'TERMINATED'].includes(status);
  // State where form is actionable
  const isActionable = status === 'IEC_APPROVED' && isOfficer && !isLinked;
  // Locked states
  const isLocked = ['DRAFT', 'IEC_SUBMITTED'].includes(status);

  return (
    <div style={{
      background: CANVAS, border: `1px solid ${isVerified ? 'rgba(0,102,204,0.28)' : HAIRLINE}`,
      borderRadius: R_LG, overflow: 'hidden',
    }}>
      {/* Card header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 24px', borderBottom: `1px solid ${HAIRLINE}`,
        background: isVerified ? 'rgba(0,102,204,0.04)' : PARCHMENT,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: INK }}>
          <ShieldAlert size={15} color={isVerified ? PRIMARY : INK_48} />
          CTRI Public Registry
        </span>
        <span style={isVerified ? BADGE.blue : isLinked ? BADGE.blue : BADGE.ink}>
          {isVerified ? 'PROSPECTIVE — VERIFIED' : isLinked ? 'LINKED' : 'UNLINKED'}
        </span>
      </div>

      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── CONDITION 1: Locked (DRAFT / IEC_SUBMITTED) ── */}
        {isLocked && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            background: PARCHMENT, border: `1px solid ${HAIRLINE}`,
            borderRadius: R_MD, padding: '14px 16px',
          }}>
            <Lock size={15} color={INK_48} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: INK_48, margin: 0, lineHeight: 1.5 }}>
              CTRI linkage is locked until Ethics Committee (IEC) clearance is granted. Complete the IEC approval process first.
            </p>
          </div>
        )}

        {/* ── CONDITION 2: IEC_APPROVED — show link form (officer only) ── */}
        {isActionable && (
          <form onSubmit={onLink} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelOverline()}>CTRI Registration Identifier</label>
              <input
                type="text"
                value={ctriId}
                onChange={e => setCtriId(e.target.value)}
                placeholder="e.g. CTRI/2026/09/012345"
                style={inputField()}
              />
            </div>
            <div>
              <label style={labelOverline()}>Registration Date</label>
              <input type="date" value={regDate} onChange={e => setRegDate(e.target.value)} style={inputField()} required />
            </div>
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              background: 'rgba(0,102,204,0.05)', border: `1px solid rgba(0,102,204,0.20)`,
              borderRadius: R_MD, padding: '12px 14px',
            }}>
              <AlertCircle size={14} color={PRIMARY} style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: INK_80, margin: 0, lineHeight: 1.5 }}>
                <strong>6-Month Statutory Rule:</strong> Next mandatory CTRI progress filing will be calculated automatically (+6 months from registration date). Linking transitions the study to <strong>ENROLLING</strong> state.
              </p>
            </div>
            <button type="submit" disabled={loading} style={btnPrimary(loading)}>
              <CheckCircle2 size={14} />
              Verify Prospective Timing &amp; Link
            </button>
          </form>
        )}

        {/* IEC approved but not officer */}
        {status === 'IEC_APPROVED' && !isOfficer && !isLinked && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'rgba(0,102,204,0.05)', border: `1px solid rgba(0,102,204,0.20)`,
            borderRadius: R_MD, padding: '14px 16px',
          }}>
            <CheckCircle2 size={15} color={PRIMARY} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: INK_80, margin: 0 }}>
              Ethics clearance granted. Awaiting Compliance Officer to link the CTRI public registry identifier.
            </p>
          </div>
        )}

        {/* ── CONDITION 3: CTRI Linked & Verified ── */}
        {isVerified && study.ctri_registration && (
          <>
            {/* Verified CTRI badge */}
            <div style={{
              background: 'rgba(0,102,204,0.05)', border: `1px solid rgba(0,102,204,0.22)`,
              borderRadius: R_MD, padding: '16px 20px',
              display: 'flex', alignItems: 'flex-start', gap: 14,
            }}>
              <CheckCircle2 size={22} color={PRIMARY} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: PRIMARY, margin: '0 0 2px', letterSpacing: '-0.224px' }}>
                  Verified CTRI Public Record
                </p>
                <p style={{ fontSize: 12, color: INK_48, margin: 0 }}>
                  Prospective Registration Verified — GCP Compliant
                </p>
              </div>
            </div>

            {/* Details */}
            <div style={{ background: PARCHMENT, borderRadius: R_MD, border: `1px solid ${HAIRLINE}`, padding: '4px 16px' }}>
              <Row
                label="CTRI Registration ID"
                value={
                  <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: PRIMARY }}>
                    {study.ctri_registration.ctri_id}
                  </span>
                }
              />
              <Row label="Registration Date" value={study.ctri_registration.registration_date || '—'} />
              <Row
                label="Next Mandatory 6-Month Filing"
                value={
                  <span>
                    {study.ctri_registration.next_mandatory_update_due}
                    {study.ctri_registration.next_mandatory_update_due && (
                      <span style={{
                        marginLeft: 8, fontSize: 11, fontWeight: 600,
                        color: daysUntil(study.ctri_registration.next_mandatory_update_due) < 30
                          ? DANGER : WARNING,
                      }}>
                        ({daysUntil(study.ctri_registration.next_mandatory_update_due)} days)
                      </span>
                    )}
                  </span>
                }
                accent={PRIMARY}
              />
              <Row label="Enrollment Status" value="Unlocked — Active" accent={SUCCESS} />
            </div>

            {/* View CTRI public record */}
            <a
              href={`https://ctri.nic.in/Clinicaltrials/login.php`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'rgba(0,102,204,0.07)', color: PRIMARY,
                border: `1px solid rgba(0,102,204,0.22)`,
                borderRadius: R_PILL, padding: '9px 18px',
                fontSize: 13, fontWeight: 600,
                textDecoration: 'none', alignSelf: 'flex-start' as const,
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,102,204,0.13)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,102,204,0.07)')}
            >
              <ExternalLink size={13} />
              View CTRI Public Disclosure Record
            </a>
          </>
        )}

      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────*/
export const EthicsCtriPage: React.FC = () => {
  const { user } = useAuth();
  const [studies,      setStudies]      = useState<Study[]>([]);
  const [selectedId,   setSelectedId]   = useState<string>('');
  const [documents,    setDocuments]    = useState<any[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // IEC FORM STATE
  const [iecDecision,  setIecDecision]  = useState<string>('APPROVED');
  const [decisionDate, setDecisionDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil,   setValidUntil]   = useState('2027-09-15');
  const [remarks,      setRemarks]      = useState('Ethics clearance approved unanimously under ICMR 2017 Guidelines.');
  const [iecFile,      setIecFile]      = useState<File | null>(null);

  // CTRI FORM STATE
  const [ctriId,  setCtriId]  = useState('');
  const [regDate, setRegDate] = useState(new Date().toISOString().split('T')[0]);

  const isOfficer = user?.role === 'ROLE_COMPLIANCE_OFFICER' || user?.role === 'ROLE_LEADERSHIP';

  /* ── Data loading ── */
  const loadStudies = useCallback(async () => {
    try {
      const res = await api.get('/study/list');
      setStudies(res.data);
      if (res.data.length > 0 && !selectedId) {
        setSelectedId(res.data[0].id);
      }
    } catch (err) { console.error(err); }
  }, [selectedId]);

  const loadDocuments = useCallback(async (studyId: string) => {
    try {
      const res = await api.get(`/documents/study/${studyId}`);
      setDocuments(Array.isArray(res.data) ? res.data : []);
    } catch { setDocuments([]); }
  }, []);

  useEffect(() => { loadStudies(); }, []);

  useEffect(() => {
    if (selectedId) loadDocuments(selectedId);
  }, [selectedId, loadDocuments]);

  const selectedStudy = studies.find(s => s.id === selectedId) ?? studies[0] ?? null;

  /* ── IEC decision handler ── */
  const handleIecDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setLoading(true);
    try {
      await api.patch(`/study/${selectedId}/iec-decide`, {
        decision: iecDecision,
        decision_date: decisionDate,
        valid_until: validUntil,
        remarks,
      });
      setNotification(`Statutory Ethics Decision ('${iecDecision}') recorded into the immutable audit log.`);
      // Upload IEC clearance letter if attached
      if (iecFile && selectedId) {
        try {
          const fd = new FormData();
          fd.append('file', iecFile);
          fd.append('study_id', selectedId);
          fd.append('document_type', 'IEC_APPROVAL_LETTER');
          fd.append('uploaded_by', user?.email ?? 'compliance@aiia.gov.in');
          await api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        } catch { /* non-fatal */ }
        setIecFile(null);
      }
      await loadStudies();
    } catch (err: any) {
      setNotification(`Error: ${err.response?.data?.message || err.message}`);
    } finally { setLoading(false); }
  };

  /* ── CTRI link handler ── */
  const handleCtriLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setLoading(true);
    try {
      const formattedCtri = ctriId.trim() || `CTRI/2026/09/${Math.floor(100000 + Math.random() * 899999)}`;
      await api.patch(`/study/${selectedId}/ctri-link`, {
        ctri_id: formattedCtri,
        registration_date: regDate,
      });
      setNotification(`CTRI ID '${formattedCtri}' linked. Study status transitioned to ENROLLING.`);
      setCtriId('');
      await loadStudies();
    } catch (err: any) {
      setNotification(`Error: ${err.response?.data?.message || err.message}`);
    } finally { setLoading(false); }
  };

  if (!selectedStudy) return null;

  const statusBadge = (s: string) => {
    if (['ENROLLING', 'CLOSED'].includes(s)) return BADGE.green;
    if (['IEC_APPROVED', 'DATA_LOCK'].includes(s)) return BADGE.blue;
    if (s === 'TERMINATED') return BADGE.red;
    return BADGE.amber;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontFamily: FONT_STACK }}>

      {/* ══════════════════════════════════════════════════════════════
          PAGE HEADER
          ══════════════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 600, color: INK, letterSpacing: '-0.374px', lineHeight: 1.47, margin: '0 0 6px' }}>
            Ethics Secretariat &amp; CTRI Compliance Console
          </h1>
          <p style={{ ...TYPE.caption, color: INK_48, margin: 0 }}>
            Statutory clearance management under ICMR 2017 Guidelines and mandatory 6-month CTRI public registry tracking.
          </p>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: isOfficer ? 'rgba(0,102,204,0.06)' : PARCHMENT,
          border: `1px solid ${isOfficer ? 'rgba(0,102,204,0.25)' : HAIRLINE}`,
          padding: '8px 14px', borderRadius: R_PILL,
        }}>
          <Scale size={14} color={isOfficer ? PRIMARY : INK_48} />
          <span style={{ fontSize: 12, fontWeight: 600, color: isOfficer ? PRIMARY : INK_80 }}>
            {user?.roleDisplayName || 'Investigator'}
          </span>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div style={{
          padding: '12px 18px', background: '#eef6ff', border: `1px solid ${PRIMARY}`,
          borderRadius: R_MD, fontSize: 13, fontWeight: 600, color: PRIMARY,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', color: INK_48, cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>
      )}

      {/* GCP Separation of Duties guard — investigator only */}
      {!isOfficer && (
        <div style={{
          background: 'rgba(255,159,10,0.06)', border: `1px solid rgba(255,159,10,0.28)`,
          borderRadius: R_MD, padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <Lock size={16} color={WARNING} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: INK_80, margin: 0, lineHeight: 1.5 }}>
            <strong>GCP Separation of Duties Policy (NDCT 2019):</strong> You are logged in as an <strong>Investigator</strong>. Ethics approvals and CTRI registry linking require the <strong>Compliance Officer</strong> persona.
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TRIAL SELECTOR BAR
          ══════════════════════════════════════════════════════════════ */}
      <div style={{
        background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG,
        padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: INK_48, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          Target Protocol
        </span>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            style={{ ...inputField(), appearance: 'none' as any, paddingRight: 36, fontWeight: 600 }}
          >
            {studies.map(s => (
              <option key={s.id} value={s.id}>
                [{s.short_code}] {s.title} — {s.status}
              </option>
            ))}
          </select>
          <ChevronDown size={14} color={INK_48} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
        <span style={statusBadge(selectedStudy.status)}>
          {selectedStudy.status}
        </span>
        <span style={BADGE.ink}>{selectedStudy.phase}</span>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 — PROTOCOL SUBMISSION DOSSIER
          ══════════════════════════════════════════════════════════════ */}
      <div style={{
        background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, overflow: 'hidden',
      }}>
        {/* Dossier header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '18px 24px', borderBottom: `1px solid ${HAIRLINE}`, background: PARCHMENT,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: R_SM,
            background: 'rgba(191,90,242,0.08)', border: '1px solid rgba(191,90,242,0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <FileText size={15} color={PURPLE} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: INK, margin: 0, letterSpacing: '-0.224px' }}>
              Protocol Submission Dossier
            </p>
            <p style={{ fontSize: 11, color: INK_48, margin: '1px 0 0' }}>
              Full trial details for ethics review — {selectedStudy.short_code}
            </p>
          </div>
          <span style={{ ...BADGE.purple, marginLeft: 'auto' }}>ICMR 2017 Dossier</span>
        </div>

        <div style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Top meta grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { label: 'Scientific Title',   value: selectedStudy.title,       span: true },
              { label: 'Short Code',         value: selectedStudy.short_code },
              { label: 'Phase',              value: selectedStudy.phase },
              { label: 'Study Design',       value: selectedStudy.study_type },
              { label: 'Target Sample Size', value: `N = ${selectedStudy.target_sample_size}` },
              { label: 'Planned End Date',   value: selectedStudy.planned_end_date || '—' },
            ].map(item => (
              <div
                key={item.label}
                style={{
                  background: PARCHMENT, border: `1px solid ${HAIRLINE}`,
                  borderRadius: R_MD, padding: '12px 16px',
                  gridColumn: (item as any).span ? '1 / -1' : undefined,
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
                  {item.label}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: INK, letterSpacing: '-0.12px' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Study Arms */}
          {selectedStudy.study_arms && selectedStudy.study_arms.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FlaskConical size={11} /> Treatment Arms ({selectedStudy.study_arms.length})
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {selectedStudy.study_arms.map((arm, i) => (
                  <div key={arm.id} style={{
                    background: i === 0 ? 'rgba(0,102,204,0.06)' : PARCHMENT,
                    border: `1px solid ${i === 0 ? 'rgba(0,102,204,0.22)' : HAIRLINE}`,
                    borderRadius: R_MD, padding: '10px 16px', minWidth: 180,
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: i === 0 ? PRIMARY : INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 3 }}>
                      {arm.arm_code}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: INK, display: 'block' }}>
                      {arm.label}
                    </span>
                    {arm.arm_type && (
                      <span style={{ fontSize: 11, color: INK_48, display: 'block', marginTop: 2 }}>
                        {arm.arm_type.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document chips */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={11} /> Uploaded Protocol Documents ({documents.length})
            </p>
            {documents.length === 0 ? (
              <p style={{ fontSize: 13, color: INK_48, margin: 0, fontStyle: 'italic' }}>
                No documents uploaded yet. Use the Document Vault to upload protocol files and consent forms.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {documents.map(doc => (
                  <div key={doc.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: PARCHMENT, border: `1px solid ${HAIRLINE}`,
                    borderRadius: R_MD, padding: '8px 14px', cursor: 'default',
                  }}>
                    <FileText size={13} color={PRIMARY} />
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: INK, display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                        {doc.file_name}
                      </span>
                      <span style={{ fontSize: 10, color: INK_48 }}>
                        {docTypeLabel(doc.document_type)} · {fmtBytes(doc.file_size_bytes)}
                      </span>
                    </div>
                    <span style={{
                      fontFamily: FONT_MONO, fontSize: 9, color: SUCCESS,
                      background: 'rgba(52,199,89,0.08)', border: '1px solid rgba(52,199,89,0.22)',
                      borderRadius: 4, padding: '2px 6px', flexShrink: 0,
                    }}>
                      SHA-256
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 — IEC & CTRI STATE-AWARE CARDS
          ══════════════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <IecCard
          study={selectedStudy}
          isOfficer={isOfficer}
          loading={loading}
          onDecision={handleIecDecision}
          iecDecision={iecDecision} setIecDecision={setIecDecision}
          decisionDate={decisionDate} setDecisionDate={setDecisionDate}
          validUntil={validUntil} setValidUntil={setValidUntil}
          remarks={remarks} setRemarks={setRemarks}
        />
        <CtriCard
          study={selectedStudy}
          isOfficer={isOfficer}
          loading={loading}
          onLink={handleCtriLink}
          ctriId={ctriId} setCtriId={setCtriId}
          regDate={regDate} setRegDate={setRegDate}
        />
      </div>

    </div>
  );
};
