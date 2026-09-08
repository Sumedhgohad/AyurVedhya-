import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Study, SaeClock } from '../types';
import {
  Users, Package, CheckCircle2, FolderKanban, Plus,
  ArrowRight, Calendar, Pill, ClipboardList, AlertTriangle,
  FileUp, ChevronDown, ShieldAlert, ExternalLink,
} from 'lucide-react';
import {
  CANVAS, PARCHMENT, HAIRLINE,
  INK, INK_48, INK_80, PRIMARY, PRIMARY_ON_DARK,
  SUCCESS, WARNING, DANGER,
  FONT_MONO, FONT_STACK,
  R_MD, R_LG, R_PILL, R_SM,
  TYPE, BADGE, btnPrimary,
} from '../design';

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */
interface Props {
  studies: Study[];
  participants: any[];
  saeClocks: SaeClock[];
  refreshData: () => void;
}

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */

/** Format a JS Date → "DD-MMM-YYYY" */
const fmtDate = (d: Date): string =>
  d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/**
 * For a participant + a visit definition, compute:
 *  - dueDate  : enrollment_date + visitDef.visit_day
 *  - windowStart / windowEnd applying window_minus / window_plus
 *  - isOverdue : windowEnd < today
 */
const computeVisitWindow = (
  enrollmentDate: string,
  visitDay: number,
  windowMinus: number,
  windowPlus: number,
) => {
  const base = new Date(enrollmentDate);
  const due = new Date(base);
  due.setDate(due.getDate() + visitDay);

  const windowStart = new Date(due);
  windowStart.setDate(windowStart.getDate() - windowMinus);

  const windowEnd = new Date(due);
  windowEnd.setDate(windowEnd.getDate() + windowPlus);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = windowEnd < today;

  return { due, windowStart, windowEnd, isOverdue };
};

/**
 * For a participant, derive which visit is next (first visit_definition from
 * the study arm that has no completed visit record with that day).
 * Falls back to a static schedule if the study has no arms/definitions.
 */
const STATIC_SCHEDULE = [
  { visit_name: 'Baseline',    visit_day: 0,  window_minus: 0, window_plus: 0 },
  { visit_name: 'Follow-up 1', visit_day: 15, window_minus: 3, window_plus: 3 },
  { visit_name: 'Follow-up 2', visit_day: 30, window_minus: 3, window_plus: 3 },
  { visit_name: 'End of Study', visit_day: 90, window_minus: 5, window_plus: 5 },
];

interface VisitRow {
  participantCode: string;
  age: number | string;
  gender: string;
  participantId: string;
  visitName: string;
  visitDay: number;
  windowMinus: number;
  windowPlus: number;
  due: Date;
  windowStart: Date;
  windowEnd: Date;
  isOverdue: boolean;
  isCompleted: boolean;
}

const deriveNextVisitRows = (participants: any[], study: Study | null): VisitRow[] => {
  const rows: VisitRow[] = [];

  // Collect all visit definitions from all arms
  const defs =
    study?.study_arms?.flatMap((arm) => arm.visit_definitions ?? []) ??
    [];
  const schedule =
    defs.length > 0
      ? defs.map((d) => ({
          visit_name: d.visit_name,
          visit_day: d.visit_day,
          window_minus: d.window_minus ?? 0,
          window_plus: d.window_plus ?? 0,
        }))
      : STATIC_SCHEDULE;

  // Sort ascending by day
  const sorted = [...schedule].sort((a, b) => a.visit_day - b.visit_day);

  for (const p of participants) {
    const completedDays = new Set<number>(
      (p.visits ?? []).map((v: any) => Number(v.visit_day ?? 0)),
    );
    const allComplete = sorted.every((s) => completedDays.has(s.visit_day));

    if (allComplete) {
      // Show last visit as Completed
      const last = sorted[sorted.length - 1];
      const { due, windowStart, windowEnd, isOverdue } = computeVisitWindow(
        p.enrollment_date ?? new Date().toISOString().split('T')[0],
        last.visit_day, last.window_minus, last.window_plus,
      );
      rows.push({
        participantCode: p.participant_code ?? `SUBJ-00${rows.length + 1}`,
        age: p.age ?? '—',
        gender: p.gender ?? '—',
        participantId: p.id ?? '',
        visitName: last.visit_name,
        visitDay: last.visit_day,
        windowMinus: last.window_minus,
        windowPlus: last.window_plus,
        due, windowStart, windowEnd, isOverdue,
        isCompleted: true,
      });
    } else {
      // Next pending visit
      const next = sorted.find((s) => !completedDays.has(s.visit_day));
      if (!next) continue;
      const { due, windowStart, windowEnd, isOverdue } = computeVisitWindow(
        p.enrollment_date ?? new Date().toISOString().split('T')[0],
        next.visit_day, next.window_minus, next.window_plus,
      );
      rows.push({
        participantCode: p.participant_code ?? `SUBJ-00${rows.length + 1}`,
        age: p.age ?? '—',
        gender: p.gender ?? '—',
        participantId: p.id ?? '',
        visitName: next.visit_name,
        visitDay: next.visit_day,
        windowMinus: next.window_minus,
        windowPlus: next.window_plus,
        due, windowStart, windowEnd, isOverdue,
        isCompleted: false,
      });
    }
  }

  // Sort: overdue first, then by due date ascending
  return rows.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    return a.due.getTime() - b.due.getTime();
  });
};

