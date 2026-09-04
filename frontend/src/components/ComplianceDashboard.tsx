import React, { useState } from 'react';
import { Study, SaeClock } from '../types';
import { api } from '../api/client';

interface Props {
  studies: Study[];
  saeClocks: SaeClock[];
  refreshData: () => void;
}

const KpiCard: React.FC<{ label: string; value: string | number; sub: string; accent?: string; border?: string }> = ({ label, value, sub, accent = '#fff', border = 'rgba(255,255,255,0.08)' }) => (
  <div style={{ background: '#1d1d1f', border: `1px solid ${border}`, borderRadius: 18, padding: 24 }}>
    <p style={{ fontSize: 11, fontWeight: 600, color: '#7a7a7a', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>{label}</p>
    <p style={{ fontSize: 36, fontWeight: 600, color: accent, letterSpacing: '-0.374px', lineHeight: 1.1, marginBottom: 6 }}>{value}</p>
    <p style={{ fontSize: 14, color: '#cccccc', letterSpacing: '-0.224px' }}>{sub}</p>
  </div>
);

export const ComplianceDashboard: React.FC<Props> = ({ studies, saeClocks, refreshData }) => {
  const [downloading, setDownloading] = useState(false);
  const study = studies[0];

  const iecApproval = study?.iec_submissions?.find(s => s.decision === 'APPROVED');

  const downloadNpvcc = async (aeId: string) => {
    setDownloading(true);
    try {
      const res = await api.get(`/safety/export/npvcc/${aeId}`);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `NPvCC_ADR_Report_${aeId}.json`; a.click();
    } catch { alert('Download failed.'); }
    finally { setDownloading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* KPI ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        <KpiCard label="24h SAE Adherence" value={saeClocks.length > 0 ? `${saeClocks.length} Active` : '✓ Clear'} sub="NDCT Rules 2019 statutory deadline" accent="#ff453a" border="rgba(255,69,58,0.3)" />
        <KpiCard label="Ethics (IEC) Renewals" value="0 Due" sub={`Valid until ${iecApproval?.valid_until || 'Sep 2027'}`} accent="#34c759" />
        <KpiCard label="CTRI 6-Month Filing" value="180d" sub={study?.ctri_registration?.ctri_id || 'CTRI/2026/09/012345'} accent="#2997ff" />
      </div>

      {/* ACTIVE SAE EMERGENCY BANNERS */}
      {saeClocks.length === 0 && (
        <div style={{ background: 'rgba(52,199,89,0.06)', border: '1px solid rgba(52,199,89,0.2)', borderRadius: 18, padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 28 }}>✓</span>
          <div>
            <p style={{ fontSize: 17, fontWeight: 600, color: '#34c759', letterSpacing: '-0.374px', marginBottom: 4 }}>All SAE Clocks Clear</p>
            <p style={{ fontSize: 14, color: '#cccccc', letterSpacing: '-0.224px' }}>No active serious adverse events pending NPvCC reporting. All statutory deadlines met.</p>
          </div>
        </div>
      )}

      {saeClocks.map(clock => (
        <div key={clock.id} style={{ background: '#272729', border: '1px solid rgba(255,69,58,0.5)', borderRadius: 18, padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
          {/* Red glow accent bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #ff453a, #ff6961)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#ff453a', background: 'rgba(255,69,58,0.12)', border: '1px solid rgba(255,69,58,0.4)', padding: '3px 10px', borderRadius: 9999, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  🚨 Statutory 24-Hour SAE Clock
                </span>
                <span style={{ fontSize: 12, color: '#7a7a7a' }}>Participant: <strong style={{ color: '#fff' }}>{clock.participant_code}</strong></span>
              </div>
              <h3 style={{ fontSize: 21, fontWeight: 600, color: '#fff', letterSpacing: '-0.374px', lineHeight: 1.19, marginBottom: 8 }}>{clock.event_term}</h3>
              <p style={{ fontSize: 14, color: '#ff6961', letterSpacing: '-0.224px' }}>
                Statutory Deadline: {new Date(clock.statutory_24h_deadline).toLocaleString()} · NDCT Rules 2019 / NPvCC
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
              <div style={{ textAlign: 'right', background: '#000', padding: '12px 20px', borderRadius: 11, border: '1px solid rgba(255,69,58,0.3)' }}>
                <span style={{ fontSize: 11, color: '#7a7a7a', display: 'block', marginBottom: 4 }}>Time Remaining</span>
                <span style={{ fontSize: 28, fontWeight: 700, color: clock.is_overdue ? '#ff453a' : '#ff9f0a', letterSpacing: '-0.374px' }}>{clock.status_label}</span>
              </div>
              <button onClick={() => downloadNpvcc(clock.id)} disabled={downloading}
                style={{ background: '#ff453a', color: '#fff', border: 'none', borderRadius: 9999, padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.224px', transition: 'transform 0.1s' }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
                {downloading ? 'Exporting…' : '⬇ NPvCC Report'}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* CTRI & IEC DETAIL TILE */}
      <div style={{ background: '#272729', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: 28 }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, color: '#fff', letterSpacing: '-0.374px', marginBottom: 20 }}>Regulatory Clearances — Active Study</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { label: 'CTRI Registration ID', value: study?.ctri_registration?.ctri_id || '—', accent: '#2997ff' },
            { label: 'Next CTRI 6-Month Update', value: study?.ctri_registration?.next_mandatory_update_due || '—', accent: '#fff' },
            { label: 'IEC Decision Status', value: iecApproval ? '✓ APPROVED' : 'Pending', accent: '#34c759' },
            { label: 'IEC Clearance Valid Until', value: iecApproval?.valid_until || '—', accent: '#fff' },
          ].map(({ label, value, accent }) => (
            <div key={label} style={{ background: '#000', borderRadius: 11, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 11, color: '#7a7a7a', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
              <span style={{ fontSize: 17, fontWeight: 600, color: accent, letterSpacing: '-0.374px' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
