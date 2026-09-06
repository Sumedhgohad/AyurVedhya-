import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Study, SaeClock } from '../types';
import { api } from '../api/client';
import {
  CheckCircle2, Download, AlertTriangle, ShieldAlert,
  FileCheck, ArrowRight, FlaskConical, ClipboardList,
  ActivitySquare, Pill,
} from 'lucide-react';
import {
  CANVAS, PARCHMENT, HAIRLINE, TILE_1,
  INK, INK_48, INK_80, PRIMARY, PRIMARY_ON_DARK,
  SUCCESS, WARNING, DANGER, PURPLE,
  R_MD, R_LG, R_PILL, R_SM,
  TYPE, BADGE, FONT_MONO, FONT_STACK,
} from '../design';

/* ─────────────────────────────────────────────────────────────────
   PROPS
───────────────────────────────────────────────────────────────────*/
interface Props {
  studies: Study[];
  saeClocks: SaeClock[];
  allAes: any[];        // all adverse events for the active study
  deviations: any[];    // all protocol deviations for the active study
  refreshData: () => void;
}

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────*/
const daysUntil = (d: string) =>
  Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);

/** Section heading shared across all panels */
const SectionHead: React.FC<{
  icon: React.ReactNode;
  title: string;
  sub: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ icon, title, sub, badge, action }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 24px', borderBottom: `1px solid ${HAIRLINE}`,
    background: PARCHMENT, flexWrap: 'wrap', gap: 10,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 32, height: 32, borderRadius: R_SM,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: 'rgba(0,102,204,0.08)', border: '1px solid rgba(0,102,204,0.18)',
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: INK, margin: 0, letterSpacing: '-0.224px' }}>{title}</p>
        <p style={{ fontSize: 11, color: INK_48, margin: '1px 0 0' }}>{sub}</p>
      </div>
      {badge}
    </div>
    {action}
  </div>
);

