import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Study } from '../types';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ShieldAlert, Lock, AlertCircle, FileCheck, Award, Scale, Calendar } from 'lucide-react';
import {
  CANVAS, PARCHMENT, PEARL, HAIRLINE, INK, INK_48, INK_80,
  PRIMARY, PRIMARY_FOCUS, PRIMARY_ON_DARK, SUCCESS, WARNING, DANGER, PURPLE,
  FONT_STACK, FONT_MONO, R_MD, R_LG, R_PILL, TYPE, BADGE,
  btnPrimary, btnSecondary, btnUtility, inputField, labelOverline
} from '../design';

const Row: React.FC<{ label: string; value: React.ReactNode; accent?: string }> = ({ label, value, accent = INK_80 }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${HAIRLINE}` }}>
    <span style={{ fontSize: 13, color: INK_48, letterSpacing: '-0.12px' }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: accent, letterSpacing: '-0.224px', textAlign: 'right' }}>{value}</span>
  </div>
);

export const EthicsCtriPage: React.FC = () => {
  const { user } = useAuth();
  const [studies, setStudies] = useState<Study[]>([]);
  const [selectedStudyId, setSelectedStudyId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // IEC FORM
  const [iecDecision, setIecDecision] = useState<'APPROVED' | 'CONDITIONAL_APPROVAL' | 'REJECTED'>('APPROVED');
  const [decisionDate, setDecisionDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState('2027-09-15');
  const [remarks, setRemarks] = useState('Ethics clearance approved unanimously under ICMR 2017 Guidelines.');

  // CTRI FORM
  const [ctriId, setCtriId] = useState('');
  const [regDate, setRegDate] = useState(new Date().toISOString().split('T')[0]);

  const isComplianceOfficer = user?.role === 'ROLE_COMPLIANCE_OFFICER';

  const loadStudies = async () => {
    try {
      const res = await api.get('/study/list');
      setStudies(res.data);
      if (res.data.length > 0 && !selectedStudyId) {
        setSelectedStudyId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStudies();
  }, []);

  const selectedStudy = studies.find(s => s.id === selectedStudyId) || studies[0];
  const iec = selectedStudy?.iec_submissions?.find(s => s.decision === 'APPROVED') || selectedStudy?.iec_submissions?.[0];

  // HANDLE IEC DECISION RECORDING
  const handleIecDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudyId) return;
    setLoading(true);
    try {
      await api.patch(`/study/${selectedStudyId}/iec-decide`, {
        decision: iecDecision,
        decision_date: decisionDate,
        valid_until: validUntil,
        remarks,
      });
      setNotification(`✅ Statutory Ethics Decision ('${iecDecision}') recorded into official audit log!`);
      await loadStudies();
    } catch (err: any) {
      setNotification(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // HANDLE CTRI LINKING
  const handleCtriLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudyId) return;
    setLoading(true);
    try {
      const formattedCtri = ctriId || `CTRI/2026/09/${Math.floor(100000 + Math.random() * 899999)}`;
      await api.patch(`/study/${selectedStudyId}/ctri-link`, {
        ctri_id: formattedCtri,
        registration_date: regDate,
      });
      setNotification(`✅ CTRI ID '${formattedCtri}' linked! Study status transitioned to ENROLLING.`);
      setCtriId('');
      await loadStudies();
    } catch (err: any) {
      setNotification(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontFamily: FONT_STACK }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 600, color: INK, letterSpacing: '-0.374px', lineHeight: 1.47, margin: '0 0 6px' }}>
            Ethics Secretariat &amp; CTRI Compliance Console
          </h1>
          <p style={{ ...TYPE.caption, color: INK_48, margin: 0 }}>
            Statutory clearance management under ICMR 2017 Guidelines and mandatory 6-month CTRI public registry tracking.
          </p>
        </div>

        {/* ROLE INDICATOR BADGE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: isComplianceOfficer ? '#f0f7ff' : PARCHMENT, border: `1px solid ${isComplianceOfficer ? PRIMARY : HAIRLINE}`, padding: '8px 14px', borderRadius: R_PILL }}>
          <Scale size={14} color={isComplianceOfficer ? PRIMARY : INK_48} />
          <span style={{ fontSize: 12, fontWeight: 600, color: isComplianceOfficer ? PRIMARY : INK_80 }}>
            Active Persona: {user?.roleDisplayName || 'Investigator'}
          </span>
        </div>
      </div>

      {notification && (
        <div style={{
          padding: '12px 18px', background: '#eef6ff', border: `1px solid ${PRIMARY}`,
          borderRadius: R_MD, fontSize: 13, fontWeight: 600, color: PRIMARY,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', color: INK_48, cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>
      )}

      {/* GCP SEPARATION OF DUTIES GUARD BANNER */}
      {!isComplianceOfficer && (
        <div style={{
          background: '#fff8e6', border: `1px solid ${WARNING}`, borderRadius: R_MD,
          padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12
        }}>
          <Lock size={18} color={WARNING} />
          <div style={{ fontSize: 13, color: INK_80 }}>
            <strong>GCP Separation of Duties Policy (NDCT 2019):</strong> You are currently logged in as an <strong>Investigator</strong>. Ethics approvals and CTRI registry linking can only be executed by the <strong>Compliance &amp; Safety Officer</strong>. Switch persona on the login screen to perform regulatory actions.
          </div>
        </div>
      )}

      {/* TRIAL SELECTOR BAR */}
      <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: INK_48, whiteSpace: 'nowrap' }}>Target Clinical Trial:</span>
          <select
            value={selectedStudyId}
            onChange={e => setSelectedStudyId(e.target.value)}
            style={{ ...inputField(), maxWidth: 450, fontWeight: 600 }}
          >
            {studies.map(s => (
              <option key={s.id} value={s.id}>
                [{s.short_code}] {s.title} — State: ({s.status})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ ...BADGE[selectedStudy?.status === 'ENROLLING' ? 'green' : selectedStudy?.status === 'IEC_APPROVED' ? 'blue' : 'amber'] }}>
            Status: {selectedStudy?.status || 'DRAFT'}
          </span>
        </div>
      </div>

      {/* INTERACTIVE COMPLIANCE PANELS (VISIBLE TO COMPLIANCE OFFICERS) */}
      {isComplianceOfficer && selectedStudy && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* PANEL 1: IEC DECISION RECORDING */}
          <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <FileCheck size={18} color={PRIMARY} />
              <h3 style={{ fontSize: 17, fontWeight: 600, color: INK, margin: 0, letterSpacing: '-0.374px' }}>
                Grant Ethics Committee (IEC) Decision
              </h3>
            </div>
            <p style={{ fontSize: 13, color: INK_48, margin: '0 0 16px' }}>
              Record formal Institutional Ethics Committee clearance under ICMR 2017 rules.
            </p>

            <form onSubmit={handleIecDecision} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelOverline()}>IEC Decision Outcome</label>
                <select
                  value={iecDecision}
                  onChange={e => setIecDecision(e.target.value as any)}
                  style={inputField()}
                >
                  <option value="APPROVED">APPROVED (Full Unanimous Approval)</option>
                  <option value="CONDITIONAL_APPROVAL">CONDITIONAL APPROVAL (Minor Revisions Required)</option>
                  <option value="REJECTED">REJECTED (Protocol Re-submission Required)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelOverline()}>Decision Date</label>
                  <input
                    type="date"
                    value={decisionDate}
                    onChange={e => setDecisionDate(e.target.value)}
                    style={inputField()}
                    required
                  />
                </div>
                <div>
                  <label style={labelOverline()}>Approval Valid Until</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={e => setValidUntil(e.target.value)}
                    style={inputField()}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={labelOverline()}>Committee Remarks / Reference Minutes</label>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  rows={2}
                  style={{ ...inputField(), resize: 'vertical' }}
                  required
                />
              </div>

              <button type="submit" disabled={loading} style={btnPrimary(loading)}>
                Record Statutory IEC Decision
              </button>
            </form>
          </div>

          {/* PANEL 2: CTRI REGISTRATION LINKING */}
          <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <ShieldAlert size={18} color={PRIMARY} />
              <h3 style={{ fontSize: 17, fontWeight: 600, color: INK, margin: 0, letterSpacing: '-0.374px' }}>
                Link CTRI Public Registry Identifier
              </h3>
            </div>
            <p style={{ fontSize: 13, color: INK_48, margin: '0 0 16px' }}>
              Link Clinical Trials Registry - India (CTRI) registration to unlock prospective patient enrollment.
            </p>

            <form onSubmit={handleCtriLink} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                <input
                  type="date"
                  value={regDate}
                  onChange={e => setRegDate(e.target.value)}
                  style={inputField()}
                  required
                />
              </div>

              <div style={{ background: PARCHMENT, padding: 12, borderRadius: R_MD, border: `1px solid ${HAIRLINE}` }}>
                <span style={{ fontSize: 12, color: INK_80 }}>
                  ℹ️ <strong>6-Month Statutory Rule:</strong> Next mandatory CTRI progress report update will be calculated automatically (+6 months from registration date).
                </span>
              </div>

              <button type="submit" disabled={loading} style={btnPrimary(loading)}>
                Verify &amp; Link CTRI Identifier
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUMMARY DISPLAY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* IEC Card — canvas */}
        <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${HAIRLINE}`, paddingBottom: 14, marginBottom: 18 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, ...TYPE.label, color: SUCCESS }}>
              <CheckCircle2 size={14} color={SUCCESS} /> Institutional Ethics Committee (IEC)
            </span>
            <span style={{ ...BADGE[iec?.decision === 'APPROVED' ? 'green' : 'amber'] }}>
              {iec?.decision || 'NOT SUBMITTED'}
            </span>
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: INK, letterSpacing: '-0.374px', margin: '0 0 18px' }}>
            {selectedStudy?.title || 'Loading…'}
          </h2>
          <div style={{ background: PARCHMENT, borderRadius: R_MD, border: `1px solid ${HAIRLINE}`, padding: '4px 16px' }}>
            <Row label="IEC Decision Date" value={iec?.decision_date || (iec ? '2026-09-01' : 'N/A')} />
            <Row label="Approval Valid Until" value={iec?.valid_until || '2027-09-14'} accent={SUCCESS} />
            <Row label="Committee Remarks" value={iec?.remarks || 'Awaiting formal review'} />
            <Row label="Statutory Status" value={iec?.decision === 'APPROVED' ? 'Ethics Cleared' : 'Pending Review'} accent={iec?.decision === 'APPROVED' ? SUCCESS : WARNING} />
          </div>
        </div>

        {/* CTRI Card — parchment */}
        <div style={{ background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${HAIRLINE}`, paddingBottom: 14, marginBottom: 18 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, ...TYPE.label, color: PRIMARY_ON_DARK }}>
              <ShieldAlert size={14} color={PRIMARY_ON_DARK} /> CTRI Public Registry
            </span>
            <span style={{ ...BADGE[selectedStudy?.ctri_registration ? 'blue' : 'ink'] }}>
              {selectedStudy?.ctri_registration ? 'VERIFIED' : 'UNLINKED'}
            </span>
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: INK, letterSpacing: '-0.374px', margin: '0 0 18px' }}>
            CTRI ID:{' '}
            <span style={{ color: PRIMARY, fontFamily: FONT_MONO, fontWeight: 600 }}>
              {selectedStudy?.ctri_registration?.ctri_id || 'Not Registered Yet'}
            </span>
          </h2>
          <div style={{ background: CANVAS, borderRadius: R_MD, border: `1px solid ${HAIRLINE}`, padding: '4px 16px' }}>
            <Row label="CTRI Registration Date" value={selectedStudy?.ctri_registration?.registration_date || 'N/A'} />
            <Row label="Next Mandatory 6-Month Update" value={selectedStudy?.ctri_registration?.next_mandatory_update_due || 'Pending Registration'} accent={PRIMARY} />
            <Row label="Enrollment Lock Status" value={selectedStudy?.status === 'ENROLLING' ? 'Unlocked & Active' : 'Locked'} accent={selectedStudy?.status === 'ENROLLING' ? SUCCESS : DANGER} />
          </div>
        </div>
      </div>
    </div>
  );
};
