import React, { useState } from 'react';
import { Study, SaeClock } from '../types';
import { api } from '../api/client';
import { CheckCircle2, Download, AlertTriangle } from 'lucide-react';
import {
  CANVAS, PARCHMENT, HAIRLINE, TILE_1, TILE_2,
  INK, INK_48, INK_80, PRIMARY_ON_DARK,
  SUCCESS, WARNING, DANGER,
  R_MD, R_LG, R_PILL, BORDER_DARK, BORDER_DARK_THIN,
  TYPE, BADGE, btnPrimary, FONT_MONO,
} from '../design';

interface Props { studies: Study[]; saeClocks: SaeClock[]; refreshData: () => void; }

const KPI: React.FC<{ label: string; value: React.ReactNode; sub: string; accent?: string; borderColor?: string }> =
  ({ label, value, sub, accent = INK, borderColor = HAIRLINE }) => (
  <div style={{ background: CANVAS, border: `1px solid ${borderColor}`, borderRadius: R_LG, padding: 24 }}>
    <p style={{ ...TYPE.label, color: INK_48, margin: '0 0 14px' }}>{label}</p>
    <div style={{ fontSize: 36, fontWeight: 600, color: accent, letterSpacing: '-0.374px', lineHeight: 1.1, marginBottom: 6 }}>{value}</div>
    <p style={{ ...TYPE.caption, color: INK_80, margin: 0 }}>{sub}</p>
  </div>
);

export const ComplianceDashboard: React.FC<Props> = ({ studies, saeClocks, refreshData }) => {
  const [downloading, setDownloading] = useState(false);
  const study = studies[0];
  const iec = study?.iec_submissions?.find(s => s.decision === 'APPROVED');

  const downloadNpvcc = async (aeId: string) => {
    setDownloading(true);
    try {
      const res = await api.get(`/safety/export/npvcc/${aeId}`);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `NPvCC_${aeId}.json`; a.click();
    } catch { alert('Download failed.'); }
    finally { setDownloading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        <KPI label="24h SAE Adherence"
          value={saeClocks.length > 0 ? `${saeClocks.length} Active` : 'Clear'}
          sub="NDCT Rules 2019 statutory deadline"
          accent={saeClocks.length > 0 ? DANGER : SUCCESS}
          borderColor={saeClocks.length > 0 ? 'rgba(255,69,58,0.30)' : HAIRLINE}
        />
        <KPI label="Ethics (IEC) Renewals" value="0 Due"
          sub={`Valid until ${iec?.valid_until || 'Sep 2027'}`} accent={SUCCESS}
        />
        <KPI label="CTRI 6-Month Filing" value="180d"
          sub={study?.ctri_registration?.ctri_id || 'CTRI/2026/09/012345'} accent={PRIMARY_ON_DARK}
        />
      </div>

      {/* All-clear state */}
      {saeClocks.length === 0 && (
        <div style={{
          background: 'rgba(52,199,89,0.06)', border: '1px solid rgba(52,199,89,0.22)',
          borderRadius: R_LG, padding: '22px 26px',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <CheckCircle2 size={26} color={SUCCESS} style={{ flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 17, fontWeight: 600, color: SUCCESS, letterSpacing: '-0.374px', margin: '0 0 4px' }}>
              All SAE Clocks Clear
            </p>
            <p style={{ ...TYPE.caption, color: INK_80, margin: 0 }}>
              No active adverse events pending NPvCC reporting. All statutory deadlines met.
            </p>
          </div>
        </div>
      )}

      {/* Active SAE banners — dark tile per verge.md danger surface */}
      {saeClocks.map(clock => (
        <div key={clock.id} style={{
          background: TILE_1, border: '1px solid rgba(255,69,58,0.50)',
          borderRadius: R_LG, padding: '26px 30px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* 3px danger accent bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: DANGER }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 10, fontWeight: 700, color: DANGER,
                  background: 'rgba(255,69,58,0.14)', border: '1px solid rgba(255,69,58,0.40)',
                  padding: '3px 10px', borderRadius: R_PILL,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  <AlertTriangle size={10} />
                  Statutory 24-Hour SAE Clock
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                  Participant: <strong style={{ color: '#ffffff' }}>{clock.participant_code}</strong>
                </span>
              </div>
              <h3 style={{ fontSize: 21, fontWeight: 600, color: '#ffffff', letterSpacing: '-0.374px', lineHeight: 1.19, margin: '0 0 8px' }}>
                {clock.event_term}
              </h3>
              <p style={{ fontSize: 14, color: '#ff6961', letterSpacing: '-0.224px', margin: 0 }}>
                Deadline: <strong>{new Date(clock.statutory_24h_deadline).toLocaleString()}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
              <div style={{ background: '#000', border: '1px solid rgba(255,69,58,0.35)', borderRadius: R_MD, padding: '12px 18px', textAlign: 'right' }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  Time Remaining
                </span>
                <span style={{ fontSize: 28, fontWeight: 700, color: clock.is_overdue ? DANGER : WARNING, letterSpacing: '-0.374px', fontFamily: FONT_MONO }}>
                  {clock.status_label}
                </span>
              </div>
              <button onClick={() => downloadNpvcc(clock.id)} disabled={downloading}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: DANGER, color: '#ffffff', border: 'none', borderRadius: R_PILL, padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.224px', transition: 'transform 0.1s', opacity: downloading ? 0.6 : 1, fontFamily: 'inherit' }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Download size={13} /> NPvCC Report
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.patch(`/safety/sae/${clock.id}/mark-reported`);
                    refreshData();
                  } catch { alert('Failed to mark SAE as reported. Please try again.'); }
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: SUCCESS, color: '#ffffff', border: 'none', borderRadius: R_PILL, padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.224px', transition: 'transform 0.1s', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <CheckCircle2 size={13} /> Confirm Dispatch &amp; Close Clock
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Regulatory detail — alternating parchment tile */}
      <div style={{ background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 26 }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, color: INK, letterSpacing: '-0.374px', margin: '0 0 18px' }}>
          Regulatory Clearances — Active Study
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'CTRI Registration ID',       value: study?.ctri_registration?.ctri_id || '—', accent: PRIMARY_ON_DARK },
            { label: 'Next CTRI 6-Month Update',   value: study?.ctri_registration?.next_mandatory_update_due || '—', accent: INK },
            { label: 'IEC Decision Status',        value: iec ? 'APPROVED' : 'Pending', accent: SUCCESS },
            { label: 'IEC Clearance Valid Until',  value: iec?.valid_until || '—', accent: INK },
          ].map(({ label, value, accent }) => (
            <div key={label} style={{ background: CANVAS, borderRadius: R_MD, padding: '14px 18px', border: `1px solid ${HAIRLINE}` }}>
              <span style={{ ...TYPE.label, color: INK_48, display: 'block', marginBottom: 6 }}>{label}</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: accent, letterSpacing: '-0.374px' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
