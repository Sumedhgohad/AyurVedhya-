import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { SaeClock, Study } from '../types';
import { ShieldAlert, Clock, Download, Plus, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import { CANVAS, PARCHMENT, HAIRLINE, TILE_1, INK, INK_48, INK_80, PRIMARY, SUCCESS, WARNING, DANGER, R_MD, R_LG, R_PILL, TYPE, FONT_MONO, btnPrimary, inputField, labelOverline } from '../design';

const IS = inputField(false);
const LB = labelOverline();

export const SafetyPage: React.FC = () => {
  const [clocks, setClocks]   = useState<SaeClock[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [showForm, setShow]   = useState(false);
  const [term, setTerm]       = useState('');
  const [sev, setSev]         = useState('SEVERE');
  const [serious, setSerious] = useState(true);
  const [causal, setCausal]   = useState('PROBABLE');
  const [action, setAction]   = useState('');
  const [loading, setLoading] = useState(false);
  const [note, setNote]       = useState<string | null>(null);

  const load = async () => {
    try {
      const [a, b] = await Promise.all([api.get('/safety/sae/active-clocks'), api.get('/study/list')]);
      setClocks(a.data); setStudies(b.data);
    } catch (err) { console.error(err); }
  };
  useEffect(() => { load(); const t = setInterval(load,5000); return ()=>clearInterval(t); }, []);

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault(); if (!studies[0]) return;
    setLoading(true);
    try {
      await api.post('/safety/ae/log', { study_id: studies[0].id, participant_id:'00000000-0000-0000-0000-000000000000', participant_code:`SUBJ-AIIA-00${Math.floor(1+Math.random()*9)}`, event_term:term, severity:sev, is_serious:serious, onset_date: new Date().toISOString().split('T')[0], causality:causal, compensation_status:'UNDER_REVIEW', action_taken: action||'Investigational medicine withheld; participant placed on clinical monitoring.', outcome:'Under Observation in AIIA Clinical Ward' });
      setNote('Adverse Event logged. If serious, 24-hour statutory countdown clock is now live.');
      setTerm(''); setAction(''); setShow(false); load();
    } catch (err: any) { setNote(`Error: ${err.response?.data?.message || err.message}`); }
    finally { setLoading(false); }
  };

  const dlNpvcc = async (id: string) => {
    try {
      const res = await api.get(`/safety/export/npvcc/${id}`);
      const blob = new Blob([JSON.stringify(res.data,null,2)],{type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download=`NPvCC_${id}.json`; a.click();
    } catch { alert('NPvCC Export failed.'); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
      {/* Header */}
      <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'flex-start', gap:14 }}>
        <div>
          <h1 style={{ fontSize:34, fontWeight:600, color: INK, letterSpacing:'-0.374px', lineHeight:1.47, margin:'0 0 6px', display:'flex', alignItems:'center', gap:10 }}>
            <ShieldAlert size={26} color={DANGER} /> Pharmacovigilance &amp; 24-Hour Statutory Safety Center
          </h1>
          <p style={{...TYPE.caption, color: INK_48, margin:0}}>Mandatory AEFA tracking under NDCT Rules 2019 and Ministry of Ayush NPvCC.</p>
        </div>
        <button onClick={()=>setShow(!showForm)} style={{ display:'flex', alignItems:'center', gap:8, background: showForm ? PARCHMENT : DANGER, color: showForm ? INK : '#ffffff', border: showForm ? `1px solid ${HAIRLINE}` : 'none', borderRadius: R_PILL, padding:'11px 22px', fontSize:14, fontWeight:600, cursor:'pointer', transition:'transform 0.1s', fontFamily:'inherit', flexShrink:0 }} onMouseDown={e=>(e.currentTarget.style.transform='scale(0.95)')} onMouseUp={e=>(e.currentTarget.style.transform='scale(1)')}>
          {showForm ? <X size={14}/> : <Plus size={14}/>} {showForm ? 'Close Form' : 'Log New Adverse Event'}
        </button>
      </div>

      {note && <div style={{ padding:'13px 18px', borderRadius: R_MD, background: PARCHMENT, border:`1px solid ${HAIRLINE}`, fontSize:14, color: INK_80, letterSpacing:'-0.224px' }}>{note}</div>}

      {/* AE Intake Form */}
      {showForm && (
        <div style={{ background: CANVAS, border:'1px solid rgba(255,69,58,0.30)', borderRadius: R_LG, padding:28 }}>
          <h2 style={{ fontSize:17, fontWeight:600, color: INK, letterSpacing:'-0.374px', margin:'0 0 18px', display:'flex', alignItems:'center', gap:8 }}>
            <AlertTriangle size={16} color={DANGER}/> Official NPvCC Adverse Event Intake Form
          </h2>
          <form onSubmit={handleLog} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div><label style={LB}>Adverse Event Term</label><input type="text" value={term} onChange={e=>setTerm(e.target.value)} placeholder="e.g. Acute Gastric Irritation" style={IS} required/></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div><label style={LB}>Severity</label><select value={sev} onChange={e=>setSev(e.target.value)} style={{...IS,appearance:'none'}}><option value="MILD">Mild</option><option value="MODERATE">Moderate</option><option value="SEVERE">Severe</option></select></div>
              <div><label style={LB}>WHO-UMC Causality</label><select value={causal} onChange={e=>setCausal(e.target.value)} style={{...IS,appearance:'none'}}><option value="CERTAIN">Certain</option><option value="PROBABLE">Probable</option><option value="POSSIBLE">Possible</option><option value="UNLIKELY">Unlikely</option></select></div>
            </div>
            <div><label style={LB}>Clinical Action Taken</label><input type="text" value={action} onChange={e=>setAction(e.target.value)} placeholder="e.g. Medicine suspended" style={IS}/></div>
            <div style={{ display:'flex', alignItems:'center' }}>
              <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:14, color: INK_80, letterSpacing:'-0.224px' }}>
                <input type="checkbox" checked={serious} onChange={e=>setSerious(e.target.checked)} style={{ width:16, height:16, accentColor: DANGER }}/>
                Mark as SAE — Triggers 24-Hr Clock
              </label>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <button type="submit" disabled={loading} style={{...btnPrimary(loading), background: DANGER, width:'100%'}} onMouseDown={e=>!loading&&(e.currentTarget.style.transform='scale(0.95)')} onMouseUp={e=>(e.currentTarget.style.transform='scale(1)')}>
                {loading ? 'Submitting…' : 'Save & Publish to Safety Queue'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Clock list */}
      <div>
        <p style={{ display:'flex', alignItems:'center', gap:7, ...TYPE.label, color: INK_48, margin:'0 0 14px' }}>
          <Clock size={12} color={DANGER}/> Active Statutory 24-Hour Countdown Clocks ({clocks.length})
        </p>

        {clocks.length === 0 ? (
          <div style={{ background: CANVAS, border:`1px solid ${HAIRLINE}`, borderRadius: R_LG, padding:48, textAlign:'center' }}>
            <CheckCircle2 size={30} color={SUCCESS} style={{ margin:'0 auto 10px' }}/>
            <p style={{ fontSize:17, fontWeight:600, color: SUCCESS, letterSpacing:'-0.374px', margin:'0 0 6px' }}>All SAE Clocks Clear</p>
            <p style={{...TYPE.caption, color: INK_48, margin:0}}>No active Serious Adverse Events. All trials 100% compliant with NDCT guidelines.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {clocks.map(sae=>(
              <div key={sae.id} style={{ background: TILE_1, border:'1px solid rgba(255,69,58,0.50)', borderRadius: R_LG, padding:'26px 30px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background: DANGER }}/>
                <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'center', gap:18 }}>
                  <div>
                    <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:10, marginBottom:10 }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:10, fontWeight:700, color: DANGER, background:'rgba(255,69,58,0.14)', border:'1px solid rgba(255,69,58,0.40)', padding:'3px 10px', borderRadius: R_PILL, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                        <AlertTriangle size={10}/> 24H Statutory Clock
                      </span>
                      <span style={{ fontSize:12, color:'rgba(255,255,255,0.50)' }}>Participant: <strong style={{ color:'#ffffff' }}>{sae.participant_code}</strong></span>
                    </div>
                    <h3 style={{ fontSize:21, fontWeight:600, color:'#ffffff', letterSpacing:'-0.374px', lineHeight:1.19, margin:'0 0 6px' }}>{sae.event_term}</h3>
                    <p style={{ fontSize:14, color:'#ff6961', letterSpacing:'-0.224px', margin:0 }}>Deadline: <strong>{new Date(sae.statutory_24h_deadline).toLocaleString()}</strong></p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:14, flexShrink:0 }}>
                    <div style={{ background:'#000', border:'1px solid rgba(255,69,58,0.35)', borderRadius: R_MD, padding:'11px 18px', textAlign:'right' }}>
                      <span style={{ fontSize:10, color:'rgba(255,255,255,0.45)', display:'block', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Time Remaining</span>
                      <span style={{ fontSize:28, fontWeight:700, color: sae.is_overdue ? DANGER : WARNING, letterSpacing:'-0.374px', fontFamily: FONT_MONO }}>{sae.status_label}</span>
                    </div>
                    <button onClick={()=>dlNpvcc(sae.id)} style={{ display:'flex', alignItems:'center', gap:7, background: DANGER, color:'#ffffff', border:'none', borderRadius: R_PILL, padding:'11px 22px', fontSize:14, fontWeight:600, cursor:'pointer', transition:'transform 0.1s', fontFamily:'inherit' }} onMouseDown={e=>(e.currentTarget.style.transform='scale(0.95)')} onMouseUp={e=>(e.currentTarget.style.transform='scale(1)')}>
                      <Download size={13}/> NPvCC Report
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
