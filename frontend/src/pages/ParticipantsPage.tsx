import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Study } from '../types';
import {
  Users, UserPlus, FileCheck, Stethoscope,
  Upload, CheckCircle2, Pill, FileText, AlertTriangle,
} from 'lucide-react';
import {
  CANVAS, PARCHMENT, HAIRLINE, INK, INK_48, INK_80,
  PRIMARY, PRIMARY_FOCUS, PRIMARY_ON_DARK,
  SUCCESS, WARNING, DANGER, PURPLE,
  FONT_STACK, FONT_MONO,
  R_MD, R_LG, R_PILL,
  TYPE, BADGE, btnPrimary, inputField, labelOverline,
} from '../design';

/* ─────────────────── Types ─────────────────── */
interface ParticipantRecord {
  id: string;
  participant_code: string;
  age: number;
  gender: string;
  enrollment_date: string;
  status: string;
  consent?: { consent_type: string; language_code: string; consent_timestamp: string };
  visits?: Array<{
    visit_number: number;
    visit_type: string;
    prakriti_assessment: string;
    pathya_apathya_diet_score: number;
    namaste_terminology_code: string;
    modern_vitals_and_labs?: any;
  }>;
}

const NAMASTE = [
  { term: 'Tamaka Shwasa (Bronchial Asthma / Respiratory Distress)', code: 'NAMASTE_AYU_0842', icd11: 'CA23' },
  { term: 'Kasa (Chronic Productive Cough / Bronchitis)',             code: 'NAMASTE_AYU_0411', icd11: 'MD21' },
  { term: 'Chittodvega (Generalized Anxiety Disorder)',               code: 'NAMASTE_AYU_0194', icd11: '6B00' },
  { term: 'Amavata (Rheumatoid Arthritis / Joint Inflammation)',      code: 'NAMASTE_AYU_0302', icd11: 'FA20' },
  { term: 'Prameha / Madhumeha (Type-2 Diabetes Mellitus)',           code: 'NAMASTE_AYU_0621', icd11: '5A11' },
];

/* ─────────────────── Shared sub-components ─────────────────── */

/** Section card wrapper */
const Section: React.FC<{
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  accent?: string;
}> = ({ icon, title, badge, children, accent = PRIMARY }) => (
  <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, overflow: 'hidden' }}>
    {/* Section header strip */}
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 24px',
      borderBottom: `1px solid ${HAIRLINE}`,
      background: PARCHMENT,
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 600, color: accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {icon} {title}
      </span>
      {badge}
    </div>
    <div style={{ padding: 24 }}>
      {children}
    </div>
  </div>
);

/** Input with label — the verge.md form field pattern */
const Field: React.FC<{
  label: string;
  children: React.ReactNode;
  hint?: string;
  col?: number; /* grid column span */
}> = ({ label, children, hint }) => (
  <div>
    <label style={labelOverline()}>{label}</label>
    {children}
    {hint && <span style={{ display: 'block', fontSize: 11, color: INK_48, marginTop: 4, letterSpacing: '-0.08px' }}>{hint}</span>}
  </div>
);

const IS: React.CSSProperties = inputField(false); // base input style

