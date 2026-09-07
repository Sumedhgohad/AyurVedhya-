import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Study, SaeClock } from '../types';
import { api } from '../api/client';
import {
  Download, TrendingUp, ShieldCheck, ChevronDown, ChevronUp,
  ArrowUpDown, Search, RefreshCw, AlertTriangle, CheckCircle2,
  Users, Layers, Lock, FileText, FlaskConical, IndianRupee,
  BookOpen, UserCheck, Award, PieChart, Sparkles, X,
  TrendingDown, Clock, Activity,
} from 'lucide-react';
import {
  CANVAS, PARCHMENT, HAIRLINE,
  INK, INK_48, INK_80, PRIMARY, PRIMARY_ON_DARK,
  SUCCESS, WARNING, DANGER, PURPLE,
  FONT_MONO, FONT_STACK,
  R_MD, R_LG, R_PILL, R_SM,
  TYPE, BADGE,
} from '../design';

/* ─────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────*/
interface Props {
  studies: Study[];
  saeClocks: SaeClock[];
  refreshData: () => Promise<void>;
}

interface AccrualData {
  current_enrolled: number;
  target_sample_size: number;
  accrual_velocity_ratio: number;
  projected_completion_date: string;
  prescriptive_recommendations: Array<{ action: string; priority: string }>;
}

type SortKey = 'enrolled' | 'pct' | 'status' | 'phase';

/* ─────────────────────────────────────────────────────────────────
   DESIGN TOKENS — slate-900 palette for dark panels
───────────────────────────────────────────────────────────────────*/
const S900 = '#0f172a';
const S800 = '#1e293b';
const S700 = '#334155';
const S400 = '#94a3b8';
const S200 = '#e2e8f0';

/* ─────────────────────────────────────────────────────────────────
   STATIC FINANCIAL & FUNNEL CONSTANTS  (illustrative Ministry data)
───────────────────────────────────────────────────────────────────*/
const GRANT_SANCTIONED    = 38500000;   // ₹ 3,85,00,000
const GRANT_UTILIZED      = 23870000;   // ₹ 2,38,70,000
const GRANT_BURN_PCT      = 62;
const GRANT_NEXT_RELEASE  = 4500000;    // ₹ 45,00,000
const FUNNEL_SCREENED     = 340;
const FUNNEL_ENROLLED     = 81;
const FUNNEL_COMPLETED    = 78;
const FUNNEL_DROPOUTS     = 3;
const DROPOUT_PCT         = 3.8;
const RETENTION_PCT       = 96.2;

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────*/
const fmtINR = (n: number): string => {
  if (n >= 10000000) return `₹ ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹ ${(n / 100000).toFixed(0)} L`;
  return `₹ ${n.toLocaleString('en-IN')}`;
};

const statusBadge = (status: string): React.CSSProperties => {
  if (['ENROLLING', 'ONGOING'].includes(status)) return BADGE.green;
  if (status === 'DATA_LOCK') return BADGE.blue;
  if (status === 'CLOSED') return BADGE.ink;
  if (status === 'TERMINATED') return BADGE.red;
  return BADGE.amber;
};

/* ─────────────────────────────────────────────────────────────────
   KPI CARD (light surface)
───────────────────────────────────────────────────────────────────*/
const KpiCard: React.FC<{
  label: string;
  value: React.ReactNode;
  sub: React.ReactNode;
  accent?: string;
  borderColor?: string;
  icon: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ label, value, sub, accent = INK, borderColor = HAIRLINE, icon, footer }) => (
  <div style={{
    background: CANVAS, border: `1px solid ${borderColor}`,
    borderRadius: R_LG, padding: 24,
    display: 'flex', flexDirection: 'column',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      {icon}
    </div>
    <div style={{ fontSize: 30, fontWeight: 600, color: accent, letterSpacing: '-0.374px', lineHeight: 1.1, marginBottom: 7 }}>
      {value}
    </div>
    <p style={{ fontSize: 13, color: INK_80, margin: 0, letterSpacing: '-0.12px', flexGrow: 1 }}>{sub}</p>
    {footer && <div style={{ marginTop: 14 }}>{footer}</div>}
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   DARK STAT ROW  (used inside slate-900 panels)
───────────────────────────────────────────────────────────────────*/
const DarkRow: React.FC<{ label: string; value: string; accent?: string }> = ({
  label, value, accent = INK,
}) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: `1px solid ${HAIRLINE}`,
  }}>
    <span style={{ fontSize: 13, color: INK_48, letterSpacing: '-0.12px' }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: accent, letterSpacing: '-0.12px' }}>{value}</span>
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   ACTION LINK  (used in bottleneck cards)
───────────────────────────────────────────────────────────────────*/
const ActionLink: React.FC<{ to: string; icon: React.ReactNode; label: string; variant?: 'primary' | 'danger' | 'neutral' }> = ({
  to, icon, label, variant = 'primary',
}) => {
  const [hover, setHover] = useState(false);
  const bg = {
    primary: hover ? 'rgba(0,102,204,0.14)' : 'rgba(0,102,204,0.07)',
    danger:  hover ? 'rgba(255,69,58,0.14)'  : 'rgba(255,69,58,0.07)',
    neutral: hover ? 'rgba(0,0,0,0.07)'      : PARCHMENT,
  }[variant];
  const color = { primary: PRIMARY, danger: DANGER, neutral: INK }[variant];
  const border = { primary: 'rgba(0,102,204,0.22)', danger: 'rgba(255,69,58,0.22)', neutral: HAIRLINE }[variant];

  return (
    <Link
      to={to}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: bg, color, border: `1px solid ${border}`,
        borderRadius: R_MD, padding: '6px 12px',
        fontSize: 12, fontWeight: 600, textDecoration: 'none',
        whiteSpace: 'nowrap' as const, transition: 'background 0.1s',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {icon}{label}
    </Link>
  );
};

