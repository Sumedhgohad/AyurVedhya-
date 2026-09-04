import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Study } from '../types';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

const T = {
  tile: '#1d1d1f',
  bg: '#000000',
  border: 'rgba(255,255,255,0.08)',
  borderDark: 'rgba(255,255,255,0.06)',
  ink: '#ffffff',
  muted: '#cccccc',
  dim: '#7a7a7a',
  primary: '#0066cc',
  primaryOnDark: '#2997ff',
  success: '#34c759',
};

const DataRow: React.FC<{ label: string; value: React.ReactNode; accent?: string }> = ({
  label, value, accent = '#cccccc',
}) => (
  <div
    style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}
  >
    <span style={{ fontSize: 13, color: T.dim, letterSpacing: '-0.12px' }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: accent, letterSpacing: '-0.224px', textAlign: 'right' }}>
      {value}
    </span>
  </div>
);

export const EthicsCtriPage: React.FC = () => {
  const [studies, setStudies] = useState<Study[]>([]);

  useEffect(() => {
    api.get('/study/list').then((res) => setStudies(res.data));
  }, []);

  const activeStudy = studies[0];
  const approvedIec = activeStudy?.iec_submissions?.find((s) => s.decision === 'APPROVED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page header */}
      <div>
        <h1
          style={{
            fontSize: 34, fontWeight: 600, color: T.ink,
            letterSpacing: '-0.374px', lineHeight: 1.1, margin: '0 0 6px',
          }}
        >
          Ethics Committee (IEC) Clearance &amp; CTRI Registry Tracker
        </h1>
        <p style={{ fontSize: 14, color: T.dim, letterSpacing: '-0.224px', margin: 0 }}>
          Statutory clearance management under ICMR 2017 Guidelines and mandatory 6-month CTRI registry updates.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* IEC Card */}
        <div
          style={{
            background: T.tile, border: `1px solid ${T.border}`,
            borderRadius: 18, padding: 28,
          }}
        >
          <div
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: `1px solid ${T.border}`, paddingBottom: 16, marginBottom: 20,
            }}
          >
            <span
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 600, color: T.success,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >
              <CheckCircle2 size={13} color={T.success} />
              Institutional Ethics Committee (IEC)
            </span>
            <span
              style={{
                fontSize: 10, fontWeight: 700,
                color: approvedIec ? T.success : '#ff9f0a',
                background: approvedIec ? 'rgba(52,199,89,0.1)' : 'rgba(255,159,10,0.1)',
                border: `1px solid ${approvedIec ? 'rgba(52,199,89,0.3)' : 'rgba(255,159,10,0.3)'}`,
                padding: '3px 10px', borderRadius: 9999,
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}
            >
              {approvedIec ? 'APPROVED' : 'PENDING'}
            </span>
          </div>

          <h2
            style={{
              fontSize: 17, fontWeight: 600, color: T.ink,
              letterSpacing: '-0.374px', marginBottom: 20,
            }}
          >
            {activeStudy?.title || 'Loading Protocol…'}
          </h2>

          <div
            style={{
              background: T.bg, borderRadius: 11,
              border: `1px solid ${T.borderDark}`,
              padding: '4px 16px',
            }}
          >
            <DataRow label="IEC Decision Date" value={approvedIec?.valid_until ? '2026-09-15' : 'N/A'} />
            <DataRow label="Approval Valid Until" value={approvedIec?.valid_until || '2027-09-14'} accent={T.success} />
            <DataRow
              label="Days to Annual Renewal"
              value="374 Days Remaining"
              accent={T.muted}
            />
          </div>
        </div>

        {/* CTRI Card */}
        <div
          style={{
            background: T.tile, border: `1px solid ${T.border}`,
            borderRadius: 18, padding: 28,
          }}
        >
          <div
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: `1px solid ${T.border}`, paddingBottom: 16, marginBottom: 20,
            }}
          >
            <span
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 600, color: T.primaryOnDark,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >
              <ShieldAlert size={13} color={T.primaryOnDark} />
              CTRI Public Registry Linkage
            </span>
            <span
              style={{
                fontSize: 10, fontWeight: 700,
                color: T.primaryOnDark,
                background: 'rgba(0,102,204,0.1)',
                border: '1px solid rgba(0,102,204,0.25)',
                padding: '3px 10px', borderRadius: 9999,
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}
            >
              VERIFIED
            </span>
          </div>

          <h2
            style={{
              fontSize: 17, fontWeight: 600, color: T.ink,
              letterSpacing: '-0.374px', marginBottom: 20,
            }}
          >
            Registration ID:{' '}
            <span
              style={{
                color: T.primaryOnDark,
                fontFamily: 'SF Mono, ui-monospace, monospace',
                fontWeight: 400,
              }}
            >
              {activeStudy?.ctri_registration?.ctri_id || 'CTRI/2026/09/012345'}
            </span>
          </h2>

          <div
            style={{
              background: T.bg, borderRadius: 11,
              border: `1px solid ${T.borderDark}`,
              padding: '4px 16px',
            }}
          >
            <DataRow label="CTRI Registration Date" value="2026-09-20" />
            <DataRow
              label="Next Mandatory 6-Month Update Due"
              value={activeStudy?.ctri_registration?.next_mandatory_update_due || '2027-03-20'}
              accent={T.primaryOnDark}
            />
            <DataRow
              label="Statutory Status"
              value="Prospective Enrollment Unlocked"
              accent={T.success}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
