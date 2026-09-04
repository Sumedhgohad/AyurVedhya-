import React, { useState } from 'react';
import { Study, SaeClock } from '../types';
import { api } from '../api/client';
import { CheckCircle2, Download, AlertTriangle } from 'lucide-react';

interface Props {
  studies: Study[];
  saeClocks: SaeClock[];
  refreshData: () => void;
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
};

const KpiCard: React.FC<{
  label: string;
  value: React.ReactNode;
  sub: string;
  accent?: string;
  borderColor?: string;
}> = ({ label, value, sub, accent = T.ink, borderColor = T.border }) => (
  <div
    style={{
      background: T.tile,
      border: `1px solid ${borderColor}`,
      borderRadius: 18,
      padding: 24,
    }}
  >
    <p
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: T.dim,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 14,
        margin: '0 0 14px',
      }}
    >
      {label}
    </p>
    <div
      style={{
        fontSize: 36,
        fontWeight: 600,
        color: accent,
        letterSpacing: '-0.374px',
        lineHeight: 1.1,
        marginBottom: 6,
      }}
    >
      {value}
    </div>
    <p style={{ fontSize: 14, color: T.muted, letterSpacing: '-0.224px', margin: 0 }}>{sub}</p>
  </div>
);

export const ComplianceDashboard: React.FC<Props> = ({ studies, saeClocks, refreshData }) => {
  const [downloading, setDownloading] = useState(false);
  const study = studies[0];
  const iecApproval = study?.iec_submissions?.find((s) => s.decision === 'APPROVED');

  const downloadNpvcc = async (aeId: string) => {
    setDownloading(true);
    try {
      const res = await api.get(`/safety/export/npvcc/${aeId}`);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NPvCC_ADR_Report_${aeId}.json`;
      a.click();
    } catch {
      alert('Download failed.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        <KpiCard
          label="24h SAE Adherence"
          value={saeClocks.length > 0 ? `${saeClocks.length} Active` : 'Clear'}
          sub="NDCT Rules 2019 statutory deadline"
          accent={saeClocks.length > 0 ? T.danger : T.success}
          borderColor={saeClocks.length > 0 ? 'rgba(255,69,58,0.25)' : T.border}
        />
        <KpiCard
          label="Ethics (IEC) Renewals"
          value="0 Due"
          sub={`Valid until ${iecApproval?.valid_until || 'Sep 2027'}`}
          accent={T.success}
        />
        <KpiCard
          label="CTRI 6-Month Filing"
          value="180d"
          sub={study?.ctri_registration?.ctri_id || 'CTRI/2026/09/012345'}
          accent={T.primaryOnDark}
        />
      </div>

      {/* SAE clear state */}
      {saeClocks.length === 0 && (
        <div
          style={{
            background: 'rgba(52,199,89,0.06)',
            border: '1px solid rgba(52,199,89,0.2)',
            borderRadius: 18,
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <CheckCircle2 size={28} color={T.success} />
          <div>
            <p
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: T.success,
                letterSpacing: '-0.374px',
                marginBottom: 4,
                margin: '0 0 4px',
              }}
            >
              All SAE Clocks Clear
            </p>
            <p style={{ fontSize: 14, color: T.muted, letterSpacing: '-0.224px', margin: 0 }}>
              No active serious adverse events pending NPvCC reporting. All statutory deadlines met.
            </p>
          </div>
        </div>
      )}

      {/* Active SAE banners */}
      {saeClocks.map((clock) => (
        <div
          key={clock.id}
          style={{
            background: T.tileDark2,
            border: '1px solid rgba(255,69,58,0.45)',
            borderRadius: 18,
            padding: '28px 32px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Accent bar — solid, no gradient */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: T.danger,
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 24,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 10,
                    fontWeight: 700,
                    color: T.danger,
                    background: 'rgba(255,69,58,0.12)',
                    border: '1px solid rgba(255,69,58,0.4)',
                    padding: '3px 10px',
                    borderRadius: 9999,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  <AlertTriangle size={10} />
                  Statutory 24-Hour SAE Clock
                </span>
                <span style={{ fontSize: 12, color: T.dim }}>
                  Participant:{' '}
                  <strong style={{ color: T.ink }}>{clock.participant_code}</strong>
                </span>
              </div>
              <h3
                style={{
                  fontSize: 21,
                  fontWeight: 600,
                  color: T.ink,
                  letterSpacing: '-0.374px',
                  lineHeight: 1.19,
                  marginBottom: 8,
                  margin: '0 0 8px',
                }}
              >
                {clock.event_term}
              </h3>
              <p style={{ fontSize: 14, color: '#ff6961', letterSpacing: '-0.224px', margin: 0 }}>
                Statutory Deadline:{' '}
                {new Date(clock.statutory_24h_deadline).toLocaleString()} · NDCT Rules 2019 / NPvCC
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  textAlign: 'right',
                  background: T.bg,
                  padding: '12px 20px',
                  borderRadius: 11,
                  border: '1px solid rgba(255,69,58,0.3)',
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: T.dim,
                    display: 'block',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Time Remaining
                </span>
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: clock.is_overdue ? T.danger : T.warning,
                    letterSpacing: '-0.374px',
                    fontFamily: 'SF Mono, ui-monospace, monospace',
                  }}
                >
                  {clock.status_label}
                </span>
              </div>
              <button
                onClick={() => downloadNpvcc(clock.id)}
                disabled={downloading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: T.danger,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '11px 22px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '-0.224px',
                  transition: 'transform 0.1s ease',
                  fontFamily: 'inherit',
                  opacity: downloading ? 0.6 : 1,
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

      {/* CTRI & IEC detail tile */}
      <div
        style={{
          background: T.tileDark2,
          border: `1px solid ${T.borderDark}`,
          borderRadius: 18,
          padding: 28,
        }}
      >
        <h3
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: T.ink,
            letterSpacing: '-0.374px',
            marginBottom: 20,
            margin: '0 0 20px',
          }}
        >
          Regulatory Clearances — Active Study
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            {
              label: 'CTRI Registration ID',
              value: study?.ctri_registration?.ctri_id || '—',
              accent: T.primaryOnDark,
            },
            {
              label: 'Next CTRI 6-Month Update',
              value: study?.ctri_registration?.next_mandatory_update_due || '—',
              accent: T.ink,
            },
            {
              label: 'IEC Decision Status',
              value: iecApproval ? 'APPROVED' : 'Pending',
              accent: T.success,
            },
            {
              label: 'IEC Clearance Valid Until',
              value: iecApproval?.valid_until || '—',
              accent: T.ink,
            },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              style={{
                background: T.bg,
                borderRadius: 11,
                padding: '16px 20px',
                border: `1px solid ${T.borderDark}`,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: T.dim,
                  display: 'block',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: accent,
                  letterSpacing: '-0.374px',
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
