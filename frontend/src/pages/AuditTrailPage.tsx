import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Search, ArrowRight } from 'lucide-react';
import { CANVAS, PARCHMENT, HAIRLINE, INK, INK_48, INK_80, PRIMARY, PRIMARY_FOCUS, SUCCESS, DANGER, PURPLE, FONT_MONO, R_MD, R_LG, R_PILL, TYPE, BADGE } from '../design';

export const AuditTrailPage: React.FC = () => {
  const [logs, setLogs]       = useState<any[]>([]);
  const [filter, setFilter]   = useState('');
  const [focus, setFocus]     = useState(false);

  useEffect(() => { api.get('/audit/all').then(r=>setLogs(r.data)).catch(console.error); }, []);

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

        {/* Pill search input per verge.md */}
        <div style={{ position:'relative', flexShrink:0 }}>
          <Search size={12} color={INK_48} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }}/>
          <input type="text" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search by entity, user, or reason…"
            style={{ background: CANVAS, border:`1px solid ${focus ? PRIMARY_FOCUS : HAIRLINE}`, borderRadius: R_PILL, padding:'10px 16px 10px 36px', fontSize:14, color: INK, letterSpacing:'-0.224px', outline:'none', width:280, fontFamily:'inherit', transition:'border-color 0.15s' }}
            onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
          />
        </div>
      </div>

      {/* Table — canvas card */}
      <div style={{ background: CANVAS, border:`1px solid ${HAIRLINE}`, borderRadius: R_LG, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, letterSpacing:'-0.12px' }}>
            <thead>
              <tr style={{ background: PARCHMENT, borderBottom:`1px solid ${HAIRLINE}` }}>
                {['Timestamp (UTC)','User & Role','Action & Entity','Change Delta','GCP Audit Reason'].map(h=>(
                  <th key={h} style={{ padding:'11px 18px', textAlign:'left', fontSize:10, fontWeight:600, color: INK_48, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(log=>(
                <tr key={log.id} style={{ borderBottom:`1px solid ${HAIRLINE}`, transition:'background 0.1s' }} onMouseEnter={e=>(e.currentTarget.style.background='rgba(0,102,204,0.03)')} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                  <td style={{ padding:'13px 18px', fontFamily: FONT_MONO, fontSize:11, color: INK_48, whiteSpace:'nowrap' }}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={{ padding:'13px 18px' }}>
                    <span style={{ display:'block', fontSize:13, fontWeight:600, color: INK, letterSpacing:'-0.224px' }}>{log.user_email}</span>
                    <span style={{ fontSize:11, color: PURPLE, fontWeight:600 }}>{log.user_role}</span>
                  </td>
                  <td style={{ padding:'13px 18px' }}>
                    <span style={{...BADGE.purple, display:'inline-flex', marginBottom:4}}>{log.action}</span>
                    <span style={{ display:'block', fontSize:11, color: INK_48, fontFamily: FONT_MONO }}>{log.entity_type}</span>
                  </td>
                  <td style={{ padding:'13px 18px', fontFamily: FONT_MONO, fontSize:11 }}>
                    {log.old_values ? (
                      <div style={{ display:'flex', alignItems:'center', gap:5, flexWrap:'wrap' }}>
                        <span style={{ color: DANGER }}>{JSON.stringify(log.old_values)}</span>
                        <ArrowRight size={9} color={INK_48} style={{ flexShrink:0 }}/>
                        <span style={{ color: SUCCESS }}>{JSON.stringify(log.new_values)}</span>
                      </div>
                    ) : <span style={{ color: SUCCESS }}>Created: {JSON.stringify(log.new_values)}</span>}
                  </td>
                  <td style={{ padding:'13px 18px', fontSize:13, color: INK_80, letterSpacing:'-0.12px', maxWidth:240 }}>{log.reason || 'Standard Transaction'}</td>
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
