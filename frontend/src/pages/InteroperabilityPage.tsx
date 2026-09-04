import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Study } from '../types';
import { Share2, Download, Code2, Database } from 'lucide-react';

export const InteroperabilityPage: React.FC = () => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [fhirPreview, setFhirPreview] = useState<any>(null);
  const [cdiscPreview, setCdiscPreview] = useState<any>(null);

  const activeStudy = studies[0];

  useEffect(() => {
    api.get('/study/list').then((res) => {
      setStudies(res.data);
      if (res.data[0]) {
        api.get(`/interop/fhir/bundle/${res.data[0].id}`).then((f) => setFhirPreview(f.data)).catch(() => null);
        api.get(`/interop/cdisc/sdtm/${res.data[0].id}`).then((c) => setCdiscPreview(c.data)).catch(() => null);
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
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-[-0.02em] flex items-center gap-2">
            <Share2 className="w-6 h-6 text-[#bf5af2]" />
            Universal Interoperability & Data Export Hub
          </h1>
          <p className="text-xs text-[#7a7a7a] mt-1">
            Dual data mapping: HL7 FHIR v4.0 for Ayushman Bharat (ABDM) and CDISC SDTM v3.3 for international scientific publishing.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => downloadJson(fhirPreview, `ABDM_FHIR_Bundle_${activeStudy?.short_code || 'AIIA'}.json`)}
            className="bg-[#bf5af2] hover:bg-[#a244d4] text-white font-normal text-xs px-4 py-2.5 rounded-full transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download ABDM FHIR JSON
          </button>
          <button
            onClick={() => downloadJson(cdiscPreview, `CDISC_SDTM_Datasets_${activeStudy?.short_code || 'AIIA'}.json`)}
            className="bg-[#0066cc] hover:bg-[#0052a3] text-white font-normal text-xs px-4 py-2.5 rounded-full transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download CDISC SDTM JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FHIR Box */}
        <div className="bg-[#1d1d1f] border border-white/10 rounded-[18px] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-semibold text-[#bf5af2] flex items-center gap-1.5 uppercase tracking-wider">
              <Code2 className="w-4 h-4" />
              HL7 FHIR v4.0 Bundle (Ayushman Bharat / Hospital EHR)
            </span>
            <span className="text-[10px] bg-[#bf5af2]/15 text-[#bf5af2] border border-[#bf5af2]/30 px-2.5 py-0.5 rounded-full font-bold">
              Profile: ResearchStudy
            </span>
          </div>

          <pre className="bg-[#000000] border border-white/10 p-4 rounded-[14px] text-[11px] font-mono text-[#e5ccff] overflow-x-auto h-80">
            {fhirPreview ? JSON.stringify(fhirPreview, null, 2) : 'Loading FHIR bundle...'}
          </pre>
        </div>

        {/* CDISC Box */}
        <div className="bg-[#1d1d1f] border border-white/10 rounded-[18px] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-semibold text-[#2997ff] flex items-center gap-1.5 uppercase tracking-wider">
              <Database className="w-4 h-4" />
              CDISC SDTM v3.3 Tabular Dataset (DM & EX Domains)
            </span>
            <span className="text-[10px] bg-[#0066cc]/15 text-[#2997ff] border border-[#0066cc]/30 px-2.5 py-0.5 rounded-full font-bold">
              Standard: CDASH / SDTM
            </span>
          </div>

          <pre className="bg-[#000000] border border-white/10 p-4 rounded-[14px] text-[11px] font-mono text-[#99ccff] overflow-x-auto h-80">
            {cdiscPreview ? JSON.stringify(cdiscPreview, null, 2) : 'Loading CDISC datasets...'}
          </pre>
        </div>
      </div>
    </div>
  );
};
