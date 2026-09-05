import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Study } from '../types';
import {
  Users,
  UserPlus,
  FileCheck,
  Stethoscope,
  Upload,
  CheckCircle2,
  Lock,
  FolderKanban,
  FileText,
  Pill,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  CANVAS, PARCHMENT, PEARL, HAIRLINE, INK, INK_48, INK_80,
  PRIMARY, PRIMARY_FOCUS, PRIMARY_ON_DARK,
  SUCCESS, WARNING, DANGER, PURPLE,
  FONT_STACK, FONT_MONO,
  R_MD, R_LG, R_PILL,
  TYPE, BADGE
} from '../design';

interface ParticipantRecord {
  id: string;
  participant_code: string;
  age: number;
  gender: string;
  enrollment_date: string;
  status: string;
  consent?: {
    consent_type: string;
    language_code: string;
    consent_timestamp: string;
  };
  visits?: Array<{
    visit_number: number;
    visit_type: string;
    prakriti_assessment: string;
    pathya_apathya_diet_score: number;
    namaste_terminology_code: string;
    dispensed_batch_no?: string;
    modern_vitals_and_labs?: any;
  }>;
}

const NAMASTE_DIAGNOSES = [
  { term: 'Tamaka Shwasa (Bronchial Asthma / Respiratory Distress)', code: 'NAMASTE_AYU_0842', icd11: 'CA23' },
  { term: 'Kasa (Chronic Productive Cough / Bronchitis)', code: 'NAMASTE_AYU_0411', icd11: 'MD21' },
  { term: 'Chittodvega (Generalized Anxiety Disorder / Mental Stress)', code: 'NAMASTE_AYU_0194', icd11: '6B00' },
  { term: 'Amavata (Rheumatoid Arthritis / Joint Inflammation)', code: 'NAMASTE_AYU_0302', icd11: 'FA20' },
  { term: 'Prameha / Madhumeha (Type-2 Diabetes Mellitus)', code: 'NAMASTE_AYU_0621', icd11: '5A11' }
];

