import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Study } from '../types';
import { Download, Code2, Database } from 'lucide-react';
import { CANVAS, PARCHMENT, HAIRLINE, INK, INK_48, INK_80, PRIMARY, PRIMARY_ON_DARK, PURPLE, FONT_MONO, R_MD, R_LG, R_PILL, TYPE, BADGE, btnPrimary } from '../design';

export const InteroperabilityPage: React.FC = () => {
  const [studies, setStudies]         = useState<Study[]>([]);
  const [fhirPreview, setFhir]        = useState<any>(null);
  const [cdiscPreview, setCdisc]      = useState<any>(null);
  const active = studies[0];

  useEffect(() => {
    api.get('/study/list').then(res => {
      setStudies(res.data);
      if (res.data[0]) {
        api.get(`/interop/fhir/bundle/${res.data[0].id}`).then(f=>setFhir(f.data)).catch(()=>null);
        api.get(`/interop/cdisc/sdtm/${res.data[0].id}`).then(c=>setCdisc(c.data)).catch(()=>null);
      }
    });
  }, []);

  const dl = (data: any, fn: string) => {
    const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=fn; a.click();
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
      <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'flex-start', gap:14 }}>
        <div>
          <h1 style={{ fontSize:34, fontWeight:600, color: INK, letterSpacing:'-0.374px', lineHeight:1.47, margin:'0 0 6px' }}>
            Universal Interoperability &amp; Data Export Hub
          </h1>
          <p style={{...TYPE.caption, color: INK_48, margin:0}}>Dual mapping: HL7 FHIR v4.0 for Ayushman Bharat (ABDM) and CDISC SDTM v3.3 for international publishing.</p>
        </div>

        {/* Download CTAs */}
        <div style={{ display:'flex', gap:10, flexShrink:0, flexWrap:'wrap' }}>
          <button onClick={()=>dl(fhirPreview, `FHIR_${active?.short_code||'AIIA'}.json`)}
            style={{ display:'flex', alignItems:'center', gap:7, background: PURPLE, color:'#ffffff', border:'none', borderRadius: R_PILL, padding:'11px 22px', fontSize:14, fontWeight:600, cursor:'pointer', transition:'transform 0.1s', fontFamily:'inherit' }}
            onMouseDown={e=>(e.currentTarget.style.transform='scale(0.95)')} onMouseUp={e=>(e.currentTarget.style.transform='scale(1)')}>
            <Download size={13}/> Download ABDM FHIR JSON
          </button>
          <button onClick={()=>dl(cdiscPreview, `SDTM_${active?.short_code||'AIIA'}.json`)}
            style={{ display:'flex', alignItems:'center', gap:7, ...btnPrimary(), padding:'11px 22px' }}
            onMouseDown={e=>(e.currentTarget.style.transform='scale(0.95)')} onMouseUp={e=>(e.currentTarget.style.transform='scale(1)')}>
            <Download size={13}/> Download CDISC SDTM JSON
          </button>
        </div>
      </div>

      {/* Preview panels — canvas + parchment alternating */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* FHIR panel */}
        <div style={{ background: CANVAS, border:`1px solid ${HAIRLINE}`, borderRadius: R_LG, padding:28, display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`1px solid ${HAIRLINE}`, paddingBottom:14 }}>
            <span style={{ display:'flex', alignItems:'center', gap:6, ...TYPE.label, color: PURPLE }}>
              <Code2 size={12}/> HL7 FHIR v4.0 — ResearchStudy
            </span>
            <span style={BADGE.purple}>ABDM Profile</span>
          </div>
          <pre style={{ background: PARCHMENT, border:`1px solid ${HAIRLINE}`, borderRadius: R_MD, padding:14, fontSize:11, lineHeight:1.6, fontFamily: FONT_MONO, color: INK_80, overflowX:'auto', overflowY:'auto', height:300, margin:0 }}>
            {fhirPreview ? JSON.stringify(fhirPreview,null,2) : 'Loading FHIR bundle…'}
          </pre>
        </div>

        {/* CDISC panel */}
        <div style={{ background: PARCHMENT, border:`1px solid ${HAIRLINE}`, borderRadius: R_LG, padding:28, display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`1px solid ${HAIRLINE}`, paddingBottom:14 }}>
            <span style={{ display:'flex', alignItems:'center', gap:6, ...TYPE.label, color: PRIMARY_ON_DARK }}>
              <Database size={12}/> CDISC SDTM v3.3 — DM &amp; EX Domains
            </span>
            <span style={BADGE.blue}>CDASH / SDTM</span>
          </div>
          <pre style={{ background: CANVAS, border:`1px solid ${HAIRLINE}`, borderRadius: R_MD, padding:14, fontSize:11, lineHeight:1.6, fontFamily: FONT_MONO, color: INK_80, overflowX:'auto', overflowY:'auto', height:300, margin:0 }}>
            {cdiscPreview ? JSON.stringify(cdiscPreview,null,2) : 'Loading CDISC datasets…'}
          </pre>
        </div>
      </div>
    </div>
  );
};
