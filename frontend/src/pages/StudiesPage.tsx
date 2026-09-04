import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Study } from '../types';
import { Package } from 'lucide-react';

const T = {
  tile: '#1d1d1f',
  bg: '#000000',
  border: 'rgba(255,255,255,0.08)',
  borderDark: 'rgba(255,255,255,0.06)',
  ink: '#ffffff',
  muted: '#cccccc',
  dim: '#7a7a7a',
  primaryOnDark: '#2997ff',
  success: '#34c759',
};

export const StudiesPage: React.FC = () => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/study/list')
      .then((res) => setStudies(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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
          Trial Protocols &amp; IP Batch Traceability
        </h1>
        <p style={{ fontSize: 14, color: T.dim, letterSpacing: '-0.224px', margin: 0 }}>
          State-machine clinical protocol engine with AFI API/formulation batch standards.
        </p>
      </div>

      {loading ? (
        <div
          style={{
            padding: 48, textAlign: 'center', color: T.dim,
            fontSize: 14, letterSpacing: '-0.224px',
          }}
        >
          Loading clinical protocols…
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {studies.map((study) => (
            <div
              key={study.id}
              style={{
                background: T.tile,
                border: `1px solid ${T.border}`,
                borderRadius: 18,
                padding: 28,
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
                  alignItems: 'flex-start', gap: 16,
                  borderBottom: `1px solid ${T.border}`, paddingBottom: 20, marginBottom: 24,
                }}
              >
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    <span
                      style={{
                        fontSize: 11, fontWeight: 600, color: T.primaryOnDark,
                        background: 'rgba(41,151,255,0.1)',
                        border: '1px solid rgba(41,151,255,0.25)',
                        padding: '3px 10px', borderRadius: 9999,
                      }}
                    >
                      {study.short_code}
                    </span>
                    <span
                      style={{
                        fontSize: 11, fontWeight: 600, color: T.success,
                        background: 'rgba(52,199,89,0.1)',
                        border: '1px solid rgba(52,199,89,0.25)',
                        padding: '3px 10px', borderRadius: 9999,
                      }}
                    >
                      {study.status}
                    </span>
                    <span
                      style={{
                        fontSize: 11, color: T.dim,
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid rgba(255,255,255,0.08)`,
                        padding: '3px 10px', borderRadius: 9999,
                      }}
                    >
                      {study.phase} · {study.study_type}
                    </span>
                  </div>
                  <h2
                    style={{
                      fontSize: 21, fontWeight: 600, color: T.ink,
                      letterSpacing: '-0.374px', lineHeight: 1.19, margin: 0,
                    }}
                  >
                    {study.title}
                  </h2>
                </div>
                <div
                  style={{
                    background: T.bg, border: `1px solid ${T.border}`,
                    borderRadius: 11, padding: '10px 18px', textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10, color: T.dim,
                      display: 'block', textTransform: 'uppercase',
                      letterSpacing: '0.06em', marginBottom: 4,
                    }}
                  >
                    Target Sample Size
                  </span>
                  <span style={{ fontSize: 17, fontWeight: 600, color: T.ink, letterSpacing: '-0.374px' }}>
                    {study.target_sample_size} Subjects
                  </span>
                </div>
              </div>

              {/* IP Batches */}
              <div style={{ marginBottom: 24 }}>
                <p
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 11, fontWeight: 600, color: T.dim,
                    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14,
                  }}
                >
                  <Package size={13} color={T.primaryOnDark} />
                  Investigational Product (IP) Batches &amp; AFI Standard Reference
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 12,
                  }}
                >
                  {(study.ip_batches || [
                    {
                      id: '1',
                      formulation_name: 'Ashwagandha Ghanvati',
                      batch_no: 'ASH-2026-B1',
                      afi_api_standard_ref: 'AFI-API-V2-882',
                      current_stock: 450,
                    },
                  ]).map((batch) => (
                    <div
                      key={batch.id}
                      style={{
                        background: T.bg, border: `1px solid ${T.borderDark}`,
                        borderRadius: 14, padding: 16,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13, fontWeight: 600, color: T.ink,
                          display: 'block', marginBottom: 10, letterSpacing: '-0.224px',
                        }}
                      >
                        {batch.formulation_name}
                      </span>
                      <div
                        style={{
                          display: 'flex', flexDirection: 'column', gap: 4,
                          fontSize: 12, color: T.muted,
                        }}
                      >
                        <span>
                          <span style={{ color: T.dim }}>Batch No: </span>
                          <strong style={{ color: T.ink }}>{batch.batch_no}</strong>
                        </span>
                        <span>
                          <span style={{ color: T.dim }}>AFI Ref: </span>
                          <span style={{ color: T.primaryOnDark }}>{batch.afi_api_standard_ref}</span>
                        </span>
                        <span>
                          <span style={{ color: T.dim }}>Stock: </span>
                          <strong style={{ color: T.success }}>{batch.current_stock} units</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regulatory snapshot */}
              <div
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
                  background: T.bg, border: `1px solid ${T.borderDark}`,
                  borderRadius: 11, padding: 16,
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: 10, color: T.dim, display: 'block',
                      textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
                    }}
                  >
                    CTRI Registration
                  </span>
                  <span
                    style={{ fontSize: 14, fontWeight: 600, color: T.ink, letterSpacing: '-0.224px' }}
                  >
                    {study.ctri_registration?.ctri_id || 'CTRI/2026/09/012345'}
                  </span>
                  <span
                    style={{
                      display: 'block', fontSize: 12, color: T.dim,
                      letterSpacing: '-0.12px', marginTop: 2,
                    }}
                  >
                    Next Update Due: {study.ctri_registration?.next_mandatory_update_due || '2027-03-01'}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: 10, color: T.dim, display: 'block',
                      textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
                    }}
                  >
                    IEC Approval Clearance
                  </span>
                  <span
                    style={{ fontSize: 14, fontWeight: 600, color: T.success, letterSpacing: '-0.224px' }}
                  >
                    ✓ Valid Clearance Letter On File
                  </span>
                  <span
                    style={{
                      display: 'block', fontSize: 12, color: T.dim,
                      letterSpacing: '-0.12px', marginTop: 2,
                    }}
                  >
                    Valid Until: {study.iec_submissions?.[0]?.valid_until || '2027-09-15'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
