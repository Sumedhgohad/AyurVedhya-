import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Search, ArrowRight } from 'lucide-react';
import { CANVAS, PARCHMENT, HAIRLINE, INK, INK_48, INK_80, PRIMARY, PRIMARY_FOCUS, SUCCESS, DANGER, PURPLE, FONT_MONO, R_MD, R_LG, R_PILL, TYPE, BADGE } from '../design';
import { DEFAULT_AUDIT_LOGS } from '../types/defaultStudies';

/**
 * Render a JSON delta object as a compact vertical list of key: value pairs
 * rather than a raw JSON string. Keeps the cell narrow and readable.
 */
const DeltaCell: React.FC<{ label: string; values: Record<string, any> | null; color: string }> = ({ label, values, color }) => {
  if (!values || Object.keys(values).length === 0) return null;
  const entries = Object.entries(values);
  return (
    <div>
      <span style={{ fontSize: 9, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 3 }}>
        {label}
      </span>
      {entries.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', gap: 4, alignItems: 'baseline', marginBottom: 2 }}>
          <span style={{ color: INK_48, fontSize: 10, flexShrink: 0 }}>{k}:</span>
          <span style={{
            color,
            fontSize: 11,
            wordBreak: 'break-all',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          } as React.CSSProperties}>
            {typeof v === 'object' ? JSON.stringify(v) : String(v)}
          </span>
        </div>
      ))}
    </div>
  );
};

export const AuditTrailPage: React.FC = () => {
  const [logs, setLogs]       = useState<any[]>(DEFAULT_AUDIT_LOGS);
  const [filter, setFilter]   = useState('');
  const [focus, setFocus]     = useState(false);

  useEffect(() => {
    api.get('/audit/all')
      .then(r => {
        if (Array.isArray(r.data) && r.data.length > 0) {
          setLogs(r.data);
        }
      })
      .catch(console.error);
  }, []);

  const filtered = logs.filter(l =>
    l.entity_type.toLowerCase().includes(filter.toLowerCase()) ||
    l.user_email.toLowerCase().includes(filter.toLowerCase()) ||
    l.reason?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
      <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'flex-start', gap:14 }}>
        <div>
          <h1 style={{ fontSize:34, fontWeight:600, color: INK, letterSpacing:'-0.374px', lineHeight:1.47, margin:'0 0 6px' }}>
            GCP / ALCOA+ Immutable Audit Trail Explorer
          </h1>
          <p style={{...TYPE.caption, color: INK_48, margin:0}}>
            Permanent, append-only records stored in <code style={{ fontSize:12, color: PURPLE, background:'rgba(191,90,242,0.08)', padding:'1px 6px', borderRadius:5, fontFamily: FONT_MONO }}>audit_integrity_db</code>. Every change records Who, What, When, and Reason.
          </p>
        </div>

        {/* Pill search input */}
        <div className="w-full sm:w-72" style={{ position:'relative', flexShrink:0 }}>
          <Search size={12} color={INK_48} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }}/>
          <input type="text" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search by entity, user, or reason…"
            style={{ background: CANVAS, border:`1px solid ${focus ? PRIMARY_FOCUS : HAIRLINE}`, borderRadius: R_PILL, padding:'10px 16px 10px 36px', fontSize:14, color: INK, letterSpacing:'-0.224px', outline:'none', width:'100%', boxSizing:'border-box', fontFamily:'inherit', transition:'border-color 0.15s' }}
            onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
          />
        </div>
      </div>

      {/* Table — canvas card */}
      <div style={{ background: CANVAS, border:`1px solid ${HAIRLINE}`, borderRadius: R_LG, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', minWidth:880, borderCollapse:'collapse', fontSize:13, letterSpacing:'-0.12px', tableLayout:'fixed' }}>
            {/* Fixed column widths: prevents any single cell from blowing up the layout */}
            <colgroup>
              <col style={{ width:'148px' }} />  {/* Timestamp */}
              <col style={{ width:'180px' }} />  {/* User & Role */}
              <col style={{ width:'150px' }} />  {/* Action & Entity */}
              <col style={{ width:'260px' }} />  {/* Change Delta */}
              <col />                             {/* GCP Reason — takes remaining space */}
            </colgroup>
            <thead>
              <tr style={{ background: PARCHMENT, borderBottom:`1px solid ${HAIRLINE}` }}>
                {['Timestamp (UTC)','User & Role','Action & Entity','Change Delta','GCP Audit Reason'].map(h=>(
                  <th key={h} style={{ padding:'11px 18px', textAlign:'left', fontSize:10, fontWeight:600, color: INK_48, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap', overflow:'hidden' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(log=>(
                <tr key={log.id} style={{ borderBottom:`1px solid ${HAIRLINE}`, transition:'background 0.1s', verticalAlign:'top' }} onMouseEnter={e=>(e.currentTarget.style.background='rgba(0,102,204,0.03)')} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>

                  {/* Col 1: Timestamp */}
                  <td style={{ padding:'13px 18px', fontFamily: FONT_MONO, fontSize:11, color: INK_48, whiteSpace:'nowrap', overflow:'hidden' }}>
                    {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle:'short', timeStyle:'short' })}
                  </td>

                  {/* Col 2: User & Role */}
                  <td style={{ padding:'13px 18px', overflow:'hidden' }}>
                    <span style={{ display:'block', fontSize:12, fontWeight:600, color: INK, letterSpacing:'-0.12px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{log.user_email}</span>
                    <span style={{ fontSize:11, color: PURPLE, fontWeight:600 }}>{log.user_role}</span>
                  </td>

                  {/* Col 3: Action & Entity */}
                  <td style={{ padding:'13px 18px', overflow:'hidden' }}>
                    <span style={{...BADGE.purple, display:'inline-flex', marginBottom:4}}>{log.action}</span>
                    <span style={{ display:'block', fontSize:11, color: INK_48, fontFamily: FONT_MONO, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{log.entity_type}</span>
                  </td>

                  {/* Col 4: Change Delta — structured key/value instead of raw JSON */}
                  <td style={{ padding:'13px 18px', fontFamily: FONT_MONO, overflow:'hidden' }}>
                    {log.old_values ? (
                      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                        <DeltaCell label="Before" values={log.old_values} color={DANGER} />
                        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                          <div style={{ flex:1, height:1, background: HAIRLINE }} />
                          <ArrowRight size={9} color={INK_48} style={{ flexShrink:0 }} />
                          <div style={{ flex:1, height:1, background: HAIRLINE }} />
                        </div>
                        <DeltaCell label="After" values={log.new_values} color={SUCCESS} />
                      </div>
                    ) : (
                      <DeltaCell label="Created" values={log.new_values} color={SUCCESS} />
                    )}
                  </td>

                  {/* Col 5: GCP Audit Reason */}
                  <td style={{ padding:'13px 18px', fontSize:13, color: INK_80, letterSpacing:'-0.12px', wordBreak:'break-word', overflowWrap:'break-word' }}>
                    {log.reason || <span style={{ color: INK_48, fontStyle:'italic' }}>Standard Transaction</span>}
                  </td>

                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ padding:48, textAlign:'center', ...TYPE.caption, color: INK_48 }}>
                  {logs.length === 0 ? 'Loading audit records…' : 'No records match your search.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
