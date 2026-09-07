import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Study, StudyArm, VisitDefinition } from '../types';
import { DEFAULT_AIIA_STUDIES } from '../types/defaultStudies';
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
  Trash2,
  Edit2,
  Save,
  Check,
  DatabaseZap,
  XCircle,
  BadgeCheck,
  AlertTriangle,
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
  const [studies, setStudies] = useState<Study[]>(DEFAULT_AIIA_STUDIES);
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(DEFAULT_AIIA_STUDIES[0]);
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

  // FORM 2: INTERACTIVE STUDY ARMS STATE
  const [arms, setArms] = useState([
    { id: '1', arm_name: 'Arm A - Active Formulation', arm_type: 'EXPERIMENTAL', allocation_ratio: '1:1' },
    { id: '2', arm_name: 'Arm B - Placebo Comparator', arm_type: 'PLACEBO_COMPARATOR', allocation_ratio: '1:1' }
  ]);

  // FORM 3: INTERACTIVE VISIT SCHEDULE MATRIX STATE
  const [visitSchedule, setVisitSchedule] = useState([
    { visit_number: 0, visit_name: 'Screening', target_day: 0, window_tolerance: 0, visit_type: 'SCREENING' },
    { visit_number: 1, visit_name: 'Baseline Visit', target_day: 1, window_tolerance: 0, visit_type: 'BASELINE' },
    { visit_number: 2, visit_name: 'Follow-up 1', target_day: 15, window_tolerance: 3, visit_type: 'FOLLOW_UP' },
    { visit_number: 3, visit_name: 'Study Closeout', target_day: 60, window_tolerance: 5, visit_type: 'CLOSEOUT' }
  ]);

  // FORM 4: IP MEDICINE BATCH
  const [formulation, setFormulation] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [standardRef, setStandardRef] = useState('API Part-1 Vol-1');
  const [mfgDate, setMfgDate] = useState('2026-08-01');
  const [expDate, setExpDate] = useState('2028-08-01');
  const [quantity, setQuantity] = useState('5000');

  // CLOSEOUT STATE
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [terminationReason, setTerminationReason] = useState('');
  const [closeoutLoading, setCloseoutLoading] = useState(false);

  // DOCUMENT UPLOAD STATE
  const [protocolFile, setProtocolFile] = useState<File | null>(null);
  const [coaFile, setCoaFile] = useState<File | null>(null);

  const loadStudies = async () => {
    try {
      const res = await api.get('/study/list');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setStudies(res.data);
        if (!selectedStudy) {
          setSelectedStudy(res.data[0]);
        } else {
          const updated = res.data.find((s: Study) => s.id === selectedStudy.id) || res.data[0];
          if (updated) setSelectedStudy(updated);
        }
      }
    } catch (err) {
      console.warn('API /study/list offline, keeping institutional trial protocols.', err);
    }
  };

  useEffect(() => {
    loadStudies();
  }, []);

  // Synchronize arms and visit schedule whenever the selected study changes
  useEffect(() => {
    if (selectedStudy) {
      if (selectedStudy.study_arms && selectedStudy.study_arms.length > 0) {
        setArms(
          selectedStudy.study_arms.map((a, i) => ({
            id: a.id || String(i + 1),
            arm_name: a.label || a.arm_code || `Arm ${String.fromCharCode(65 + i)}`,
            arm_type: a.arm_type || 'EXPERIMENTAL',
            allocation_ratio: (a as any).allocation_ratio || '1:1',
          }))
        );
        const firstArmVisits = selectedStudy.study_arms[0]?.visit_definitions;
        if (firstArmVisits && firstArmVisits.length > 0) {
          setVisitSchedule(
            firstArmVisits.map((v, i) => ({
              visit_number: i,
              visit_name: v.visit_name,
              target_day: v.visit_day ?? 0,
              window_tolerance: v.window_plus ?? 0,
              visit_type: v.visit_type || 'FOLLOW_UP',
            }))
          );
        }
      }
    }
  }, [selectedStudy?.id]);

  // ARMS STATE HANDLERS
  const handleAddArmState = () => {
    const letter = String.fromCharCode(65 + arms.length);
    setArms([
      ...arms,
      {
        id: String(Date.now()),
        arm_name: `Arm ${letter} - New Formulation`,
        arm_type: 'EXPERIMENTAL',
        allocation_ratio: '1:1'
      }
    ]);
  };

  const handleUpdateArmState = (id: string, field: string, val: string) => {
    setArms(arms.map(a => a.id === id ? { ...a, [field]: val } : a));
  };

  const handleDeleteArmState = (id: string) => {
    if (arms.length <= 1) {
      setNotification('⚠️ Trial protocol must contain at least 1 study arm.');
      return;
    }
    setArms(arms.filter(a => a.id !== id));
  };

  // VISIT SCHEDULE STATE HANDLERS
  const handleAddVisitScheduleState = () => {
    const nextNum = visitSchedule.length;
    const lastDay = visitSchedule[visitSchedule.length - 1]?.target_day || 0;
    setVisitSchedule([
      ...visitSchedule,
      {
        visit_number: nextNum,
        visit_name: `Follow-up ${nextNum}`,
        target_day: lastDay + 15,
        window_tolerance: 3,
        visit_type: 'FOLLOW_UP'
      }
    ]);
  };

  const handleUpdateVisitScheduleState = (index: number, field: string, val: any) => {
    setVisitSchedule(visitSchedule.map((v, i) => i === index ? { ...v, [field]: val } : v));
  };

  const handleDeleteVisitScheduleState = (index: number) => {
    if (visitSchedule.length <= 1) {
      setNotification('⚠️ Protocol must contain at least 1 scheduled visit definition.');
      return;
    }
    setVisitSchedule(visitSchedule.filter((_, i) => i !== index));
  };

  // 1. SAVE COMPLETE PROTOCOL STRUCTURE & CREATE STUDY
  const handleCreateStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const generatedCode = shortCode || `AIIA-AYU-${Math.floor(10 + Math.random() * 89)}`;
    const newStudyObj: Study = {
      id: `study-${Date.now()}`,
      short_code: generatedCode,
      title,
      phase,
      study_type: studyType,
      status: 'DRAFT',
      target_sample_size: Number(sampleSize) || 100,
      start_date: new Date().toISOString().split('T')[0],
      planned_end_date: '2027-06-30',
      study_arms: arms.map((a, i) => ({
        id: a.id || String(i + 1),
        arm_code: a.arm_name.split(' ')[0] || `ARM-${String.fromCharCode(65 + i)}`,
        label: a.arm_name,
        arm_type: a.arm_type,
        visit_definitions: visitSchedule.map(v => ({
          id: `vd-${Math.random()}`,
          visit_name: v.visit_name,
          visit_day: v.target_day,
          window_minus: v.window_tolerance,
          window_plus: v.window_tolerance,
          visit_type: v.visit_type,
          is_mandatory: true,
        })),
      })),
      ip_batches: [],
    };

    try {
      const res = await api.post('/study/create', {
        short_code: generatedCode,
        title,
        phase,
        study_type: studyType,
        target_sample_size: Number(sampleSize),
        start_date: new Date().toISOString().split('T')[0],
        planned_end_date: '2027-06-30',
        arms: arms.map(a => ({
          arm_code: a.arm_name.split(' ')[0] || 'ARM',
          arm_name: a.arm_name,
          arm_type: a.arm_type,
          allocation_ratio: a.allocation_ratio
        })),
        visitSchedule
      });

      if (protocolFile && res?.data?.id) {
        try {
          const fd = new FormData();
          fd.append('file', protocolFile);
          fd.append('study_id', res.data.id);
          fd.append('document_type', 'PROTOCOL_VERSION');
          fd.append('uploaded_by', user?.email ?? 'investigator@aiia.gov.in');
          await api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        } catch { /* non-fatal */ }
        setProtocolFile(null);
      }
      await loadStudies();
      if (res?.data) setSelectedStudy(res.data);
    } catch (err: any) {
      console.warn('API study/create offline notice:', err);
    } finally {
      setStudies(prev => [newStudyObj, ...prev.filter(s => s.short_code !== newStudyObj.short_code)]);
      setSelectedStudy(newStudyObj);
      setShowCreateModal(false);
      setTitle('');
      setShortCode('');
      setNotification(`✅ Clinical Trial '${generatedCode}' created with ${arms.length} Arms & ${visitSchedule.length} Scheduled Visits!`);
      setLoading(false);
    }
  };

  // 2. SAVE PROTOCOL STRUCTURE FOR SELECTED EXISTING TRIAL
  const handleSaveProtocolStructure = async () => {
    if (!selectedStudy) return;
    setLoading(true);
    const updatedArms: StudyArm[] = arms.map(a => ({
      id: a.id,
      arm_code: a.arm_name.split(' ')[0] || 'ARM',
      label: a.arm_name,
      arm_type: a.arm_type,
      visit_definitions: visitSchedule.map(v => ({
        id: `vd-${Math.random()}`,
        visit_name: v.visit_name,
        visit_day: v.target_day,
        window_minus: v.window_tolerance,
        window_plus: v.window_tolerance,
        visit_type: v.visit_type,
        is_mandatory: true,
      })),
    }));

    try {
      await api.post(`/study/${selectedStudy.id}/protocol-structure`, {
        arms: arms.map(a => ({
          arm_code: a.arm_name.split(' ')[0] || 'ARM',
          arm_name: a.arm_name,
          arm_type: a.arm_type,
          allocation_ratio: a.allocation_ratio
        })),
        visitSchedule
      });
      await loadStudies();
    } catch (err: any) {
      console.warn('API protocol-structure notice:', err);
    } finally {
      const updatedStudy = { ...selectedStudy, study_arms: updatedArms };
      setStudies(prev => prev.map(s => s.id === selectedStudy.id ? updatedStudy : s));
      setSelectedStudy(updatedStudy);
      setNotification(`✅ Protocol structure saved for '${selectedStudy.short_code}'!`);
      setLoading(false);
    }
  };

  // 3. SUBMIT TO IEC (INVESTIGATOR ACTION)
  const handleIecSubmit = async () => {
    if (!selectedStudy) return;
    setLoading(true);
    try {
      await api.post(`/study/${selectedStudy.id}/iec-submit`, {
        submission_date: new Date().toISOString().split('T')[0],
      });
      await loadStudies();
    } catch (err: any) {
      console.warn('API iec-submit notice:', err);
    } finally {
      const updatedStudy: Study = {
        ...selectedStudy,
        status: 'IEC_SUBMITTED',
        iec_submissions: [
          {
            id: `iec-${Date.now()}`,
            submission_date: new Date().toISOString().split('T')[0],
            decision: 'PENDING_ETHICS_REVIEW',
            valid_until: '2027-12-31',
            remarks: 'Submitted for Institutional Ethics Committee clearance.',
          },
          ...(selectedStudy.iec_submissions || [])
        ]
      };
      setStudies(prev => prev.map(s => s.id === selectedStudy.id ? updatedStudy : s));
      setSelectedStudy(updatedStudy);
      setNotification(`✅ Study '${selectedStudy.short_code}' submitted to Ethics Secretariat!`);
      setLoading(false);
    }
  };

  // 4. ADD IP MEDICINE BATCH
  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudy) return;
    setLoading(true);
    const generatedBatchNo = batchNo || `BATCH-2026-${Math.floor(10 + Math.random() * 89)}`;
    const newBatch = {
      id: `batch-${Date.now()}`,
      formulation_name: formulation,
      batch_no: generatedBatchNo,
      afi_api_standard_ref: standardRef,
      current_stock: Number(quantity) || 1000,
    };

    try {
      await api.post(`/study/${selectedStudy.id}/ip-batch`, {
        formulation_name: formulation,
        batch_no: generatedBatchNo,
        afi_api_standard_ref: standardRef,
        manufacturing_date: mfgDate,
        expiry_date: expDate,
        quantity: Number(quantity),
      });
      if (coaFile && selectedStudy.id) {
        try {
          const fd = new FormData();
          fd.append('file', coaFile);
          fd.append('study_id', selectedStudy.id);
          fd.append('document_type', 'DRUG_CERTIFICATE_OF_ANALYSIS');
          fd.append('uploaded_by', user?.email ?? 'investigator@aiia.gov.in');
          await api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        } catch { /* non-fatal */ }
        setCoaFile(null);
      }
      await loadStudies();
    } catch (err: any) {
      console.warn('API ip-batch notice:', err);
    } finally {
      const updatedStudy = {
        ...selectedStudy,
        ip_batches: [...(selectedStudy.ip_batches || []), newBatch]
      };
      setStudies(prev => prev.map(s => s.id === selectedStudy.id ? updatedStudy : s));
      setSelectedStudy(updatedStudy);
      setNotification(`✅ Medicine batch '${generatedBatchNo}' logged with ${quantity} units stock.`);
      setShowBatchModal(false);
      setFormulation('');
      setBatchNo('');
      setLoading(false);
    }
  };

  // 5. DATA LOCK
  const handleDataLock = async () => {
    if (!selectedStudy) return;
    if (!window.confirm(`Lock the clinical database for "${selectedStudy.short_code}"? No further CRF edits will be permitted after this action.`)) return;
    setCloseoutLoading(true);
    try {
      await api.patch(`/study/${selectedStudy.id}/data-lock`);
      await loadStudies();
    } catch (err: any) {
      console.warn('API data-lock notice:', err);
    } finally {
      const updatedStudy: Study = { ...selectedStudy, status: 'DATA_LOCK' };
      setStudies(prev => prev.map(s => s.id === selectedStudy.id ? updatedStudy : s));
      setSelectedStudy(updatedStudy);
      setNotification(`Database locked for ${selectedStudy.short_code}. Study is now in DATA_LOCK state.`);
      setCloseoutLoading(false);
    }
  };

  // 6. COMPLETE STUDY
  const handleCompleteStudy = async () => {
    if (!selectedStudy) return;
    if (!window.confirm(`Complete study "${selectedStudy.short_code}" and start the statutory 30-day CTRI notification clock?`)) return;
    setCloseoutLoading(true);
    try {
      await api.patch(`/study/${selectedStudy.id}/complete`);
      await loadStudies();
    } catch (err: any) {
      console.warn('API complete notice:', err);
    } finally {
      const updatedStudy: Study = { ...selectedStudy, status: 'CLOSED' };
      setStudies(prev => prev.map(s => s.id === selectedStudy.id ? updatedStudy : s));
      setSelectedStudy(updatedStudy);
      setNotification(`Study ${selectedStudy.short_code} closed. 30-day CTRI notification deadline has started.`);
      setCloseoutLoading(false);
    }
  };

  // 7. TERMINATE STUDY
  const handleTerminate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudy || !terminationReason.trim()) return;
    setCloseoutLoading(true);
    try {
      await api.patch(`/study/${selectedStudy.id}/terminate`, { reason: terminationReason });
      await loadStudies();
    } catch (err: any) {
      console.warn('API terminate notice:', err);
    } finally {
      const updatedStudy: Study = { ...selectedStudy, status: 'TERMINATED' };
      setStudies(prev => prev.map(s => s.id === selectedStudy.id ? updatedStudy : s));
      setSelectedStudy(updatedStudy);
      setNotification(`Study ${selectedStudy.short_code} terminated. Emergency alert dispatched to Ethics Committee and Leadership.`);
      setShowTerminateModal(false);
      setTerminationReason('');
      setCloseoutLoading(false);
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Study List Selector */}
        <div className="lg:col-span-4" style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: `1px solid ${HAIRLINE}` }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: INK_48, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Registered Trials ({studies.length})
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 580, overflowY: 'auto' }}>
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
                    <span>{s.study_arms?.length || arms.length} Arms</span>
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
          <div className="lg:col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mb-5">
                {[
                  { key: 'DRAFT', label: '1. Protocol Setup', desc: 'Investigator Draft' },
                  { key: 'IEC_SUBMITTED', label: '2. IEC Submission', desc: 'Ethics Review' },
                  { key: 'IEC_APPROVED', label: '3. Ethics Approved', desc: 'Clearance Granted' },
                  { key: 'CTRI_LINKED', label: '4. CTRI Registered', desc: 'Public Registry' },
                  { key: 'ENROLLING', label: '5. Enrolling Patients', desc: 'Subject Enrollment' },
                ].map((st) => {
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

            {/* CARD 2: PROTOCOL ARCHITECTURE (INTERACTIVE STUDY ARMS & VISIT SCHEDULE) */}
            <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: INK, margin: 0, letterSpacing: '-0.374px' }}>
                    Protocol Architecture: Study Arms &amp; Visit Schedule
                  </h3>
                  <p style={{ fontSize: 13, color: INK_48, margin: '2px 0 0' }}>
                    Live interactive configuration of Intervention/Comparator arms and Schedule of Events.
                  </p>
                </div>

                <button
                  onClick={handleSaveProtocolStructure}
                  disabled={loading}
                  style={btnPrimary(loading)}
                >
                  <Save size={14} /> Save Protocol Structure
                </button>
              </div>

              {/* SECTION A: STUDY ARMS CONFIGURATION */}
              <div style={{ marginBottom: 24, background: PARCHMENT, borderRadius: R_MD, padding: 20, border: `1px solid ${HAIRLINE}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: INK, letterSpacing: '-0.12px' }}>
                      Study Arms Configuration ({arms.length} Arms)
                    </span>
                    <p style={{ fontSize: 11, color: INK_48, margin: '2px 0 0' }}>
                      Define treatment, placebo, or active comparator arms for subjects.
                    </p>
                  </div>

                  <button onClick={handleAddArmState} style={btnUtility(CANVAS)}>
                    <Plus size={14} color={PRIMARY} /> Add Study Arm
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
                  {arms.map((arm) => (
                    <div key={arm.id} style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: PRIMARY, fontFamily: FONT_MONO }}>
                          Arm #{arm.id}
                        </span>
                        <button
                          onClick={() => handleDeleteArmState(arm.id)}
                          style={{ background: 'none', border: 'none', color: DANGER, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                        >
                          <Trash2 size={13} /> Delete Arm
                        </button>
                      </div>

                      <div>
                        <label style={labelOverline()}>Arm Name / Title</label>
                        <input
                          type="text"
                          value={arm.arm_name}
                          onChange={e => handleUpdateArmState(arm.id, 'arm_name', e.target.value)}
                          style={inputField()}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 10 }}>
                        <div>
                          <label style={labelOverline()}>Arm Type</label>
                          <select
                            value={arm.arm_type}
                            onChange={e => handleUpdateArmState(arm.id, 'arm_type', e.target.value)}
                            style={inputField()}
                          >
                            <option value="EXPERIMENTAL">EXPERIMENTAL</option>
                            <option value="ACTIVE_COMPARATOR">ACTIVE_COMPARATOR</option>
                            <option value="PLACEBO_COMPARATOR">PLACEBO_COMPARATOR</option>
                            <option value="OPEN_LABEL">OPEN_LABEL</option>
                          </select>
                        </div>
                        <div>
                          <label style={labelOverline()}>Ratio</label>
                          <input
                            type="text"
                            value={arm.allocation_ratio}
                            onChange={e => handleUpdateArmState(arm.id, 'allocation_ratio', e.target.value)}
                            placeholder="1:1"
                            style={inputField()}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION B: VISIT SCHEDULE DEFINITIONS */}
              <div style={{ background: PARCHMENT, borderRadius: R_MD, padding: 20, border: `1px solid ${HAIRLINE}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: INK, letterSpacing: '-0.12px' }}>
                      Visit Schedule Matrix &amp; Window Tolerances ({visitSchedule.length} Visits)
                    </span>
                    <p style={{ fontSize: 11, color: INK_48, margin: '2px 0 0' }}>
                      Schedule of events with mandatory target day and ± tolerance windows.
                    </p>
                  </div>

                  <button onClick={handleAddVisitScheduleState} style={btnUtility(CANVAS)}>
                    <Plus size={14} color={PRIMARY} /> Add Visit Definition
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${HAIRLINE}`, textAlign: 'left', color: INK_48 }}>
                        <th style={{ padding: '8px 10px', fontWeight: 600 }}>#</th>
                        <th style={{ padding: '8px 10px', fontWeight: 600 }}>Visit Name</th>
                        <th style={{ padding: '8px 10px', fontWeight: 600 }}>Target Day</th>
                        <th style={{ padding: '8px 10px', fontWeight: 600 }}>Window (± Days)</th>
                        <th style={{ padding: '8px 10px', fontWeight: 600 }}>Visit Type</th>
                        <th style={{ padding: '8px 10px', fontWeight: 600, textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visitSchedule.map((v, idx) => (
                        <tr key={idx} style={{ borderBottom: `1px solid ${HAIRLINE}`, background: CANVAS }}>
                          <td style={{ padding: '8px 10px', fontWeight: 600, fontFamily: FONT_MONO, color: PRIMARY }}>
                            V{v.visit_number}
                          </td>
                          <td style={{ padding: '8px 10px' }}>
                            <input
                              type="text"
                              value={v.visit_name}
                              onChange={e => handleUpdateVisitScheduleState(idx, 'visit_name', e.target.value)}
                              style={{ ...inputField(), padding: '6px 10px' }}
                            />
                          </td>
                          <td style={{ padding: '8px 10px', width: 100 }}>
                            <input
                              type="number"
                              value={v.target_day}
                              onChange={e => handleUpdateVisitScheduleState(idx, 'target_day', Number(e.target.value))}
                              style={{ ...inputField(), padding: '6px 10px', fontFamily: FONT_MONO }}
                            />
                          </td>
                          <td style={{ padding: '8px 10px', width: 110 }}>
                            <input
                              type="number"
                              value={v.window_tolerance}
                              onChange={e => handleUpdateVisitScheduleState(idx, 'window_tolerance', Number(e.target.value))}
                              style={{ ...inputField(), padding: '6px 10px', fontFamily: FONT_MONO }}
                            />
                          </td>
                          <td style={{ padding: '8px 10px', width: 140 }}>
                            <select
                              value={v.visit_type}
                              onChange={e => handleUpdateVisitScheduleState(idx, 'visit_type', e.target.value)}
                              style={{ ...inputField(), padding: '6px 8px' }}
                            >
                              <option value="SCREENING">SCREENING</option>
                              <option value="BASELINE">BASELINE</option>
                              <option value="FOLLOW_UP">FOLLOW_UP</option>
                              <option value="CLOSEOUT">CLOSEOUT</option>
                            </select>
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteVisitScheduleState(idx)}
                              style={{ background: 'none', border: 'none', color: DANGER, cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
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

            {/* ═══════════════════════════════════════
                CARD 4: TRIAL CLOSEOUT CONTROL ROOM
                Status-gated actions: Data Lock → Complete → Terminated
                ═══════════════════════════════════════ */}
            <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 24 }}>
              <div style={{ marginBottom: 18 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: INK_48, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Trial Lifecycle — Closeout Controls
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: INK, margin: '4px 0 0', letterSpacing: '-0.374px' }}>
                  Data Lock, Study Completion &amp; Premature Termination
                </h3>
              </div>

              {/* ── State: ENROLLING — show Data Lock + Terminate buttons ── */}
              {(selectedStudy.status === 'ENROLLING' || selectedStudy.status === 'ONGOING') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{
                    background: 'rgba(0,102,204,0.05)', border: '1px solid rgba(0,102,204,0.20)',
                    borderRadius: R_MD, padding: '14px 18px',
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                  }}>
                    <DatabaseZap size={18} color={PRIMARY} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: INK, letterSpacing: '-0.224px', margin: '0 0 4px' }}>
                        Lock Clinical Database (Data Lock)
                      </p>
                      <p style={{ fontSize: 13, color: INK_48, margin: '0 0 14px', letterSpacing: '-0.12px', lineHeight: 1.5 }}>
                        Freezes all CRF edits and transitions the trial to DATA_LOCK state. Required before statistical analysis.
                        An immutable audit event will be written to <code style={{ fontFamily: FONT_MONO, fontSize: 12, color: PURPLE, background: 'rgba(191,90,242,0.08)', padding: '1px 5px', borderRadius: 4 }}>audit_integrity_db</code>.
                      </p>
                      <button
                        onClick={handleDataLock}
                        disabled={closeoutLoading}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 7,
                          background: PRIMARY, color: '#ffffff', border: 'none',
                          borderRadius: R_PILL, padding: '10px 20px',
                          fontSize: 14, fontWeight: 600, cursor: closeoutLoading ? 'not-allowed' : 'pointer',
                          opacity: closeoutLoading ? 0.6 : 1,
                          transition: 'transform 0.1s ease', fontFamily: FONT_STACK,
                        }}
                        onMouseDown={e => !closeoutLoading && (e.currentTarget.style.transform = 'scale(0.95)')}
                        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        <Lock size={13} />
                        {closeoutLoading ? 'Processing…' : 'Lock Clinical Database'}
                      </button>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255,69,58,0.04)', border: '1px solid rgba(255,69,58,0.22)',
                    borderRadius: R_MD, padding: '14px 18px',
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                  }}>
                    <AlertTriangle size={18} color={DANGER} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: DANGER, letterSpacing: '-0.224px', margin: '0 0 4px' }}>
                        Prematurely Terminate Trial
                      </p>
                      <p style={{ fontSize: 13, color: INK_48, margin: '0 0 14px', letterSpacing: '-0.12px', lineHeight: 1.5 }}>
                        Permanently terminates the trial. Requires a mandatory GCP justification reason. An emergency alert will be dispatched to the Ethics Committee and Leadership dashboard.
                      </p>
                      <button
                        onClick={() => setShowTerminateModal(true)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 7,
                          background: DANGER, color: '#ffffff', border: 'none',
                          borderRadius: R_PILL, padding: '10px 20px',
                          fontSize: 14, fontWeight: 600, cursor: 'pointer',
                          transition: 'transform 0.1s ease', fontFamily: FONT_STACK,
                        }}
                        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        <XCircle size={13} />
                        Terminate Trial
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── State: DATA_LOCK — frozen banner + Complete button ── */}
              {selectedStudy.status === 'DATA_LOCK' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Frozen banner */}
                  <div style={{
                    background: 'rgba(255,159,10,0.07)', border: '1px solid rgba(255,159,10,0.30)',
                    borderRadius: R_MD, padding: '13px 18px',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <Lock size={18} color={WARNING} style={{ flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: WARNING, letterSpacing: '-0.224px', margin: '0 0 2px' }}>
                        Clinical Database is Frozen
                      </p>
                      <p style={{ fontSize: 13, color: INK_48, margin: 0, letterSpacing: '-0.12px' }}>
                        No further patient CRF edits are permitted. Database locked for statistical analysis.
                      </p>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(52,199,89,0.05)', border: '1px solid rgba(52,199,89,0.22)',
                    borderRadius: R_MD, padding: '14px 18px',
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                  }}>
                    <BadgeCheck size={18} color={SUCCESS} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: INK, letterSpacing: '-0.224px', margin: '0 0 4px' }}>
                        Complete Study &amp; Submit Final Report
                      </p>
                      <p style={{ fontSize: 13, color: INK_48, margin: '0 0 14px', letterSpacing: '-0.12px', lineHeight: 1.5 }}>
                        Marks the trial as CLOSED and starts the statutory 30-day CTRI closeout notification clock per ICMR guidelines. An immutable audit event will be written.
                      </p>
                      <button
                        onClick={handleCompleteStudy}
                        disabled={closeoutLoading}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 7,
                          background: SUCCESS, color: '#ffffff', border: 'none',
                          borderRadius: R_PILL, padding: '10px 20px',
                          fontSize: 14, fontWeight: 600, cursor: closeoutLoading ? 'not-allowed' : 'pointer',
                          opacity: closeoutLoading ? 0.6 : 1,
                          transition: 'transform 0.1s ease', fontFamily: FONT_STACK,
                        }}
                        onMouseDown={e => !closeoutLoading && (e.currentTarget.style.transform = 'scale(0.95)')}
                        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        <BadgeCheck size={13} />
                        {closeoutLoading ? 'Processing…' : 'Complete Study & Submit Final Report'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── State: CLOSED — completion summary ── */}
              {selectedStudy.status === 'CLOSED' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{
                    background: 'rgba(52,199,89,0.06)', border: '1px solid rgba(52,199,89,0.25)',
                    borderRadius: R_MD, padding: '16px 20px',
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                  }}>
                    <CheckCircle2 size={24} color={SUCCESS} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p style={{ fontSize: 17, fontWeight: 600, color: SUCCESS, letterSpacing: '-0.374px', margin: '0 0 6px' }}>
                        Trial Successfully Completed
                      </p>
                      <p style={{ fontSize: 13, color: INK_48, margin: '0 0 14px', letterSpacing: '-0.12px', lineHeight: 1.5 }}>
                        This trial has been closed. Statutory 30-day CTRI closeout notification window is active.
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[
                          { label: 'Final Status', value: 'CLOSED', color: SUCCESS },
                          { label: 'CTRI Notification Deadline', value: (selectedStudy as any).ctri_completion_deadline || '30 days from closure', color: WARNING },
                          { label: 'Short Code', value: selectedStudy.short_code, color: PRIMARY },
                          { label: 'Phase', value: selectedStudy.phase, color: INK },
                        ].map(({ label, value, color }) => (
                          <div key={label} style={{ background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '11px 14px' }}>
                            <span style={{ fontSize: 10, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>{label}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color, letterSpacing: '-0.12px' }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── State: TERMINATED — termination summary ── */}
              {selectedStudy.status === 'TERMINATED' && (
                <div style={{
                  background: 'rgba(255,69,58,0.05)', border: '1px solid rgba(255,69,58,0.28)',
                  borderRadius: R_MD, padding: '16px 20px',
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                }}>
                  <XCircle size={24} color={DANGER} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontSize: 17, fontWeight: 600, color: DANGER, letterSpacing: '-0.374px', margin: '0 0 6px' }}>
                      Trial Prematurely Terminated
                    </p>
                    <p style={{ fontSize: 13, color: INK_48, margin: '0 0 14px', letterSpacing: '-0.12px', lineHeight: 1.5 }}>
                      This trial was terminated before completion. Emergency alerts dispatched to Ethics Committee and Leadership.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                      {[
                        { label: 'Termination Status', value: 'PREMATURELY TERMINATED', color: DANGER },
                        { label: 'GCP Justification Reason', value: (selectedStudy as any).termination_reason || 'Reason on file in audit_integrity_db', color: INK },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{ background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '11px 14px' }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>{label}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color, letterSpacing: '-0.12px', lineHeight: 1.5, display: 'block' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── All other states: not yet actionable ── */}
              {!['ENROLLING', 'ONGOING', 'DATA_LOCK', 'CLOSED', 'TERMINATED'].includes(selectedStudy.status) && (
                <div style={{ background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Lock size={15} color={INK_48} />
                  <p style={{ fontSize: 13, color: INK_48, margin: 0, letterSpacing: '-0.12px' }}>
                    Closeout actions are available once the trial reaches <strong style={{ color: INK }}>ENROLLING</strong> state. Complete IEC clearance and CTRI registration first.
                  </p>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="lg:col-span-8" style={{ background: CANVAS, borderRadius: R_LG, padding: 48, border: `1px solid ${HAIRLINE}`, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <FolderKanban size={40} color={PRIMARY} style={{ marginBottom: 14 }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: INK, margin: '0 0 8px' }}>No Clinical Trial Selected</h3>
            <p style={{ fontSize: 14, color: INK_48, maxWidth: 440, margin: '0 auto 24px', lineHeight: 1.5 }}>
              Select a clinical trial from the left panel to configure its protocol architecture, study arms, and visit schedules, or create a new trial.
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
            background: CANVAS, borderRadius: R_LG, width: '100%', maxWidth: 640,
            border: `1px solid ${HAIRLINE}`, padding: 32, display: 'flex', flexDirection: 'column', gap: 20,
            maxHeight: '90vh', overflowY: 'auto'
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                {/* Protocol document upload — optional at creation time */}
                <div>
                  <label style={labelOverline()}>Attach Signed Protocol Document (PDF) — Optional</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={e => setProtocolFile(e.target.files?.[0] ?? null)}
                    style={{
                      width: '100%', boxSizing: 'border-box' as const,
                      background: PARCHMENT, border: `1px solid ${HAIRLINE}`,
                      borderRadius: R_MD, padding: '8px 12px',
                      fontSize: 13, color: INK_80, cursor: 'pointer',
                    }}
                  />
                  {protocolFile && (
                    <p style={{ fontSize: 11, color: SUCCESS, margin: '4px 0 0' }}>
                      Ready to upload: {protocolFile.name}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                  <button type="button" onClick={() => setShowCreateModal(false)} style={btnSecondary()}>
                    Cancel
                  </button>
                  <button type="button" onClick={() => setWizardStep(2)} style={btnPrimary()}>
                    Next: Configure Arms <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: STUDY ARMS */}
            {wizardStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>Define Trial Arms</span>
                  <button type="button" onClick={handleAddArmState} style={btnUtility()}>
                    <Plus size={14} /> Add Arm
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
                  {arms.map((arm) => (
                    <div key={arm.id} style={{ background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={arm.arm_name}
                          onChange={e => handleUpdateArmState(arm.id, 'arm_name', e.target.value)}
                          style={{ ...inputField(), fontWeight: 600 }}
                        />
                        <button type="button" onClick={() => handleDeleteArmState(arm.id)} style={{ background: 'none', border: 'none', color: DANGER, cursor: 'pointer', marginLeft: 8 }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 10 }}>
                        <select
                          value={arm.arm_type}
                          onChange={e => handleUpdateArmState(arm.id, 'arm_type', e.target.value)}
                          style={inputField()}
                        >
                          <option value="EXPERIMENTAL">EXPERIMENTAL</option>
                          <option value="ACTIVE_COMPARATOR">ACTIVE_COMPARATOR</option>
                          <option value="PLACEBO_COMPARATOR">PLACEBO_COMPARATOR</option>
                          <option value="OPEN_LABEL">OPEN_LABEL</option>
                        </select>
                        <input
                          type="text"
                          value={arm.allocation_ratio}
                          onChange={e => handleUpdateArmState(arm.id, 'allocation_ratio', e.target.value)}
                          placeholder="Ratio 1:1"
                          style={inputField()}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${HAIRLINE}`, paddingTop: 14, marginTop: 6 }}>
                  <button type="button" onClick={() => setWizardStep(1)} style={btnSecondary()}>
                    ← Back to Identity
                  </button>
                  <button type="button" onClick={() => setWizardStep(3)} style={btnPrimary()}>
                    Next: Visit Matrix →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: VISIT SCHEDULE MATRIX */}
            {wizardStep === 3 && (
              <form onSubmit={handleCreateStudy} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>Define Schedule of Events</span>
                  <button type="button" onClick={handleAddVisitScheduleState} style={btnUtility()}>
                    <Plus size={14} /> Add Visit Row
                  </button>
                </div>

                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: INK_48, borderBottom: `1px solid ${HAIRLINE}` }}>
                        <th style={{ padding: 6 }}>Visit Name</th>
                        <th style={{ padding: 6, width: 80 }}>Day</th>
                        <th style={{ padding: 6, width: 80 }}>Window</th>
                        <th style={{ padding: 6, width: 130 }}>Type</th>
                        <th style={{ padding: 6, width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {visitSchedule.map((v, idx) => (
                        <tr key={idx} style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                          <td style={{ padding: 4 }}>
                            <input
                              type="text"
                              value={v.visit_name}
                              onChange={e => handleUpdateVisitScheduleState(idx, 'visit_name', e.target.value)}
                              style={{ ...inputField(), padding: '5px 8px' }}
                            />
                          </td>
                          <td style={{ padding: 4 }}>
                            <input
                              type="number"
                              value={v.target_day}
                              onChange={e => handleUpdateVisitScheduleState(idx, 'target_day', Number(e.target.value))}
                              style={{ ...inputField(), padding: '5px 8px', fontFamily: FONT_MONO }}
                            />
                          </td>
                          <td style={{ padding: 4 }}>
                            <input
                              type="number"
                              value={v.window_tolerance}
                              onChange={e => handleUpdateVisitScheduleState(idx, 'window_tolerance', Number(e.target.value))}
                              style={{ ...inputField(), padding: '5px 8px', fontFamily: FONT_MONO }}
                            />
                          </td>
                          <td style={{ padding: 4 }}>
                            <select
                              value={v.visit_type}
                              onChange={e => handleUpdateVisitScheduleState(idx, 'visit_type', e.target.value)}
                              style={{ ...inputField(), padding: '5px 6px' }}
                            >
                              <option value="SCREENING">SCREENING</option>
                              <option value="BASELINE">BASELINE</option>
                              <option value="FOLLOW_UP">FOLLOW_UP</option>
                              <option value="CLOSEOUT">CLOSEOUT</option>
                            </select>
                          </td>
                          <td style={{ padding: 4, textAlign: 'center' }}>
                            <button type="button" onClick={() => handleDeleteVisitScheduleState(idx)} style={{ background: 'none', border: 'none', color: DANGER, cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${HAIRLINE}`, paddingTop: 14, marginTop: 6 }}>
                  <button type="button" onClick={() => setWizardStep(2)} style={btnSecondary()}>
                    ← Back to Arms
                  </button>
                  <button type="submit" disabled={loading} style={btnPrimary(loading)}>
                    <Check size={16} /> Save &amp; Initialize Trial Protocol
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: PREMATURE TERMINATION — Mandatory GCP Justification */}
      {showTerminateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          padding: 20, fontFamily: FONT_STACK,
        }}>
          <div style={{
            background: CANVAS, borderRadius: R_LG, width: '100%', maxWidth: 520,
            border: `1px solid rgba(255,69,58,0.35)`, padding: 32,
            display: 'flex', flexDirection: 'column', gap: 20,
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(255,69,58,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <AlertTriangle size={20} color={DANGER} />
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: DANGER, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Irreversible Action — GCP Required
                  </span>
                  <h2 style={{ fontSize: 18, fontWeight: 600, color: INK, margin: '3px 0 0', letterSpacing: '-0.374px' }}>
                    Prematurely Terminate Trial
                  </h2>
                </div>
              </div>
              <button
                onClick={() => { setShowTerminateModal(false); setTerminationReason(''); }}
                style={{ background: 'none', border: 'none', fontSize: 18, color: INK_48, cursor: 'pointer', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            {/* Warning banner */}
            <div style={{
              background: 'rgba(255,69,58,0.06)', border: '1px solid rgba(255,69,58,0.22)',
              borderRadius: R_MD, padding: '12px 16px',
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <AlertCircle size={15} color={DANGER} style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: DANGER, margin: 0, lineHeight: 1.5, letterSpacing: '-0.12px' }}>
                This will permanently terminate study <strong>{selectedStudy?.short_code}</strong>. An emergency CRITICAL alert will be dispatched to the Ethics Committee and Leadership dashboard. This action is written to the immutable <code style={{ fontFamily: FONT_MONO, fontSize: 12, background: 'rgba(255,69,58,0.08)', padding: '1px 5px', borderRadius: 4 }}>audit_integrity_db</code> and cannot be undone.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleTerminate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 600, color: INK_48,
                  letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6,
                }}>
                  Mandatory GCP Justification Reason *
                </label>
                <textarea
                  value={terminationReason}
                  onChange={e => setTerminationReason(e.target.value)}
                  placeholder="Describe the clinical, safety, or operational reason for premature termination per GCP guidelines (e.g. unacceptable adverse event rate, sponsor decision, loss of funding)..."
                  required
                  rows={5}
                  style={{
                    width: '100%', resize: 'vertical', fontFamily: FONT_STACK,
                    fontSize: 13, color: INK, background: PARCHMENT,
                    border: `1px solid ${terminationReason.trim() ? 'rgba(255,69,58,0.40)' : HAIRLINE}`,
                    borderRadius: R_MD, padding: '10px 14px',
                    outline: 'none', lineHeight: 1.6, boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,69,58,0.60)')}
                  onBlur={e => (e.currentTarget.style.borderColor = terminationReason.trim() ? 'rgba(255,69,58,0.40)' : HAIRLINE)}
                />
                <p style={{ fontSize: 11, color: INK_48, margin: '5px 0 0', letterSpacing: '-0.08px' }}>
                  {terminationReason.trim().length} characters — minimum detail required per ICH E6(R2) GCP guidelines.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
                <button
                  type="button"
                  onClick={() => { setShowTerminateModal(false); setTerminationReason(''); }}
                  style={btnSecondary()}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={closeoutLoading || !terminationReason.trim()}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    background: closeoutLoading || !terminationReason.trim() ? 'rgba(255,69,58,0.45)' : DANGER,
                    color: '#ffffff', border: 'none',
                    borderRadius: R_PILL, padding: '10px 22px',
                    fontSize: 14, fontWeight: 600,
                    cursor: closeoutLoading || !terminationReason.trim() ? 'not-allowed' : 'pointer',
                    transition: 'transform 0.1s ease', fontFamily: FONT_STACK,
                  }}
                  onMouseDown={e => !(closeoutLoading || !terminationReason.trim()) && (e.currentTarget.style.transform = 'scale(0.95)')}
                  onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <XCircle size={14} />
                  {closeoutLoading ? 'Terminating…' : 'Confirm Termination'}
                </button>
              </div>
            </form>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              {/* CoA / Batch Certificate upload */}
              <div>
                <label style={labelOverline()}>Attach Certificate of Analysis (CoA / PDF) — Optional</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => setCoaFile(e.target.files?.[0] ?? null)}
                  style={{
                    width: '100%', boxSizing: 'border-box' as const,
                    background: PARCHMENT, border: `1px solid ${HAIRLINE}`,
                    borderRadius: R_MD, padding: '8px 12px',
                    fontSize: 13, color: INK_80, cursor: 'pointer',
                  }}
                />
                {coaFile && (
                  <p style={{ fontSize: 11, color: SUCCESS, margin: '4px 0 0' }}>
                    Ready to upload: {coaFile.name}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowBatchModal(false)} style={btnSecondary()}>
                  Cancel
                </button>                <button type="submit" disabled={loading} style={btnPrimary(loading)}>
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
