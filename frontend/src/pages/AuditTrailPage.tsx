import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { History, Search, ArrowRight } from 'lucide-react';

export const AuditTrailPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get('/audit/all')
      .then((res) => setLogs(res.data))
      .catch((err) => console.error(err));
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.entity_type.toLowerCase().includes(filter.toLowerCase()) ||
      l.user_email.toLowerCase().includes(filter.toLowerCase()) ||
      l.reason?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-[-0.02em] flex items-center gap-2">
            <History className="w-6 h-6 text-[#bf5af2]" />
            GCP / ALCOA+ Immutable Audit Trail Explorer
          </h1>
          <p className="text-xs text-[#7a7a7a] mt-1">
            Permanent, append-only record history stored in <code className="text-[#bf5af2]">audit_integrity_db</code>. Every change records Who, What, When, and Reason.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#7a7a7a]" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search by Entity, User, or Reason..."
            className="bg-[#1d1d1f] border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-[#7a7a7a] focus:outline-none focus:border-[#0066cc] w-72"
          />
        </div>
      </div>

      <div className="bg-[#1d1d1f] border border-white/10 rounded-[18px] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#cccccc]">
            <thead className="bg-[#000000] text-[#7a7a7a] uppercase font-semibold text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">Timestamp (UTC)</th>
                <th className="px-5 py-3.5">User & Role</th>
                <th className="px-5 py-3.5">Action & Entity</th>
                <th className="px-5 py-3.5">Change Delta (Old ➔ New)</th>
                <th className="px-5 py-3.5">GCP Audit Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4 font-mono text-[11px] text-[#7a7a7a]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-white block">{log.user_email}</span>
                    <span className="text-[10px] text-[#bf5af2] font-medium">{log.user_role}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="bg-[#bf5af2]/15 text-[#bf5af2] border border-[#bf5af2]/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {log.action}
                    </span>
                    <span className="block text-[11px] text-[#7a7a7a] mt-1 font-mono">{log.entity_type}</span>
                  </td>
                  <td className="px-5 py-4 font-mono text-[10px]">
                    {log.old_values ? (
                      <div className="flex items-center gap-1.5 text-[#7a7a7a]">
                        <span className="text-[#ff453a]">{JSON.stringify(log.old_values)}</span>
                        <ArrowRight className="w-3 h-3 text-[#7a7a7a] shrink-0" />
                        <span className="text-[#34c759]">{JSON.stringify(log.new_values)}</span>
                      </div>
                    ) : (
                      <span className="text-[#34c759]">Created: {JSON.stringify(log.new_values)}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-[#cccccc] text-xs max-w-xs">
                    {log.reason || 'Standard Transaction'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