export const ParticipantsPage: React.FC = () => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [selectedStudyId, setSelectedStudyId] = useState<string>('');
  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ENROLL' | 'LIST'>('ENROLL');
  const [notification, setNotification] = useState<string | null>(null);

  // FORM 1: SUBJECT SCREENING & DEMOGRAPHICS (Default values removed except opdNumber)
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [opdNumber, setOpdNumber] = useState('OPD-2026-9481'); // Retained OPD reg number as instructed
  const [consentFile, setConsentFile] = useState<File | null>(null);
  const [inclusionChecked, setInclusionChecked] = useState(false);

  // FORM 2: CLINICAL VITALS & AYURVEDA CRF (Default values removed)
  const [systolicBp, setSystolicBp] = useState('');
  const [diastolicBp, setDiastolicBp] = useState('');
  const [pulseRate, setPulseRate] = useState('');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(NAMASTE_DIAGNOSES[0]);
  const [prakriti, setPrakriti] = useState('');

  // STRUCTURED DIET & LIFESTYLE CHECKLIST
  const [dietChecklist, setDietChecklist] = useState({
    aharaTiming: false,
    apathyaAvoided: false,
    dinacharyaFollowed: false,
    herbalAnupana: false
  });

  const currentStudy = studies.find((s) => s.id === selectedStudyId) || studies[0];
  const currentBatch = currentStudy?.ip_batches?.[0];
  const isEnrollingUnlocked = currentStudy?.status === 'ENROLLING' || currentStudy?.status === 'ONGOING';

  // Safe Auto-calculated BMI
  const numH = Number(heightCm);
  const numW = Number(weightKg);
  const bmi = (numH >= 50 && numW >= 20) ? (numW / ((numH / 100) ** 2)).toFixed(1) : '--';

  // Auto-calculated Diet Score
  const calculatedDietScore = Object.values(dietChecklist).filter(Boolean).length * 25;

  // Auto-generated Next Subject Code
  const studyPrefix = currentStudy?.short_code?.split('-')[1] || 'AIIA';
  const nextSubjectCode = `SUBJ-${studyPrefix}-00${participants.length + 1}`;

  const loadData = async (studyIdToLoad?: string) => {
    try {
      const studyRes = await api.get('/study/list');
      setStudies(studyRes.data);

      const targetId = studyIdToLoad || selectedStudyId || studyRes.data[0]?.id;
      if (targetId) {
        setSelectedStudyId(targetId);
        const pRes = await api.get(`/clinical/participants/study/${targetId}`);
        setParticipants(pRes.data);
      }
    } catch (err) {
      console.error('Error loading participants', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStudyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedStudyId(newId);
    setLoading(true);
    try {
      const pRes = await api.get(`/clinical/participants/study/${newId}`);
      setParticipants(pRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Logical Validation Function
  const validateInputs = (): string | null => {
    const numAge = Number(age);
    if (!age || isNaN(numAge) || numAge < 18 || numAge > 95) {
      return 'Age must be a valid number between 18 and 95 years.';
    }

    if (!gender) {
      return 'Please select a Gender for the subject.';
    }

    if (!heightCm || isNaN(numH) || numH < 50 || numH > 250) {
      return 'Height must be between 50 cm and 250 cm.';
    }

    if (!weightKg || isNaN(numW) || numW < 20 || numW > 250) {
      return 'Weight must be between 20 kg and 250 kg.';
    }

    const numSys = Number(systolicBp);
    if (!systolicBp || isNaN(numSys) || numSys < 60 || numSys > 250) {
      return 'Systolic Blood Pressure must be between 60 and 250 mmHg.';
    }

    const numDia = Number(diastolicBp);
    if (!diastolicBp || isNaN(numDia) || numDia < 40 || numDia > 150) {
      return 'Diastolic Blood Pressure must be between 40 and 150 mmHg.';
    }

    if (numSys <= numDia) {
      return 'Systolic BP must be greater than Diastolic BP.';
    }

    const numPulse = Number(pulseRate);
    if (!pulseRate || isNaN(numPulse) || numPulse < 40 || numPulse > 220) {
      return 'Resting Pulse Rate must be between 40 and 220 bpm.';
    }

    if (!prakriti) {
      return 'Please select an Ayurvedic Prakriti Assessment.';
    }

    return null;
  };

  const handleEnrollmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudy) return;

    if (!isEnrollingUnlocked) {
      alert(`LEGAL GUARD: Cannot enroll! Study '${currentStudy.short_code}' is in '${currentStudy.status}' status. It must have IEC Approval and CTRI Registration first.`);
      return;
    }

    const validationError = validateInputs();
    if (validationError) {
      setNotification(`❌ Validation Error: ${validationError}`);
      return;
    }

    if (!inclusionChecked) {
      alert('Cannot enroll: Subject must meet all protocol Inclusion and Exclusion criteria.');
      return;
    }

    setLoading(true);
    setNotification(null);

    try {
      // 1. If consent file attached, upload FIRST
      if (consentFile) {
        const formData = new FormData();
        formData.append('file', consentFile);
        formData.append('study_id', currentStudy.id);
        formData.append('document_type', 'SIGNED_INFORMED_CONSENT');
        formData.append('uploaded_by', 'investigator@aiia.gov.in');
        await api.post('/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // 2. Enroll Participant with Auto-Generated ID
      const patientRes = await api.post('/clinical/participants/enroll', {
        study_id: currentStudy.id,
        participant_code: nextSubjectCode,
        age: Number(age),
        gender,
        enrollment_date: new Date().toISOString().split('T')[0],
        consent_type: 'WRITTEN',
        language_code: 'hi',
        witness_name: 'Dr. Clinical Coordinator',
      });

      // 3. Record Baseline Hybrid CRF & Auto-Decrement Medicine Batch
      await api.post('/clinical/visits/record', {
        participant_id: patientRes.data.id,
        visit_number: 1,
        visit_type: 'BASELINE',
        visit_date: new Date().toISOString().split('T')[0],
        prakriti_assessment: prakriti,
        nidan_panchaka_findings: `Primary Diagnosis: ${selectedDiagnosis.term}. Vata-Pitta Hetu noted.`,
        pathya_apathya_diet_score: calculatedDietScore,
        namaste_terminology_code: selectedDiagnosis.code,
        dispensed_batch_no: currentBatch?.batch_no || 'ASH-2026-B1',
        quantity_dispensed: 60,
        modern_vitals_and_labs: {
          opd_registration_no: opdNumber,
          blood_pressure: `${systolicBp}/${diastolicBp} mmHg`,
          pulse_rate: Number(pulseRate),
          height_cm: Number(heightCm),
          weight_kg: Number(weightKg),
          bmi: Number(bmi),
          icd11_code: selectedDiagnosis.icd11
        },
      });

      setNotification(`✅ Successfully enrolled ${nextSubjectCode} into '${currentStudy.short_code}'! Baseline CRF saved and stock updated.`);
      setConsentFile(null);
      // Reset form values after successful submission
      setAge('');
      setGender('');
      setHeightCm('');
      setWeightKg('');
      setSystolicBp('');
      setDiastolicBp('');
      setPulseRate('');
      setPrakriti('');
      setInclusionChecked(false);
      setDietChecklist({ aharaTiming: false, apathyaAvoided: false, dinacharyaFollowed: false, herbalAnupana: false });

      loadData(currentStudy.id);
      setActiveTab('LIST');
    } catch (err: any) {
      setNotification(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontFamily: FONT_STACK }}>
      {/* HEADER WITH TABS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 600, color: INK, letterSpacing: '-0.374px', lineHeight: 1.47, margin: '0 0 6px' }}>
            Subject Enrollment &amp; Hybrid Clinical CRFs
          </h1>
          <p style={{ ...TYPE.caption, color: INK_48, margin: 0 }}>
            GCP-compliant screening, verified consent capture, NAMASTE diagnosis, and automated pharmacy dispensation.
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ background: PARCHMENT, border: `1px solid ${HAIRLINE}`, padding: 4, borderRadius: R_PILL, display: 'flex', gap: 4 }}>
          <button
            onClick={() => setActiveTab('ENROLL')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: activeTab === 'ENROLL' ? PRIMARY : 'transparent',
              color: activeTab === 'ENROLL' ? '#ffffff' : INK_80,
              border: 'none', borderRadius: R_PILL, padding: '8px 18px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease'
            }}
          >
            <UserPlus size={15} />
            Enroll New Subject
          </button>
          <button
            onClick={() => setActiveTab('LIST')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: activeTab === 'LIST' ? SUCCESS : 'transparent',
              color: activeTab === 'LIST' ? '#ffffff' : INK_80,
              border: 'none', borderRadius: R_PILL, padding: '8px 18px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease'
            }}
          >
            <FileText size={15} />
            Study Cohort ({participants.length})
          </button>
        </div>
      </div>

      {notification && (
        <div style={{
          padding: '12px 18px',
          background: notification.startsWith('❌') ? '#fff0f0' : '#eef6ff',
          border: `1px solid ${notification.startsWith('❌') ? DANGER : PRIMARY}`,
          borderRadius: R_MD, fontSize: 13, fontWeight: 600,
          color: notification.startsWith('❌') ? DANGER : PRIMARY,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', color: INK_48, cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>
      )}

      {/* TRIAL SELECTOR BANNER */}
      <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 20, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 280 }}>
          <div style={{ padding: 10, background: '#eef6ff', border: `1px solid ${PRIMARY}`, borderRadius: R_MD, color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderKanban size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ ...TYPE.label, color: INK_48, display: 'block', marginBottom: 4 }}>
              Select Active Clinical Trial Protocol
            </label>
            <select
              value={selectedStudyId}
              onChange={handleStudyChange}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD,
                padding: '9px 14px', color: INK, fontSize: 14, fontWeight: 600, outline: 'none'
              }}
            >
              {studies.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.short_code}] {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ ...TYPE.label, color: INK_48, display: 'block' }}>Trial Status</span>
            <span style={isEnrollingUnlocked ? BADGE.green : BADGE.amber}>
              {currentStudy?.status || 'LOADING...'}
            </span>
          </div>

          <div style={{ textAlign: 'right', borderLeft: `1px solid ${HAIRLINE}`, paddingLeft: 16 }}>
            <span style={{ ...TYPE.label, color: INK_48, display: 'block' }}>CTRI ID</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 600, color: PRIMARY }}>
              {currentStudy?.ctri_registration?.ctri_id || 'PENDING'}
            </span>
          </div>
        </div>
      </div>

      {/* GUARDED WARNING BANNER IF STUDY IS NOT ENROLLING */}
      {!isEnrollingUnlocked && (
        <div style={{
          padding: 16, background: '#fff8e6', border: `1px solid ${WARNING}`,
          borderRadius: R_LG, fontSize: 13, color: '#8a5300',
          display: 'flex', alignItems: 'flex-start', gap: 12, lineHeight: 1.4
        }}>
          <Lock size={18} color={WARNING} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>LEGAL GUARD ACTIVE:</strong> Patient enrollment for <strong>{currentStudy?.short_code}</strong> is currently locked because it is in <strong>{currentStudy?.status}</strong> state. Under ICMR &amp; NDCT Rules 2019, patient enrollment cannot begin until Institutional Ethics Committee (IEC) clearance and prospective CTRI registration are verified in the <strong>Trial Protocols</strong> tab.
          </div>
        </div>
      )}

      {/* TAB 1: ENROLLMENT FORM */}
      {activeTab === 'ENROLL' && (
        <form onSubmit={handleEnrollmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* SECTION 1: AUTO-IDENTIFIERS & DEMOGRAPHICS */}
          <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, overflow: 'hidden' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 24px', background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}`
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, ...TYPE.label, color: PRIMARY }}>
                <FileCheck size={16} />
                Section 1: Subject Eligibility &amp; Baseline Demographics
              </span>
              <span style={BADGE.blue}>
                Auto-Assigned ID: {nextSubjectCode}
              </span>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Hospital OPD/IPD Reg. Number
                  </label>
                  <input
                    type="text"
                    value={opdNumber}
                    onChange={(e) => setOpdNumber(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 14px', color: INK, fontSize: 14, outline: 'none' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Age (Years) <span style={{ color: DANGER }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="18"
                    max="95"
                    placeholder="e.g. 38 (18-95)"
                    style={{ width: '100%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 14px', color: INK, fontSize: 14, outline: 'none' }}
                    required
                  />
                  <span style={{ fontSize: 11, color: INK_48, marginTop: 4, display: 'block' }}>Range: 18 – 95 years</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Gender <span style={{ color: DANGER }}>*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 14px', color: gender ? INK : INK_48, fontSize: 14, outline: 'none' }}
                    required
                  >
                    <option value="">-- Select Gender --</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Height &amp; Weight (BMI) <span style={{ color: DANGER }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="number"
                      placeholder="Height (cm)"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      min="50"
                      max="250"
                      style={{ width: '50%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 10px', color: INK, fontSize: 14, textAlign: 'center', outline: 'none' }}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Weight (kg)"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      min="20"
                      max="250"
                      style={{ width: '50%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 10px', color: INK, fontSize: 14, textAlign: 'center', outline: 'none' }}
                      required
                    />
                  </div>
                  <span style={{ fontSize: 11, color: INK_48, marginTop: 4, display: 'block' }}>
                    BMI: <strong style={{ color: bmi === '--' ? INK_48 : INK }}>{bmi} kg/m²</strong> (Height: 50-250cm, Weight: 20-250kg)
                  </span>
                </div>
              </div>

              {/* Signed Consent Upload & Criteria Checklist */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, borderTop: `1px solid ${HAIRLINE}`, paddingTop: 16 }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    <Upload size={14} color={SUCCESS} />
                    Upload Signed Informed Consent Form (PDF / Image)
                  </label>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => setConsentFile(e.target.files?.[0] || null)}
                    style={{ width: '100%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '8px 12px', fontSize: 13, color: INK_80 }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', paddingTop: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: INK }}>
                    <input
                      type="checkbox"
                      checked={inclusionChecked}
                      onChange={(e) => setInclusionChecked(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: PRIMARY, borderRadius: 4 }}
                    />
                    Subject satisfies all Inclusion &amp; Exclusion Criteria for <strong>{currentStudy?.short_code}</strong>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: BASELINE VITALS & AYUSH HYBRID CRF */}
          <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, overflow: 'hidden' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 24px', background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}`
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, ...TYPE.label, color: SUCCESS }}>
                <Stethoscope size={16} />
                Section 2: Baseline Clinical Vitals &amp; Ayurvedic CRF Assessment
              </span>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Clinical Indication / Diagnosis (Search NAMASTE / ICD-11)
                  </label>
                  <select
                    value={selectedDiagnosis.code}
                    onChange={(e) => {
                      const found = NAMASTE_DIAGNOSES.find(d => d.code === e.target.value);
                      if (found) setSelectedDiagnosis(found);
                    }}
                    style={{ width: '100%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 14px', color: INK, fontSize: 14, fontWeight: 600, outline: 'none' }}
                  >
                    {NAMASTE_DIAGNOSES.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.term}
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: INK_48, marginTop: 6 }}>
                    <span>Attached NAMASTE Code: <strong style={{ color: SUCCESS, fontFamily: FONT_MONO }}>{selectedDiagnosis.code}</strong></span>
                    <span>WHO ICD-11 Code: <strong style={{ color: PRIMARY, fontFamily: FONT_MONO }}>{selectedDiagnosis.icd11}</strong></span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Ayurvedic Prakriti Assessment <span style={{ color: DANGER }}>*</span>
                  </label>
                  <select
                    value={prakriti}
                    onChange={(e) => setPrakriti(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 14px', color: prakriti ? INK : INK_48, fontSize: 14, outline: 'none' }}
                    required
                  >
                    <option value="">-- Select Prakriti --</option>
                    <option value="Vata-Pitta">Vata-Pitta (V:50%, P:35%, K:15%)</option>
                    <option value="Kapha-Vata">Kapha-Vata (K:50%, V:35%, P:15%)</option>
                    <option value="Pitta-Kapha">Pitta-Kapha (P:50%, K:35%, V:15%)</option>
                    <option value="Tridoshaja">Tridoshaja (Balanced Constitution)</option>
                  </select>
                </div>
              </div>

              {/* Vitals Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, borderTop: `1px solid ${HAIRLINE}`, paddingTop: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Blood Pressure (Sys / Dia) <span style={{ color: DANGER }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input
                      type="number"
                      placeholder="120"
                      value={systolicBp}
                      onChange={(e) => setSystolicBp(e.target.value)}
                      min="60"
                      max="250"
                      style={{ width: '45%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 10px', color: INK, fontSize: 14, textAlign: 'center', fontFamily: FONT_MONO, outline: 'none' }}
                      required
                    />
                    <span style={{ color: INK_48 }}>/</span>
                    <input
                      type="number"
                      placeholder="80"
                      value={diastolicBp}
                      onChange={(e) => setDiastolicBp(e.target.value)}
                      min="40"
                      max="150"
                      style={{ width: '45%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 10px', color: INK, fontSize: 14, textAlign: 'center', fontFamily: FONT_MONO, outline: 'none' }}
                      required
                    />
                    <span style={{ fontSize: 12, color: INK_48 }}>mmHg</span>
                  </div>
                  <span style={{ fontSize: 11, color: INK_48, marginTop: 4, display: 'block' }}>Sys: 60-250, Dia: 40-150</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Resting Pulse Rate <span style={{ color: DANGER }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input
                      type="number"
                      placeholder="e.g. 78"
                      value={pulseRate}
                      onChange={(e) => setPulseRate(e.target.value)}
                      min="40"
                      max="220"
                      style={{ width: '100%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 10px', color: INK, fontSize: 14, textAlign: 'center', fontFamily: FONT_MONO, outline: 'none' }}
                      required
                    />
                    <span style={{ fontSize: 12, color: INK_48 }}>bpm</span>
                  </div>
                  <span style={{ fontSize: 11, color: INK_48, marginTop: 4, display: 'block' }}>Range: 40 – 220 bpm</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Pharmacy Dispensation</label>
                  <div style={{ background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '8px 12px', fontSize: 12, color: INK_80 }}>
                    <span style={{ color: INK_48, display: 'block' }}>Auto-Dispensing:</span>
                    <strong>60 Capsules</strong> from Batch <strong style={{ color: SUCCESS, fontFamily: FONT_MONO }}>{currentBatch?.batch_no || 'ASH-2026-B1'}</strong>
                  </div>
                </div>
              </div>

              {/* STRUCTURED PATHYA-APATHYA CHECKLIST */}
              <div style={{ background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>
                    Structured Pathya-Apathya (Diet &amp; Regimen) Compliance Checklist
                  </span>
                  <span style={BADGE.green}>
                    Calculated Compliance: {calculatedDietScore}%
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, color: INK_80 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={dietChecklist.aharaTiming}
                      onChange={(e) => setDietChecklist({ ...dietChecklist, aharaTiming: e.target.checked })}
                      style={{ width: 16, height: 16, accentColor: SUCCESS }}
                    />
                    Followed Ahara Kala (Regular, timely meal intervals)
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={dietChecklist.apathyaAvoided}
                      onChange={(e) => setDietChecklist({ ...dietChecklist, apathyaAvoided: e.target.checked })}
                      style={{ width: 16, height: 16, accentColor: SUCCESS }}
                    />
                    Strictly avoided Apathya foods (heavy fried, cold/curd at night)
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={dietChecklist.dinacharyaFollowed}
                      onChange={(e) => setDietChecklist({ ...dietChecklist, dinacharyaFollowed: e.target.checked })}
                      style={{ width: 16, height: 16, accentColor: SUCCESS }}
                    />
                    Followed daily regimen (adequate hydration &amp; regular sleep)
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={dietChecklist.herbalAnupana}
                      onChange={(e) => setDietChecklist({ ...dietChecklist, herbalAnupana: e.target.checked })}
                      style={{ width: 16, height: 16, accentColor: SUCCESS }}
                    />
                    Administered trial drug with prescribed Anupana (warm water)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading || !isEnrollingUnlocked}
            style={{
              width: '100%', padding: '14px 0', borderRadius: R_PILL,
              border: 'none', fontSize: 15, fontWeight: 600,
              cursor: isEnrollingUnlocked ? 'pointer' : 'not-allowed',
              background: isEnrollingUnlocked ? PRIMARY : PARCHMENT,
              color: isEnrollingUnlocked ? '#ffffff' : INK_48,
              boxShadow: isEnrollingUnlocked ? '0 4px 14px rgba(0,102,204,0.25)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'transform 0.1s ease', fontFamily: FONT_STACK
            }}
          >
            {isEnrollingUnlocked ? (
              <>
                <CheckCircle2 size={18} />
                {loading ? 'Executing Trial Transaction...' : `Enroll ${nextSubjectCode} into ${currentStudy?.short_code}`}
              </>
            ) : (
              <>
                <Lock size={18} color={WARNING} />
                Enrollment Locked (Protocol Not in Enrolling State)
              </>
            )}
          </button>
        </form>
      )}

      {/* TAB 2: ENROLLED COHORT TABLE */}
      {activeTab === 'LIST' && (
        <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, overflow: 'hidden' }}>
          <div style={{ padding: '14px 24px', background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: INK }}>
              Active Cohort for: <strong style={{ color: PRIMARY }}>[{currentStudy?.short_code}] {currentStudy?.title}</strong>
            </span>
            <span style={{ fontFamily: FONT_MONO, color: INK_48 }}>Total Enrolled: {participants.length}</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}` }}>
                  {['Subject Code', 'Demographics & Vitals', 'Ayurvedic Diagnosis', 'Prakriti', 'Diet Score', 'Dispensed Batch'].map((h) => (
                    <th key={h} style={{ padding: '12px 18px', fontSize: 11, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: INK_48 }}>
                      No participants enrolled in this study yet. Switch to "Enroll New Subject" to register the first participant.
                    </td>
                  </tr>
                ) : (
                  participants.map((p) => {
                    const baselineVisit = p.visits?.[0];
                    return (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${HAIRLINE}`, transition: 'background 0.1s' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,102,204,0.03)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '14px 18px', fontFamily: FONT_MONO, fontWeight: 600, color: INK, fontSize: 13 }}>
                          {p.participant_code}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ display: 'block', fontWeight: 600, color: INK }}>{p.age} yrs • {p.gender}</span>
                          <span style={{ display: 'block', fontSize: 11, color: INK_48, marginTop: 2 }}>
                            BP: {baselineVisit?.modern_vitals_and_labs?.blood_pressure || '120/80 mmHg'} | Pulse: {baselineVisit?.modern_vitals_and_labs?.pulse_rate || 78} bpm
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ fontWeight: 600, color: INK, display: 'block' }}>
                            {baselineVisit?.namaste_terminology_code ? 'Tamaka Shwasa (Asthma)' : 'Anxiety Disorder'}
                          </span>
                          <span style={{ fontSize: 11, fontFamily: FONT_MONO, color: SUCCESS }}>
                            {baselineVisit?.namaste_terminology_code || 'NAMASTE_AYU_0842'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={BADGE.blue}>
                            {typeof baselineVisit?.prakriti_assessment === 'string' && baselineVisit.prakriti_assessment.startsWith('{')
                              ? JSON.parse(baselineVisit.prakriti_assessment).dominant_prakriti
                              : baselineVisit?.prakriti_assessment || 'Vata-Pitta'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ color: SUCCESS, fontWeight: 600, fontSize: 14 }}>
                            {baselineVisit?.pathya_apathya_diet_score ?? 100}%
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ ...BADGE.ink, fontFamily: FONT_MONO }}>
                            {baselineVisit?.dispensed_batch_no || 'ASH-2026-B1'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
