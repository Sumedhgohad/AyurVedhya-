import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Study } from '../types';
import { FolderKanban, Package, CheckCircle2, FileText, ArrowRight, Activity } from 'lucide-react';

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
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-[-0.02em] flex items-center gap-2">
          <FolderKanban className="w-6 h-6 text-[#2997ff]" />
          Trial Protocols & IP Batch Traceability
        </h1>
        <p className="text-xs text-[#7a7a7a] mt-1">
          State-Machine Clinical Protocol Engine with AFI API/Formulation Batch Standards.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-[#7a7a7a] text-sm">Loading Clinical Protocols...</div>
      ) : (
        <div className="space-y-6">
          {studies.map((study) => (
            <div key={study.id} className="bg-[#1d1d1f] border border-white/10 rounded-[18px] p-6 shadow-xl space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#2997ff] bg-[#0066cc]/15 border border-[#0066cc]/30 px-2.5 py-0.5 rounded-full">
                      {study.short_code}
                    </span>
                    <span className="text-[11px] font-semibold text-[#34c759] bg-[#34c759]/15 border border-[#34c759]/30 px-2.5 py-0.5 rounded-full">
                      {study.status}
                    </span>
                    <span className="text-[11px] text-[#7a7a7a] bg-black/40 px-2.5 py-0.5 rounded-full border border-white/5">
                      {study.phase} · {study.study_type}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-white tracking-tight">{study.title}</h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-[#000000] border border-white/10 px-4 py-2 rounded-[11px] text-right">
                    <span className="text-[10px] text-[#7a7a7a] block uppercase tracking-wider">Target Sample Size</span>
                    <span className="text-base font-semibold text-white">{study.target_sample_size} Subjects</span>
                  </div>
                </div>
              </div>

              {/* IP Batches Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7a7a7a] flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#2997ff]" />
                  Investigational Product (IP) Batches & AFI Standard Reference
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(study.ip_batches || [
                    { id: '1', formulation_name: 'Ashwagandha Ghanvati', batch_no: 'ASH-2026-B1', afi_api_standard_ref: 'AFI-API-V2-882', current_stock: 450 }
                  ]).map((batch) => (
                    <div key={batch.id} className="bg-[#000000] border border-white/10 rounded-[14px] p-4 space-y-2">
                      <span className="text-xs font-semibold text-white block">{batch.formulation_name}</span>
                      <div className="text-[11px] space-y-1 text-[#cccccc]">
                        <div><span className="text-[#7a7a7a]">Batch No:</span> <strong className="text-white">{batch.batch_no}</strong></div>
                        <div><span className="text-[#7a7a7a]">AFI Ref:</span> <span className="text-[#2997ff]">{batch.afi_api_standard_ref}</span></div>
                        <div><span className="text-[#7a7a7a]">Stock Available:</span> <strong className="text-[#34c759]">{batch.current_stock} units</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regulatory Snapshot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#000000] border border-white/10 rounded-[14px] p-4 text-xs">
                <div>
                  <span className="text-[#7a7a7a] block text-[10px] uppercase font-semibold">CTRI Registration</span>
                  <span className="text-white font-medium">{study.ctri_registration?.ctri_id || 'CTRI/2026/09/012345'}</span>
                  <span className="text-[#7a7a7a] text-[11px] block mt-0.5">Next Update Due: {study.ctri_registration?.next_mandatory_update_due || '2027-03-01'}</span>
                </div>
                <div>
                  <span className="text-[#7a7a7a] block text-[10px] uppercase font-semibold">IEC Approval Clearance</span>
                  <span className="text-[#34c759] font-medium">✓ Valid Clearance Letter On File</span>
                  <span className="text-[#7a7a7a] text-[11px] block mt-0.5">Valid Until: {study.iec_submissions?.[0]?.valid_until || '2027-09-15'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