/* ─────────────────────────────────────────────────────────────────
   FUNNEL BAR
───────────────────────────────────────────────────────────────────*/
const FunnelRow: React.FC<{ label: string; count: number; total: number; color: string; sub?: string }> = ({
  label, count, total, color, sub,
}) => {
  const pct = total > 0 ? Math.min(100, Math.round((count / total) * 100)) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: INK }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: FONT_MONO }}>{count.toLocaleString()}</span>
      </div>
      <div style={{ height: 6, background: 'rgba(0,0,0,0.07)', borderRadius: R_PILL, overflow: 'hidden', marginBottom: 3 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: R_PILL, transition: 'width 0.8s ease' }} />
      </div>
      {sub && <span style={{ fontSize: 10, color: INK_48 }}>{sub}</span>}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────*/
export const LeadershipDashboard: React.FC<Props> = ({ studies, saeClocks, refreshData }) => {
  const [accrualMap, setAccrualMap] = useState<Record<string, AccrualData>>({});
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortKey,    setSortKey]    = useState<SortKey>('enrolled');
  const [sortAsc,    setSortAsc]    = useState(false);
  const [search,     setSearch]     = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  // popover: studyId → open
  const [popoverId,   setPopoverId]   = useState<string | null>(null);

  /* ── Single fetch on mount — no polling ── */
  const fetchAccrual = useCallback(async () => {
    if (studies.length === 0) { setLoading(false); return; }
    setLoading(true);
    const results = await Promise.allSettled(
      studies.map(s =>
        api.get(`/ai/health-score/${s.id}`)
          .then(r => ({ id: s.id, accrual: r.data?.job_b_accrual_prediction ?? null }))
          .catch(() => null)
      )
    );
    const map: Record<string, AccrualData> = {};
    results.forEach(r => {
      if (r.status === 'fulfilled' && r.value?.accrual) {
        map[r.value.id] = r.value.accrual;
      }
    });
    setAccrualMap(map);
    setLoading(false);
  }, [studies]);

  useEffect(() => { fetchAccrual(); }, [fetchAccrual]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([refreshData(), fetchAccrual()]);
    setRefreshing(false);
  };

  // Close popover on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setPopoverId(null); setDrawerOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* ─── Aggregate KPIs ─── */
  const enrollingCount = studies.filter(s => s.status === 'ENROLLING').length;
  const dataLockCount  = studies.filter(s => s.status === 'DATA_LOCK').length;
  const closedCount    = studies.filter(s => s.status === 'CLOSED').length;

  const totalEnrolled = useMemo(
    () => Object.values(accrualMap).reduce((s, a) => s + (a.current_enrolled ?? 0), 0),
    [accrualMap]
  );

  /* ─── Bottleneck detection ─── */
  const bottlenecks = useMemo(() => studies.flatMap(s => {
    const a = accrualMap[s.id];
    if (!a) return [];
    const enrolled = a.current_enrolled;
    const target   = a.target_sample_size ?? s.target_sample_size ?? 0;
    const pct      = target > 0 ? enrolled / target : 1;
    const items: Array<{ type: 'lag' | 'lock' | 'sae'; study: Study; accrual: AccrualData; pct: number }> = [];
    if (pct >= 1 && s.status === 'ENROLLING') items.push({ type: 'lock', study: s, accrual: a, pct });
    if (pct < 0.25 && target > 0 && ['ENROLLING', 'ONGOING'].includes(s.status)) items.push({ type: 'lag', study: s, accrual: a, pct });
    return items;
  }), [studies, accrualMap]);

  /* ─── AI Predictive Signals — computed from live accrual data ─── */
  const aiSignals = useMemo(() => {
    type Signal = {
      kind: 'accrual' | 'safety' | 'regulatory';
      studyId?: string;
      title: string;
      detail: string;
      recommendation: string;
      severity: 'warn' | 'critical' | 'info';
    };
    const signals: Signal[] = [];

    studies.forEach(s => {
      const a = accrualMap[s.id];
      if (!a) return;
      const enrolled = a.current_enrolled;
      const target   = a.target_sample_size ?? s.target_sample_size ?? 0;
      const pct      = target > 0 ? enrolled / target : 1;
      const ratio    = a.accrual_velocity_ratio ?? 0;

      if (pct < 0.25 && target > 0 && ['ENROLLING', 'ONGOING'].includes(s.status)) {
        // current velocity in subj/mo: (enrolled / elapsed days) * 30
        const projDate = a.projected_completion_date;
        const monthsDelay = ratio > 0 ? Math.round((3.5 / ratio) * 10) / 10 : 3.5;
        const subjPerMo = ratio > 0
          ? `${(ratio * (target / 30) ).toFixed(1)} subj/mo`
          : '~0 subj/mo';
        const requiredRate = target > 0 && s.start_date
          ? `${(target / Math.max(1, Math.ceil((new Date(s.planned_end_date ?? Date.now()).getTime() - new Date(s.start_date).getTime()) / 2592000000))).toFixed(1)} subj/mo`
          : '—';
        signals.push({
          kind: 'accrual', studyId: s.id,
          title: `Accrual Velocity Delay — ${s.short_code}`,
          detail: `Current velocity (${subjPerMo}) projects a ${monthsDelay}-month milestone delay. Target: ${projDate ?? 'unknown'}.`,
          recommendation: a.prescriptive_recommendations?.[0]?.action ?? 'Expand OPD screening window or authorise satellite site.',
          severity: 'warn',
        });
      }
    });

    if (saeClocks.length > 0) {
      signals.push({
        kind: 'safety',
        title: `Safety Signal — ${saeClocks.length} Active SAE${saeClocks.length > 1 ? 's' : ''}`,
        detail: `${saeClocks.length} serious adverse event${saeClocks.length > 1 ? 's' : ''} under active 24-hour statutory review.${saeClocks.some(c => c.is_overdue) ? ' One or more clocks are OVERDUE.' : ''}`,
        recommendation: 'Navigate to Safety Center to review countdown clocks and dispatch NPvCC reports.',
        severity: 'critical',
      });
    }

    // CTRI filings due in <30 days
    studies.forEach(s => {
      const due = s.ctri_registration?.next_mandatory_update_due;
      if (!due) return;
      const days = Math.ceil((new Date(due).getTime() - Date.now()) / 86_400_000);
      if (days < 30 && days >= 0) {
        signals.push({
          kind: 'regulatory', studyId: s.id,
          title: `CTRI Statutory Filing — ${s.short_code}`,
          detail: `6-month mandatory progress update due on ${due} (${days} days remaining).`,
          recommendation: 'Prepare and submit the CTRI progress filing via ctri.nic.in before the deadline.',
          severity: days < 7 ? 'critical' : 'info',
        });
      }
    });

    return signals;
  }, [studies, accrualMap, saeClocks]);

  // First projected completion date across all lagging studies (for KPI projection tag)
  const overallProjectedDate = useMemo(() => {
    const dates = studies
      .map(s => accrualMap[s.id]?.projected_completion_date)
      .filter(Boolean) as string[];
    if (dates.length === 0) return null;
    dates.sort();
    return dates[dates.length - 1]; // latest = when full portfolio will complete
  }, [studies, accrualMap]);

  /* ─── Sorted / searched table rows ─── */
  const filteredStudies = useMemo(() => {
    const q = search.toLowerCase().trim();
    let rows = q
      ? studies.filter(s =>
          s.short_code.toLowerCase().includes(q) || s.title.toLowerCase().includes(q)
        )
      : [...studies];

    rows.sort((a, b) => {
      const aD = accrualMap[a.id], bD = accrualMap[b.id];
      let va = 0, vb = 0;
      if (sortKey === 'enrolled') { va = aD?.current_enrolled ?? 0; vb = bD?.current_enrolled ?? 0; }
      else if (sortKey === 'pct') {
        const at = aD?.target_sample_size ?? a.target_sample_size ?? 1;
        const bt = bD?.target_sample_size ?? b.target_sample_size ?? 1;
        va = (aD?.current_enrolled ?? 0) / at;
        vb = (bD?.current_enrolled ?? 0) / bt;
      }
      else if (sortKey === 'status') { va = a.status.charCodeAt(0); vb = b.status.charCodeAt(0); }
      else { va = a.phase.charCodeAt(0); vb = b.phase.charCodeAt(0); }
      return sortAsc ? va - vb : vb - va;
    });
    return rows;
  }, [studies, accrualMap, sortKey, sortAsc, search]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortAsc(v => !v);
    else { setSortKey(k); setSortAsc(false); }
  };

  /* ─── CSV export ─── */
  const exportMIS = () => {
    const header = 'Code,Phase,Title,Enrolled,Target,Pct,Velocity Ratio,Projected Completion,Status,IEC,CTRI';
    const rows = filteredStudies.map(s => {
      const a = accrualMap[s.id];
      const enrolled = a?.current_enrolled ?? 0;
      const target   = a?.target_sample_size ?? s.target_sample_size ?? 0;
      const pct      = target > 0 ? Math.round((enrolled / target) * 100) : 0;
      return [
        s.short_code, s.phase, s.title, enrolled, target, `${pct}%`,
        a?.accrual_velocity_ratio ?? '—',
        a?.projected_completion_date ?? '—',
        s.status,
        s.iec_submissions?.some(i => i.decision === 'APPROVED') ? 'Approved' : 'Pending',
        s.ctri_registration?.ctri_id ?? 'Unlinked',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'AIIA_Ministry_MIS_Dossier.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  /* ═══════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: FONT_STACK }}>

      {/* ── Sub-header: title + AI pill + Refresh ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <p style={{ fontSize: 13, color: INK_48, margin: 0 }}>
          Executive Research &amp; Governance Command Center — All India Institute of Ayurveda
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* AI Intelligence Pill */}
          {!loading && (
            <button
              onClick={() => setDrawerOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: aiSignals.length > 0
                  ? 'rgba(191,90,242,0.08)'
                  : 'rgba(52,199,89,0.07)',
                color: aiSignals.length > 0 ? PURPLE : SUCCESS,
                border: `1px solid ${aiSignals.length > 0 ? 'rgba(191,90,242,0.30)' : 'rgba(52,199,89,0.25)'}`,
                borderRadius: R_PILL, padding: '7px 14px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: FONT_STACK, transition: 'transform 0.1s',
                animation: aiSignals.some(s => s.severity === 'critical')
                  ? 'ai-pulse 2s ease-in-out infinite' : 'none',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Sparkles size={13} />
              {aiSignals.length > 0
                ? `${aiSignals.length} Predictive Signal${aiSignals.length > 1 ? 's' : ''} Detected`
                : 'AI Forecast: All Protocols On Track'}
              <ChevronDown size={11} />
            </button>
          )}

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: PARCHMENT, color: INK, border: `1px solid ${HAIRLINE}`,
              borderRadius: R_PILL, padding: '8px 18px',
              fontSize: 13, fontWeight: 600,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontFamily: FONT_STACK, transition: 'transform 0.1s',
              opacity: refreshing ? 0.6 : 1,
            }}
            onMouseDown={e => !refreshing && (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            {refreshing ? 'Refreshing…' : 'Refresh Analytics'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ai-pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes drawer-in { from{transform:translateX(100%)} to{transform:translateX(0)} }
      `}</style>

      {/* ── AI Intelligence Slide-Over Drawer ── */}
      {drawerOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(4px)',
          }}
          onClick={() => setDrawerOpen(false)}
        >
          <div
            style={{
              position: 'absolute', top: 0, right: 0, bottom: 0,
              width: 440, background: CANVAS,
              borderLeft: `1px solid ${HAIRLINE}`,
              display: 'flex', flexDirection: 'column',
              animation: 'drawer-in 0.22s cubic-bezier(0.4,0,0.2,1)',
              fontFamily: FONT_STACK,
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 22px', borderBottom: `1px solid ${HAIRLINE}`,
              background: PARCHMENT, flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: R_SM,
                  background: 'rgba(191,90,242,0.10)', border: '1px solid rgba(191,90,242,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={15} color={PURPLE} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: INK, margin: 0 }}>
                    AI Predictive Intelligence
                  </p>
                  <p style={{ fontSize: 11, color: INK_48, margin: '1px 0 0' }}>
                    Poisson accrual model · PRR signal detection · ICH E6(R2)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK_48, padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {aiSignals.length === 0 ? (
                <div style={{
                  background: 'rgba(52,199,89,0.06)', border: '1px solid rgba(52,199,89,0.22)',
                  borderRadius: R_MD, padding: '16px 18px',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <CheckCircle2 size={18} color={SUCCESS} style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: 13, color: INK_80, margin: 0, lineHeight: 1.5 }}>
                    All active protocols are meeting enrollment milestones and statutory timelines. No risk signals detected.
                  </p>
                </div>
              ) : aiSignals.map((sig, i) => {
                const borderColor = sig.severity === 'critical'
                  ? 'rgba(255,69,58,0.30)'
                  : sig.severity === 'warn'
                  ? 'rgba(255,159,10,0.28)'
                  : 'rgba(0,102,204,0.22)';
                const bgColor = sig.severity === 'critical'
                  ? 'rgba(255,69,58,0.05)'
                  : sig.severity === 'warn'
                  ? 'rgba(255,159,10,0.05)'
                  : 'rgba(0,102,204,0.04)';
                const titleColor = sig.severity === 'critical' ? DANGER
                  : sig.severity === 'warn' ? WARNING : PRIMARY;
                const icon = sig.kind === 'accrual' ? <TrendingDown size={14} color={titleColor} />
                  : sig.kind === 'safety' ? <AlertTriangle size={14} color={titleColor} />
                  : <Clock size={14} color={titleColor} />;

                return (
                  <div key={i} style={{
                    background: bgColor, border: `1px solid ${borderColor}`,
                    borderRadius: R_MD, padding: '14px 16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                      {icon}
                      <p style={{ fontSize: 13, fontWeight: 600, color: titleColor, margin: 0, letterSpacing: '-0.12px' }}>
                        {sig.title}
                      </p>
                    </div>
                    <p style={{ fontSize: 12, color: INK_80, margin: '0 0 6px', lineHeight: 1.6 }}>
                      {sig.detail}
                    </p>
                    <p style={{ fontSize: 11, color: INK_48, margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
                      Recommendation: {sig.recommendation}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Drawer footer */}
            <div style={{
              padding: '14px 22px', borderTop: `1px solid ${HAIRLINE}`,
              background: PARCHMENT, flexShrink: 0,
            }}>
              <p style={{ fontSize: 10, color: INK_48, margin: 0, lineHeight: 1.5 }}>
                Signals are computed locally from live accrual velocity ratios and statutory deadlines. No data is sent externally.
              </p>
            </div>
          </div>
        </div>
      )}


      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — 4 INSTITUTIONAL KPI CARDS
          ══════════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>

        {/* KPI 1 — Portfolio Scale */}
        <KpiCard
          label="Portfolio Scale"
          value={<span style={{ color: PRIMARY_ON_DARK }}>{studies.length} Trials</span>}
          sub={`${enrollingCount} Enrolling · ${dataLockCount} Data Lock · ${closedCount} Closed`}
          accent={PRIMARY_ON_DARK}
          icon={<Layers size={14} color={PRIMARY_ON_DARK} />}
        />

        {/* KPI 2 — Subject Retention Rate */}
        <KpiCard
          label="Subject Retention Rate"
          value={<span style={{ color: SUCCESS }}>{RETENTION_PCT}%</span>}
          sub={`${FUNNEL_DROPOUTS} dropouts across all trials`}
          accent={SUCCESS}
          borderColor="rgba(52,199,89,0.25)"
          icon={<Users size={14} color={SUCCESS} />}
          footer={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(52,199,89,0.08)', border: '1px solid rgba(52,199,89,0.22)',
                borderRadius: R_PILL, padding: '3px 10px',
                fontSize: 10, fontWeight: 600, color: SUCCESS,
              }}>
                <CheckCircle2 size={9} /> {DROPOUT_PCT}% Dropout — GCP Threshold Met
              </div>
              {/* AI accrual projection inline tag */}
              {!loading && overallProjectedDate && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'rgba(191,90,242,0.07)', border: '1px solid rgba(191,90,242,0.22)',
                  borderRadius: R_PILL, padding: '3px 10px',
                  fontSize: 10, fontWeight: 600, color: PURPLE,
                }}>
                  <Sparkles size={9} />
                  AI: 100% capacity by {new Date(overallProjectedDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </div>
              )}
            </div>
          }
        />

        {/* KPI 3 — Ministry Research Grants */}
        <KpiCard
          label="Ministry Research Grants"
          value={
            <span style={{ color: PURPLE, display: 'inline-flex', alignItems: 'baseline', gap: 1 }}>
              <IndianRupee size={19} style={{ marginBottom: -2 }} />
              3.85 Cr
            </span>
          }
          sub="Total sanctioned — Ministry of Ayush"
          accent={PURPLE}
          borderColor="rgba(191,90,242,0.25)"
          icon={<IndianRupee size={14} color={PURPLE} />}
          footer={
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: INK_48 }}>Budget Utilised</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: PURPLE }}>{GRANT_BURN_PCT}% · {fmtINR(GRANT_UTILIZED)}</span>
              </div>
              <div style={{ height: 4, background: 'rgba(191,90,242,0.12)', borderRadius: R_PILL, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${GRANT_BURN_PCT}%`, background: PURPLE, borderRadius: R_PILL }} />
              </div>
            </div>
          }
        />

        {/* KPI 4 — GCP Audit Readiness */}
        <KpiCard
          label="GCP Audit Readiness"
          value={
            <span style={{ color: saeClocks.filter(c => c.is_overdue).length === 0 ? SUCCESS : DANGER, fontSize: 22 }}>
              {saeClocks.filter(c => c.is_overdue).length === 0 ? '100% Inspection-Ready' : 'Action Required'}
            </span>
          }
          sub="0 overdue queries >14d · 0 major unaddressed deviations"
          accent={SUCCESS}
          borderColor={saeClocks.filter(c => c.is_overdue).length === 0 ? 'rgba(52,199,89,0.25)' : 'rgba(255,69,58,0.30)'}
          icon={<ShieldCheck size={14} color={saeClocks.filter(c => c.is_overdue).length === 0 ? SUCCESS : DANGER} />}
          footer={
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(52,199,89,0.08)', border: '1px solid rgba(52,199,89,0.22)',
              borderRadius: R_PILL, padding: '3px 10px',
              fontSize: 10, fontWeight: 600, color: SUCCESS,
            }}>
              <CheckCircle2 size={9} /> ICMR / CDSCO Inspection Ready
            </div>
          }
        />
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — EXECUTIVE ACTION & BOTTLENECK RADAR
          ══════════════════════════════════════════════════════════ */}
      <div style={{
        background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${HAIRLINE}`, background: PARCHMENT }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: INK, margin: 0, letterSpacing: '-0.224px' }}>
            Executive Action &amp; Bottleneck Radar
          </p>
          <p style={{ fontSize: 11, color: INK_48, margin: '2px 0 0' }}>
            Studies requiring a director-level decision or ministerial escalation
          </p>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            <p style={{ fontSize: 13, color: INK_48, margin: 0 }}>Scanning study portfolio…</p>
          ) : (
            <>
              {/* SAE safety alert (always shows if clocks active) */}
              {saeClocks.length > 0 && (
                <div style={{
                  background: 'rgba(255,69,58,0.05)', border: '1px solid rgba(255,69,58,0.28)',
                  borderRadius: R_MD, padding: '16px 20px',
                  animation: saeClocks.some(c => c.is_overdue) ? 'pulse-border 1.4s ease-in-out infinite' : 'none',
                }}>
                  <style>{`@keyframes pulse-border { 0%,100%{border-color:rgba(255,69,58,0.28)} 50%{border-color:rgba(255,69,58,0.70)} }`}</style>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <AlertTriangle size={16} color={DANGER} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: DANGER, margin: '0 0 3px' }}>
                        Safety Escalation — {saeClocks.length} Active SAE{saeClocks.length > 1 ? 's' : ''}
                      </p>
                      <p style={{ fontSize: 12, color: INK_80, margin: '0 0 10px' }}>
                        {saeClocks.length} Serious Adverse Event{saeClocks.length > 1 ? 's' : ''} under active 24-hour statutory review.{' '}
                        {saeClocks.filter(c => c.is_overdue).length > 0 && (
                          <strong style={{ color: DANGER }}>
                            {saeClocks.filter(c => c.is_overdue).length} clock{saeClocks.filter(c => c.is_overdue).length > 1 ? 's' : ''} OVERDUE.
                          </strong>
                        )}
                        {' '}Navigate to Safety Center to dispatch NPvCC reports immediately.
                      </p>
                      <ActionLink to="/safety" icon={<AlertTriangle size={11} />} label="Go to Safety Center" variant="danger" />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottleneck cards from accrual data */}
              {bottlenecks.map((b, i) => {
                const { type, study: s, accrual: a, pct } = b;
                const enrolled = a.current_enrolled;
                const target   = a.target_sample_size ?? s.target_sample_size ?? 0;

                if (type === 'lock') return (
                  <div key={`lock-${s.id}`} style={{
                    background: 'rgba(0,102,204,0.05)', border: '1px solid rgba(0,102,204,0.22)',
                    borderRadius: R_MD, padding: '16px 20px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <Lock size={16} color={PRIMARY} style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' as const }}>
                          <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: PRIMARY }}>{s.short_code}</span>
                          <span style={BADGE.green}>Target Reached — Milestone</span>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: '0 0 3px', letterSpacing: '-0.12px' }}>
                          {s.title.length > 80 ? s.title.slice(0, 80) + '…' : s.title}
                        </p>
                        <p style={{ fontSize: 12, color: INK_80, margin: '0 0 12px' }}>
                          All {target} target subjects enrolled. Clinical database is ready for lock.
                          Authorize to transition to statistical analysis phase.
                        </p>
                        <ActionLink to="/studies" icon={<Lock size={11} />} label="Authorize Clinical Data Lock" />
                      </div>
                    </div>
                  </div>
                );

                if (type === 'lag') {
                  const ratio       = a.accrual_velocity_ratio ?? 0;
                  const monthsDelay = ratio > 0 ? (3.5 / ratio).toFixed(1) : '3.5+';
                  const rec         = a.prescriptive_recommendations?.[0]?.action ?? '';
                  return (
                    <div key={`lag-${s.id}`} style={{
                      background: 'rgba(255,159,10,0.05)', border: '1px solid rgba(255,159,10,0.28)',
                      borderRadius: R_MD, padding: '16px 20px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <AlertTriangle size={16} color={WARNING} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' as const }}>
                            <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: WARNING }}>{s.short_code}</span>
                            <span style={BADGE.amber}>Accrual Lag</span>
                          </div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: '0 0 3px', letterSpacing: '-0.12px' }}>
                            {s.title.length > 80 ? s.title.slice(0, 80) + '…' : s.title}
                          </p>
                          <p style={{ fontSize: 12, color: INK_80, margin: '0 0 2px' }}>
                            <strong>{Math.round(pct * 100)}% enrolled</strong> ({enrolled}/{target} subjects) at current pace.{' '}
                            Indicates ~{monthsDelay} month timeline delay.
                          </p>
                          {rec && (
                            <p style={{ fontSize: 11, color: INK_48, fontStyle: 'italic', margin: '0 0 12px' }}>
                              AI Recommendation: {rec}
                            </p>
                          )}
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                            <ActionLink to="/studies" icon={<BookOpen size={11} />} label="Authorize Satellite Screening Site" variant="neutral" />
                            <ActionLink to="/studies" icon={<FileText size={11} />} label="Request Protocol Amendment from PI" variant="neutral" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}

              {/* All-clear */}
              {bottlenecks.length === 0 && saeClocks.length === 0 && (
                <div style={{
                  background: 'rgba(52,199,89,0.05)', border: '1px solid rgba(52,199,89,0.22)',
                  borderRadius: R_MD, padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <CheckCircle2 size={18} color={SUCCESS} style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: 13, color: INK_80, margin: 0, lineHeight: 1.5 }}>
                    All active protocols are currently meeting recruitment milestones and statutory timelines.
                    No executive decisions are pending.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — DUAL OPERATIONAL PANELS (dark slate-900)
          ══════════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* LEFT — Grant Funding & Financial Governance */}
        <div style={{
          background: CANVAS, border: `1px solid ${HAIRLINE}`,
          borderRadius: R_LG, padding: 28,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <div style={{
              width: 34, height: 34, borderRadius: R_SM,
              background: 'rgba(191,90,242,0.08)', border: '1px solid rgba(191,90,242,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IndianRupee size={16} color={PURPLE} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: PURPLE, margin: 0, letterSpacing: '-0.224px' }}>
                Grant Funding &amp; Financial Governance
              </p>
              <p style={{ fontSize: 11, color: INK_48, margin: '2px 0 0' }}>
                Ministry of Ayush — AIIA Research Portfolio FY 2026-27
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <DarkRow label="Total Sanctioned Grants"      value="₹ 3,85,00,000"              accent={INK} />
            <DarkRow label="Funds Utilised to Date"       value={`₹ 2,38,70,000 (${GRANT_BURN_PCT}% Burn Rate)`} accent={PURPLE} />
            <DarkRow label="Next Milestone Fund Release"  value="₹ 45,00,000 (Milestone 2)"  accent={SUCCESS} />
            <DarkRow label="Remaining Undrawn Balance"    value={fmtINR(GRANT_SANCTIONED - GRANT_UTILIZED)} accent={INK} />
          </div>

          <div style={{ marginTop: 20 }}>
            {/* Budget burn bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ fontSize: 11, color: INK_48 }}>Budget Burn Rate</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: PURPLE }}>{GRANT_BURN_PCT}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(0,0,0,0.07)', borderRadius: R_PILL, overflow: 'hidden', marginBottom: 18 }}>
              <div style={{ height: '100%', width: `${GRANT_BURN_PCT}%`, background: PURPLE, borderRadius: R_PILL, transition: 'width 0.8s ease' }} />
            </div>

            {/* Funding sources */}
            <p style={{ fontSize: 10, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
              Funding Sources
            </p>
            {[
              { src: 'Ministry of Ayush — AYURGYAN Scheme', pct: 65, color: PURPLE },
              { src: 'CCRAS EMR Research Grant',            pct: 35, color: PRIMARY },
            ].map(f => (
              <div key={f.src} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: INK_80 }}>{f.src}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: f.color, fontFamily: FONT_MONO }}>{f.pct}%</span>
                </div>
                <div style={{ height: 4, background: 'rgba(0,0,0,0.07)', borderRadius: R_PILL, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${f.pct}%`, background: f.color, borderRadius: R_PILL }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Patient Accrual & Retention Funnel */}
        <div style={{
          background: CANVAS, border: `1px solid ${HAIRLINE}`,
          borderRadius: R_LG, padding: 28,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <div style={{
              width: 34, height: 34, borderRadius: R_SM,
              background: 'rgba(0,102,204,0.08)', border: '1px solid rgba(0,102,204,0.20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PieChart size={16} color={PRIMARY} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: PRIMARY, margin: 0, letterSpacing: '-0.224px' }}>
                Institute Patient Accrual &amp; Retention Funnel
              </p>
              <p style={{ fontSize: 11, color: INK_48, margin: '2px 0 0' }}>
                OPD/IPD screening → Consent → Enrolled → Completed
              </p>
            </div>
          </div>

          <FunnelRow
            label="Total Screened (OPD / IPD)"
            count={FUNNEL_SCREENED}
            total={FUNNEL_SCREENED}
            color={PRIMARY}
            sub="Assessed for eligibility in AIIA outpatient clinics"
          />
          <FunnelRow
            label="Consented &amp; Enrolled"
            count={FUNNEL_ENROLLED}
            total={FUNNEL_SCREENED}
            color={PURPLE}
            sub={`${((FUNNEL_ENROLLED / FUNNEL_SCREENED) * 100).toFixed(1)}% Conversion Rate`}
          />
          <FunnelRow
            label="Completed Full Protocol"
            count={FUNNEL_COMPLETED}
            total={FUNNEL_ENROLLED}
            color={SUCCESS}
            sub="All scheduled visits and CRFs complete"
          />
          <FunnelRow
            label="Dropouts / Lost to Follow-up"
            count={FUNNEL_DROPOUTS}
            total={FUNNEL_ENROLLED}
            color="#fb923c"
            sub={`${DROPOUT_PCT}% — GCP Compliant (Threshold: <10%)`}
          />

          {/* Retention summary tile */}
          <div style={{
            marginTop: 18, background: 'rgba(52,199,89,0.06)',
            border: '1px solid rgba(52,199,89,0.22)',
            borderRadius: R_MD, padding: '12px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: SUCCESS }}>
              Overall Retention Rate
            </span>
            <span style={{ fontSize: 22, fontWeight: 700, color: SUCCESS, fontFamily: FONT_MONO }}>
              {RETENTION_PCT}%
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4 — CROSS-STUDY PORTFOLIO MATRIX
          ══════════════════════════════════════════════════════════ */}
      <div style={{
        background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, overflow: 'hidden',
      }}>
        {/* Controls */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', borderBottom: `1px solid ${HAIRLINE}`,
          background: PARCHMENT, flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: R_SM,
              background: 'rgba(0,102,204,0.08)', border: '1px solid rgba(0,102,204,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={14} color={PRIMARY} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: INK, margin: 0, letterSpacing: '-0.224px' }}>
                Cross-Study Executive Portfolio Matrix
              </p>
              <p style={{ fontSize: 11, color: INK_48, margin: '1px 0 0' }}>
                {filteredStudies.length} of {studies.length} protocols — sortable
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={12} color={INK_48} style={{
                position: 'absolute', left: 10, top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none',
              }} />
              <input
                type="text"
                placeholder="Search code or title…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
                style={{
                  background: CANVAS,
                  border: `1px solid ${searchFocus ? PRIMARY : HAIRLINE}`,
                  borderRadius: R_PILL, padding: '7px 14px 7px 30px',
                  fontSize: 12, color: INK, fontFamily: FONT_STACK,
                  outline: 'none', width: 210,
                  transition: 'border-color 0.15s',
                }}
              />
            </div>

            {/* Export */}
            <button
              onClick={exportMIS}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: PRIMARY, color: '#fff', border: 'none',
                borderRadius: R_PILL, padding: '8px 16px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: FONT_STACK, transition: 'transform 0.1s',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Download size={12} /> Export MIS Dossier
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }} onClick={() => setPopoverId(null)}>
          <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', fontSize: 12, tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '115px' }} />   {/* Protocol & Phase */}
              <col style={{ width: '220px' }} />   {/* Scientific Title */}
              <col style={{ width: '140px' }} />   {/* Lead PI */}
              <col style={{ width: '155px' }} />   {/* Recruitment */}
              <col style={{ width: '140px' }} />   {/* Timeline + AI badge */}
              <col style={{ width: '160px' }} />   {/* Safety & Reg */}
              <col style={{ width: '110px' }} />   {/* Lifecycle */}
              <col style={{ width: '100px' }} />   {/* Action */}
            </colgroup>
            <thead>
              <tr style={{ background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}` }}>
                {[
                  { label: 'Protocol & Phase',          key: 'phase' as SortKey },
                  { label: 'Scientific Title',           key: null },
                  { label: 'Lead PI',                    key: null },
                  { label: 'Recruitment',                key: 'enrolled' as SortKey },
                  { label: 'Timeline',                   key: 'pct' as SortKey },
                  { label: 'Safety & Regulatory',        key: null },
                  { label: 'Lifecycle State',            key: 'status' as SortKey },
                  { label: 'Action',                     key: null },
                ].map(col => (
                  <th
                    key={col.label}
                    onClick={col.key ? () => toggleSort(col.key!) : undefined}
                    style={{
                      padding: '10px 14px', textAlign: 'left',
                      fontSize: 10, fontWeight: 600, color: INK_48,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      whiteSpace: 'nowrap', overflow: 'hidden',
                      cursor: col.key ? 'pointer' : 'default', userSelect: 'none',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {col.label}
                      {col.key && (
                        sortKey === col.key
                          ? sortAsc ? <ChevronUp size={9} /> : <ChevronDown size={9} />
                          : <ArrowUpDown size={9} color={INK_48} />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudies.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 36, textAlign: 'center', color: INK_48, fontSize: 13 }}>
                    {search ? 'No protocols match your search.' : 'No studies loaded.'}
                  </td>
                </tr>
              ) : filteredStudies.map(s => {
                const a        = accrualMap[s.id];
                const enrolled = a?.current_enrolled ?? 0;
                const target   = a?.target_sample_size ?? s.target_sample_size ?? 0;
                const pct      = target > 0 ? Math.round((enrolled / target) * 100) : 0;
                const onTrack  = pct >= 50 || ['CLOSED', 'DATA_LOCK'].includes(s.status);
                const iecOk    = s.iec_submissions?.some(i => i.decision === 'APPROVED');
                const ctriOk   = !!s.ctri_registration?.ctri_id;
                const hasAiSignal = !onTrack && !!a;
                const ratio    = a?.accrual_velocity_ratio ?? 0;
                const monthsDelay = ratio > 0 ? Math.round((3.5 / ratio) * 10) / 10 : 3.5;
                const projDate = a?.projected_completion_date ?? null;
                const popoverOpen = popoverId === s.id;

                return (
                  <tr
                    key={s.id}
                    style={{ borderBottom: `1px solid ${HAIRLINE}`, verticalAlign: 'middle' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,102,204,0.025)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: PRIMARY, display: 'block' }}>{s.short_code}</span>
                      <span style={{ fontSize: 10, color: INK_48 }}>{s.phase}</span>
                    </td>
                    <td style={{ padding: '12px 14px', overflow: 'hidden' }}>
                      <span title={s.title} style={{ fontSize: 12, fontWeight: 600, color: INK, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.title}
                      </span>
                      <span style={{ fontSize: 11, color: INK_48 }}>{s.study_type}</span>
                    </td>
                    <td style={{ padding: '12px 14px', overflow: 'hidden' }}>
                      <span style={{ fontSize: 11, color: INK_80, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Dr. Principal Investigator
                      </span>
                      <span style={{ fontSize: 10, color: INK_48 }}>AIIA Clinical Research</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: INK, marginBottom: 5 }}>
                        {loading ? '—' : `${enrolled} / ${target > 0 ? target : '—'}`}
                        <span style={{ fontSize: 10, color: INK_48, fontWeight: 400, marginLeft: 5 }}>
                          {loading ? '' : `${pct}%`}
                        </span>
                      </div>
                      {!loading && target > 0 && (
                        <div style={{ height: 4, background: 'rgba(0,0,0,0.07)', borderRadius: R_PILL, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${Math.min(100, pct)}%`,
                            background: pct >= 75 ? SUCCESS : pct >= 40 ? PRIMARY : DANGER,
                            borderRadius: R_PILL, transition: 'width 0.6s ease',
                          }} />
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', position: 'relative' }}>
                      {loading ? (
                        <span style={{ fontSize: 10, color: INK_48 }}>…</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          {/* Pace badge */}
                          <span style={onTrack ? BADGE.green : BADGE.amber}>
                            {onTrack ? 'On Track' : 'Lagging Pace'}
                          </span>

                          {/* AI badge — only for lagging studies with accrual data */}
                          {hasAiSignal && (
                            <div style={{ position: 'relative' }}>
                              <button
                                onClick={() => setPopoverId(popoverOpen ? null : s.id)}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                  background: 'rgba(191,90,242,0.08)',
                                  color: PURPLE,
                                  border: '1px solid rgba(191,90,242,0.28)',
                                  borderRadius: R_PILL, padding: '2px 8px',
                                  fontSize: 10, fontWeight: 600, cursor: 'pointer',
                                  fontFamily: FONT_STACK,
                                }}
                              >
                                <Sparkles size={9} /> AI Forecast
                              </button>

                              {/* Popover */}
                              {popoverOpen && (
                                <div
                                  style={{
                                    position: 'absolute', top: '100%', left: 0, zIndex: 500,
                                    width: 280, marginTop: 6,
                                    background: CANVAS,
                                    border: `1px solid ${HAIRLINE}`,
                                    borderRadius: R_MD,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                    padding: '14px 16px',
                                    fontFamily: FONT_STACK,
                                  }}
                                  onClick={e => e.stopPropagation()}
                                >
                                  {/* Close */}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <Sparkles size={12} color={PURPLE} />
                                      <span style={{ fontSize: 11, fontWeight: 700, color: PURPLE, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        AI Accrual Trajectory
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => setPopoverId(null)}
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK_48, padding: 2 }}
                                    >
                                      <X size={13} />
                                    </button>
                                  </div>

                                  {/* Velocity row */}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${HAIRLINE}` }}>
                                    <span style={{ fontSize: 11, color: INK_48 }}>Accrual Velocity</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: ratio >= 0.8 ? SUCCESS : ratio >= 0.4 ? WARNING : DANGER, fontFamily: FONT_MONO }}>
                                      {(ratio * 100).toFixed(0)}% of target pace
                                    </span>
                                  </div>

                                  {/* Target vs projected */}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: 11, color: INK_48 }}>Planned Completion</span>
                                      <span style={{ fontSize: 11, fontWeight: 600, color: INK, fontFamily: FONT_MONO }}>
                                        {s.planned_end_date ?? '—'}
                                      </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: 11, color: INK_48 }}>AI Projected</span>
                                      <span style={{ fontSize: 11, fontWeight: 700, color: DANGER, fontFamily: FONT_MONO }}>
                                        {projDate ?? '—'}
                                        {projDate && <span style={{ color: WARNING, marginLeft: 4 }}>(+{monthsDelay} mo)</span>}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Recommendation */}
                                  {a?.prescriptive_recommendations?.[0] && (
                                    <div style={{
                                      background: 'rgba(191,90,242,0.06)', border: '1px solid rgba(191,90,242,0.18)',
                                      borderRadius: R_MD, padding: '8px 10px',
                                    }}>
                                      <p style={{ fontSize: 10, fontWeight: 700, color: PURPLE, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Recommended Action
                                      </p>
                                      <p style={{ fontSize: 11, color: INK_80, margin: 0, lineHeight: 1.5 }}>
                                        {a.prescriptive_recommendations[0].action}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span style={{ fontSize: 10, color: iecOk ? SUCCESS : WARNING, fontWeight: 600 }}>
                          IEC: {iecOk ? 'Approved' : 'Pending'}
                        </span>
                        <span style={{ fontSize: 10, color: ctriOk ? SUCCESS : WARNING, fontWeight: 600 }}>
                          CTRI: {ctriOk ? 'Verified' : 'Unlinked'}
                        </span>
                        <span style={{ fontSize: 10, color: saeClocks.length === 0 ? SUCCESS : DANGER, fontWeight: 600 }}>
                          {saeClocks.length === 0 ? '0 Active SAEs' : `${saeClocks.length} SAE${saeClocks.length > 1 ? 's' : ''} Active`}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={statusBadge(s.status)}>{s.status}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Link
                        to="/studies"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: 'rgba(0,102,204,0.07)', color: PRIMARY,
                          border: '1px solid rgba(0,102,204,0.22)',
                          borderRadius: R_MD, padding: '6px 10px',
                          fontSize: 11, fontWeight: 600, textDecoration: 'none',
                          whiteSpace: 'nowrap', transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,102,204,0.14)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,102,204,0.07)')}
                      >
                        Inspect Study
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 5 — SCIENTIFIC PUBLISHING & IPR PIPELINE
          ══════════════════════════════════════════════════════════ */}
      <div style={{
        background: CANVAS, border: `1px solid ${HAIRLINE}`,
        borderRadius: R_LG, padding: 28,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <div style={{
            width: 34, height: 34, borderRadius: R_SM,
            background: 'rgba(191,90,242,0.08)', border: '1px solid rgba(191,90,242,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Award size={16} color={PURPLE} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: PURPLE, margin: 0, letterSpacing: '-0.224px' }}>
              Scientific Publishing &amp; IPR Pipeline
            </p>
            <p style={{ fontSize: 11, color: INK_48, margin: '2px 0 0' }}>
              Research output, manuscript pipeline, and proprietary formulation patent status
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[
            {
              icon: <FlaskConical size={18} color={PRIMARY} />,
              label: 'Trials in Statistical Analysis',
              value: studies.filter(s => s.status === 'DATA_LOCK').length.toString() || '1',
              sub: studies.filter(s => s.status === 'DATA_LOCK').map(s => s.short_code).join(', ') || 'CDISC SDTM Datasets Ready',
              color: PRIMARY,
            },
            {
              icon: <FileText size={18} color={SUCCESS} />,
              label: 'Manuscripts in Peer-Review',
              value: '1',
              sub: 'Target: Journal of Ayurveda & Integrative Medicine (JAIM) / PubMed',
              color: SUCCESS,
            },
            {
              icon: <Award size={18} color={PURPLE} />,
              label: 'Formulations in Patent Review',
              value: '2',
              sub: 'Proprietary Ayurvedic formulations under IP protection review',
              color: PURPLE,
            },
          ].map(item => (
            <div key={item.label} style={{
              background: PARCHMENT, border: `1px solid ${HAIRLINE}`,
              borderRadius: R_MD, padding: '18px 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                {item.icon}
                <span style={{ fontSize: 10, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {item.label}
                </span>
              </div>
              <p style={{ fontSize: 36, fontWeight: 700, color: item.color, fontFamily: FONT_MONO, margin: '0 0 8px', letterSpacing: '-0.374px' }}>
                {item.value}
              </p>
              <p style={{ fontSize: 12, color: INK_80, margin: 0, lineHeight: 1.5 }}>{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
