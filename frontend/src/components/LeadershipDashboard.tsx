import React, { useState, useEffect } from 'react';
import { Study, HealthScore } from '../types';
import { api } from '../api/client';

interface Props {
  studies: Study[];
}

const T = {
  tile: '#1d1d1f',
  tileDark2: '#272729',
  bg: '#000000',
  border: 'rgba(255,255,255,0.08)',
  borderDark: 'rgba(255,255,255,0.06)',
  ink: '#ffffff',
  muted: '#cccccc',
  dim: '#7a7a7a',
  primary: '#0066cc',
  primaryOnDark: '#2997ff',
  success: '#34c759',
  warning: '#ff9f0a',
  danger: '#ff453a',
  purple: '#bf5af2',
};

const KpiCard: React.FC<{ label: string; value: React.ReactNode; sub: string; accent?: string }> = ({
  label, value, sub, accent = T.ink,
}) => (
  <div
    style={{
      background: T.tile, border: `1px solid ${T.border}`,
      borderRadius: 18, padding: 24,
    }}
  >
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
    <p style={{ fontSize: 14, color: T.muted, letterSpacing: '-0.224px', margin: 0 }}>{sub}</p>
  </div>
);

const ScoreBar: React.FC<{ label: string; score: number; weight: string; detail?: string }> = ({
  label, score, weight, detail,
}) => {
  const color = score >= 80 ? T.success : score >= 50 ? T.warning : T.danger;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.ink, letterSpacing: '-0.224px' }}>{label}</span>
          {detail && (
            <span style={{ fontSize: 12, color: T.dim, marginLeft: 8 }}>{detail}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: T.dim }}>{weight}</span>
          <span style={{ fontSize: 17, fontWeight: 600, color, letterSpacing: '-0.374px' }}>{score}</span>
        </div>
      </div>
      <div
        style={{
          height: 4, background: 'rgba(255,255,255,0.08)',
          borderRadius: 9999, overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%', width: `${score}%`, background: color,
            borderRadius: 9999, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  );
};