/* ─────────────────────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────────────────────── */

/** KPI card */
const KPI: React.FC<{
  label: string;
  value: React.ReactNode;
  sub: string;
  accent?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ label, value, sub, accent = INK, icon, footer }) => (
  <div style={{
    background: CANVAS, border: `1px solid ${HAIRLINE}`,
    borderRadius: R_LG, padding: 24,
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
  }}>
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ ...TYPE.label, color: INK_48 }}>{label}</span>
        {icon}
      </div>
      <div style={{ fontSize: 36, fontWeight: 600, color: accent, letterSpacing: '-0.374px', lineHeight: 1.1, marginBottom: 6 }}>
        {value}
      </div>
      <p style={{ ...TYPE.caption, color: INK_80, margin: 0 }}>{sub}</p>
    </div>
    {footer && <div style={{ marginTop: 14 }}>{footer}</div>}
  </div>
);

/** Sidebar quick-link row */
const QuickLink: React.FC<{ to: string; label: string; sub: string; icon: React.ReactNode }> = ({ to, label, sub, icon }) => (
  <Link
    to={to}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 14px', borderRadius: R_MD,
      background: PARCHMENT, border: `1px solid ${HAIRLINE}`,
      textDecoration: 'none', transition: 'border-color 0.12s',
    }}
    onMouseEnter={e => (e.currentTarget.style.borderColor = `rgba(0,102,204,0.35)`)}
    onMouseLeave={e => (e.currentTarget.style.borderColor = HAIRLINE)}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'rgba(0,102,204,0.08)', border: '1px solid rgba(0,102,204,0.16)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: INK, letterSpacing: '-0.224px', margin: 0 }}>{label}</p>
        <p style={{ fontSize: 11, color: INK_48, margin: '2px 0 0', letterSpacing: '-0.08px' }}>{sub}</p>
      </div>
    </div>
    <ArrowRight size={14} color={INK_48} />
  </Link>
);

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export const InvestigatorDashboard: React.FC<Props> = ({
  studies,
  participants,
  saeClocks,
  refreshData,
}) => {
  const navigate = useNavigate();

  /* ── Study switcher state ── */
  const [selectedStudyId, setSelectedStudyId] = useState<string>('ALL');

  /* ── Derived data scoped to selected study ── */
  const activeStudies = useMemo(
    () => studies.filter((s) => !['CLOSED', 'TERMINATED', 'DRAFT'].includes(s.status)),
    [studies],
  );

  const scopedStudy = useMemo((): Study | null => {
    if (selectedStudyId === 'ALL') return studies[0] ?? null;
    return studies.find((s) => s.id === selectedStudyId) ?? null;
  }, [selectedStudyId, studies]);

  /** Participants filtered by selected study (all if ALL, else by study_id) */
  const scopedParticipants = useMemo(() => {
    if (selectedStudyId === 'ALL') return participants;
    return participants.filter((p) => p.study_id === selectedStudyId);
  }, [selectedStudyId, participants]);

  const batch = scopedStudy?.ip_batches?.[0] ?? null;

  /* ── KPI derived values ── */
  const enrolledCount = scopedParticipants.length;
  const targetSize    = scopedStudy?.target_sample_size ?? 0;
  const pct           = targetSize > 0 && enrolledCount > 0
    ? Math.round((enrolledCount / targetSize) * 100)
    : 0;
  const stockUnits    = batch?.current_stock ?? 0;
  const initialStock  = stockUnits + enrolledCount * 60;
  const openQueries   = 0;

  /* ── SAE clocks (scoped) ── */
  const activeSaeCount = useMemo(() => {
    if (selectedStudyId === 'ALL') return saeClocks.length;
    // SaeClock doesn't carry study_id directly — show global count when ALL,
    // otherwise still show all (investigator sees all urgent clocks)
    return saeClocks.length;
  }, [selectedStudyId, saeClocks]);

  const urgentSae = saeClocks.some((c) => c.hours_remaining < 12 || c.is_overdue);

  /* ── Visit rows ── */
  const visitRows = useMemo(
    () => deriveNextVisitRows(scopedParticipants, scopedStudy),
    [scopedParticipants, scopedStudy],
  );

  /* ─── Empty state ─── */
  if (studies.length === 0) {
    return (
      <div style={{
        background: CANVAS, border: `1px solid ${HAIRLINE}`,
        borderRadius: R_LG, padding: '64px 48px',
        textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'rgba(0,102,204,0.07)',
          border: '1px solid rgba(0,102,204,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FolderKanban size={28} color={PRIMARY} />
        </div>
        <h2 style={{ fontSize: 21, fontWeight: 600, color: INK, letterSpacing: '-0.374px', margin: 0 }}>
          No Clinical Trials Found in Database
        </h2>
        <p style={{ fontSize: 14, color: INK_48, letterSpacing: '-0.224px', maxWidth: 400, margin: 0, lineHeight: 1.6 }}>
          Your database is empty. Navigate to{' '}
          <strong style={{ color: INK }}>Trial Protocols &amp; Batches</strong>{' '}
          in the sidebar to initialise your first clinical protocol.
        </p>
        <Link
          to="/studies"
          style={{ ...btnPrimary(), marginTop: 8, textDecoration: 'none' }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Plus size={15} />
          Go to Trial Setup
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: FONT_STACK }}>

      {/* ══════════════════════════════════════════════════════════════════════
          TOP BAR — Protocol Switcher + Quick-Action Toolbar
          ══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'space-between',
        gap: 12,
      }}>

        {/* ── Protocol Switcher ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: INK_48, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            Viewing Protocol
          </span>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedStudyId}
              onChange={e => setSelectedStudyId(e.target.value)}
              style={{
                appearance: 'none' as const,
                background: CANVAS,
                border: `1px solid ${HAIRLINE}`,
                borderRadius: R_MD,
                padding: '8px 36px 8px 14px',
                fontSize: 13, fontWeight: 600, color: INK,
                fontFamily: FONT_STACK, cursor: 'pointer',
                outline: 'none', minWidth: 260,
                letterSpacing: '-0.12px',
              }}
            >
              <option value="ALL">All Studies — Aggregate Overview</option>
              {studies.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.short_code}] {s.title.length > 48 ? s.title.slice(0, 48) + '…' : s.title}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              color={INK_48}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
          </div>
          {scopedStudy && selectedStudyId !== 'ALL' && (
            <span style={{ ...BADGE.blue }}>{scopedStudy.status}</span>
          )}
          {selectedStudyId === 'ALL' && studies.length > 1 && (
            <span style={{ ...BADGE.ink }}>{studies.length} trials</span>
          )}
        </div>

        {/* ── Quick-Action Toolbar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => navigate('/participants')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: PRIMARY, color: '#ffffff', border: 'none',
              borderRadius: R_PILL, padding: '8px 16px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: FONT_STACK, whiteSpace: 'nowrap' as const,
              transition: 'transform 0.1s ease',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Plus size={13} />
            Enroll Subject
          </button>

          <button
            onClick={() => navigate('/safety')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,69,58,0.08)', color: DANGER,
              border: `1px solid rgba(255,69,58,0.30)`,
              borderRadius: R_PILL, padding: '8px 16px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: FONT_STACK, whiteSpace: 'nowrap' as const,
              transition: 'transform 0.1s ease',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <ShieldAlert size={13} />
            Log Adverse Event
          </button>

          <button
            onClick={() => navigate('/documents')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: PARCHMENT, color: INK,
              border: `1px solid ${HAIRLINE}`,
              borderRadius: R_PILL, padding: '8px 16px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: FONT_STACK, whiteSpace: 'nowrap' as const,
              transition: 'transform 0.1s ease',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <FileUp size={13} />
            Upload Document
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          KPI ROW — 4 cards
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* 1. Recruitment */}
        <KPI
          label="Recruitment"
          value={`${enrolledCount} / ${targetSize > 0 ? targetSize : '—'}`}
          sub={targetSize > 0 ? `${pct}% of target sample size` : 'Target not set'}
          accent={PRIMARY}
          icon={<Users size={15} color={PRIMARY} />}
        />

        {/* 2. Drug inventory */}
        <KPI
          label="Drug Inventory"
          value={stockUnits}
          sub={batch
            ? `${stockUnits} / ${initialStock} units · ${batch.batch_no}`
            : 'No IP batch registered'}
          accent={stockUnits > 0 ? SUCCESS : INK_48}
          icon={<Pill size={15} color={stockUnits > 0 ? SUCCESS : INK_48} />}
        />

        {/* 3. CRF completion */}
        <KPI
          label="CRF Completion"
          value={enrolledCount > 0 ? '100%' : '—'}
          sub="Prakriti · Nidan Panchaka · Diet Score"
          accent={SUCCESS}
          icon={<CheckCircle2 size={15} color={SUCCESS} />}
        />

        {/* 4. Open GCP queries + SAE badge */}
        <KPI
          label="Open GCP Queries"
          value={openQueries}
          sub="Pending source data verifications"
          accent={openQueries > 0 ? WARNING : INK}
          icon={<ClipboardList size={15} color={openQueries > 0 ? WARNING : INK_48} />}
          footer={
            activeSaeCount > 0 ? (
              <div
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,69,58,0.08)', border: `1px solid rgba(255,69,58,0.28)`,
                  borderRadius: R_PILL, padding: '4px 10px',
                  fontSize: 11, fontWeight: 600, color: DANGER,
                  letterSpacing: '0.04em',
                  /* pulsing animation for urgent SAEs */
                  animation: urgentSae ? 'sae-pulse 1.4s ease-in-out infinite' : 'none',
                }}
              >
                <AlertTriangle size={11} color={DANGER} />
                {activeSaeCount === 1
                  ? '1 Urgent SAE Clock Active'
                  : `${activeSaeCount} Urgent SAE Clocks Active`}
              </div>
            ) : (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(52,199,89,0.08)', border: `1px solid rgba(52,199,89,0.28)`,
                borderRadius: R_PILL, padding: '4px 10px',
                fontSize: 11, fontWeight: 600, color: SUCCESS,
                letterSpacing: '0.04em',
              }}>
                <CheckCircle2 size={11} color={SUCCESS} />
                0 Active SAEs
              </div>
            )
          }
        />
      </div>

      {/* Keyframe for SAE pulse — injected once via a <style> tag */}
      <style>{`
        @keyframes sae-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════════
          RECRUITMENT PROGRESS BAR
          ══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        background: CANVAS, border: `1px solid ${HAIRLINE}`,
        borderRadius: R_LG, padding: '20px 24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: INK, letterSpacing: '-0.224px' }}>
            Recruitment Progress
            {selectedStudyId !== 'ALL' && scopedStudy && (
              <span style={{ fontSize: 11, fontWeight: 400, color: INK_48, marginLeft: 8 }}>
                — {scopedStudy.short_code}
              </span>
            )}
          </span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 600, color: PRIMARY }}>
            {enrolledCount} enrolled · {targetSize > 0 ? targetSize - enrolledCount : '—'} remaining · {pct}%
          </span>
        </div>
        <div style={{ height: 6, background: 'rgba(0,0,0,0.08)', borderRadius: R_PILL, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: pct >= 80 ? SUCCESS : PRIMARY,
            borderRadius: R_PILL,
            transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
        {targetSize > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: INK_48 }}>0</span>
            <span style={{ fontSize: 11, color: INK_48 }}>{targetSize} subjects</span>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          OPERATIONAL PANELS — Protocol Summary + Actionable Visit Timeline
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ─── Panel A: Active Protocol Summary ─── */}
        <div className="lg:col-span-5" style={{
          background: CANVAS, border: `1px solid ${HAIRLINE}`,
          borderRadius: R_LG, padding: 28,
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          {scopedStudy ? (
            <>
              {/* Header */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ ...BADGE.blue }}>{scopedStudy.short_code}</span>
                  <span style={{ ...BADGE.green }}>{scopedStudy.status}</span>
                  <span style={{ ...BADGE.ink }}>{scopedStudy.phase}</span>
                </div>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: INK, letterSpacing: '-0.374px', lineHeight: 1.47, margin: '0 0 4px' }}>
                  {scopedStudy.title}
                </h2>
                <p style={{ ...TYPE.caption, color: INK_48, margin: 0 }}>
                  {scopedStudy.study_type} · CTRI:{' '}
                  <span style={{ fontFamily: FONT_MONO, color: PRIMARY_ON_DARK }}>
                    {scopedStudy.ctri_registration?.ctri_id || '—'}
                  </span>
                </p>
              </div>

              {/* Drug inventory tracker */}
              <div style={{ background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '16px 18px' }}>
                <p style={{ ...TYPE.label, color: INK_48, margin: '0 0 12px' }}>
                  Drug Inventory — {batch?.formulation_name || 'No batch registered'}
                </p>
                {batch ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: INK, letterSpacing: '-0.224px' }}>
                        {stockUnits} / {initialStock} Units
                      </span>
                      <span style={{ fontSize: 12, color: INK_48, fontFamily: FONT_MONO }}>
                        Batch {batch.batch_no}
                      </span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(0,0,0,0.08)', borderRadius: R_PILL, overflow: 'hidden', marginBottom: 10 }}>
                      <div style={{
                        height: '100%',
                        width: initialStock > 0 ? `${Math.round((stockUnits / initialStock) * 100)}%` : '0%',
                        background: stockUnits / Math.max(initialStock, 1) < 0.2 ? DANGER : SUCCESS,
                        borderRadius: R_PILL,
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {[
                        { k: 'AFI Standard', v: batch.afi_api_standard_ref },
                        { k: 'Dispensed',    v: `${enrolledCount * 60} units` },
                      ].map(({ k, v }) => (
                        <div key={k}>
                          <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</span>
                          <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: '2px 0 0', letterSpacing: '-0.12px' }}>{v}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: INK_48, margin: 0 }}>
                    No IP batch registered. Add a batch in Trial Protocols.
                  </p>
                )}
              </div>

              {/* Quick-action links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <QuickLink
                  to="/studies"
                  label="View Protocol Architecture"
                  sub="Phases, IP batches, regulatory snapshot"
                  icon={<FolderKanban size={14} color={PRIMARY} />}
                />
                <QuickLink
                  to="/participants"
                  label="Manage Cohort"
                  sub="Enroll subjects, capture CRFs, view baseline data"
                  icon={<Users size={14} color={PRIMARY} />}
                />
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ ...TYPE.label, color: INK_48 }}>Aggregate View</span>
              <p style={{ fontSize: 13, color: INK_48, margin: 0 }}>
                {studies.length} trial{studies.length !== 1 ? 's' : ''} across all phases. Select a specific protocol using the switcher above to view detailed metrics.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                {studies.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStudyId(s.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: PARCHMENT, border: `1px solid ${HAIRLINE}`,
                      borderRadius: R_MD, padding: '10px 14px',
                      cursor: 'pointer', fontFamily: FONT_STACK,
                      transition: 'border-color 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = `rgba(0,102,204,0.35)`)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = HAIRLINE)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: PRIMARY }}>{s.short_code}</span>
                      <span style={{ fontSize: 12, color: INK, letterSpacing: '-0.12px' }}>
                        {s.title.length > 36 ? s.title.slice(0, 36) + '…' : s.title}
                      </span>
                    </div>
                    <span style={{ ...BADGE.green, fontSize: 10 }}>{s.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── Panel B: Actionable Visit Timeline ─── */}
        <div className="lg:col-span-7" style={{
          background: CANVAS, border: `1px solid ${HAIRLINE}`,
          borderRadius: R_LG, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Panel header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 24px', borderBottom: `1px solid ${HAIRLINE}`,
            background: PARCHMENT, flexShrink: 0,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: INK, letterSpacing: '-0.224px' }}>
              <Calendar size={14} color={PRIMARY} />
              Upcoming Patient Visit Timeline
              {visitRows.some(r => r.isOverdue) && (
                <span style={{
                  ...BADGE.amber,
                  fontSize: 10,
                  marginLeft: 4,
                }}>
                  {visitRows.filter(r => r.isOverdue).length} Overdue
                </span>
              )}
            </span>
            <Link
              to="/participants"
              style={{ fontSize: 12, fontWeight: 600, color: PRIMARY, textDecoration: 'none', letterSpacing: '-0.12px', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {/* Visit rows */}
          {scopedParticipants.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={28} color={INK_48} style={{ marginBottom: 10, opacity: 0.4 }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: INK, letterSpacing: '-0.224px', margin: '0 0 6px' }}>
                No Subjects Enrolled Yet
              </p>
              <p style={{ fontSize: 13, color: INK_48, margin: '0 0 20px', letterSpacing: '-0.12px' }}>
                Enroll your first participant to see visit schedules here.
              </p>
              <Link
                to="/participants"
                style={{ ...btnPrimary(), textDecoration: 'none', fontSize: 14, padding: '9px 20px' }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Plus size={13} />
                Enroll First Subject
              </Link>
            </div>
          ) : (
            <div style={{ overflowY: 'auto', flex: 1, maxHeight: 420 }}>
              {visitRows.map((row, idx) => (
                <div
                  key={`${row.participantId}-${idx}`}
                  style={{
                    padding: '14px 24px',
                    borderBottom: `1px solid ${HAIRLINE}`,
                    background: row.isOverdue ? 'rgba(255,159,10,0.03)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = row.isOverdue ? 'rgba(255,159,10,0.07)' : 'rgba(0,102,204,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = row.isOverdue ? 'rgba(255,159,10,0.03)' : 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>

                    {/* Left: participant identity + visit info */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
                      {/* Avatar */}
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: row.isOverdue ? 'rgba(255,159,10,0.12)' : 'rgba(0,102,204,0.08)',
                        border: `1px solid ${row.isOverdue ? 'rgba(255,159,10,0.30)' : 'rgba(0,102,204,0.18)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: 11, fontWeight: 700,
                        color: row.isOverdue ? WARNING : PRIMARY,
                        fontFamily: FONT_MONO,
                      }}>
                        {row.participantCode.slice(-2)}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        {/* Participant code + demographics */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: INK }}>
                            {row.participantCode}
                          </span>
                          <span style={{ fontSize: 11, color: INK_48 }}>
                            {row.age} yrs · {row.gender}
                          </span>
                        </div>

                        {/* Visit name + day */}
                        <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: '0 0 4px', letterSpacing: '-0.12px' }}>
                          {row.visitName}{' '}
                          <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 400, color: INK_48 }}>
                            [Day {row.visitDay}{row.windowMinus > 0 || row.windowPlus > 0 ? ` ±${Math.max(row.windowMinus, row.windowPlus)}d` : ''}]
                          </span>
                        </p>

                        {/* Due date + window */}
                        {!row.isCompleted && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 11, color: INK_48 }}>
                            <span>
                              Due:{' '}
                              <span style={{ fontWeight: 600, color: row.isOverdue ? WARNING : INK }}>
                                {fmtDate(row.due)}
                              </span>
                            </span>
                            {(row.windowMinus > 0 || row.windowPlus > 0) && (
                              <span>
                                Window:{' '}
                                <span style={{ fontFamily: FONT_MONO, fontSize: 10 }}>
                                  {fmtDate(row.windowStart)} — {fmtDate(row.windowEnd)}
                                </span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Overdue warning badge */}
                        {row.isOverdue && !row.isCompleted && (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            background: 'rgba(255,159,10,0.10)', border: `1px solid rgba(255,159,10,0.30)`,
                            borderRadius: R_PILL, padding: '3px 9px', marginTop: 5,
                            fontSize: 10, fontWeight: 600, color: WARNING, letterSpacing: '0.04em',
                          }}>
                            <AlertTriangle size={10} color={WARNING} />
                            Window Overdue — Protocol Deviation Risk
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: action button */}
                    <div style={{ flexShrink: 0, alignSelf: 'center' }}>
                      {row.isCompleted ? (
                        <span style={{ ...BADGE.green, fontSize: 10 }}>Completed</span>
                      ) : (
                        <Link
                          to="/participants"
                          state={{ participantId: row.participantId }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            background: 'rgba(0,102,204,0.07)',
                            border: `1px solid rgba(0,102,204,0.22)`,
                            borderRadius: R_MD, padding: '6px 12px',
                            fontSize: 12, fontWeight: 600, color: PRIMARY,
                            textDecoration: 'none', whiteSpace: 'nowrap' as const,
                            transition: 'background 0.1s, border-color 0.1s',
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(0,102,204,0.13)';
                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,102,204,0.40)';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(0,102,204,0.07)';
                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,102,204,0.22)';
                          }}
                        >
                          <ExternalLink size={11} />
                          Open Visit CRF
                        </Link>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
