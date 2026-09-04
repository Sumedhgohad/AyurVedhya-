import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Study } from '../types';
import { Download, Code2, Database } from 'lucide-react';

const T = {
  tile: '#1d1d1f',
  bg: '#000000',
  border: 'rgba(255,255,255,0.08)',
  ink: '#ffffff',
  muted: '#cccccc',
  dim: '#7a7a7a',
  primary: '#0066cc',
  primaryOnDark: '#2997ff',
  purple: '#bf5af2',
};

export const InteroperabilityPage: React.FC = () => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [fhirPreview, setFhirPreview] = useState<any>(null);
  const [cdiscPreview, setCdiscPreview] = useState<any>(null);
  const activeStudy = studies[0];

  useEffect(() => {
    api.get('/study/list').then((res) => {
      setStudies(res.data);
      if (res.data[0]) {
        api.get(`/interop/fhir/bundle/${res.data[0].id}`)
          .then((f) => setFhirPreview(f.data))
          .catch(() => null);
        api.get(`/interop/cdisc/sdtm/${res.data[0].id}`)
          .then((c) => setCdiscPreview(c.data))
          .catch(() => null);
      }
    });
  }, []);

  const downloadJson = (data: any, fileName: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page header */}
      <div
        style={{
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'space-between', alignItems: 'flex-start', gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 34, fontWeight: 600, color: T.ink,
              letterSpacing: '-0.374px', lineHeight: 1.1, margin: '0 0 6px',
            }}
          >
            Universal Interoperability &amp; Data Export Hub
          </h1>
          <p style={{ fontSize: 14, color: T.dim, letterSpacing: '-0.224px', margin: 0 }}>
            Dual data mapping: HL7 FHIR v4.0 for Ayushman Bharat (ABDM) and CDISC SDTM v3.3 for international scientific publishing.
          </p>
        </div>

        {/* Download buttons */}
        <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
          <button
            onClick={() =>
              downloadJson(fhirPreview, `ABDM_FHIR_Bundle_${activeStudy?.short_code || 'AIIA'}.json`)
            }
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: T.purple, color: T.ink, border: 'none',
              borderRadius: 9999, padding: '11px 22px',
              fontSize: 14, fontWeight: 600, letterSpacing: '-0.224px',
              cursor: 'pointer', transition: 'transform 0.1s ease', fontFamily: 'inherit',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Download size={14} />
            Download ABDM FHIR JSON
          </button>
          <button
            onClick={() =>
              downloadJson(cdiscPreview, `CDISC_SDTM_Datasets_${activeStudy?.short_code || 'AIIA'}.json`)
            }
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: T.primary, color: T.ink, border: 'none',
              borderRadius: 9999, padding: '11px 22px',
              fontSize: 14, fontWeight: 600, letterSpacing: '-0.224px',
              cursor: 'pointer', transition: 'transform 0.1s ease', fontFamily: 'inherit',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Download size={14} />
            Download CDISC SDTM JSON
          </button>
        </div>
      </div>

      {/* Preview panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* FHIR panel */}
        <div
          style={{
            background: T.tile, border: `1px solid ${T.border}`,
            borderRadius: 18, padding: 28,
            display: 'flex', flexDirection: 'column', gap: 18,
          }}
        >
          <div
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: `1px solid ${T.border}`, paddingBottom: 16,
            }}
          >
            <span
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 600, color: T.purple,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >
              <Code2 size={12} />
              HL7 FHIR v4.0 Bundle (Ayushman Bharat / Hospital EHR)
            </span>
            <span
              style={{
                fontSize: 10, fontWeight: 700,
                color: T.purple,
                background: 'rgba(191,90,242,0.1)',
                border: '1px solid rgba(191,90,242,0.25)',
                padding: '2px 9px', borderRadius: 9999,
                letterSpacing: '0.04em',
              }}
            >
              Profile: ResearchStudy
            </span>
          </div>

          <pre
            style={{
              background: T.bg, border: `1px solid rgba(255,255,255,0.06)`,
              borderRadius: 11, padding: 16,
              fontSize: 11, lineHeight: 1.6,
              fontFamily: 'SF Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
              color: '#e5ccff',
              overflowX: 'auto', overflowY: 'auto',
              height: 320, margin: 0,
            }}
          >
            {fhirPreview ? JSON.stringify(fhirPreview, null, 2) : 'Loading FHIR bundle…'}
          </pre>
        </div>

        {/* CDISC panel */}
        <div
          style={{
            background: T.tile, border: `1px solid ${T.border}`,
            borderRadius: 18, padding: 28,
            display: 'flex', flexDirection: 'column', gap: 18,
          }}
        >
          <div
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: `1px solid ${T.border}`, paddingBottom: 16,
            }}
          >
            <span
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 600, color: T.primaryOnDark,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >
              <Database size={12} />
              CDISC SDTM v3.3 Tabular Dataset (DM &amp; EX Domains)
            </span>
            <span
              style={{
                fontSize: 10, fontWeight: 700,
                color: T.primaryOnDark,
                background: 'rgba(0,102,204,0.1)',
                border: '1px solid rgba(0,102,204,0.25)',
                padding: '2px 9px', borderRadius: 9999,
                letterSpacing: '0.04em',
              }}
            >
              Standard: CDASH / SDTM
            </span>
          </div>

          <pre
            style={{
              background: T.bg, border: `1px solid rgba(255,255,255,0.06)`,
              borderRadius: 11, padding: 16,
              fontSize: 11, lineHeight: 1.6,
              fontFamily: 'SF Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
              color: '#99ccff',
              overflowX: 'auto', overflowY: 'auto',
              height: 320, margin: 0,
            }}
          >
            {cdiscPreview ? JSON.stringify(cdiscPreview, null, 2) : 'Loading CDISC datasets…'}
          </pre>
        </div>
      </div>
    </div>
  );
};
