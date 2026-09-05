import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Study } from '../types';
import {
  FolderKanban,
  Plus,
  Pill,
  FileCheck,
  ShieldAlert,
  CheckCircle2,
  Lock,
  RefreshCw,
  Clock,
  Award,
  AlertCircle
} from 'lucide-react';
import {
  CANVAS, PARCHMENT, PEARL, HAIRLINE, INK, INK_48, INK_80,
  PRIMARY, PRIMARY_FOCUS, PRIMARY_ON_DARK,
  SUCCESS, WARNING, DANGER, PURPLE,
  FONT_STACK, FONT_MONO,
  R_MD, R_LG, R_PILL,
  TYPE, BADGE
} from '../design';

export const StudiesPage: React.FC = () => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // MODAL STATES
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showCtriModal, setShowCtriModal] = useState(false);

  // FORM 1: CREATE STUDY
  const [shortCode, setShortCode] = useState('');
  const [title, setTitle] = useState('');
  const [phase, setPhase] = useState('Phase 2');
  const [studyType, setStudyType] = useState('Interventional RCT');
  const [sampleSize, setSampleSize] = useState('100');

  // FORM 2: IP MEDICINE BATCH
  const [formulation, setFormulation] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [standardRef, setStandardRef] = useState('API Part-1 Vol-1');
  const [mfgDate, setMfgDate] = useState('2026-08-01');
  const [expDate, setExpDate] = useState('2028-08-01');
  const [quantity, setQuantity] = useState('5000');

  // FORM 3: CTRI LINKING
  const [ctriId, setCtriId] = useState('');
  const [regDate, setRegDate] = useState('2026-09-01');

  const loadStudies = async () => {
    try {
      const res = await api.get('/study/list');
      setStudies(res.data);
      if (res.data.length > 0 && !selectedStudy) {
        setSelectedStudy(res.data[0]);
      } else if (selectedStudy) {
        const updated = res.data.find((s: Study) => s.id === selectedStudy.id);
        if (updated) setSelectedStudy(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStudies();
  }, []);

  // 1. CREATE NEW TRIAL
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
      setNotification(`✅ Study '${res.data.short_code}' created in DRAFT state!`);
      setShowCreateModal(false);
      setTitle('');
      setShortCode('');
      loadStudies();
    } catch (err: any) {
      setNotification(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. STATE TRANSITION: SUBMIT TO IEC
  const handleIecSubmit = async () => {
    if (!selectedStudy) return;
    setLoading(true);
    try {
      await api.post(`/study/${selectedStudy.id}/iec-submit`, {
        submission_date: new Date().toISOString().split('T')[0],
      });
      setNotification(`✅ Study '${selectedStudy.short_code}' submitted to Institutional Ethics Committee (IEC)!`);
      loadStudies();
    } catch (err: any) {
      setNotification(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 3. STATE TRANSITION: IEC APPROVAL
  const handleIecApprove = async () => {
    if (!selectedStudy) return;
    setLoading(true);
    try {
      await api.patch(`/study/${selectedStudy.id}/iec-decide`, {
        decision: 'APPROVED',
        decision_date: new Date().toISOString().split('T')[0],
        valid_until: '2027-09-15',
        remarks: 'Ethics clearance approved unanimously under ICMR 2017 Guidelines.',
      });
      setNotification(`✅ Ethics approval granted! Approval validity locked until Sep 2027.`);
      loadStudies();
    } catch (err: any) {
      setNotification(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 4. STATE TRANSITION: LINK CTRI (UNLOCKS ENROLLING)
  const handleLinkCtri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudy) return;
    setLoading(true);
    try {
      await api.patch(`/study/${selectedStudy.id}/ctri-link`, {
        ctri_id: ctriId || `CTRI/2026/09/${Math.floor(100000 + Math.random() * 899999)}`,
        registration_date: regDate,
      });
      setNotification(`✅ CTRI ID linked! Guard unlocked: Study is now in ENROLLING status.`);
      setShowCtriModal(false);
      setCtriId('');
      loadStudies();
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
      loadStudies();
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
            Trial Setup &amp; Governance Engine
          </h1>
          <p style={{ ...TYPE.caption, color: INK_48, margin: 0 }}>
            Central control room for study protocol creation, guarded state transitions, and Investigational Product (IP) batch setup.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: PRIMARY, color: '#ffffff', border: 'none',
            borderRadius: R_PILL, padding: '11px 22px',
            fontSize: 14, fontWeight: 600, letterSpacing: '-0.224px',
            cursor: 'pointer', transition: 'transform 0.1s ease',
            fontFamily: FONT_STACK, whiteSpace: 'nowrap'
          }}
        >
          <Plus size={16} />
          Setup New Clinical Trial
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        {/* Left: Study List Selector */}
        <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${HAIRLINE}`, paddingBottom: 12 }}>
            <span style={{ ...TYPE.label, color: INK_48 }}>All Protocols ({studies.length})</span>
            <button onClick={loadStudies} style={{ background: 'none', border: 'none', color: INK_48, cursor: 'pointer', padding: 4 }} title="Refresh">
              <RefreshCw size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {studies.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: INK_48 }}>
                No clinical trials found. Click "Setup New Clinical Trial" to create one.
              </div>
            ) : (
              studies.map((s) => {
                const isSelected = selectedStudy?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedStudy(s)}
                    style={{
                      padding: 14, borderRadius: R_MD,
                      border: `1px solid ${isSelected ? PRIMARY : HAIRLINE}`,
                      background: isSelected ? '#eef6ff' : PARCHMENT,
                      cursor: 'pointer', transition: 'all 0.15s ease',
                      display: 'flex', flexDirection: 'column', gap: 6
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: FONT_MONO, fontWeight: 600, fontSize: 13, color: PRIMARY }}>{s.short_code}</span>
                      <span style={
                        s.status === 'ENROLLING' ? BADGE.green :
                        s.status === 'IEC_APPROVED' ? BADGE.purple : BADGE.ink
                      }>
                        {s.status}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: 0, lineHeight: 1.3 }}>{s.title}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: INK_48, borderTop: `1px solid ${HAIRLINE}`, paddingTop: 6 }}>
                      <span>{s.phase}</span>
                      <span>Target: <strong style={{ color: INK }}>{s.target_sample_size}</strong></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Study Control Room & Guarded State Machine */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* 1. GUARDED STATE MACHINE PROGRESS STEPPER */}
          <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${HAIRLINE}`, paddingBottom: 14 }}>
              <div>
                <span style={{ ...TYPE.label, color: INK_48, display: 'block', marginBottom: 2 }}>Lifecycle Architecture</span>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: INK, margin: 0, letterSpacing: '-0.374px' }}>Guarded Trial Lifecycle State Machine</h3>
              </div>
              <span style={BADGE.green}>Current State: {selectedStudy?.status || 'N/A'}</span>
            </div>

            {/* Stepper Visual */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, textAlign: 'center' }}>
              <div style={{ background: '#eafaf1', border: `1px solid ${SUCCESS}`, color: INK, padding: 10, borderRadius: R_MD, fontSize: 11, fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>1. DRAFT</span>
                <CheckCircle2 size={16} color={SUCCESS} style={{ marginTop: 6 }} />
              </div>

              <div style={{
                background: getStepStatus('IEC_SUBMITTED') === 'COMPLETED' ? '#eafaf1' : PARCHMENT,
                border: `1px solid ${getStepStatus('IEC_SUBMITTED') === 'COMPLETED' ? SUCCESS : HAIRLINE}`,
                color: INK, padding: 10, borderRadius: R_MD, fontSize: 11, fontWeight: 600,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <span>2. IEC SUBMITTED</span>
                {getStepStatus('IEC_SUBMITTED') === 'COMPLETED' ? (
                  <CheckCircle2 size={16} color={SUCCESS} style={{ marginTop: 6 }} />
                ) : (
                  <Clock size={16} color={INK_48} style={{ marginTop: 6 }} />
                )}
              </div>

              <div style={{
                background: getStepStatus('IEC_APPROVED') === 'COMPLETED' ? '#f5e8ff' : PARCHMENT,
                border: `1px solid ${getStepStatus('IEC_APPROVED') === 'COMPLETED' ? PURPLE : HAIRLINE}`,
                color: INK, padding: 10, borderRadius: R_MD, fontSize: 11, fontWeight: 600,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <span>3. IEC APPROVED</span>
                {getStepStatus('IEC_APPROVED') === 'COMPLETED' ? (
                  <CheckCircle2 size={16} color={PURPLE} style={{ marginTop: 6 }} />
                ) : (
                  <Lock size={16} color={INK_48} style={{ marginTop: 6 }} />
                )}
              </div>

              <div style={{
                background: getStepStatus('CTRI_LINKED') === 'COMPLETED' ? '#eef6ff' : PARCHMENT,
                border: `1px solid ${getStepStatus('CTRI_LINKED') === 'COMPLETED' ? PRIMARY : HAIRLINE}`,
                color: INK, padding: 10, borderRadius: R_MD, fontSize: 11, fontWeight: 600,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <span>4. CTRI LINKED</span>
                {getStepStatus('CTRI_LINKED') === 'COMPLETED' ? (
                  <CheckCircle2 size={16} color={PRIMARY} style={{ marginTop: 6 }} />
                ) : (
                  <Lock size={16} color={INK_48} style={{ marginTop: 6 }} />
                )}
              </div>

              <div style={{
                background: getStepStatus('ENROLLING') === 'COMPLETED' ? '#eafaf1' : PARCHMENT,
                border: `1px solid ${getStepStatus('ENROLLING') === 'COMPLETED' ? SUCCESS : HAIRLINE}`,
                color: INK, padding: 10, borderRadius: R_MD, fontSize: 11, fontWeight: 600,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <span>5. ENROLLING</span>
                {getStepStatus('ENROLLING') === 'COMPLETED' ? (
                  <CheckCircle2 size={16} color={SUCCESS} style={{ marginTop: 6 }} />
                ) : (
                  <Lock size={16} color={INK_48} style={{ marginTop: 6 }} />
                )}
              </div>
            </div>

            {/* State Actions Bar */}
            <div style={{ borderTop: `1px solid ${HAIRLINE}`, paddingTop: 14, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {selectedStudy?.status === 'DRAFT' && (
                <button
                  onClick={handleIecSubmit}
                  disabled={loading}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: PRIMARY, color: '#ffffff', border: 'none',
                    borderRadius: R_PILL, padding: '9px 18px', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <FileCheck size={15} />
                  Submit Protocol to IEC
                </button>
              )}

              {selectedStudy?.status === 'IEC_SUBMITTED' && (
                <button
                  onClick={handleIecApprove}
                  disabled={loading}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: PURPLE, color: '#ffffff', border: 'none',
                    borderRadius: R_PILL, padding: '9px 18px', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Award size={15} />
                  Record Ethics Approval (1-Year Validity)
                </button>
              )}

              {selectedStudy?.status === 'IEC_APPROVED' && (
                <button
                  onClick={() => setShowCtriModal(true)}
                  disabled={loading}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: SUCCESS, color: '#ffffff', border: 'none',
                    borderRadius: R_PILL, padding: '9px 18px', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <ShieldAlert size={15} />
                  Link CTRI Registration ID (Unlocks Enrollment)
                </button>
              )}

              {selectedStudy?.status === 'ENROLLING' && (
                <div style={{
                  padding: '10px 16px', background: '#eafaf1', border: `1px solid ${SUCCESS}`,
                  borderRadius: R_MD, color: SUCCESS, fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%'
                }}>
                  <CheckCircle2 size={16} />
                  <span>Prospective Registration Verified — Patient Enrollment Live &amp; Unlocked!</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. INVESTIGATIONAL PRODUCT (IP) BATCHES MODULE */}
          <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${HAIRLINE}`, paddingBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: INK, margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '-0.374px' }}>
                  <Pill size={16} color={PRIMARY} />
                  Investigational Product (IP) Batch Inventory
                </h2>
                <p style={{ ...TYPE.caption, color: INK_48, margin: 0 }}>
                  GCP Drug Accountability: Batch standards (AFI/API), shelf life, and warehouse stock.
                </p>
              </div>

              <button
                onClick={() => setShowBatchModal(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: PARCHMENT, color: INK_80, border: `1px solid ${HAIRLINE}`,
                  borderRadius: R_PILL, padding: '8px 16px', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} />
                Add Medicine Batch
              </button>
            </div>

            {!selectedStudy?.ip_batches || selectedStudy.ip_batches.length === 0 ? (
              <div style={{ padding: 24, background: PARCHMENT, borderRadius: R_MD, border: `1px solid ${HAIRLINE}`, textAlign: 'center', fontSize: 13, color: INK_48 }}>
                No medicine batches registered for this study. Click "Add Medicine Batch" to record formulation details.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                {selectedStudy.ip_batches.map((b) => (
                  <div key={b.id} style={{ background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: INK }}>{b.formulation_name}</span>
                      <span style={BADGE.green}>{b.current_stock} Units</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: INK_80, borderTop: `1px solid ${HAIRLINE}`, paddingTop: 6 }}>
                      <span>Batch No: <strong style={{ color: INK }}>{b.batch_no}</strong></span>
                      <span>Standard: <strong style={{ color: PRIMARY }}>{b.afi_api_standard_ref || 'AFI Part-1'}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: CREATE NEW TRIAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(29, 29, 31, 0.4)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, maxWidth: 500, width: '100%', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${HAIRLINE}`, paddingBottom: 12 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: INK, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FolderKanban size={18} color={PRIMARY} />
                Setup New Ayurveda Clinical Protocol
              </h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', fontSize: 16, color: INK_48, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateStudy} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Study Short Code</label>
                <input
                  type="text"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value)}
                  placeholder="e.g. AIIA-PANKA-01"
                  style={{ width: '100%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 14px', color: INK, fontSize: 14, outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Scientific Title of Study</label>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. An open clinical trial for assessment of efficacy of Breath Eazy in Bronchial Asthma"
                  style={{ width: '100%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 14px', color: INK, fontSize: 14, height: 80, outline: 'none', fontFamily: FONT_STACK }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Phase</label>
                  <select
                    value={phase}
                    onChange={(e) => setPhase(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 14px', color: INK, fontSize: 14, outline: 'none' }}
                  >
                    <option>Phase 1</option>
                    <option>Phase 2</option>
                    <option>Phase 3</option>
                    <option>Pilot / Exploratory</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Target Sample Size</label>
                  <input
                    type="number"
                    value={sampleSize}
                    onChange={(e) => setSampleSize(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 14px', color: INK, fontSize: 14, outline: 'none' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, paddingTop: 10, borderTop: `1px solid ${HAIRLINE}` }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ width: '50%', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, color: INK_80, borderRadius: R_PILL, padding: '10px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '50%', background: PRIMARY, border: 'none', color: '#ffffff', borderRadius: R_PILL, padding: '10px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  {loading ? 'Creating...' : 'Initialize Protocol'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD IP BATCH */}
      {showBatchModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(29, 29, 31, 0.4)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, maxWidth: 450, width: '100%', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${HAIRLINE}`, paddingBottom: 12 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: INK, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Pill size={18} color={PRIMARY} />
                Register Medicine Batch (AFI/API)
              </h2>
              <button onClick={() => setShowBatchModal(false)} style={{ background: 'none', border: 'none', fontSize: 16, color: INK_48, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddBatch} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Formulation Name</label>
                <input
                  type="text"
                  value={formulation}
                  onChange={(e) => setFormulation(e.target.value)}
                  placeholder="e.g. Breath Eazy Mishrit 20ml"
                  style={{ width: '100%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 14px', color: INK, fontSize: 14, outline: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Batch Number</label>
                  <input
                    type="text"
                    value={batchNo}
                    onChange={(e) => setBatchNo(e.target.value)}
                    placeholder="e.g. BZ-2026-B1"
                    style={{ width: '100%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 14px', color: INK, fontSize: 14, outline: 'none' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Standard Ref</label>
                  <input
                    type="text"
                    value={standardRef}
                    onChange={(e) => setStandardRef(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 14px', color: INK, fontSize: 14, outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Manufacturing Date</label>
                  <input
                    type="date"
                    value={mfgDate}
                    onChange={(e) => setMfgDate(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 14px', color: INK, fontSize: 14, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Expiry Date</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 14px', color: INK, fontSize: 14, outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Initial Quantity (Units)</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 14px', color: INK, fontSize: 14, outline: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 12, paddingTop: 10, borderTop: `1px solid ${HAIRLINE}` }}>
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  style={{ width: '50%', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, color: INK_80, borderRadius: R_PILL, padding: '10px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '50%', background: PRIMARY, border: 'none', color: '#ffffff', borderRadius: R_PILL, padding: '10px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  {loading ? 'Logging...' : 'Register Batch Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CTRI LINKING */}
      {showCtriModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(29, 29, 31, 0.4)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG, maxWidth: 450, width: '100%', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${HAIRLINE}`, paddingBottom: 12 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: INK, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={18} color={PRIMARY} />
                Link Official CTRI Registration ID
              </h2>
              <button onClick={() => setShowCtriModal(false)} style={{ background: 'none', border: 'none', fontSize: 16, color: INK_48, cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ ...TYPE.caption, color: INK_48, margin: 0 }}>
              Under ICMR/WHO guidelines, entering the prospective CTRI ID verifies trial authorization and unlocks patient enrollment.
            </p>

            <form onSubmit={handleLinkCtri} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>CTRI Registration Number</label>
                <input
                  type="text"
                  value={ctriId}
                  onChange={(e) => setCtriId(e.target.value)}
                  placeholder="e.g. CTRI/2026/09/012345"
                  style={{ width: '100%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 14px', color: INK, fontSize: 14, fontFamily: FONT_MONO, outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Official Registration Date</label>
                <input
                  type="date"
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, borderRadius: R_MD, padding: '9px 14px', color: INK, fontSize: 14, outline: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 12, paddingTop: 10, borderTop: `1px solid ${HAIRLINE}` }}>
                <button
                  type="button"
                  onClick={() => setShowCtriModal(false)}
                  style={{ width: '50%', background: PARCHMENT, border: `1px solid ${HAIRLINE}`, color: INK_80, borderRadius: R_PILL, padding: '10px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '50%', background: PRIMARY, border: 'none', color: '#ffffff', borderRadius: R_PILL, padding: '10px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  {loading ? 'Verifying...' : 'Link & Unlock Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