/** Compensation status badge */
const compBadge = (s: string): React.CSSProperties => {
  if (s === 'COMPENSATION_ELIGIBLE') return BADGE.red;
  if (s === 'UNDER_REVIEW') return BADGE.amber;
  return BADGE.ink;
};

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────*/
export const ComplianceDashboard: React.FC<Props> = ({
  studies, saeClocks, allAes, deviations, refreshData,
}) => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const study = studies[0] ?? null;
  const approvedIec = study?.iec_submissions?.find(s => s.decision === 'APPROVED');

  /* ── KPI derivations ── */
  const iecBacklog = studies.filter(s => s.status === 'IEC_SUBMITTED').length;
  const iecExpiring = studies.filter(s => {
    const iec = s.iec_submissions?.find(sub => sub.decision === 'APPROVED');
    return iec?.valid_until && daysUntil(iec.valid_until) < 60;
  }).length;

  const ctriDueSoon = studies.filter(s => {
    const d = s.ctri_registration?.next_mandatory_update_due;
    return d && daysUntil(d) < 30;
  }).length;
  const ctriCloseout = studies.filter(s =>
    s.status === 'CLOSED' && (s as any).ctri_completion_deadline
  ).length;

  const majorDeviations = deviations.filter(d => d.severity === 'MAJOR').length;
  const minorDeviations = deviations.filter(d => d.severity === 'MINOR').length;
  const openCapa = deviations.filter(d => !d.corrective_action).length;

  /* ── Causality distribution across all AEs ── */
  const causality: Record<string, number> = {};
  allAes.forEach(ae => {
    const k = ae.causality ?? 'UNASSESSABLE';
    causality[k] = (causality[k] ?? 0) + 1;
  });

  const downloadNpvcc = async (aeId: string) => {
    setDownloading(aeId);
    try {
      const res = await api.get(`/safety/export/npvcc/${aeId}`);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `NPvCC_${aeId}.json`; a.click();
      URL.revokeObjectURL(url);
    } catch { alert('Download failed.'); }
    finally { setDownloading(null); }
  };

  const markReported = async (id: string) => {
    try {
      await api.patch(`/safety/sae/${id}/mark-reported`);
      refreshData();
    } catch { alert('Failed to close clock. Try again.'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: FONT_STACK }}>

      {/* ══════════════════════════════════════════════════════════════
          4-CARD STATUTORY KPI ROW
          ══════════════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>

        {/* KPI 1 — IEC Dossier Backlog */}
        <div style={{
          background: CANVAS,
          border: `1px solid ${iecBacklog > 0 ? 'rgba(255,159,10,0.35)' : HAIRLINE}`,
          borderRadius: R_LG, padding: 22,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ ...TYPE.label, color: INK_48 }}>IEC Dossier Backlog</span>
            <FileCheck size={14} color={iecBacklog > 0 ? WARNING : INK_48} />
          </div>
          <div style={{ fontSize: 34, fontWeight: 600, color: iecBacklog > 0 ? WARNING : INK, letterSpacing: '-0.374px', lineHeight: 1.1, marginBottom: 6 }}>
            {iecBacklog}
          </div>
          <p style={{ ...TYPE.caption, color: INK_80, margin: 0 }}>
            Awaiting committee review
          </p>
          {iecExpiring > 0 && (
            <div style={{
              marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.25)',
              borderRadius: R_PILL, padding: '3px 9px',
              fontSize: 10, fontWeight: 600, color: DANGER,
            }}>
              <AlertTriangle size={9} /> {iecExpiring} expiring &lt;60d
            </div>
          )}
        </div>

        {/* KPI 2 — 24-Hour SAE Adherence */}
        <div style={{
          background: CANVAS,
          border: `1px solid ${saeClocks.length > 0 ? 'rgba(255,69,58,0.35)' : HAIRLINE}`,
          borderRadius: R_LG, padding: 22,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ ...TYPE.label, color: INK_48 }}>SAE Statutory Clocks</span>
            <ShieldAlert size={14} color={saeClocks.length > 0 ? DANGER : SUCCESS} />
          </div>
          <div style={{ fontSize: 34, fontWeight: 600, color: saeClocks.length > 0 ? DANGER : SUCCESS, letterSpacing: '-0.374px', lineHeight: 1.1, marginBottom: 6 }}>
            {saeClocks.length > 0 ? `${saeClocks.length} Active` : 'Clear'}
          </div>
          <p style={{ ...TYPE.caption, color: INK_80, margin: 0 }}>
            NDCT Rules 2019 deadline
          </p>
          {allAes.filter(a => a.is_serious).length > 0 && (
            <div style={{
              marginTop: 10, fontSize: 11, color: INK_48,
            }}>
              {allAes.filter(a => a.is_serious).length} total SAEs on file
            </div>
          )}
        </div>

        {/* KPI 3 — CTRI Statutory Filings */}
        <div style={{
          background: CANVAS,
          border: `1px solid ${ctriDueSoon > 0 ? 'rgba(0,102,204,0.28)' : HAIRLINE}`,
          borderRadius: R_LG, padding: 22,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ ...TYPE.label, color: INK_48 }}>CTRI Statutory Filings</span>
            <ClipboardList size={14} color={ctriDueSoon > 0 ? PRIMARY : INK_48} />
          </div>
          <div style={{ fontSize: 34, fontWeight: 600, color: ctriDueSoon > 0 ? PRIMARY : INK, letterSpacing: '-0.374px', lineHeight: 1.1, marginBottom: 6 }}>
            {ctriDueSoon}
          </div>
          <p style={{ ...TYPE.caption, color: INK_80, margin: 0 }}>
            6-month updates due &lt;30 days
          </p>
          {ctriCloseout > 0 && (
            <div style={{
              marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,159,10,0.08)', border: '1px solid rgba(255,159,10,0.25)',
              borderRadius: R_PILL, padding: '3px 9px',
              fontSize: 10, fontWeight: 600, color: WARNING,
            }}>
              {ctriCloseout} 30-day closeout notice active
            </div>
          )}
        </div>

        {/* KPI 4 — GCP Deviations & CAPA */}
        <div style={{
          background: CANVAS,
          border: `1px solid ${majorDeviations > 0 ? 'rgba(255,69,58,0.28)' : HAIRLINE}`,
          borderRadius: R_LG, padding: 22,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ ...TYPE.label, color: INK_48 }}>GCP Deviations & CAPA</span>
            <ActivitySquare size={14} color={majorDeviations > 0 ? DANGER : INK_48} />
          </div>
          <div style={{ fontSize: 34, fontWeight: 600, color: majorDeviations > 0 ? DANGER : INK, letterSpacing: '-0.374px', lineHeight: 1.1, marginBottom: 6 }}>
            {deviations.length}
          </div>
          <p style={{ ...TYPE.caption, color: INK_80, margin: 0 }}>
            {majorDeviations} major · {minorDeviations} minor
          </p>
          {openCapa > 0 && (
            <div style={{
              marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.25)',
              borderRadius: R_PILL, padding: '3px 9px',
              fontSize: 10, fontWeight: 600, color: DANGER,
            }}>
              <AlertTriangle size={9} /> {openCapa} CAPA actions open
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION A — ACTIVE SAE STATUTORY CLOCKS
          ══════════════════════════════════════════════════════════════ */}
      <div style={{
        background: CANVAS, border: `1px solid ${saeClocks.length > 0 ? 'rgba(255,69,58,0.35)' : HAIRLINE}`,
        borderRadius: R_LG, overflow: 'hidden',
      }}>
        <SectionHead
          icon={<ShieldAlert size={15} color={saeClocks.length > 0 ? DANGER : SUCCESS} />}
          title="Active Safety Emergency & Statutory Clocks"
          sub="NDCT Rules 2019 — 24-hour initial report to NPvCC mandatory"
          badge={
            saeClocks.length > 0
              ? <span style={{
                  ...BADGE.red,
                  animation: 'sae-pulse 1.4s ease-in-out infinite',
                }}>
                  {saeClocks.length} URGENT
                </span>
              : <span style={BADGE.green}>All Clear</span>
          }
        />

        <style>{`@keyframes sae-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

        {saeClocks.length === 0 ? (
          <div style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <CheckCircle2 size={22} color={SUCCESS} style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: SUCCESS, margin: '0 0 3px' }}>
                All SAE Clocks Clear
              </p>
              <p style={{ ...TYPE.caption, color: INK_80, margin: 0 }}>
                No adverse events pending NPvCC reporting. All statutory deadlines met.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {saeClocks.map(clock => (
              <div key={clock.id} style={{
                background: TILE_1, borderBottom: `1px solid rgba(255,69,58,0.20)`,
                padding: '22px 28px', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: DANGER }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  {/* Left: identity */}
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 10, fontWeight: 700, color: DANGER,
                        background: 'rgba(255,69,58,0.14)', border: '1px solid rgba(255,69,58,0.40)',
                        padding: '3px 10px', borderRadius: R_PILL,
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                      }}>
                        <AlertTriangle size={10} /> SAE Statutory Clock
                      </span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                        Participant: <strong style={{ color: '#fff' }}>{clock.participant_code}</strong>
                      </span>
                      {/* NDCT 2019 Compensation badge */}
                      {(clock as any).compensation_status && (
                        <span style={compBadge((clock as any).compensation_status)}>
                          {(clock as any).compensation_status.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', letterSpacing: '-0.374px', margin: '0 0 6px' }}>
                      {clock.event_term}
                    </h3>
                    <p style={{ fontSize: 13, color: '#ff6961', margin: 0 }}>
                      Deadline: <strong>{new Date(clock.statutory_24h_deadline).toLocaleString()}</strong>
                    </p>
                  </div>
                  {/* Right: clock + actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ background: '#000', border: '1px solid rgba(255,69,58,0.35)', borderRadius: R_MD, padding: '10px 16px', textAlign: 'right' }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                        Time Remaining
                      </span>
                      <span style={{ fontSize: 24, fontWeight: 700, color: clock.is_overdue ? DANGER : WARNING, fontFamily: FONT_MONO }}>
                        {clock.status_label}
                      </span>
                    </div>
                    <button
                      onClick={() => downloadNpvcc(clock.id)}
                      disabled={downloading === clock.id}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        background: DANGER, color: '#fff', border: 'none',
                        borderRadius: R_PILL, padding: '9px 18px',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        fontFamily: FONT_STACK, transition: 'transform 0.1s',
                        opacity: downloading === clock.id ? 0.6 : 1,
                      }}
                      onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <Download size={12} /> NPvCC Report
                    </button>
                    <button
                      onClick={() => markReported(clock.id)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        background: SUCCESS, color: '#fff', border: 'none',
                        borderRadius: R_PILL, padding: '9px 18px',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        fontFamily: FONT_STACK, transition: 'transform 0.1s',
                        whiteSpace: 'nowrap' as const,
                      }}
                      onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <CheckCircle2 size={12} /> Confirm Dispatch &amp; Close Clock
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION B — IEC DOSSIER & RENEWAL QUEUE
          ══════════════════════════════════════════════════════════════ */}
      <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, overflow: 'hidden' }}>
        <SectionHead
          icon={<FileCheck size={15} color={PRIMARY} />}
          title="Ethics Committee (IEC) Dossier & Renewal Queue"
          sub="ICMR 2017 Guidelines — submitted protocols, amendments, annual continuing review"
          action={
            <Link
              to="/ethics-ctri"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 12, fontWeight: 600, color: PRIMARY,
                textDecoration: 'none', letterSpacing: '-0.12px',
              }}
            >
              Open Ethics Console <ArrowRight size={12} />
            </Link>
          }
        />

        {studies.length === 0 ? (
          <div style={{ padding: '28px 24px', color: INK_48, fontSize: 13 }}>No studies loaded.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}` }}>
                  {['Study', 'Phase', 'IEC Status', 'Valid Until', 'Days Remaining', 'Action Required'].map(h => (
                    <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {studies.map(s => {
                  const iec = s.iec_submissions?.find(sub => sub.decision === 'APPROVED') ?? s.iec_submissions?.[0];
                  const days = iec?.valid_until ? daysUntil(iec.valid_until) : null;
                  const isBacklog = s.status === 'IEC_SUBMITTED';
                  const isExpiring = days !== null && days < 60;

                  return (
                    <tr
                      key={s.id}
                      style={{ borderBottom: `1px solid ${HAIRLINE}`, background: isBacklog ? 'rgba(255,159,10,0.03)' : 'transparent' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,102,204,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = isBacklog ? 'rgba(255,159,10,0.03)' : 'transparent')}
                    >
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: PRIMARY, display: 'block' }}>{s.short_code}</span>
                        <span style={{ fontSize: 11, color: INK_48, display: 'block', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: 12, color: INK_80 }}>{s.phase}</td>
                      <td style={{ padding: '11px 16px' }}>
                        <span style={isBacklog ? BADGE.amber : iec?.decision === 'APPROVED' ? BADGE.green : BADGE.ink}>
                          {isBacklog ? 'PENDING REVIEW' : iec?.decision ?? 'NOT SUBMITTED'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: 12, fontFamily: FONT_MONO, color: INK_80 }}>
                        {iec?.valid_until ?? '—'}
                      </td>
                      <td style={{ padding: '11px 16px' }}>
                        {days !== null ? (
                          <span style={{ fontSize: 12, fontWeight: 600, color: days < 30 ? DANGER : days < 60 ? WARNING : SUCCESS }}>
                            {days}d
                          </span>
                        ) : <span style={{ color: INK_48, fontSize: 12 }}>—</span>}
                      </td>
                      <td style={{ padding: '11px 16px' }}>
                        {isBacklog && <span style={{ fontSize: 11, color: WARNING, fontWeight: 600 }}>Record IEC Decision</span>}
                        {isExpiring && !isBacklog && <span style={{ fontSize: 11, color: DANGER, fontWeight: 600 }}>Submit Renewal Dossier</span>}
                        {!isBacklog && !isExpiring && <span style={{ fontSize: 11, color: SUCCESS }}>Compliant</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION C — PHARMACOVIGILANCE & AEFA CAUSALITY MATRIX
          ══════════════════════════════════════════════════════════════ */}
      <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, overflow: 'hidden' }}>
        <SectionHead
          icon={<Pill size={15} color={PURPLE} />}
          title="Pharmacovigilance & AEFA Causality Matrix"
          sub="Adverse Events Following Ayurveda — Ministry of Ayush NPvCC / WHO-UMC Classification"
          badge={
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(52,199,89,0.08)', border: '1px solid rgba(52,199,89,0.25)',
              borderRadius: R_PILL, padding: '3px 9px', marginLeft: 6,
              fontSize: 10, fontWeight: 600, color: SUCCESS,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: SUCCESS, display: 'inline-block' }} />
              NPvCC / Ayush Suraksha Gateway Active
            </span>
          }
        />

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Summary stat row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {[
              { label: 'Total AEFA Reactions', val: allAes.length, color: INK },
              { label: 'Serious (SAE)', val: allAes.filter(a => a.is_serious).length, color: DANGER },
              { label: 'Reported to NPvCC', val: allAes.filter(a => a.is_reported_to_npvcc).length, color: SUCCESS },
            ].map(s => (
              <div key={s.label} style={{ background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '14px 18px' }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>{s.label}</span>
                <span style={{ fontSize: 28, fontWeight: 600, color: s.color, letterSpacing: '-0.374px' }}>{s.val}</span>
              </div>
            ))}
          </div>

          {/* WHO-UMC causality distribution */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
              WHO-UMC Causality Distribution
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { key: 'CERTAIN',      style: BADGE.red },
                { key: 'PROBABLE',     style: BADGE.amber },
                { key: 'POSSIBLE',     style: BADGE.blue },
                { key: 'UNLIKELY',     style: BADGE.green },
                { key: 'UNASSESSABLE', style: BADGE.ink },
              ].map(({ key, style }) => (
                <div key={key} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: PARCHMENT, border: `1px solid ${HAIRLINE}`,
                  borderRadius: R_MD, padding: '10px 16px',
                }}>
                  <span style={style}>{key}</span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 700, color: INK }}>
                    {causality[key] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Empty state */}
          {allAes.length === 0 && (
            <p style={{ fontSize: 13, color: INK_48, fontStyle: 'italic', margin: 0 }}>
              No adverse events on file for the active study.
            </p>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION D — GCP PROTOCOL DEVIATIONS & CAPA TRACKER
          ══════════════════════════════════════════════════════════════ */}
      <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, overflow: 'hidden' }}>
        <SectionHead
          icon={<ActivitySquare size={15} color={majorDeviations > 0 ? DANGER : INK_48} />}
          title="GCP Quality Assurance — Protocol Deviations & CAPA Tracker"
          sub="Logged deviations against active protocols — corrective action plan status"
          badge={
            deviations.length > 0
              ? <span style={{ ...BADGE.amber, marginLeft: 6 }}>{deviations.length} Logged</span>
              : <span style={{ ...BADGE.green, marginLeft: 6 }}>No Deviations</span>
          }
        />

        {deviations.length === 0 ? (
          <div style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <CheckCircle2 size={20} color={SUCCESS} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: INK_80, margin: 0 }}>
              No protocol deviations logged for the active study. All GCP procedures compliant.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '120px' }} />
                <col style={{ width: '130px' }} />
                <col style={{ width: '90px' }} />
                <col style={{ width: '120px' }} />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr style={{ background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}` }}>
                  {['Participant', 'Protocol', 'Severity', 'Date', 'Description / Deviation', 'CAPA Status'].map(h => (
                    <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', overflow: 'hidden' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deviations.map((dev, i) => (
                  <tr
                    key={dev.id ?? i}
                    style={{ borderBottom: `1px solid ${HAIRLINE}`, verticalAlign: 'top' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,102,204,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: PRIMARY }}>
                        {dev.participant?.participant_code ?? '—'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: INK_80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {dev.study_id ? dev.study_id.slice(0, 8) + '…' : '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={dev.severity === 'MAJOR' ? BADGE.red : BADGE.amber}>
                        {dev.severity}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: FONT_MONO, fontSize: 11, color: INK_48 }}>
                      {dev.deviation_date ?? '—'}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: INK_80, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      <span style={{ fontWeight: 600, color: INK, display: 'block', marginBottom: 2 }}>
                        {dev.category}
                      </span>
                      {dev.description}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {dev.corrective_action ? (
                        <div>
                          <span style={BADGE.green}>CAPA Documented</span>
                          <p style={{ fontSize: 11, color: INK_48, margin: '4px 0 0', wordBreak: 'break-word' }}>
                            {dev.corrective_action}
                          </p>
                        </div>
                      ) : (
                        <span style={BADGE.red}>CAPA Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          REGULATORY CLEARANCES SUMMARY
          ══════════════════════════════════════════════════════════════ */}
      <div style={{ background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: INK, letterSpacing: '-0.224px', margin: '0 0 16px' }}>
          Regulatory Clearances — Active Protocol
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { label: 'CTRI Registration ID',      value: study?.ctri_registration?.ctri_id ?? '—',                      accent: PRIMARY_ON_DARK },
            { label: 'Next 6-Month CTRI Update',  value: study?.ctri_registration?.next_mandatory_update_due ?? '—',   accent: INK },
            { label: 'IEC Decision Status',       value: approvedIec ? 'APPROVED' : 'Pending',                          accent: approvedIec ? SUCCESS : WARNING },
            { label: 'IEC Clearance Valid Until', value: approvedIec?.valid_until ?? '—',                               accent: INK },
          ].map(({ label, value, accent }) => (
            <div key={label} style={{ background: CANVAS, borderRadius: R_MD, padding: '14px 16px', border: `1px solid ${HAIRLINE}` }}>
              <span style={{ ...TYPE.label, color: INK_48, display: 'block', marginBottom: 6 }}>{label}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: accent, letterSpacing: '-0.224px' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
