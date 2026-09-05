import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Study, StudyArm, VisitDefinition } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  FolderKanban,
  Plus,
  Pill,
  FileCheck,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Layers,
  Calendar,
  ChevronRight,
  Clock,
  Award,
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import {
  CANVAS, PARCHMENT, PEARL, HAIRLINE, INK, INK_48, INK_80,
  PRIMARY, PRIMARY_FOCUS, PRIMARY_ON_DARK,
  SUCCESS, WARNING, DANGER, PURPLE,
  FONT_STACK, FONT_MONO,
  R_MD, R_LG, R_PILL,
  TYPE, BADGE, btnPrimary, btnSecondary, btnUtility, inputField, labelOverline
} from '../design';

export const StudiesPage: React.FC = () => {
  const { user } = useAuth();
  const [studies, setStudies] = useState<Study[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // WIZARD STATE
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // FORM 1: CREATE STUDY IDENTITY
  const [shortCode, setShortCode] = useState('');
  const [title, setTitle] = useState('');
  const [phase, setPhase] = useState('Phase 2');
  const [studyType, setStudyType] = useState('Interventional RCT');
  const [sampleSize, setSampleSize] = useState('100');

  // FORM 2: STUDY ARMS
  const [armCode, setArmCode] = useState('ARM-A');
  const [armLabel, setArmLabel] = useState('Intervention — Ashwagandha Extract 500mg');
  const [armType, setArmType] = useState('INTERVENTION');
  const [armDesc, setArmDesc] = useState('');

  // FORM 3: VISIT SCHEDULE MATRIX
  const [selectedArmId, setSelectedArmId] = useState<string>('');
  const [visitName, setVisitName] = useState('Day 15 Follow-up');
  const [visitDay, setVisitDay] = useState('15');
  const [windowMinus, setWindowMinus] = useState('-2');
  const [windowPlus, setWindowPlus] = useState('2');
  const [visitType, setVisitType] = useState('FOLLOW_UP');

  // FORM 4: IP MEDICINE BATCH
  const [formulation, setFormulation] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [standardRef, setStandardRef] = useState('API Part-1 Vol-1');
  const [mfgDate, setMfgDate] = useState('2026-08-01');
  const [expDate, setExpDate] = useState('2028-08-01');
  const [quantity, setQuantity] = useState('5000');

  const loadStudies = async () => {
    try {
      const res = await api.get('/study/list');
      setStudies(res.data);
      if (res.data.length > 0) {
        if (!selectedStudy) {
          setSelectedStudy(res.data[0]);
          if (res.data[0].study_arms?.length > 0) {
            setSelectedArmId(res.data[0].study_arms[0].id);
          }
        } else {
          const updated = res.data.find((s: Study) => s.id === selectedStudy.id);
          if (updated) {
            setSelectedStudy(updated);
            if (updated.study_arms?.length > 0 && !selectedArmId) {
              setSelectedArmId(updated.study_arms[0].id);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStudies();
  }, []);

  useEffect(() => {
    if (selectedStudy?.study_arms && selectedStudy.study_arms.length > 0) {
      if (!selectedStudy.study_arms.some(a => a.id === selectedArmId)) {
        setSelectedArmId(selectedStudy.study_arms[0].id);
      }
    }
  }, [selectedStudy]);

  // 1. CREATE NEW TRIAL (IDENTITY)
  const handleCreateStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/study/create', {
        short_code: shortCode || `AIIA-AYU-${Math.floor(10 + Math.random() * 89)}`,
        title,
        phase,
        study_type: studyType,
        target_sample_size: Number(sampleSize),
        start_date: new Date().toISOString().split('T')[0],
        planned_end_date: '2027-06-30',
      });
      setNotification(`✅ Study '${res.data.short_code}' created! Proceeding to Arm Configuration.`);
      setTitle('');
      setShortCode('');
      await loadStudies();
      setSelectedStudy(res.data);
      setWizardStep(2);
    } catch (err: any) {
      setNotification(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. ADD STUDY ARM
  const handleAddArm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudy) return;
    setLoading(true);
    try {
      const res = await api.post(`/study/${selectedStudy.id}/arms`, {
        arm_code: armCode,
        label: armLabel,
        arm_type: armType,
        description: armDesc,
      });
      setNotification(`✅ Study Arm '${res.data.arm_code}' added to protocol.`);
      setArmCode('ARM-B');
      setArmLabel('Comparator — Standard Treatment');
      setArmType('COMPARATOR');
      await loadStudies();
    } catch (err: any) {
      setNotification(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 3. ADD VISIT DEFINITION TO ARM
  const handleAddVisitDef = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArmId) {
      setNotification('❌ Please select a Study Arm first.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post(`/study/arms/${selectedArmId}/visits`, {
        visit_name: visitName,
        visit_day: Number(visitDay),
        window_minus: Math.abs(Number(windowMinus)),
        window_plus: Math.abs(Number(windowPlus)),
        visit_type: visitType,
      });
      setNotification(`✅ Visit '${res.data.visit_name}' (Day ${res.data.visit_day}) mapped to Protocol Matrix.`);
      setVisitName('Day 30 Follow-up');
      setVisitDay('30');
      await loadStudies();
    } catch (err: any) {
      setNotification(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 4. SUBMIT TO IEC (INVESTIGATOR ACTION)
  const handleIecSubmit = async () => {
    if (!selectedStudy) return;
    setLoading(true);
    try {
      await api.post(`/study/${selectedStudy.id}/iec-submit`, {
        submission_date: new Date().toISOString().split('T')[0],
      });
      setNotification(`✅ Study '${selectedStudy.short_code}' submitted to Ethics Secretariat!`);
      await loadStudies();
    } catch (err: any) {
      setNotification(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 5. ADD IP MEDICINE BATCH
  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudy) return;
    setLoading(true);
    try {
      await api.post(`/study/${selectedStudy.id}/ip-batch`, {
        formulation_name: formulation,
        batch_no: batchNo || `BATCH-2026-${Math.floor(10 + Math.random() * 89)}`,
        afi_api_standard_ref: standardRef,
        manufacturing_date: mfgDate,
        expiry_date: expDate,
        quantity: Number(quantity),
      });
      setNotification(`✅ Medicine batch '${batchNo}' logged with ${quantity} units stock.`);
      setShowBatchModal(false);
      setFormulation('');
      setBatchNo('');
      await loadStudies();
    } catch (err: any) {
      setNotification(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (step: string) => {
    const status = selectedStudy?.status || 'DRAFT';
    if (step === 'DRAFT') return 'COMPLETED';
    if (step === 'IEC_SUBMITTED') {
      if (['IEC_SUBMITTED', 'IEC_APPROVED', 'ENROLLING', 'ONGOING', 'CLOSED'].includes(status)) return 'COMPLETED';
      return 'PENDING';
    }
    if (step === 'IEC_APPROVED') {
      if (['IEC_APPROVED', 'ENROLLING', 'ONGOING', 'CLOSED'].includes(status)) return 'COMPLETED';
      return 'PENDING';
    }
    if (step === 'CTRI_LINKED') {
      if (['ENROLLING', 'ONGOING', 'CLOSED'].includes(status)) return 'COMPLETED';
      return 'PENDING';
    }
    if (step === 'ENROLLING') {
      if (['ENROLLING', 'ONGOING', 'CLOSED'].includes(status)) return 'COMPLETED';
      return 'LOCKED';
    }
    return 'PENDING';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontFamily: FONT_STACK }}>
      {/* PAGE HEADER */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 600, color: INK, letterSpacing: '-0.374px', lineHeight: 1.47, margin: '0 0 6px' }}>
            Trial Setup &amp; Protocol Architecture
          </h1>
          <p style={{ ...TYPE.caption, color: INK_48, margin: 0 }}>
            Configure clinical trial protocol structure, study arms, visit matrix tolerances, and Investigational Product (IP) inventory.
          </p>
        </div>

        <button
          onClick={() => {
            setShowCreateModal(true);
            setWizardStep(1);
          }}
          style={btnPrimary()}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Plus size={16} />
          Create New Clinical Trial
        </button>
      </div>

      {notification && (
        <div style={{
          padding: '12px 18px', background: '#eef6ff', border: `1px solid ${PRIMARY}`,
          borderRadius: R_MD, fontSize: 13, fontWeight: 600, color: PRIMARY,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', color: INK_48, cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>
      )}

      {/* SELECTOR & DETAIL CARD GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: 20 }}>
        {/* Left: Study List Selector */}
        <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: `1px solid ${HAIRLINE}` }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: INK_48, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Registered Trials ({studies.length})
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 520, overflowY: 'auto' }}>
            {studies.map((s) => {
              const isSel = selectedStudy?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedStudy(s)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: R_MD,
                    background: isSel ? PARCHMENT : CANVAS,
                    border: `1px solid ${isSel ? PRIMARY : HAIRLINE}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: PRIMARY, fontFamily: FONT_MONO }}>
                      {s.short_code}
                    </span>
                    <span style={{
                      ...BADGE[
                        s.status === 'ENROLLING' ? 'green' :
                        s.status === 'IEC_APPROVED' ? 'blue' :
                        s.status === 'IEC_SUBMITTED' ? 'amber' : 'ink'
                      ]
                    }}>
                      {s.status}
                    </span>
                  </div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: INK, margin: '0 0 6px', lineHeight: 1.3, letterSpacing: '-0.224px' }}>
                    {s.title}
                  </h4>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: INK_48 }}>
                    <span>{s.phase}</span>
                    <span>•</span>
                    <span>{s.study_arms?.length || 0} Arms</span>
                    <span>•</span>
                    <span>N={s.target_sample_size}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Protocol View & State Machine Stepper */}
        {selectedStudy ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* CARD 1: GUARDED STATE MACHINE STEPPER */}
            <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: PRIMARY, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    GCP Governance &amp; Regulatory Workflow
                  </span>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: INK, margin: '2px 0 0', letterSpacing: '-0.374px' }}>
                    {selectedStudy.short_code}: {selectedStudy.title}
                  </h3>
                </div>
                <span style={{ ...BADGE.blue }}>Phase: {selectedStudy.phase}</span>
              </div>

              {/* Stepper progress bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 20 }}>
                {[
                  { key: 'DRAFT', label: '1. Protocol Setup', desc: 'Investigator Draft' },
                  { key: 'IEC_SUBMITTED', label: '2. IEC Submission', desc: 'Ethics Review' },
                  { key: 'IEC_APPROVED', label: '3. Ethics Approved', desc: 'Clearance Granted' },
                  { key: 'CTRI_LINKED', label: '4. CTRI Registered', desc: 'Public Registry' },
                  { key: 'ENROLLING', label: '5. Enrolling Patients', desc: 'Subject Enrollment' },
                ].map((st, idx) => {
                  const state = getStepStatus(st.key);
                  const isActive = selectedStudy.status === st.key;
                  return (
                    <div
                      key={st.key}
                      style={{
                        background: isActive ? '#f0f7ff' : PARCHMENT,
                        border: `1px solid ${isActive ? PRIMARY : state === 'COMPLETED' ? SUCCESS : HAIRLINE}`,
                        borderRadius: R_MD,
                        padding: '10px 12px',
                        display: 'flex', flexDirection: 'column', gap: 4
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? PRIMARY : INK_48 }}>
                          {st.label}
                        </span>
                        {state === 'COMPLETED' ? (
                          <CheckCircle2 size={12} color={SUCCESS} />
                        ) : state === 'LOCKED' ? (
                          <Lock size={12} color={INK_48} />
                        ) : (
                          <Clock size={12} color={WARNING} />
                        )}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: INK_80 }}>{st.desc}</span>
                    </div>
                  );
                })}
              </div>

              {/* Investigator Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: PARCHMENT, padding: '12px 16px', borderRadius: R_MD, border: `1px solid ${HAIRLINE}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldAlert size={16} color={PRIMARY} />
                  <span style={{ fontSize: 13, color: INK_80 }}>
                    {selectedStudy.status === 'DRAFT' && 'Protocol configuration in progress. Submit to IEC when ready.'}
                    {selectedStudy.status === 'IEC_SUBMITTED' && 'Submitted to Ethics Secretariat. Awaiting Compliance Officer review.'}
                    {selectedStudy.status === 'IEC_APPROVED' && 'Ethics Approved. Awaiting CTRI Registration by Compliance Officer.'}
                    {selectedStudy.status === 'ENROLLING' && 'Prospective Enrollment is ACTIVE and GCP compliant.'}
                  </span>
                </div>

                {selectedStudy.status === 'DRAFT' && (
                  <button
                    onClick={handleIecSubmit}
                    disabled={loading}
                    style={btnPrimary(loading)}
                  >
                    <FileCheck size={14} /> Submit to IEC
                  </button>
                )}

                {(selectedStudy.status === 'IEC_SUBMITTED' || selectedStudy.status === 'IEC_APPROVED') && (
                  <div style={{ fontSize: 12, fontWeight: 600, color: PURPLE, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lock size={12} /> Compliance Officer Action Required (Ethics Console)
                  </div>
                )}
              </div>
            </div>

            {/* CARD 2: PROTOCOL ARCHITECTURE (STUDY ARMS & VISIT MATRIX) */}
            <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: INK, margin: 0, letterSpacing: '-0.374px' }}>
                    Protocol Architecture: Study Arms &amp; Visit Matrix
                  </h3>
                  <p style={{ fontSize: 13, color: INK_48, margin: '2px 0 0' }}>
                    Intervention/Comparator arms and Schedule of Events with visit window tolerances.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setWizardStep(2)}
                    style={btnUtility(PARCHMENT)}
                  >
                    <Layers size={14} color={PRIMARY} /> Add Study Arm
                  </button>
                  <button
                    onClick={() => setWizardStep(3)}
                    style={btnUtility(PARCHMENT)}
                  >
                    <Calendar size={14} color={PRIMARY} /> Add Visit Definition
                  </button>
                </div>
              </div>

              {/* ARMS SUMMARY TABLE */}
              {selectedStudy.study_arms && selectedStudy.study_arms.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                    {selectedStudy.study_arms.map((arm) => (
                      <div
                        key={arm.id}
                        onClick={() => setSelectedArmId(arm.id)}
                        style={{
                          background: selectedArmId === arm.id ? '#f4f8ff' : PARCHMENT,
                          border: `1px solid ${selectedArmId === arm.id ? PRIMARY : HAIRLINE}`,
                          borderRadius: R_MD,
                          padding: 16,
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: PRIMARY, fontFamily: FONT_MONO }}>
                            {arm.arm_code}
                          </span>
                          <span style={{ ...BADGE[arm.arm_type === 'INTERVENTION' ? 'green' : 'blue'] }}>
                            {arm.arm_type}
                          </span>
                        </div>
                        <h4 style={{ fontSize: 14, fontWeight: 600, color: INK, margin: '0 0 6px' }}>{arm.label}</h4>
                        <div style={{ fontSize: 12, color: INK_48 }}>
                          {arm.visit_definitions?.length || 0} Scheduled Visits Configured
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* VISIT SCHEDULE MATRIX FOR SELECTED ARM */}
                  {selectedArmId && (
                    <div style={{ background: PARCHMENT, borderRadius: R_MD, padding: 18, border: `1px solid ${HAIRLINE}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: INK, letterSpacing: '-0.12px' }}>
                          Visit Schedule Matrix for Selected Arm ({selectedStudy.study_arms.find(a=>a.id===selectedArmId)?.arm_code})
                        </span>
                        <span style={{ fontSize: 11, color: INK_48 }}>
                          Window Tolerances Enforced Automatically
                        </span>
                      </div>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                          <thead>
                            <tr style={{ borderBottom: `1px solid ${HAIRLINE}`, textAlign: 'left', color: INK_48 }}>
                              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Target Day</th>
                              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Visit Name</th>
                              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Visit Type</th>
                              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Window Tolerance</th>
                              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Mandatory</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedStudy.study_arms.find(a=>a.id===selectedArmId)?.visit_definitions?.length ? (
                              selectedStudy.study_arms.find(a=>a.id===selectedArmId)?.visit_definitions?.map((vd) => (
                                <tr key={vd.id} style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                                  <td style={{ padding: '10px', fontWeight: 600, fontFamily: FONT_MONO, color: PRIMARY }}>
                                    Day {vd.visit_day}
                                  </td>
                                  <td style={{ padding: '10px', color: INK, fontWeight: 600 }}>{vd.visit_name}</td>
                                  <td style={{ padding: '10px' }}>
                                    <span style={{ ...BADGE.ink }}>{vd.visit_type}</span>
                                  </td>
                                  <td style={{ padding: '10px', fontFamily: FONT_MONO, color: INK_80 }}>
                                    -{vd.window_minus}d / +{vd.window_plus}d
                                  </td>
                                  <td style={{ padding: '10px' }}>
                                    <span style={{ ...BADGE[vd.is_mandatory ? 'green' : 'amber'] }}>
                                      {vd.is_mandatory ? 'YES' : 'OPTIONAL'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} style={{ padding: 16, textAlign: 'center', color: INK_48 }}>
                                  No visits configured for this arm yet. Click "Add Visit Definition" above to set up Day 0, Day 15, Day 30 visits.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ background: PARCHMENT, borderRadius: R_MD, padding: 24, textAlign: 'center', border: `1px solid ${HAIRLINE}` }}>
                  <Layers size={24} color={INK_48} style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 14, color: INK_48, margin: 0 }}>
                    No Study Arms configured for this trial yet. Create Arm A (Intervention) and Arm B (Placebo/Comparator) to establish GCP protocol architecture.
                  </p>
                </div>
              )}
            </div>

            {/* CARD 3: INVESTIGATIONAL PRODUCT (IP) BATCHES */}
            <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: INK, margin: 0, letterSpacing: '-0.374px' }}>
                    Investigational Product (IP) Pharmacy Batches
                  </h3>
                  <p style={{ fontSize: 13, color: INK_48, margin: '2px 0 0' }}>
                    Ayurvedic Formulations logged with Pharmacopoeial Standard reference &amp; stock tracking.
                  </p>
                </div>

                <button
                  onClick={() => setShowBatchModal(true)}
                  style={btnUtility()}
                >
                  <Pill size={14} /> Log IP Medicine Batch
                </button>
              </div>

              {selectedStudy.ip_batches && selectedStudy.ip_batches.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                  {selectedStudy.ip_batches.map((b) => (
                    <div key={b.id} style={{ background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: PRIMARY, fontFamily: FONT_MONO }}>
                          {b.batch_no}
                        </span>
                        <span style={{ ...BADGE[b.current_stock > 100 ? 'green' : 'red'] }}>
                          Stock: {b.current_stock}
                        </span>
                      </div>
                      <h4 style={{ fontSize: 15, fontWeight: 600, color: INK, margin: '0 0 4px' }}>{b.formulation_name}</h4>
                      <p style={{ fontSize: 12, color: INK_48, margin: 0 }}>
                        Ref Standard: <strong style={{ color: INK_80 }}>{b.afi_api_standard_ref}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: PARCHMENT, borderRadius: R_MD, padding: 20, textAlign: 'center', border: `1px solid ${HAIRLINE}` }}>
                  <Pill size={20} color={INK_48} style={{ marginBottom: 6 }} />
                  <p style={{ fontSize: 13, color: INK_48, margin: 0 }}>
                    No IP medicine batches registered for this trial yet. Log batches before patient enrollment.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: CANVAS, borderRadius: R_LG, padding: 40, border: `1px solid ${HAIRLINE}`, textAlign: 'center' }}>
            <FolderKanban size={36} color={PRIMARY} style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: INK }}>No Clinical Trial Selected</h3>
            <p style={{ fontSize: 14, color: INK_48, maxWidth: 400, margin: '6px auto 20px' }}>
              Select a clinical trial from the left panel or click below to set up a new trial protocol.
            </p>
            <button onClick={() => setShowCreateModal(true)} style={btnPrimary()}>
              <Plus size={16} /> Create Clinical Trial
            </button>
          </div>
        )}
      </div>

      {/* MODAL 1: 3-STEP PROTOCOL WIZARD */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          padding: 20, fontFamily: FONT_STACK
        }}>
          <div style={{
            background: CANVAS, borderRadius: R_LG, width: '100%', maxWidth: 560,
            border: `1px solid ${HAIRLINE}`, padding: 32, display: 'flex', flexDirection: 'column', gap: 20
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: PRIMARY, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Protocol Setup Wizard (Step {wizardStep} of 3)
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: INK, margin: '2px 0 0' }}>
                  {wizardStep === 1 && 'Step 1: Clinical Trial Identity'}
                  {wizardStep === 2 && 'Step 2: Study Arms Configuration'}
                  {wizardStep === 3 && 'Step 3: Visit Schedule Matrix'}
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 18, color: INK_48, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Stepper Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { s: 1, label: '1. Identity' },
                { s: 2, label: '2. Study Arms' },
                { s: 3, label: '3. Visit Matrix' },
              ].map(st => (
                <div
                  key={st.s}
                  onClick={() => setWizardStep(st.s as any)}
                  style={{
                    padding: '8px 10px', borderRadius: R_MD, textAlign: 'center', cursor: 'pointer',
                    background: wizardStep === st.s ? PRIMARY : PARCHMENT,
                    color: wizardStep === st.s ? '#ffffff' : INK_80,
                    fontSize: 12, fontWeight: 600
                  }}
                >
                  {st.label}
                </div>
              ))}
            </div>

            {/* STEP 1: TRIAL IDENTITY */}
            {wizardStep === 1 && (
              <form onSubmit={handleCreateStudy} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelOverline()}>Clinical Trial Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Evaluation of Ashwagandha Ghan Vati in Mild-to-Moderate Generalized Anxiety"
                    style={inputField()}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelOverline()}>Short Trial Code</label>
                    <input
                      type="text"
                      value={shortCode}
                      onChange={e => setShortCode(e.target.value)}
                      placeholder="e.g. AIIA-ASHWA-001"
                      style={inputField()}
                    />
                  </div>
                  <div>
                    <label style={labelOverline()}>Target Sample Size (N)</label>
                    <input
                      type="number"
                      value={sampleSize}
                      onChange={e => setSampleSize(e.target.value)}
                      style={inputField()}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelOverline()}>Trial Phase</label>
                    <select
                      value={phase}
                      onChange={e => setPhase(e.target.value)}
                      style={inputField()}
                    >
                      <option value="Phase 1">Phase 1 (Safety/Tolerability)</option>
                      <option value="Phase 2">Phase 2 (Efficacy &amp; Safety)</option>
                      <option value="Phase 3">Phase 3 (Confirmatory RCT)</option>
                      <option value="Pilot/Exploratory">Pilot / Exploratory Study</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelOverline()}>Study Design Type</label>
                    <select
                      value={studyType}
                      onChange={e => setStudyType(e.target.value)}
                      style={inputField()}
                    >
                      <option value="Interventional RCT">Interventional RCT</option>
                      <option value="Double Blind Parallel Group">Double Blind Parallel Group</option>
                      <option value="Observational Cohort">Observational Cohort</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={btnSecondary()}
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} style={btnPrimary(loading)}>
                    Save Identity &amp; Next <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: STUDY ARMS */}
            {wizardStep === 2 && (
              <form onSubmit={handleAddArm} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {!selectedStudy && (
                  <div style={{ background: '#fff8e6', padding: 12, borderRadius: R_MD, fontSize: 13, color: WARNING }}>
                    ⚠️ Please select or create a trial in Step 1 first.
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                  <div>
                    <label style={labelOverline()}>Arm Code</label>
                    <input
                      type="text"
                      value={armCode}
                      onChange={e => setArmCode(e.target.value)}
                      placeholder="e.g. ARM-A"
                      style={inputField()}
                      required
                    />
                  </div>
                  <div>
                    <label style={labelOverline()}>Arm Label / Treatment Name</label>
                    <input
                      type="text"
                      value={armLabel}
                      onChange={e => setArmLabel(e.target.value)}
                      placeholder="e.g. Intervention — Ashwagandha 500mg bd"
                      style={inputField()}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelOverline()}>Arm Type</label>
                    <select
                      value={armType}
                      onChange={e => setArmType(e.target.value)}
                      style={inputField()}
                    >
                      <option value="INTERVENTION">INTERVENTION</option>
                      <option value="COMPARATOR">COMPARATOR</option>
                      <option value="PLACEBO">PLACEBO</option>
                      <option value="OPEN_LABEL">OPEN_LABEL</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelOverline()}>Arm Description (Optional)</label>
                    <input
                      type="text"
                      value={armDesc}
                      onChange={e => setArmDesc(e.target.value)}
                      placeholder="e.g. 500mg twice daily after meals"
                      style={inputField()}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading || !selectedStudy} style={btnPrimary(loading || !selectedStudy)}>
                  <Plus size={14} /> Add Study Arm to Protocol
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${HAIRLINE}`, paddingTop: 14, marginTop: 6 }}>
                  <button type="button" onClick={() => setWizardStep(1)} style={btnSecondary()}>
                    ← Back to Identity
                  </button>
                  <button type="button" onClick={() => setWizardStep(3)} style={btnPrimary()}>
                    Next: Visit Matrix →
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: VISIT SCHEDULE MATRIX */}
            {wizardStep === 3 && (
              <form onSubmit={handleAddVisitDef} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelOverline()}>Select Study Arm</label>
                  <select
                    value={selectedArmId}
                    onChange={e => setSelectedArmId(e.target.value)}
                    style={inputField()}
                    required
                  >
                    <option value="">-- Select Protocol Arm --</option>
                    {selectedStudy?.study_arms?.map(arm => (
                      <option key={arm.id} value={arm.id}>
                        {arm.arm_code}: {arm.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelOverline()}>Visit Name</label>
                    <input
                      type="text"
                      value={visitName}
                      onChange={e => setVisitName(e.target.value)}
                      placeholder="e.g. Day 15 Follow-up"
                      style={inputField()}
                      required
                    />
                  </div>
                  <div>
                    <label style={labelOverline()}>Target Day (Day N)</label>
                    <input
                      type="number"
                      value={visitDay}
                      onChange={e => setVisitDay(e.target.value)}
                      placeholder="e.g. 15"
                      style={inputField()}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelOverline()}>Window Minus (- Days)</label>
                    <input
                      type="number"
                      value={windowMinus}
                      onChange={e => setWindowMinus(e.target.value)}
                      placeholder="e.g. 2"
                      style={inputField()}
                    />
                  </div>
                  <div>
                    <label style={labelOverline()}>Window Plus (+ Days)</label>
                    <input
                      type="number"
                      value={windowPlus}
                      onChange={e => setWindowPlus(e.target.value)}
                      placeholder="e.g. 2"
                      style={inputField()}
                    />
                  </div>
                  <div>
                    <label style={labelOverline()}>Visit Category</label>
                    <select
                      value={visitType}
                      onChange={e => setVisitType(e.target.value)}
                      style={inputField()}
                    >
                      <option value="SCREENING">SCREENING</option>
                      <option value="BASELINE">BASELINE</option>
                      <option value="FOLLOW_UP">FOLLOW_UP</option>
                      <option value="CLOSEOUT">CLOSEOUT</option>
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={loading || !selectedArmId} style={btnPrimary(loading || !selectedArmId)}>
                  <Plus size={14} /> Map Visit to Schedule Matrix
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${HAIRLINE}`, paddingTop: 14, marginTop: 6 }}>
                  <button type="button" onClick={() => setWizardStep(2)} style={btnSecondary()}>
                    ← Back to Arms
                  </button>
                  <button type="button" onClick={() => setShowCreateModal(false)} style={btnPrimary()}>
                    Done &amp; Close Wizard ✓
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: LOG IP MEDICINE BATCH */}
      {showBatchModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          padding: 20, fontFamily: FONT_STACK
        }}>
          <div style={{
            background: CANVAS, borderRadius: R_LG, width: '100%', maxWidth: 480,
            border: `1px solid ${HAIRLINE}`, padding: 32, display: 'flex', flexDirection: 'column', gap: 18
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: PRIMARY, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Pharmacy Inventory Logging
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: INK, margin: '2px 0 0' }}>
                  Log Investigational Product (IP) Batch
                </h2>
              </div>
              <button onClick={() => setShowBatchModal(false)} style={{ background: 'none', border: 'none', fontSize: 18, color: INK_48, cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBatch} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelOverline()}>Formulation Name</label>
                <input
                  type="text"
                  value={formulation}
                  onChange={e => setFormulation(e.target.value)}
                  placeholder="e.g. Ashwagandha Ghan Vati 500mg"
                  style={inputField()}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelOverline()}>Batch Number</label>
                  <input
                    type="text"
                    value={batchNo}
                    onChange={e => setBatchNo(e.target.value)}
                    placeholder="e.g. BATCH-ASHWA-2026-01"
                    style={inputField()}
                  />
                </div>
                <div>
                  <label style={labelOverline()}>Initial Stock Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    style={inputField()}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={labelOverline()}>Pharmacopoeial Standard (AFI / API Reference)</label>
                <input
                  type="text"
                  value={standardRef}
                  onChange={e => setStandardRef(e.target.value)}
                  placeholder="e.g. Ayurvedic Pharmacopoeia of India (API) Part-1 Vol-1"
                  style={inputField()}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelOverline()}>Mfg Date</label>
                  <input
                    type="date"
                    value={mfgDate}
                    onChange={e => setMfgDate(e.target.value)}
                    style={inputField()}
                    required
                  />
                </div>
                <div>
                  <label style={labelOverline()}>Expiry Date</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={e => setExpDate(e.target.value)}
                    style={inputField()}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowBatchModal(false)} style={btnSecondary()}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={btnPrimary(loading)}>
                  Log Batch Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
