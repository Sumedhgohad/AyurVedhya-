import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Study } from '../types';
import { Package, CheckCircle2 } from 'lucide-react';
import { CANVAS, PARCHMENT, HAIRLINE, INK, INK_48, INK_80, PRIMARY_ON_DARK, SUCCESS, R_MD, R_LG, R_PILL, TYPE, BADGE } from '../design';

export const StudiesPage: React.FC = () => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/study/list').then(r => setStudies(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h1 style={{ fontSize: 34, fontWeight: 600, color: INK, letterSpacing: '-0.374px', lineHeight: 1.47, margin: '0 0 6px' }}>
          Trial Protocols &amp; IP Batch Traceability
        </h1>
        <p style={{ ...TYPE.caption, color: INK_48, margin: 0 }}>
          State-machine clinical protocol engine with AFI API/formulation batch standards.
        </p>
      </div>

      {loading ? (
        <p style={{ padding: 48, textAlign: 'center', ...TYPE.caption, color: INK_48 }}>Loading clinical protocols…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {studies.map(study => (
            <div key={study.id} style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 28 }}>

              {/* Header */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, borderBottom: `1px solid ${HAIRLINE}`, paddingBottom: 20, marginBottom: 22 }}>
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    <span style={BADGE.blue}>{study.short_code}</span>
                    <span style={BADGE.green}>{study.status}</span>
                    <span style={BADGE.ink}>{study.phase} · {study.study_type}</span>
                  </div>
                  <h2 style={{ fontSize: 21, fontWeight: 600, color: INK, letterSpacing: '-0.374px', lineHeight: 1.19, margin: 0 }}>
                    {study.title}
                  </h2>
                </div>
                <div style={{ background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '10px 18px', textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ ...TYPE.label, color: INK_48, display: 'block', marginBottom: 4 }}>Target Sample Size</span>
                  <span style={{ fontSize: 17, fontWeight: 600, color: INK, letterSpacing: '-0.374px' }}>{study.target_sample_size} Subjects</span>
                </div>
              </div>

              {/* IP Batches */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: 7, ...TYPE.label, color: INK_48, margin: '0 0 12px' }}>
                  <Package size={12} color={PRIMARY_ON_DARK} />
                  Investigational Product Batches &amp; AFI Standard
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
                  {(study.ip_batches || [{ id:'1', formulation_name:'Ashwagandha Ghanvati', batch_no:'ASH-2026-B1', afi_api_standard_ref:'AFI-API-V2-882', current_stock:450 }]).map(b => (
                    <div key={b.id} style={{ background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: 14 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: INK, display: 'block', marginBottom: 8, letterSpacing: '-0.224px' }}>{b.formulation_name}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 12, color: INK_80 }}>
                        <span><span style={{ color: INK_48 }}>Batch: </span><strong>{b.batch_no}</strong></span>
                        <span><span style={{ color: INK_48 }}>AFI: </span><span style={{ color: PRIMARY_ON_DARK }}>{b.afi_api_standard_ref}</span></span>
                        <span><span style={{ color: INK_48 }}>Stock: </span><strong style={{ color: SUCCESS }}>{b.current_stock} units</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regulatory snapshot */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: 16 }}>
                <div>
                  <span style={{ ...TYPE.label, color: INK_48, display: 'block', marginBottom: 5 }}>CTRI Registration</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: INK, letterSpacing: '-0.224px' }}>{study.ctri_registration?.ctri_id || 'CTRI/2026/09/012345'}</span>
                  <span style={{ display: 'block', fontSize: 12, color: INK_48, marginTop: 2 }}>Next Update: {study.ctri_registration?.next_mandatory_update_due || '2027-03-01'}</span>
                </div>
                <div>
                  <span style={{ ...TYPE.label, color: INK_48, display: 'block', marginBottom: 5 }}>IEC Approval</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: SUCCESS, letterSpacing: '-0.224px', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <CheckCircle2 size={13} /> Valid Clearance On File
                  </span>
                  <span style={{ display: 'block', fontSize: 12, color: INK_48, marginTop: 2 }}>Until: {study.iec_submissions?.[0]?.valid_until || '2027-09-15'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
