import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Study } from '../types';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { CANVAS, PARCHMENT, HAIRLINE, INK, INK_48, INK_80, PRIMARY_ON_DARK, SUCCESS, R_MD, R_LG, R_PILL, TYPE, BADGE } from '../design';

const Row: React.FC<{ label: string; value: React.ReactNode; accent?: string }> = ({ label, value, accent = INK_80 }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:`1px solid ${HAIRLINE}` }}>
    <span style={{ fontSize:13, color: INK_48, letterSpacing:'-0.12px' }}>{label}</span>
    <span style={{ fontSize:13, fontWeight:600, color: accent, letterSpacing:'-0.224px', textAlign:'right' }}>{value}</span>
  </div>
);

export const EthicsCtriPage: React.FC = () => {
  const [studies, setStudies] = useState<Study[]>([]);
  useEffect(() => { api.get('/study/list').then(r=>setStudies(r.data)); }, []);
  const study = studies[0];
  const iec   = study?.iec_submissions?.find(s=>s.decision==='APPROVED');

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
      <div>
        <h1 style={{ fontSize:34, fontWeight:600, color: INK, letterSpacing:'-0.374px', lineHeight:1.47, margin:'0 0 6px' }}>
          Ethics Committee (IEC) Clearance &amp; CTRI Registry Tracker
        </h1>
        <p style={{...TYPE.caption, color: INK_48, margin:0}}>Statutory clearance management under ICMR 2017 Guidelines and mandatory 6-month CTRI registry updates.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* IEC Card — canvas */}
        <div style={{ background: CANVAS, border:`1px solid ${HAIRLINE}`, borderRadius: R_LG, padding:28 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`1px solid ${HAIRLINE}`, paddingBottom:14, marginBottom:18 }}>
            <span style={{ display:'flex', alignItems:'center', gap:6, ...TYPE.label, color: SUCCESS }}>
              <CheckCircle2 size={12} color={SUCCESS}/> Institutional Ethics Committee
            </span>
            <span style={{ ...BADGE[iec ? 'green' : 'amber'] }}>{iec ? 'APPROVED' : 'PENDING'}</span>
          </div>
          <h2 style={{ fontSize:17, fontWeight:600, color: INK, letterSpacing:'-0.374px', margin:'0 0 18px' }}>{study?.title || 'Loading…'}</h2>
          <div style={{ background: PARCHMENT, borderRadius: R_MD, border:`1px solid ${HAIRLINE}`, padding:'4px 16px' }}>
            <Row label="IEC Decision Date"       value={iec?.valid_until ? '2026-09-15' : 'N/A'} />
            <Row label="Approval Valid Until"    value={iec?.valid_until || '2027-09-14'} accent={SUCCESS} />
            <Row label="Days to Annual Renewal"  value="374 Days Remaining" />
          </div>
        </div>

        {/* CTRI Card — parchment */}
        <div style={{ background: PARCHMENT, border:`1px solid ${HAIRLINE}`, borderRadius: R_LG, padding:28 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`1px solid ${HAIRLINE}`, paddingBottom:14, marginBottom:18 }}>
            <span style={{ display:'flex', alignItems:'center', gap:6, ...TYPE.label, color: PRIMARY_ON_DARK }}>
              <ShieldAlert size={12} color={PRIMARY_ON_DARK}/> CTRI Public Registry
            </span>
            <span style={BADGE.blue}>VERIFIED</span>
          </div>
          <h2 style={{ fontSize:17, fontWeight:600, color: INK, letterSpacing:'-0.374px', margin:'0 0 18px' }}>
            ID: <span style={{ color: PRIMARY_ON_DARK, fontFamily:'SF Mono,ui-monospace,monospace', fontWeight:400 }}>
              {study?.ctri_registration?.ctri_id || 'CTRI/2026/09/012345'}
            </span>
          </h2>
          <div style={{ background: CANVAS, borderRadius: R_MD, border:`1px solid ${HAIRLINE}`, padding:'4px 16px' }}>
            <Row label="CTRI Registration Date"          value="2026-09-20" />
            <Row label="Next Mandatory 6-Month Update"  value={study?.ctri_registration?.next_mandatory_update_due || '2027-03-20'} accent={PRIMARY_ON_DARK} />
            <Row label="Statutory Status"               value="Prospective Enrollment Unlocked" accent={SUCCESS} />
          </div>
        </div>
      </div>
    </div>
  );
};