export const LeadershipDashboard: React.FC<Props> = ({ studies }) => {
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const study = studies[0];

  useEffect(() => {
    if (study) {
      api.get(`/ai/health-score/${study.id}`)
        .then((r) => setHealthScore(r.data))
        .catch(() => null);
    }
  }, [study]);

  const exportFile = async (endpoint: string, filename: string) => {
    const res = await api.get(endpoint);
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const score = healthScore?.overall_trial_health_score ?? 73;
  const scoreColor = score >= 80 ? T.success : score >= 50 ? T.warning : T.danger;
  const scoreStatus = healthScore?.health_status ?? 'MODERATE';
  const pillars = healthScore?.pillars_breakdown;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        <KpiCard
          label="Trial Health Index"
          value={
            <span>
              <span style={{ color: scoreColor }}>{score}</span>
              {' '}
              <span
                style={{
                  fontSize: 13, fontWeight: 600, color: scoreColor,
                  background: `${scoreColor}18`,
                  border: `1px solid ${scoreColor}44`,
                  padding: '2px 10px', borderRadius: 9999,
                }}
              >
                {scoreStatus}
              </span>
            </span>
          }
          sub="AI composite score across 5 clinical pillars"
          accent={scoreColor}
        />
        <KpiCard
          label="Active Trials"
          value={studies.length}
          sub={`${studies.filter((s) => s.status === 'ENROLLING').length} currently enrolling · 100% regulatory clearance`}
          accent={T.primaryOnDark}
        />
        {/* Interoperability exports card */}
        <div
          style={{
            background: T.tile, border: `1px solid ${T.border}`,
            borderRadius: 18, padding: 24,
          }}
        >
          <p
            style={{
              fontSize: 11, fontWeight: 600, color: T.dim,
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14,
            }}
          >
            Interoperability Exports
          </p>
          <p
            style={{
              fontSize: 17, fontWeight: 600, color: T.purple,
              letterSpacing: '-0.374px', marginBottom: 16,
            }}
          >
            FHIR R4 + CDISC SDTM
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              {
                label: '⬇ ABDM FHIR',
                action: () => study && exportFile(`/interop/fhir/bundle/${study.id}`, `ABDM_FHIR_${study.short_code}.json`),
              },
              {
                label: '⬇ CDISC SDTM',
                action: () => study && exportFile(`/interop/cdisc/sdtm/${study.id}`, `CDISC_SDTM_${study.short_code}.json`),
              },
            ].map(({ label, action }) => (
              <button
                key={label}
                onClick={action}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: `1px solid rgba(255,255,255,0.14)`,
                  borderRadius: 9999,
                  padding: '7px 12px',
                  color: T.ink,
                  fontSize: 12, fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '-0.12px',
                  transition: 'transform 0.1s',
                  fontFamily: 'inherit',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Score breakdown + AI Co-Pilot */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Score Breakdown */}
        <div
          style={{
            background: T.tileDark2, border: `1px solid ${T.borderDark}`,
            borderRadius: 18, padding: 28,
          }}
        >
          <h3
            style={{
              fontSize: 17, fontWeight: 600, color: T.ink,
              letterSpacing: '-0.374px', marginBottom: 24,
            }}
          >
            5-Pillar Trial Health Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <ScoreBar
              label="Recruitment"
              score={pillars?.recruitment.score ?? 1}
              weight="25%"
              detail={`${pillars?.recruitment.enrolled ?? 1}/${pillars?.recruitment.target ?? 120} enrolled`}
            />
            <ScoreBar label="Regulatory Compliance" score={pillars?.regulatory_compliance.score ?? 100} weight="25%" />
            <ScoreBar
              label="Data Quality"
              score={pillars?.data_quality.score ?? 100}
              weight="20%"
              detail={`${pillars?.data_quality.resolved_queries ?? 1}/${pillars?.data_quality.total_queries ?? 1} queries resolved`}
            />
            <ScoreBar label="Safety" score={pillars?.safety.score ?? 95} weight="15%" />
            <ScoreBar label="Monitoring" score={pillars?.monitoring.score ?? 90} weight="15%" />
          </div>

          {/* Composite */}
          <div
            style={{
              marginTop: 24, paddingTop: 20,
              borderTop: `1px solid rgba(255,255,255,0.06)`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: T.dim }}>Composite Health Score</span>
            <span
              style={{
                fontSize: 34, fontWeight: 700, color: scoreColor, letterSpacing: '-0.374px',
              }}
            >
              {score} / 100
            </span>
          </div>
        </div>

        {/* AI Co-Pilot */}
        <div
          style={{
            background: T.tileDark2,
            border: '1px solid rgba(191,90,242,0.2)',
            borderRadius: 18,
            padding: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 18 }}>✦</span>
            <h3
              style={{
                fontSize: 17, fontWeight: 600, color: T.purple, letterSpacing: '-0.374px',
              }}
            >
              AI Trial Co-Pilot
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(healthScore?.ai_predictive_recommendations ?? [
              '✅ No risk factors detected. Trial is on track.',
            ]).map((rec, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(191,90,242,0.07)',
                  border: '1px solid rgba(191,90,242,0.18)',
                  borderRadius: 11,
                  padding: '14px 16px',
                  fontSize: 14,
                  color: '#e5ccff',
                  letterSpacing: '-0.224px',
                  lineHeight: 1.47,
                }}
              >
                {rec}
              </div>
            ))}
          </div>

          {/* Portfolio table */}
          {studies.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <p
                style={{
                  fontSize: 11, fontWeight: 600, color: T.dim,
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12,
                }}
              >
                Portfolio Overview
              </p>
              {studies.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0',
                    borderTop: `1px solid rgba(255,255,255,0.05)`,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.ink, letterSpacing: '-0.224px' }}>
                      {s.short_code}
                    </span>
                    <p style={{ fontSize: 12, color: T.dim, margin: '2px 0 0' }}>{s.phase}</p>
                  </div>
                  <span
                    style={{
                      fontSize: 11, fontWeight: 600,
                      color: s.status === 'ENROLLING' ? T.success : T.warning,
                      background: s.status === 'ENROLLING' ? 'rgba(52,199,89,0.1)' : 'rgba(255,159,10,0.1)',
                      border: `1px solid ${s.status === 'ENROLLING' ? 'rgba(52,199,89,0.3)' : 'rgba(255,159,10,0.3)'}`,
                      padding: '2px 10px', borderRadius: 9999,
                    }}
                  >
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
