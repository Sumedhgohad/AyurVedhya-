import React from 'react';
import { Link } from 'react-router-dom';
import { Study } from '../types';
import {
  Users, Package, CheckCircle2, FolderKanban, Plus,
  ArrowRight, Calendar, Pill, ClipboardList,
} from 'lucide-react';
import {
  CANVAS, PARCHMENT, HAIRLINE,
  INK, INK_48, INK_80, PRIMARY, PRIMARY_ON_DARK,
  SUCCESS, WARNING, DANGER,
  FONT_MONO,
  R_MD, R_LG, R_PILL,
  TYPE, BADGE, btnPrimary,
} from '../design';

interface Props {
  studies: Study[];
  participants: any[];
  refreshData: () => void;
}

/* ─── KPI card ─── */
const KPI: React.FC<{
  label: string;
  value: React.ReactNode;
  sub: string;
  accent?: string;
  icon?: React.ReactNode;
}> = ({ label, value, sub, accent = INK, icon }) => (
  <div style={{
    background: CANVAS, border: `1px solid ${HAIRLINE}`,
    borderRadius: R_LG, padding: 24,
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

/* ─── Quick-action link row ─── */
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
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,102,204,0.08)', border: '1px solid rgba(0,102,204,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

/* ─── Visit status badge ─── */
const visitBadge = (status: 'Scheduled' | 'Visit Due' | 'Completed'): React.CSSProperties => {
  if (status === 'Completed') return BADGE.green;
  if (status === 'Visit Due') return BADGE.amber;
  return BADGE.blue;
};

/* ─── Compute derived visit info from participant record ─── */
const getVisitInfo = (p: any, idx: number): { nextVisit: string; status: 'Scheduled' | 'Visit Due' | 'Completed' } => {
  const visits: any[] = p.visits ?? [];
  const baselineDate = visits[0]?.visit_date
    ? new Date(visits[0].visit_date)
    : new Date(p.enrollment_date ?? Date.now());

  // Visit schedule: Baseline(D0), Follow-up 1(D15), Follow-up 2(D30), End(D90)
  const schedule = [
    { label: 'Baseline [Day 0]', day: 0 },
    { label: 'Follow-up 1 [Day 15 ±3d]', day: 15 },
    { label: 'Follow-up 2 [Day 30 ±3d]', day: 30 },
    { label: 'End of Study [Day 90 ±5d]', day: 90 },
  ];

  const completedCount = visits.length;
  const nextIdx = Math.min(completedCount, schedule.length - 1);
  const next = schedule[nextIdx];

  const dueDate = new Date(baselineDate);
  dueDate.setDate(dueDate.getDate() + next.day);
  const today = new Date();
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);

  let status: 'Scheduled' | 'Visit Due' | 'Completed' = 'Scheduled';
  if (completedCount >= schedule.length) {
    status = 'Completed';
  } else if (diffDays <= 3) {
    status = 'Visit Due';
  }

  return { nextVisit: next.label, status };
};

export const InvestigatorDashboard: React.FC<Props> = ({ studies, participants, refreshData }) => {
  const study = studies[0] ?? null;
  const batch = study?.ip_batches?.[0] ?? null;

  /* ─── Empty state: no protocol in DB ─── */
  if (!study) {
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

  /* ─── Derived real values ─── */
  const enrolledCount = participants.length;
  const targetSize    = study.target_sample_size ?? 0;
  const pct           = targetSize > 0 && enrolledCount > 0
    ? Math.round((enrolledCount / targetSize) * 100)
    : 0;
  const stockUnits    = batch?.current_stock ?? 0;
  // Estimate initial stock: current + (enrolled × 60 capsules per subject)
  const initialStock  = stockUnits + enrolledCount * 60;
  const openQueries   = 0; // driven by future query API

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ══════════════════════
          KPI ROW — 4 cards
          ══════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
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

        {/* 4. Open GCP queries */}
        <KPI
          label="Open GCP Queries"
          value={openQueries}
          sub="Pending source data verifications"
          accent={openQueries > 0 ? WARNING : INK}
          icon={<ClipboardList size={15} color={openQueries > 0 ? WARNING : INK_48} />}
        />
      </div>

      {/* ══════════════════════════════════════
          RECRUITMENT PROGRESS BAR — full width
          ══════════════════════════════════════ */}
      <div style={{
        background: CANVAS, border: `1px solid ${HAIRLINE}`,
        borderRadius: R_LG, padding: '20px 24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: INK, letterSpacing: '-0.224px' }}>
            Recruitment Progress
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

      {/* ══════════════════════════════════════════════
          OPERATIONAL PANELS — 2 columns
          Panel A: Protocol summary · Panel B: Visits
          ══════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* ─── Panel A: Active Protocol Summary ─── */}
        <div style={{
          background: CANVAS, border: `1px solid ${HAIRLINE}`,
          borderRadius: R_LG, padding: 28,
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          {/* Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ ...BADGE.blue }}>{study.short_code}</span>
              <span style={{ ...BADGE.green }}>{study.status}</span>
              <span style={{ ...BADGE.ink }}>{study.phase}</span>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: INK, letterSpacing: '-0.374px', lineHeight: 1.47, margin: '0 0 4px' }}>
              {study.title}
            </h2>
            <p style={{ ...TYPE.caption, color: INK_48, margin: 0 }}>
              {study.study_type} · CTRI:{' '}
              <span style={{ fontFamily: FONT_MONO, color: PRIMARY_ON_DARK }}>
                {study.ctri_registration?.ctri_id || '—'}
              </span>
            </p>
          </div>

          {/* Drug inventory tracker */}
          <div style={{ background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '16px 18px' }}>
            <p style={{ ...TYPE.label, color: INK_48, margin: '0 0 12px' }}>
              Drug Inventory Tracker — {batch?.formulation_name || 'No batch registered'}
            </p>
            {batch ? (
              <>
                {/* Stock bar */}
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
        </div>

        {/* ─── Panel B: Upcoming Patient Visit Timeline ─── */}
        <div style={{
          background: CANVAS, border: `1px solid ${HAIRLINE}`,
          borderRadius: R_LG, overflow: 'hidden',
        }}>
          {/* Panel header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 24px', borderBottom: `1px solid ${HAIRLINE}`,
            background: PARCHMENT,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: INK, letterSpacing: '-0.224px' }}>
              <Calendar size={14} color={PRIMARY} />
              Upcoming Patient Visit Timeline
            </span>
            <Link
              to="/participants"
              style={{ fontSize: 12, fontWeight: 600, color: PRIMARY, textDecoration: 'none', letterSpacing: '-0.12px', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {/* Visit rows */}
          {participants.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <Users size={28} color={INK_48} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.4 }} />
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
            <div style={{ overflowY: 'auto', maxHeight: 360 }}>
              {participants.map((p, idx) => {
                const { nextVisit, status } = getVisitInfo(p, idx);
                return (
                  <div
                    key={p.id ?? idx}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '13px 24px',
                      borderBottom: `1px solid ${HAIRLINE}`,
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,102,204,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Subject identity */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'rgba(0,102,204,0.08)',
                        border: '1px solid rgba(0,102,204,0.18)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: 11, fontWeight: 700, color: PRIMARY,
                        fontFamily: FONT_MONO,
                      }}>
                        {(p.participant_code ?? `${idx + 1}`).slice(-2)}
                      </div>
                      <div>
                        <p style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: INK, margin: 0, letterSpacing: '0' }}>
                          {p.participant_code ?? `SUBJ-AIIA-00${idx + 1}`}
                        </p>
                        <p style={{ fontSize: 11, color: INK_48, margin: '2px 0 0', letterSpacing: '-0.08px' }}>
                          {p.age ?? '—'} yrs · {p.gender ?? '—'}
                        </p>
                      </div>
                    </div>

                    {/* Next visit + status */}
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: INK_80, margin: '0 0 4px', letterSpacing: '-0.12px' }}>
                        {nextVisit}
                      </p>
                      <span style={visitBadge(status)}>{status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
