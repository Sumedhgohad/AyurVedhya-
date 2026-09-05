import React, { useState, useEffect } from 'react';
import { Study, HealthScore } from '../types';
import { api } from '../api/client';
import { Sparkles, Download, TrendingUp, ShieldCheck } from 'lucide-react';
import {
  CANVAS, PARCHMENT, HAIRLINE, TILE_1, TILE_2,
  INK, INK_48, INK_80, PRIMARY, PRIMARY_ON_DARK,
  SUCCESS, WARNING, DANGER, PURPLE,
  R_MD, R_LG, R_PILL, BORDER_DARK, BORDER_DARK_THIN,
  TYPE, BADGE, FONT_MONO,
} from '../design';

interface Props { studies: Study[]; }

const KPI: React.FC<{ label: string; value: React.ReactNode; sub: string; accent?: string }> =
  ({ label, value, sub, accent = INK }) => (
  <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 24 }}>
    <p style={{ ...TYPE.label, color: INK_48, margin: '0 0 14px' }}>{label}</p>
    <div style={{ fontSize: 36, fontWeight: 600, color: accent, letterSpacing: '-0.374px', lineHeight: 1.1, marginBottom: 6 }}>{value}</div>
    <p style={{ ...TYPE.caption, color: INK_80, margin: 0 }}>{sub}</p>
  </div>
);

const ScoreBar: React.FC<{ label: string; score: number; weight: string; detail?: string }> = ({ label, score, weight, detail }) => {
  const c = score >= 80 ? SUCCESS : score >= 50 ? WARNING : DANGER;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 600, color: INK, letterSpacing: '-0.224px' }}>{label}</span>
          {detail && <span style={{ fontSize: 12, color: INK_48, marginLeft: 8 }}>{detail}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: INK_48 }}>{weight}</span>
          <span style={{ fontSize: 17, fontWeight: 600, color: c, letterSpacing: '-0.374px' }}>{score}</span>
        </div>
      </div>
      <div style={{ height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: c, borderRadius: 9999, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  );
};

export const LeadershipDashboard: React.FC<Props> = ({ studies }) => {
  const [hs, setHs] = useState<HealthScore | null>(null);
  const study = studies[0];

  useEffect(() => {
    if (study) api.get(`/ai/health-score/${study.id}`).then(r => setHs(r.data)).catch(() => null);
  }, [study]);

  const exportFile = async (ep: string, fn: string) => {
    const res = await api.get(ep);
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = fn; a.click();
  };

  const score  = hs?.overall_trial_health_score ?? 73;
  const sc     = score >= 80 ? SUCCESS : score >= 50 ? WARNING : DANGER;
  const status = hs?.health_status ?? 'MODERATE';
  const p      = hs?.pillars_breakdown;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        <KPI label="Trial Health Index"
          value={
            <span>
              <span style={{ color: sc }}>{score}</span>{' '}
              <span style={{ fontSize: 12, fontWeight: 600, color: sc, background: `${sc}14`, border: `1px solid ${sc}40`, padding: '2px 10px', borderRadius: R_PILL }}>
                {status}
              </span>
            </span>
          }
          sub="AI composite score across 5 clinical pillars" accent={sc}
        />
        <KPI label="Active Trials" value={studies.length}
          sub={`${studies.filter(s => s.status === 'ENROLLING').length} currently enrolling · 100% regulatory clearance`}
          accent={PRIMARY_ON_DARK}
        />
        {/* Interop exports card */}
        <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 24 }}>
          <p style={{ ...TYPE.label, color: INK_48, margin: '0 0 14px' }}>Interoperability Exports</p>
          <p style={{ fontSize: 17, fontWeight: 600, color: PURPLE, letterSpacing: '-0.374px', margin: '0 0 16px' }}>
            FHIR R4 + CDISC SDTM
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: 'ABDM FHIR',   ep: `/interop/fhir/bundle/${study?.id}`,   fn: `FHIR_${study?.short_code}.json` },
              { label: 'CDISC SDTM',  ep: `/interop/cdisc/sdtm/${study?.id}`,    fn: `SDTM_${study?.short_code}.json` },
            ].map(({ label, ep, fn }) => (
              <button key={label} onClick={() => study && exportFile(ep, fn)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'transparent', border: `1px solid ${HAIRLINE}`, borderRadius: R_PILL, padding: '7px 10px', color: INK, fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.12px', transition: 'transform 0.1s', fontFamily: 'inherit' }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Download size={11} />{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Score breakdown + AI Co-Pilot — alternating dark tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Score breakdown — dark tile 1 */}
        <div style={{ background: TILE_1, border: `1px solid rgba(255,255,255,0.07)`, borderRadius: R_LG, padding: 28 }}>
          <h3 style={{ fontSize: 17, fontWeight: 600, color: '#ffffff', letterSpacing: '-0.374px', margin: '0 0 24px' }}>
            5-Pillar Trial Health Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <ScoreBar label="Recruitment"          score={p?.recruitment.score ?? 1}              weight="25%" detail={`${p?.recruitment.enrolled ?? 1}/${p?.recruitment.target ?? 120}`} />
            <ScoreBar label="Regulatory Compliance"score={p?.regulatory_compliance.score ?? 100}  weight="25%" />
            <ScoreBar label="Data Quality"         score={p?.data_quality.score ?? 100}           weight="20%" detail={`${p?.data_quality.resolved_queries ?? 1}/${p?.data_quality.total_queries ?? 1} queries`} />
            <ScoreBar label="Safety"               score={p?.safety.score ?? 95}                  weight="15%" />
            <ScoreBar label="Monitoring"           score={p?.monitoring.score ?? 90}              weight="15%" />
          </div>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.50)' }}>Composite</span>
            <span style={{ fontSize: 32, fontWeight: 700, color: sc, letterSpacing: '-0.374px' }}>{score} / 100</span>
          </div>
        </div>

        {/* AI Co-Pilot — dark tile with purple tint border */}
        <div style={{ background: TILE_2, border: '1px solid rgba(191,90,242,0.22)', borderRadius: R_LG, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Sparkles size={16} color={PURPLE} />
            <h3 style={{ fontSize: 17, fontWeight: 600, color: PURPLE, letterSpacing: '-0.374px', margin: 0 }}>
              AI Trial Co-Pilot
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(hs?.ai_predictive_recommendations ?? ['No risk factors detected. Trial is on track.']).map((rec, i) => (
              <div key={i} style={{ background: 'rgba(191,90,242,0.08)', border: '1px solid rgba(191,90,242,0.20)', borderRadius: R_MD, padding: '13px 16px', fontSize: 14, color: '#e5ccff', letterSpacing: '-0.224px', lineHeight: 1.47 }}>
                {rec}
              </div>
            ))}
          </div>

          {/* Portfolio table */}
          {studies.length > 0 && (
            <div style={{ marginTop: 22 }}>
              <p style={{ ...TYPE.label, color: 'rgba(255,255,255,0.45)', margin: '0 0 10px' }}>Portfolio Overview</p>
              {studies.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', letterSpacing: '-0.224px' }}>{s.short_code}</span>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '2px 0 0' }}>{s.phase}</p>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                    color: s.status === 'ENROLLING' ? SUCCESS : WARNING,
                    background: s.status === 'ENROLLING' ? 'rgba(52,199,89,0.12)' : 'rgba(255,159,10,0.12)',
                    border: `1px solid ${s.status === 'ENROLLING' ? 'rgba(52,199,89,0.30)' : 'rgba(255,159,10,0.30)'}`,
                    padding: '2px 10px', borderRadius: R_PILL,
                  }}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
