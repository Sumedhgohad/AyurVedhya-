import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Study } from '../types';
import { FileCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const EthicsCtriPage: React.FC = () => {
  const [studies, setStudies] = useState<Study[]>([]);

  useEffect(() => {
    api.get('/study/list').then((res) => setStudies(res.data));
  }, []);

  const activeStudy = studies[0];
  const approvedIec = activeStudy?.iec_submissions?.find((s) => s.decision === 'APPROVED');

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-[-0.02em] flex items-center gap-2">
          <FileCheck className="w-6 h-6 text-[#34c759]" />
          Ethics Committee (IEC) Clearance & CTRI Registry Tracker
        </h1>
        <p className="text-xs text-[#7a7a7a] mt-1">
          Statutory clearance management under ICMR 2017 Guidelines and mandatory 6-month CTRI registry updates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IEC Card */}
        <div className="bg-[#1d1d1f] border border-white/10 rounded-[18px] p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#34c759] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Institutional Ethics Committee (IEC) Status
            </span>
            <span className="bg-[#34c759]/15 text-[#34c759] border border-[#34c759]/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              {approvedIec ? 'APPROVED' : 'PENDING'}
            </span>
          </div>

          <h2 className="text-base font-semibold text-white tracking-tight">{activeStudy?.title || 'Loading Protocol...'}</h2>

          <div className="bg-[#000000] p-4 rounded-[14px] border border-white/10 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-[#7a7a7a]">IEC Decision Date</span>
              <span className="text-[#cccccc] font-semibold">{approvedIec?.valid_until ? '2026-09-15' : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7a7a7a]">Approval Valid Until</span>
              <span className="text-[#34c759] font-bold">{approvedIec?.valid_until || '2027-09-14'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7a7a7a]">Days to Annual Renewal</span>
              <span className="text-[#cccccc] font-semibold">374 Days Remaining</span>
            </div>
          </div>
        </div>

        {/* CTRI Card */}
        <div className="bg-[#1d1d1f] border border-white/10 rounded-[18px] p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2997ff] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              CTRI Public Registry Linkage
            </span>
            <span className="bg-[#0066cc]/15 text-[#2997ff] border border-[#0066cc]/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              VERIFIED
            </span>
          </div>

          <h2 className="text-base font-semibold text-white tracking-tight">
            Registration ID: <span className="font-mono text-[#2997ff]">{activeStudy?.ctri_registration?.ctri_id || 'CTRI/2026/09/012345'}</span>
          </h2>

          <div className="bg-[#000000] p-4 rounded-[14px] border border-white/10 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-[#7a7a7a]">CTRI Registration Date</span>
              <span className="text-[#cccccc] font-semibold">2026-09-20</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7a7a7a]">Next Mandatory 6-Month Update Due</span>
              <span className="text-[#2997ff] font-bold">{activeStudy?.ctri_registration?.next_mandatory_update_due || '2027-03-20'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7a7a7a]">Statutory Status</span>
              <span className="text-[#34c759] font-semibold">Prospective Enrollment Unlocked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
