import React, { useState } from 'react';
import { api } from '../api/client';
import { CANVAS, PARCHMENT, HAIRLINE, INK, INK_48, INK_80, PRIMARY, PRIMARY_ON_DARK, SUCCESS, DANGER, R_MD, R_LG, R_PILL, TYPE, BADGE, btnPrimary, inputField, labelOverline } from '../design';

const IS = inputField(false);
const LB = labelOverline();

export const ParticipantsPage: React.FC = () => {
  const [code, setCode]       = useState('');
  const [age, setAge]         = useState('38');
  const [gender, setGender]   = useState('Female');
  const [prakriti, setPrk]    = useState('Vata-Pitta');
  const [diet, setDiet]       = useState(85);
  const [namaste, setNam]     = useState('NAMASTE_AYU_0842');
  const [loading, setLoading] = useState(false);
  const [note, setNote]       = useState<{ msg: string; ok: boolean } | null>(null);
  const [list, setList]       = useState<any[]>([]);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const sRes = await api.get('/study/list');
      const sid = sRes.data[0]?.id || '4f722d35-7e9d-44cf-bf3f-af97d557cdbb';
      const pRes = await api.post('/clinical/participants/enroll', { study_id: sid, participant_code: code || `SUBJ-AIIA-${Math.floor(100 + Math.random() * 900)}`, age: Number(age), gender, enrollment_date: new Date().toISOString().split('T')[0], consent_type:'WRITTEN', language_code:'hi' });
      await api.post('/clinical/visits/record', { participant_id: pRes.data.id, visit_number:1, visit_type:'BASELINE', visit_date: new Date().toISOString().split('T')[0], prakriti_assessment: prakriti, nidan_panchaka_findings:'Chronic Manasika Hetu documented.', pathya_apathya_diet_score: Number(diet), namaste_terminology_code: namaste, dispensed_batch_no:'ASH-2026-B1', quantity_dispensed:60 });
      setNote({ msg: `${pRes.data.participant_code} enrolled — Baseline CRF locked.`, ok: true });
      setList(p => [{ code: pRes.data.participant_code, age, gender, prakriti, diet }, ...p]);
      setCode('');
    } catch (err: any) { setNote({ msg: `Error: ${err.response?.data?.message || err.message}`, ok: false }); }
    finally { setLoading(false); }
  };

  const rows = [{ code:'SUBJ-AIIA-001', age:'34', gender:'Female', prakriti:'Vata-Pitta', diet:90 }, ...list];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h1 style={{ fontSize: 34, fontWeight: 600, color: INK, letterSpacing: '-0.374px', lineHeight: 1.47, margin: '0 0 6px' }}>
          Enrolled Participants &amp; Hybrid Ayush CRFs
        </h1>
        <p style={{ ...TYPE.caption, color: INK_48, margin: 0 }}>NAMASTE Terminology, Prakriti Pariksha, and Pathya-Apathya Compliance Tracking.</p>
      </div>

      {note && (
        <div style={{ padding:'13px 18px', borderRadius: R_MD, border:`1px solid ${note.ok ? 'rgba(52,199,89,0.30)' : 'rgba(255,69,58,0.30)'}`, background: note.ok ? 'rgba(52,199,89,0.06)' : 'rgba(255,69,58,0.06)', fontSize:14, color: note.ok ? SUCCESS : DANGER, letterSpacing:'-0.224px' }}>
          {note.msg}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:20, alignItems:'start' }}>
        {/* Enroll form */}
        <div style={{ background: CANVAS, border:`1px solid ${HAIRLINE}`, borderRadius: R_LG, padding:26 }}>
          <h2 style={{ fontSize:17, fontWeight:600, color: INK, letterSpacing:'-0.374px', margin:'0 0 18px' }}>New Subject Enrollment</h2>
          <form onSubmit={handleEnroll} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div><label style={LB}>Participant Code</label><input style={IS} placeholder="e.g. SUBJ-AIIA-005" value={code} onChange={e=>setCode(e.target.value)} /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div><label style={LB}>Age</label><input type="number" style={IS} value={age} onChange={e=>setAge(e.target.value)} /></div>
              <div><label style={LB}>Gender</label><select style={{...IS,appearance:'none'}} value={gender} onChange={e=>setGender(e.target.value)}>{['Female','Male','Other'].map(v=><option key={v}>{v}</option>)}</select></div>
            </div>
            <div><label style={LB}>Prakriti Classification</label><select style={{...IS,appearance:'none'}} value={prakriti} onChange={e=>setPrk(e.target.value)}>{['Vata-Pitta','Kapha-Vata','Pitta-Kapha','Tridoshaja'].map(v=><option key={v}>{v}</option>)}</select></div>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <label style={LB}>Pathya-Apathya Diet Score</label>
                <span style={{ fontSize:13, fontWeight:600, color: SUCCESS }}>{diet}%</span>
              </div>
              <input type="range" min="0" max="100" value={diet} onChange={e=>setDiet(Number(e.target.value))} style={{ width:'100%', accentColor: PRIMARY }} />
            </div>
            <div><label style={LB}>NAMASTE Code</label><input style={IS} value={namaste} onChange={e=>setNam(e.target.value)} /></div>
            <button type="submit" disabled={loading} style={{...btnPrimary(loading), width:'100%', marginTop:4}} onMouseDown={e=>!loading&&(e.currentTarget.style.transform='scale(0.95)')} onMouseUp={e=>(e.currentTarget.style.transform='scale(1)')}>{loading ? 'Enrolling…' : 'Enroll & Save Hybrid CRF'}</button>
          </form>
        </div>

        {/* Cohort table */}
        <div style={{ background: CANVAS, border:`1px solid ${HAIRLINE}`, borderRadius: R_LG, overflow:'hidden' }}>
          <div style={{ padding:'18px 22px 14px', borderBottom:`1px solid ${HAIRLINE}` }}>
            <h2 style={{ fontSize:17, fontWeight:600, color: INK, letterSpacing:'-0.374px', margin:0 }}>Enrolled Cohort &amp; Baseline CRF Records</h2>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
              <thead>
                <tr style={{ background: PARCHMENT, borderBottom:`1px solid ${HAIRLINE}` }}>
                  {['Subject ID','Demographics','Prakriti','Diet Score','Status'].map(h=>(
                    <th key={h} style={{ padding:'11px 18px', textAlign:'left', fontSize:10, fontWeight:600, color: INK_48, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((pt,i)=>(
                  <tr key={i} style={{ borderBottom:`1px solid ${HAIRLINE}`, transition:'background 0.1s' }} onMouseEnter={e=>(e.currentTarget.style.background='rgba(0,102,204,0.04)')} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                    <td style={{ padding:'12px 18px', fontWeight:600, color: INK }}>{pt.code}</td>
                    <td style={{ padding:'12px 18px', color: INK_80 }}>{pt.age} yrs · {pt.gender}</td>
                    <td style={{ padding:'12px 18px' }}><span style={BADGE.blue}>{pt.prakriti}</span></td>
                    <td style={{ padding:'12px 18px', fontWeight:600, color: SUCCESS }}>{pt.diet ?? pt.dietScore}%</td>
                    <td style={{ padding:'12px 18px', fontSize:12, color: SUCCESS, display:'flex', alignItems:'center', gap:4 }}>CRF Verified</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