/* ─────────────────── Main component ─────────────────── */
export const ParticipantsPage: React.FC = () => {
  const [studies, setStudies]           = useState<Study[]>([]);
  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);
  const [loading, setLoading]           = useState(false);
  const [tab, setTab]                   = useState<'ENROLL' | 'LIST'>('ENROLL');
  const [note, setNote]                 = useState<{ msg: string; ok: boolean } | null>(null);

  // ── Step 1: Demographics ──
  const [age, setAge]             = useState('38');
  const [gender, setGender]       = useState('Female');
  const [heightCm, setHeight]     = useState('162');
  const [weightKg, setWeight]     = useState('64');
  const [opd, setOpd]             = useState('OPD-2026-9481');
  const [consentFile, setCF]      = useState<File | null>(null);
  const [inclusion, setInclusion] = useState(true);

  // ── Step 2: Clinical CRF ──
  const [sysBP, setSysBP]       = useState('120');
  const [diaBP, setDiaBP]       = useState('80');
  const [pulse, setPulse]       = useState('78');
  const [diagnosis, setDx]      = useState(NAMASTE[0]);
  const [prakriti, setPrakriti] = useState('Vata-Pitta');

  // ── Diet checklist ──
  const [diet, setDiet] = useState({
    aharaTiming:       true,
    apathyaAvoided:    true,
    dinacharyaFollowed:true,
    herbalAnupana:     true,
  });

  // ── Derived ──
  const bmi          = (Number(weightKg) / ((Number(heightCm) / 100) ** 2)).toFixed(1);
  const dietScore    = Object.values(diet).filter(Boolean).length * 25;
  const study        = studies[0];
  const batch        = study?.ip_batches?.[0];
  const nextCode     = `SUBJ-AIIA-${String(participants.length + 1).padStart(3, '0')}`;

  const loadData = async () => {
    try {
      const sRes = await api.get('/study/list');
      setStudies(sRes.data);
      if (sRes.data[0]) {
        const pRes = await api.get(`/clinical/participants/study/${sRes.data[0].id}`);
        setParticipants(pRes.data);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!study) return;
    if (!inclusion) { alert('Cannot enroll: Subject must meet all inclusion/exclusion criteria.'); return; }
    setLoading(true); setNote(null);

    try {
      const pRes = await api.post('/clinical/participants/enroll', {
        study_id: study.id,
        participant_code: nextCode,
        age: Number(age), gender,
        enrollment_date: new Date().toISOString().split('T')[0],
        consent_type: 'WRITTEN',
        language_code: 'hi',
        witness_name: 'Dr. Clinical Coordinator',
      });

      if (consentFile) {
        const fd = new FormData();
        fd.append('file', consentFile); fd.append('study_id', study.id);
        fd.append('document_type', 'SIGNED_INFORMED_CONSENT');
        fd.append('uploaded_by', 'investigator@aiia.gov.in');
        await api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      await api.post('/clinical/visits/record', {
        participant_id: pRes.data.id,
        visit_number: 1, visit_type: 'BASELINE',
        visit_date: new Date().toISOString().split('T')[0],
        prakriti_assessment: prakriti,
        nidan_panchaka_findings: `Primary Diagnosis: ${diagnosis.term}. Hetu: Vata-Pitta vitiating lifestyle.`,
        pathya_apathya_diet_score: dietScore,
        namaste_terminology_code: diagnosis.code,
        dispensed_batch_no: batch?.batch_no || 'ASH-2026-B1',
        quantity_dispensed: 60,
        modern_vitals_and_labs: {
          opd_registration_no: opd,
          blood_pressure: `${sysBP}/${diaBP} mmHg`,
          pulse_rate: Number(pulse),
          height_cm: Number(heightCm),
          weight_kg: Number(weightKg),
          bmi: Number(bmi),
          icd11_code: diagnosis.icd11,
        },
      });

      setNote({ msg: `${nextCode} enrolled successfully. Baseline CRF saved, 60 units dispensed from Batch ${batch?.batch_no}.`, ok: true });
      setCF(null);
      loadData();
      setTab('LIST');
    } catch (err: any) {
      setNote({ msg: `Error: ${err.response?.data?.message || err.message}`, ok: false });
    } finally { setLoading(false); }
  };

  /* ───── Tab button style ───── */
  const tabBtn = (active: boolean, color: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '8px 18px', borderRadius: R_PILL,
    fontSize: 13, fontWeight: 600, letterSpacing: '-0.12px',
    cursor: 'pointer', border: 'none',
    background: active ? color : 'transparent',
    color: active ? '#ffffff' : INK_48,
    transition: 'all 0.12s ease', fontFamily: FONT_STACK,
  });

  /* ───── Checklist item ───── */
  const CheckItem: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: INK_80, letterSpacing: '-0.12px', lineHeight: 1.4 }}>
      <span style={{
        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
        border: `1.5px solid ${checked ? SUCCESS : HAIRLINE}`,
        background: checked ? SUCCESS : CANVAS,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.12s ease', cursor: 'pointer',
      }}
        onClick={() => onChange(!checked)}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </label>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontFamily: FONT_STACK }}>

      {/* ── Page header + tab switcher ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 600, color: INK, letterSpacing: '-0.374px', lineHeight: 1.47, margin: '0 0 6px' }}>
            Subject Enrollment &amp; Hybrid Clinical CRFs
          </h1>
          <p style={{ ...TYPE.caption, color: INK_48, margin: 0 }}>
            GCP-compliant screening, verified consent capture, NAMASTE diagnosis, and automated pharmacy dispensation.
          </p>
        </div>

        {/* Tab switcher — pill container */}
        <div style={{ display: 'flex', alignItems: 'center', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_PILL, padding: 4, gap: 2 }}>
          <button style={tabBtn(tab === 'ENROLL', PRIMARY)} onClick={() => setTab('ENROLL')}>
            <UserPlus size={13} /> Enroll New Subject
          </button>
          <button style={tabBtn(tab === 'LIST', SUCCESS)} onClick={() => setTab('LIST')}>
            <FileText size={13} /> Enrolled Cohort ({participants.length})
          </button>
        </div>
      </div>

      {/* ── Notification ── */}
      {note && (
        <div style={{
          padding: '13px 18px', borderRadius: R_MD,
          border: `1px solid ${note.ok ? 'rgba(52,199,89,0.30)' : 'rgba(255,69,58,0.30)'}`,
          background: note.ok ? 'rgba(52,199,89,0.06)' : 'rgba(255,69,58,0.06)',
          fontSize: 14, color: note.ok ? SUCCESS : DANGER, letterSpacing: '-0.224px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          {note.ok ? <CheckCircle2 size={16} style={{ flexShrink: 0 }} /> : <AlertTriangle size={16} style={{ flexShrink: 0 }} />}
          {note.msg}
        </div>
      )}

      {/* ══════════════════════════════
          TAB 1 — ENROLLMENT FORM
          ══════════════════════════════ */}
      {tab === 'ENROLL' && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── SECTION 1: Demographics ── */}
          <Section
            icon={<FileCheck size={12} />}
            title="Section 1 — Subject Eligibility & Baseline Demographics"
            badge={
              <span style={{
                fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700,
                color: PRIMARY, background: 'rgba(0,102,204,0.08)',
                border: `1px solid rgba(0,102,204,0.22)`,
                padding: '3px 12px', borderRadius: R_PILL, letterSpacing: '0.04em',
              }}>
                Auto-ID: {nextCode}
              </span>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Row 1: 4 columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 140px 1fr', gap: 16 }}>
                <Field label="Hospital OPD / IPD Registration Number">
                  <input type="text" value={opd} onChange={e => setOpd(e.target.value)} style={IS} required />
                </Field>

                <Field label="Age (Years)">
                  <input type="number" value={age} min="18" max="70" onChange={e => setAge(e.target.value)} style={IS} required />
                </Field>

                <Field label="Gender">
                  <select value={gender} onChange={e => setGender(e.target.value)} style={{ ...IS, appearance: 'none' }}>
                    {['Female', 'Male', 'Other'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </Field>

                <Field label="Height (cm) / Weight (kg) — BMI Auto-Calculated" hint={`Calculated BMI: ${bmi} kg/m²`}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="number" placeholder="Height cm" value={heightCm} onChange={e => setHeight(e.target.value)} style={{ ...IS, textAlign: 'center' }} />
                    <input type="number" placeholder="Weight kg" value={weightKg} onChange={e => setWeight(e.target.value)} style={{ ...IS, textAlign: 'center' }} />
                  </div>
                </Field>
              </div>

              {/* Row 2: consent upload + I/E criteria */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 16, borderTop: `1px solid ${HAIRLINE}` }}>
                <Field label="Upload Signed Informed Consent Form (PDF / Image)">
                  <div style={{
                    position: 'relative',
                    background: PARCHMENT, border: `1px dashed ${consentFile ? SUCCESS : HAIRLINE}`,
                    borderRadius: R_MD, padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    cursor: 'pointer', transition: 'border-color 0.15s',
                  }}>
                    <Upload size={14} color={consentFile ? SUCCESS : INK_48} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: consentFile ? SUCCESS : INK_48, letterSpacing: '-0.12px' }}>
                      {consentFile ? consentFile.name : 'Choose file — PDF or image'}
                    </span>
                    <input type="file" accept="application/pdf,image/*" onChange={e => setCF(e.target.files?.[0] || null)}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                  </div>
                </Field>

                <Field label="Inclusion / Exclusion Criteria">
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', fontSize: 14, color: INK_80, letterSpacing: '-0.224px', lineHeight: 1.47 }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 2,
                        border: `1.5px solid ${inclusion ? PRIMARY : HAIRLINE}`,
                        background: inclusion ? PRIMARY : CANVAS,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.12s ease', cursor: 'pointer',
                      }} onClick={() => setInclusion(!inclusion)}>
                        {inclusion && (
                          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                            <path d="M1 4.5L4 7.5L10 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      Subject satisfies all Protocol Inclusion &amp; Exclusion Criteria as per approved IEC protocol
                    </label>
                  </div>
                </Field>
              </div>
            </div>
          </Section>

          {/* ── SECTION 2: Clinical Vitals + CRF ── */}
          <Section
            icon={<Stethoscope size={12} />}
            title="Section 2 — Baseline Clinical Vitals & Ayurvedic CRF Assessment"
            accent={SUCCESS}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Row 1: Diagnosis + Prakriti */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
                <Field label="Clinical Indication — NAMASTE Diagnosis (ICD-11 Mapped)">
                  <select
                    value={diagnosis.code}
                    onChange={e => { const d = NAMASTE.find(n => n.code === e.target.value); if (d) setDx(d); }}
                    style={{ ...IS, appearance: 'none', fontWeight: 600 }}
                  >
                    {NAMASTE.map(d => <option key={d.code} value={d.code}>{d.term}</option>)}
                  </select>
                  {/* Code pills below the select — verge.md inline badge style */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <span style={{ ...BADGE.green, fontSize: 10 }}>
                      NAMASTE: {diagnosis.code}
                    </span>
                    <span style={{ ...BADGE.blue, fontSize: 10 }}>
                      ICD-11: {diagnosis.icd11}
                    </span>
                  </div>
                </Field>

                <Field label="Ayurvedic Prakriti Assessment">
                  <select value={prakriti} onChange={e => setPrakriti(e.target.value)} style={{ ...IS, appearance: 'none', fontWeight: 600 }}>
                    {['Vata-Pitta', 'Kapha-Vata', 'Pitta-Kapha', 'Tridoshaja'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </Field>
              </div>

              {/* Row 2: Vitals */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, paddingTop: 16, borderTop: `1px solid ${HAIRLINE}` }}>
                <Field label="Blood Pressure (Systolic / Diastolic)">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="number" value={sysBP} onChange={e => setSysBP(e.target.value)}
                      style={{ ...IS, textAlign: 'center', fontFamily: FONT_MONO }} />
                    <span style={{ fontSize: 14, color: INK_48, flexShrink: 0 }}>/</span>
                    <input type="number" value={diaBP} onChange={e => setDiaBP(e.target.value)}
                      style={{ ...IS, textAlign: 'center', fontFamily: FONT_MONO }} />
                    <span style={{ fontSize: 12, color: INK_48, flexShrink: 0 }}>mmHg</span>
                  </div>
                </Field>

                <Field label="Resting Pulse Rate">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="number" value={pulse} onChange={e => setPulse(e.target.value)}
                      style={{ ...IS, textAlign: 'center', fontFamily: FONT_MONO }} />
                    <span style={{ fontSize: 12, color: INK_48, flexShrink: 0 }}>bpm</span>
                  </div>
                </Field>

                <Field label="Pharmacy Dispensation (Auto)">
                  <div style={{
                    background: PARCHMENT, border: `1px solid ${HAIRLINE}`,
                    borderRadius: R_MD, padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <Pill size={14} color={SUCCESS} style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: 13, color: INK_80, lineHeight: 1.4 }}>
                      <strong style={{ color: INK }}>60 Capsules</strong> deducted from Batch{' '}
                      <strong style={{ color: SUCCESS }}>{batch?.batch_no || 'ASH-2026-B1'}</strong>
                    </div>
                  </div>
                </Field>
              </div>

              {/* Row 3: Pathya-Apathya Diet Checklist */}
              <div style={{
                background: PARCHMENT, border: `1px solid ${HAIRLINE}`,
                borderRadius: R_MD, padding: 20,
              }}>
                {/* Checklist header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: INK, letterSpacing: '-0.224px' }}>
                    Structured Pathya-Apathya (Diet &amp; Regimen) Compliance Checklist
                  </span>
                  {/* Auto-calculated score badge */}
                  <span style={{
                    fontSize: 13, fontWeight: 700, color: dietScore >= 75 ? SUCCESS : dietScore >= 50 ? WARNING : DANGER,
                    background: dietScore >= 75 ? 'rgba(52,199,89,0.08)' : dietScore >= 50 ? 'rgba(255,159,10,0.08)' : 'rgba(255,69,58,0.08)',
                    border: `1px solid ${dietScore >= 75 ? 'rgba(52,199,89,0.28)' : dietScore >= 50 ? 'rgba(255,159,10,0.28)' : 'rgba(255,69,58,0.28)'}`,
                    padding: '3px 14px', borderRadius: R_PILL, letterSpacing: '-0.12px',
                  }}>
                    Compliance: {dietScore}%
                  </span>
                </div>

                {/* Score progress bar */}
                <div style={{ height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: R_PILL, overflow: 'hidden', marginBottom: 18 }}>
                  <div style={{
                    height: '100%',
                    width: `${dietScore}%`,
                    background: dietScore >= 75 ? SUCCESS : dietScore >= 50 ? WARNING : DANGER,
                    borderRadius: R_PILL, transition: 'width 0.4s ease',
                  }} />
                </div>

                {/* 4 checklist items in 2x2 grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <CheckItem
                    label="Followed Ahara Kala (regular, timely meal intervals)"
                    checked={diet.aharaTiming}
                    onChange={v => setDiet({ ...diet, aharaTiming: v })}
                  />
                  <CheckItem
                    label="Avoided Apathya foods (heavy/fried, curd at night)"
                    checked={diet.apathyaAvoided}
                    onChange={v => setDiet({ ...diet, apathyaAvoided: v })}
                  />
                  <CheckItem
                    label="Followed Dinacharya regimen (hydration &amp; regular sleep)"
                    checked={diet.dinacharyaFollowed}
                    onChange={v => setDiet({ ...diet, dinacharyaFollowed: v })}
                  />
                  <CheckItem
                    label="Administered drug with prescribed Anupana (warm water)"
                    checked={diet.herbalAnupana}
                    onChange={v => setDiet({ ...diet, herbalAnupana: v })}
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* ── Submit CTA ── */}
          <button
            type="submit"
            disabled={loading}
            style={{ ...btnPrimary(loading), width: '100%', fontSize: 17, padding: '14px 22px', gap: 10 }}
            onMouseDown={e => !loading && (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <CheckCircle2 size={18} />
            {loading ? 'Executing Trial Transaction…' : `Enroll ${nextCode} & Submit Baseline CRF`}
          </button>
        </form>
      )}

      {/* ══════════════════════════════
          TAB 2 — ENROLLED COHORT TABLE
          ══════════════════════════════ */}
      {tab === 'LIST' && (
        <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: `1px solid ${HAIRLINE}`, background: PARCHMENT }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: INK, letterSpacing: '-0.374px', margin: 0 }}>
              Enrolled Cohort &amp; Baseline CRF Records
            </h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}` }}>
                  {['Subject Code', 'Demographics & Vitals', 'NAMASTE Diagnosis', 'Prakriti', 'Diet Score', 'Consent'].map(h => (
                    <th key={h} style={{
                      padding: '11px 18px', textAlign: 'left',
                      fontSize: 10, fontWeight: 600, color: INK_48,
                      textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 48, textAlign: 'center', fontSize: 14, color: INK_48 }}>
                      No participants enrolled yet. Use the Enroll tab to add the first subject.
                    </td>
                  </tr>
                ) : participants.map(p => {
                  const v = p.visits?.[0];
                  const prakritiLabel = (() => {
                    if (!v?.prakriti_assessment) return 'Vata-Pitta';
                    try { return JSON.parse(v.prakriti_assessment).dominant_prakriti || v.prakriti_assessment; }
                    catch { return v.prakriti_assessment; }
                  })();
                  const score = v?.pathya_apathya_diet_score ?? 100;
                  const scoreColor = score >= 75 ? SUCCESS : score >= 50 ? WARNING : DANGER;

                  return (
                    <tr
                      key={p.id}
                      style={{ borderBottom: `1px solid ${HAIRLINE}`, transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,102,204,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Subject Code — monospace */}
                      <td style={{ padding: '13px 18px' }}>
                        <span style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: INK }}>
                          {p.participant_code}
                        </span>
                      </td>

                      {/* Demographics + vitals */}
                      <td style={{ padding: '13px 18px' }}>
                        <span style={{ display: 'block', fontWeight: 600, color: INK, letterSpacing: '-0.224px' }}>
                          {p.age} yrs · {p.gender}
                        </span>
                        <span style={{ display: 'block', fontSize: 11, color: INK_48, marginTop: 2, fontFamily: FONT_MONO }}>
                          BP: {v?.modern_vitals_and_labs?.blood_pressure || '—'} · {v?.modern_vitals_and_labs?.pulse_rate || '—'} bpm
                        </span>
                      </td>

                      {/* NAMASTE Diagnosis */}
                      <td style={{ padding: '13px 18px' }}>
                        <span style={{ display: 'block', fontWeight: 600, color: INK, letterSpacing: '-0.224px', fontSize: 12, maxWidth: 220 }}>
                          {NAMASTE.find(n => n.code === v?.namaste_terminology_code)?.term?.split('(')[0]?.trim() || 'Tamaka Shwasa'}
                        </span>
                        <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: SUCCESS, marginTop: 2, display: 'block' }}>
                          {v?.namaste_terminology_code || 'NAMASTE_AYU_0842'}
                        </span>
                      </td>

                      {/* Prakriti */}
                      <td style={{ padding: '13px 18px' }}>
                        <span style={BADGE.blue}>{prakritiLabel}</span>
                      </td>

                      {/* Diet score */}
                      <td style={{ padding: '13px 18px' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: scoreColor }}>{score}%</span>
                        <div style={{ height: 3, background: 'rgba(0,0,0,0.08)', borderRadius: R_PILL, marginTop: 5, width: 60, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${score}%`, background: scoreColor, borderRadius: R_PILL }} />
                        </div>
                      </td>

                      {/* Consent */}
                      <td style={{ padding: '13px 18px' }}>
                        <span style={BADGE.green}>{p.consent?.consent_type || 'VERIFIED'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
