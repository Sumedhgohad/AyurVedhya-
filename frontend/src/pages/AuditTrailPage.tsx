import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Search, ArrowRight } from 'lucide-react';

const T = {
  tile: '#1d1d1f',
  bg: '#000000',
  border: 'rgba(255,255,255,0.08)',
  ink: '#ffffff',
  muted: '#cccccc',
  dim: '#7a7a7a',
  primary: '#0066cc',
  primaryFocus: '#0071e3',
  success: '#34c759',
  danger: '#ff453a',
  purple: '#bf5af2',
};

export const AuditTrailPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);

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
            GCP / ALCOA+ Immutable Audit Trail Explorer
          </h1>
          <p style={{ fontSize: 14, color: T.dim, letterSpacing: '-0.224px', margin: 0 }}>
            Permanent, append-only record history stored in{' '}
            <code
              style={{
                fontSize: 12, color: T.purple,
                background: 'rgba(191,90,242,0.1)',
                padding: '1px 6px', borderRadius: 5,
                fontFamily: 'SF Mono, ui-monospace, monospace',
              }}
            >
              audit_integrity_db
            </code>
            . Every change records Who, What, When, and Reason.
          </p>
        </div>

        {/* Search input — pill shape per verge.md */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Search
            size={13}
            color={T.dim}
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search by entity, user, or reason…"
            style={{
              background: T.tile,
              border: `1px solid ${searchFocus ? T.primaryFocus : T.border}`,
              borderRadius: 9999,
              padding: '10px 16px 10px 36px',
              fontSize: 14,
              color: T.ink,
              letterSpacing: '-0.224px',
              outline: 'none',
              width: 280,
              fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
          />
        </div>
      </div>

      {/* Audit table */}
      <div
        style={{
          background: T.tile,
          border: `1px solid ${T.border}`,
          borderRadius: 18,
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%', borderCollapse: 'collapse',
              fontSize: 13, letterSpacing: '-0.12px',
            }}
          >
            <thead>
              <tr style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                {['Timestamp (UTC)', 'User & Role', 'Action & Entity', 'Change Delta (Old → New)', 'GCP Audit Reason'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 20px', textAlign: 'left',
                      fontSize: 10, fontWeight: 600, color: T.dim,
                      textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td
                    style={{
                      padding: '14px 20px',
                      fontFamily: 'SF Mono, ui-monospace, monospace',
                      fontSize: 11, color: T.dim, whiteSpace: 'nowrap',
                    }}
                  >
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span
                      style={{
                        display: 'block', fontSize: 13, fontWeight: 600,
                        color: T.ink, letterSpacing: '-0.224px',
                      }}
                    >
                      {log.user_email}
                    </span>
                    <span style={{ fontSize: 11, color: T.purple, fontWeight: 600 }}>
                      {log.user_role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: 10, fontWeight: 700,
                        color: T.purple,
                        background: 'rgba(191,90,242,0.1)',
                        border: '1px solid rgba(191,90,242,0.25)',
                        padding: '2px 9px', borderRadius: 9999,
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        marginBottom: 4,
                      }}
                    >
                      {log.action}
                    </span>
                    <span
                      style={{
                        display: 'block', fontSize: 11, color: T.dim,
                        fontFamily: 'SF Mono, ui-monospace, monospace',
                      }}
                    >
                      {log.entity_type}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: 'SF Mono, ui-monospace, monospace', fontSize: 11 }}>
                    {log.old_values ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ color: T.danger }}>{JSON.stringify(log.old_values)}</span>
                        <ArrowRight size={10} color={T.dim} style={{ flexShrink: 0 }} />
                        <span style={{ color: T.success }}>{JSON.stringify(log.new_values)}</span>
                      </div>
                    ) : (
                      <span style={{ color: T.success }}>Created: {JSON.stringify(log.new_values)}</span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '14px 20px', fontSize: 13,
                      color: T.muted, letterSpacing: '-0.12px', maxWidth: 260,
                    }}
                  >
                    {log.reason || 'Standard Transaction'}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: 48, textAlign: 'center',
                      fontSize: 14, color: T.dim, letterSpacing: '-0.224px',
                    }}
                  >
                    {logs.length === 0 ? 'Loading audit records…' : 'No records match your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
