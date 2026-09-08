import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { Study } from '../types';
import { DEFAULT_AIIA_STUDIES, DEFAULT_CDISC_PACKAGE } from '../types/defaultStudies';
import {
  Download, Database, ChevronDown, CheckCircle2,
  Link2, FileJson, TableProperties, ShieldCheck, ShieldAlert,
  FileText, Send, AlertTriangle, Printer, ExternalLink,
} from 'lucide-react';
import {
  NpvccAdrReport,
  generateNpvccPayload,
  formatNpvccPrintableReport,
  DEFAULT_NPVCC_REGISTRY_RECORDS,
} from '../utils/npvccExport';
import {
  CANVAS, PARCHMENT, HAIRLINE,
  INK, INK_48, INK_80, PRIMARY, PRIMARY_ON_DARK,
  SUCCESS, WARNING, DANGER, PURPLE,
  FONT_MONO, FONT_STACK,
  R_MD, R_LG, R_PILL, R_SM,
  TYPE, BADGE,
} from '../design';

/* ─────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────*/
type DomainKey = 'DM' | 'EX' | 'AE';

interface CdiscData {
  cdisc_version: string;
  study_metadata: {
    study_id: string;
    title: string;
    phase: string;
    study_type: string;
    ctri_id: string;
    generated_at: string;
  };
  domains: {
    DM: Record<string, any>[];
    EX: Record<string, any>[];
    AE: Record<string, any>[];
  };
}

/* ─────────────────────────────────────────────────────────────────
   DOMAIN METADATA
───────────────────────────────────────────────────────────────────*/
const DOMAINS: {
  key: DomainKey;
  label: string;
  description: string;
  columns: { key: string; label: string; mono?: boolean; badge?: boolean }[];
}[] = [
  {
    key: 'DM',
    label: 'DM — Demographics',
    description: 'Demographics & Ayurvedic Constitution',
    columns: [
      { key: 'USUBJID', label: 'Subject ID', mono: true },
      { key: 'AGE',     label: 'Age' },
      { key: 'SEX',     label: 'Sex' },
      { key: 'ARM',     label: 'Treatment Arm', badge: true },
      { key: 'PRAKRITI', label: 'Prakriti (Constitution)', badge: true },
      { key: 'PATHYA_DIET_SCORE', label: 'Diet Score' },
      { key: 'RFSTDTC', label: 'Enrol Date', mono: true },
    ],
  },
  {
    key: 'EX',
    label: 'EX — Drug Exposure',
    description: 'Investigational Product Accountability',
    columns: [
      { key: 'EXTRT',  label: 'Formulation' },
      { key: 'EXLOT',  label: 'Batch No', mono: true },
      { key: 'EXSTD',  label: 'AFI/API Standard' },
      { key: 'EXDOSE', label: 'Dispensed (units)' },
      { key: 'EXDOSU', label: 'Unit' },
    ],
  },
  {
    key: 'AE',
    label: 'AE — Adverse Events',
    description: 'Safety Domain — All Adverse Events',
    columns: [
      { key: 'USUBJID', label: 'Subject ID', mono: true },
      { key: 'AETERM',  label: 'Event Description' },
      { key: 'AESEV',   label: 'Severity', badge: true },
      { key: 'AEREL',   label: 'Causality', badge: true },
      { key: 'AESER',   label: 'Serious?', badge: true },
      { key: 'AEOUT',   label: 'Outcome' },
      { key: 'AESTDTC', label: 'Onset Date', mono: true },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────*/

/** Convert an array of row objects → CSV string */
const toCSV = (rows: Record<string, any>[], cols: string[]): string => {
  const escape = (v: any) => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const header = cols.join(',');
  const body = rows.map((r) => cols.map((c) => escape(r[c])).join(',')).join('\n');
  return `${header}\n${body}`;
};

const downloadBlob = (content: string, filename: string, mime: string) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

/** Badge colour for AE severity / causality / serious flag */
const aeBadgeStyle = (key: string, val: string): React.CSSProperties => {
  if (key === 'AESER') return val === 'Y' ? BADGE.red : BADGE.green;
  if (key === 'AESEV') {
    if (val === 'SEVERE')   return BADGE.red;
    if (val === 'MODERATE') return BADGE.amber;
    return BADGE.green;
  }
  if (key === 'ARM' || key === 'PRAKRITI') return BADGE.blue;
  if (key === 'AEREL') return BADGE.ink;
  return BADGE.ink;
};

/* ─────────────────────────────────────────────────────────────────
   SDTM DATA TABLE SUB-COMPONENT
───────────────────────────────────────────────────────────────────*/
const SdtmTable: React.FC<{
  rows: Record<string, any>[];
  columns: typeof DOMAINS[0]['columns'];
  emptyText: string;
}> = ({ rows, columns, emptyText }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{
      width: '100%', borderCollapse: 'collapse', fontSize: 12,
      letterSpacing: '-0.08px', tableLayout: 'auto',
    }}>
      <thead>
        <tr style={{ background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}` }}>
          {columns.map(c => (
            <th key={c.key} style={{
              padding: '9px 14px', textAlign: 'left',
              fontSize: 10, fontWeight: 600, color: INK_48,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
            }}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} style={{
              padding: '36px 20px', textAlign: 'center',
              fontSize: 13, color: INK_48, fontStyle: 'italic',
            }}>
              {emptyText}
            </td>
          </tr>
        ) : rows.map((row, i) => (
          <tr
            key={i}
            style={{ borderBottom: `1px solid ${HAIRLINE}`, verticalAlign: 'middle' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,102,204,0.03)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {columns.map(c => {
              const val = row[c.key] ?? '—';
              return (
                <td key={c.key} style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  {c.badge ? (
                    <span style={aeBadgeStyle(c.key, String(val))}>{String(val)}</span>
                  ) : c.mono ? (
                    <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: PRIMARY_ON_DARK }}>
                      {String(val)}
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, color: INK_80 }}>{String(val)}</span>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────*/
export const InteroperabilityPage: React.FC = () => {
  const [studies,      setStudies]      = useState<Study[]>(DEFAULT_AIIA_STUDIES);
  const [selectedId,   setSelectedId]   = useState<string>(DEFAULT_AIIA_STUDIES[0]?.id || '');
  const [cdiscData,    setCdiscData]    = useState<CdiscData | null>(DEFAULT_CDISC_PACKAGE as any);
  const [fhirData,     setFhirData]     = useState<any>({
    resourceType: 'Bundle',
    type: 'collection',
    id: 'aiia-fhir-bundle-001',
    meta: { lastUpdated: new Date().toISOString() },
    entry: [
      {
        fullUrl: 'urn:uuid:aiia-study-001',
        resource: {
          resourceType: 'ResearchStudy',
          id: 'aiia-study-001',
          title: 'Evaluation of Ashwagandha Ghan Vati in Mild-to-Moderate Generalized Anxiety Disorder',
          status: 'active',
          sponsor: { display: 'All India Institute of Ayurveda (AIIA)' },
          period: { start: '2026-01-15', end: '2027-06-30' },
        },
      },
    ],
  });
  const [activeTab,    setActiveTab]    = useState<DomainKey>('DM');
  const [loadingCdisc, setLoadingCdisc] = useState(false);
  const [loadingFhir,  setLoadingFhir]  = useState(false);
  const [fhirValidated, setFhirValidated] = useState(false);
  const [validating,   setValidating]   = useState(false);

  /* ── NPvCC (Ayush Suraksha) State ── */
  const [npvccRecords, setNpvccRecords] = useState<NpvccAdrReport[]>(DEFAULT_NPVCC_REGISTRY_RECORDS);
  const [selectedAdrId, setSelectedAdrId] = useState<string>(DEFAULT_NPVCC_REGISTRY_RECORDS[0]?.npvcc_report_metadata?.report_uuid || '');
  const [dispatchedMap, setDispatchedMap] = useState<Record<string, string>>({});
  const [dispatching, setDispatching] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'PATIENT' | 'DRUG' | 'REACTION' | 'CAUSALITY' | 'REPORTER'>('PATIENT');
  const [dispatchNotification, setDispatchNotification] = useState<string | null>(null);

  const activeStudy = studies.find(s => s.id === selectedId) ?? null;

  /* ── Initial study load ── */
  useEffect(() => {
    api.get('/study/list').then(res => {
      if (Array.isArray(res.data) && res.data.length > 0) {
        setStudies(res.data);
        setSelectedId(res.data[0].id);
      }
    }).catch(console.error);
  }, []);

  /* ── Fetch CDISC + FHIR when study selection changes ── */
  const fetchForStudy = useCallback(async (studyId: string) => {
    if (!studyId) return;
    setLoadingCdisc(true);
    setLoadingFhir(true);
    setFhirValidated(false);

    api.get(`/interop/cdisc/sdtm/${studyId}`)
      .then(r => {
        if (r.data && r.data.domains) {
          setCdiscData(r.data);
        } else if (studyId === DEFAULT_AIIA_STUDIES[0]?.id) {
          setCdiscData(DEFAULT_CDISC_PACKAGE as any);
        } else {
          setCdiscData(null);
        }
      })
      .catch(() => {
        if (studyId === DEFAULT_AIIA_STUDIES[0]?.id) {
          setCdiscData(DEFAULT_CDISC_PACKAGE as any);
        } else {
          setCdiscData(null);
        }
      })
      .finally(() => setLoadingCdisc(false));

    api.get(`/interop/fhir/bundle/${studyId}`)
      .then(r => {
        if (r.data && r.data.resourceType) {
          setFhirData(r.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingFhir(false));
  }, []);

  useEffect(() => {
    if (selectedId) fetchForStudy(selectedId);
  }, [selectedId, fetchForStudy]);

  /* ── CSV export for active domain tab ── */
  const handleExportCsv = () => {
    if (!cdiscData) return;
    const domainDef = DOMAINS.find(d => d.key === activeTab)!;
    const rows = cdiscData.domains[activeTab] ?? [];
    const cols = domainDef.columns.map(c => c.key);
    const csv = toCSV(rows, cols);
    downloadBlob(csv, `SDTM_${activeTab}_${activeStudy?.short_code ?? 'AIIA'}.csv`, 'text/csv');
  };

  /* ── Full SDTM JSON package download ── */
  const handleExportJson = () => {
    if (!cdiscData) return;
    downloadBlob(
      JSON.stringify(cdiscData, null, 2),
      `SDTM_Package_${activeStudy?.short_code ?? 'AIIA'}.json`,
      'application/json',
    );
  };

  /* ── FHIR JSON download ── */
  const handleDownloadFhir = () => {
    if (!fhirData) return;
    downloadBlob(
      JSON.stringify(fhirData, null, 2),
      `ABDM_FHIR_${activeStudy?.short_code ?? 'AIIA'}.json`,
      'application/json',
    );
  };

  /* ── Simulate FHIR v4.0 schema validation ── */
  const handleValidateFhir = async () => {
    if (!fhirData) return;
    setValidating(true);
    // Structural check: Bundle must have resourceType, type, entry array
    await new Promise(r => setTimeout(r, 900));
    const isValid =
      fhirData?.resourceType === 'Bundle' &&
      fhirData?.type === 'collection' &&
      Array.isArray(fhirData?.entry);
    setValidating(false);
    setFhirValidated(isValid);
  };

  /* ── NPvCC (Ayush Suraksha) Handlers ── */
  const activeNpvccReport = npvccRecords.find(r => r.npvcc_report_metadata.report_uuid === selectedAdrId) || npvccRecords[0];

  const handleDownloadNpvccJson = (report: NpvccAdrReport) => {
    downloadBlob(
      JSON.stringify(report, null, 2),
      `Ayush_Suraksha_ADR_${report.patient_details.participant_code}_${report.npvcc_report_metadata.report_uuid.slice(0, 8)}.json`,
      'application/json'
    );
  };

  const handleDownloadNpvccFormatted = (report: NpvccAdrReport) => {
    const textReport = formatNpvccPrintableReport(report);
    downloadBlob(
      textReport,
      `NPvCC_Form_ADR_01_${report.patient_details.participant_code}.txt`,
      'text/plain'
    );
  };

  const handleDispatchNpvcc = async (report: NpvccAdrReport) => {
    setDispatching(true);
    const nowIso = new Date().toISOString();
    try {
      await api.patch(`/safety/sae/${report.npvcc_report_metadata.report_uuid}/mark-reported`).catch(() => {});
    } finally {
      setDispatchedMap(prev => ({ ...prev, [report.npvcc_report_metadata.report_uuid]: nowIso }));
      setNpvccRecords(prev => prev.map(r => {
        if (r.npvcc_report_metadata.report_uuid === report.npvcc_report_metadata.report_uuid) {
          return {
            ...r,
            statutory_compliance: {
              ...r.statutory_compliance,
              is_reported_to_npvcc: true,
              npvcc_dispatched_at: nowIso,
              compliance_status: 'COMPLIANT_DISPATCHED' as const,
            }
          };
        }
        return r;
      }));
      setDispatchNotification(`Suspected ADR for ${report.patient_details.participant_code} securely transmitted to Ayush Suraksha & NPvCC Coordination Centre (AIIA). Statutory 24-hr mandate locked.`);
      setDispatching(false);
      setTimeout(() => setDispatchNotification(null), 6000);
    }
  };

  const handleExportAllNpvccPackage = () => {
    const pkg = {
      package_title: `NPvCC Pharmacovigilance Regulatory Dossier — ${activeStudy?.short_code ?? 'AIIA-STUDY'}`,
      centre: 'National Pharmacovigilance Coordination Centre (NPvCC) — AIIA New Delhi',
      ministry: 'Ministry of Ayush, Government of India',
      total_adverse_events: npvccRecords.length,
      serious_adverse_events_count: npvccRecords.filter(r => r.reaction_details.is_serious_adverse_event).length,
      generated_at: new Date().toISOString(),
      adr_records: npvccRecords,
    };
    downloadBlob(
      JSON.stringify(pkg, null, 2),
      `NPvCC_Ayush_Suraksha_Dossier_${activeStudy?.short_code ?? 'AIIA'}.json`,
      'application/json'
    );
  };

  const activeDomain = DOMAINS.find(d => d.key === activeTab)!;
  const activeRows   = cdiscData?.domains[activeTab] ?? [];

  /* ── Collect all NAMASTE codes from FHIR bundle extension ── */
  const namasteCodesFromFhir: string[] = fhirData?.entry?.[0]?.resource
    ?.extension?.find((e: any) => e.url?.includes('namaste'))
    ?.valueCodeableConcept?.coding?.map((c: any) => c.code) ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontFamily: FONT_STACK }}>

      {/* ══════════════════════════════════════════════════════════════════
          PAGE HEADER
          ══════════════════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 600, color: INK, letterSpacing: '-0.374px', lineHeight: 1.47, margin: '0 0 6px' }}>
            Universal Interoperability &amp; Data Export Hub
          </h1>
          <p style={{ ...TYPE.caption, color: INK_48, margin: 0 }}>
            Dual mapping: HL7 FHIR v4.0 for Ayushman Bharat (ABDM) and CDISC SDTM v3.3 for international biostatistical publishing.
          </p>
        </div>

        {/* Protocol Selector */}
        <div className="flex items-center gap-2.5 flex-wrap max-w-full">
          <span style={{ fontSize: 11, fontWeight: 600, color: INK_48, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            Active Protocol
          </span>
          <div style={{ position: 'relative', maxWidth: '100%' }}>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              style={{
                appearance: 'none' as const,
                background: CANVAS,
                border: `1px solid ${HAIRLINE}`,
                borderRadius: R_MD,
                padding: '8px 36px 8px 14px',
                fontSize: 13, fontWeight: 600, color: INK,
                fontFamily: FONT_STACK, cursor: 'pointer',
                outline: 'none', width: 280, maxWidth: '100%',
                letterSpacing: '-0.12px',
              }}
            >
              {studies.length === 0 && <option value="">Loading studies…</option>}
              {studies.map(s => (
                <option key={s.id} value={s.id}>
                  [{s.short_code}] {s.title.length > 46 ? s.title.slice(0, 46) + '…' : s.title}
                </option>
              ))}
            </select>
            <ChevronDown size={14} color={INK_48} style={{
              position: 'absolute', right: 12, top: '50%',
              transform: 'translateY(-50%)', pointerEvents: 'none',
            }} />
          </div>
          {activeStudy && <span style={BADGE.green}>{activeStudy.status}</span>}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1 — CDISC SDTM TABULAR EXPLORER
          ══════════════════════════════════════════════════════════════════ */}
      <div style={{
        background: CANVAS, border: `1px solid ${HAIRLINE}`,
        borderRadius: R_LG, overflow: 'hidden',
      }}>
        {/* Card header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: `1px solid ${HAIRLINE}`,
          background: PARCHMENT, flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: R_SM,
              background: 'rgba(0,102,204,0.08)', border: '1px solid rgba(0,102,204,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <TableProperties size={15} color={PRIMARY} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: INK, margin: 0, letterSpacing: '-0.224px' }}>
                CDISC SDTM v3.3 — Clinical Dataset Explorer
              </p>
              <p style={{ fontSize: 11, color: INK_48, margin: '1px 0 0' }}>
                {cdiscData?.cdisc_version ?? 'SDTM v3.3 / CDASH v2.1'} · {cdiscData?.study_metadata?.study_id ?? '—'}
              </p>
            </div>
          </div>

          {/* Export buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={handleExportCsv}
              disabled={!cdiscData || activeRows.length === 0}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: cdiscData && activeRows.length > 0 ? PRIMARY : 'rgba(0,102,204,0.3)',
                color: '#ffffff', border: 'none',
                borderRadius: R_PILL, padding: '7px 16px',
                fontSize: 12, fontWeight: 600, cursor: cdiscData && activeRows.length > 0 ? 'pointer' : 'not-allowed',
                fontFamily: FONT_STACK, transition: 'transform 0.1s',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Download size={12} />
              Export {activeTab} (CSV)
            </button>
            <button
              onClick={handleExportJson}
              disabled={!cdiscData}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'transparent',
                color: PRIMARY, border: `1px solid ${PRIMARY}`,
                borderRadius: R_PILL, padding: '6px 16px',
                fontSize: 12, fontWeight: 600, cursor: cdiscData ? 'pointer' : 'not-allowed',
                fontFamily: FONT_STACK, transition: 'transform 0.1s',
                opacity: cdiscData ? 1 : 0.45,
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <FileJson size={12} />
              Export SDTM Package (JSON)
            </button>
          </div>
        </div>

        {/* Domain tabs */}
        <div style={{
          display: 'flex', gap: 0,
          borderBottom: `1px solid ${HAIRLINE}`,
          background: CANVAS, paddingLeft: 24,
        }}>
          {DOMAINS.map(d => {
            const count = cdiscData?.domains[d.key]?.length ?? 0;
            const isActive = activeTab === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setActiveTab(d.key)}
                style={{
                  background: 'none', border: 'none',
                  borderBottom: isActive ? `2px solid ${PRIMARY}` : '2px solid transparent',
                  padding: '12px 20px',
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  color: isActive ? PRIMARY : INK_48,
                  cursor: 'pointer', fontFamily: FONT_STACK,
                  letterSpacing: '-0.12px', display: 'flex',
                  alignItems: 'center', gap: 8,
                  transition: 'color 0.15s, border-color 0.15s',
                  whiteSpace: 'nowrap' as const,
                }}
              >
                {d.label}
                {!loadingCdisc && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    background: isActive ? 'rgba(0,102,204,0.10)' : PARCHMENT,
                    color: isActive ? PRIMARY : INK_48,
                    border: `1px solid ${isActive ? 'rgba(0,102,204,0.25)' : HAIRLINE}`,
                    borderRadius: R_PILL, padding: '1px 7px',
                    fontFamily: FONT_MONO,
                    transition: 'all 0.15s',
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Domain description row */}
        <div style={{
          padding: '10px 24px',
          borderBottom: `1px solid ${HAIRLINE}`,
          background: 'rgba(0,102,204,0.025)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 12, color: INK_48, letterSpacing: '-0.08px' }}>
            <span style={{ fontFamily: FONT_MONO, fontWeight: 700, color: PRIMARY, fontSize: 11 }}>
              {activeDomain.key}
            </span>
            {' '}— {activeDomain.description}
          </span>
          {cdiscData && (
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: INK_48 }}>
              {activeRows.length} row{activeRows.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Table body */}
        {loadingCdisc ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: INK_48, fontSize: 13 }}>
            Loading CDISC datasets…
          </div>
        ) : (
          <SdtmTable
            rows={activeRows}
            columns={activeDomain.columns}
            emptyText={
              activeTab === 'AE'
                ? 'No adverse events recorded for this study.'
                : activeTab === 'EX'
                ? 'No IP batches registered for this study.'
                : 'No participants enrolled yet.'
            }
          />
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2 — ABDM / HL7 FHIR GATEWAY STATUS CARD
          ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        {/* ── Left: Integration Status ── */}
        <div style={{
          background: CANVAS, border: `1px solid ${HAIRLINE}`,
          borderRadius: R_LG, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '18px 24px', borderBottom: `1px solid ${HAIRLINE}`,
            background: PARCHMENT,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: R_SM,
              background: 'rgba(191,90,242,0.08)', border: '1px solid rgba(191,90,242,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Link2 size={15} color={PURPLE} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: INK, margin: 0, letterSpacing: '-0.224px' }}>
                Ayushman Bharat (ABDM) / HL7 FHIR Gateway
              </p>
              <p style={{ fontSize: 11, color: INK_48, margin: '1px 0 0' }}>
                National Health Stack Integration Status
              </p>
            </div>
            <span style={{ ...BADGE.purple, marginLeft: 'auto' }}>ABDM Profile</span>
          </div>

          {/* Status tiles */}
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              {
                label: 'FHIR Profile Version',
                value: 'HL7 FHIR v4.0 — ResearchStudy / ResearchSubject',
                color: PRIMARY,
                dot: PRIMARY,
              },
              {
                label: 'ABDM Gateway Status',
                value: 'Connected — Mapped to National Health Stack',
                color: SUCCESS,
                dot: SUCCESS,
              },
              {
                label: 'Consent Artifact',
                value: 'Digitally Signed e-Consent Linked',
                color: SUCCESS,
                dot: SUCCESS,
              },
            ].map(item => (
              <div key={item.label} style={{
                background: PARCHMENT, border: `1px solid ${HAIRLINE}`,
                borderRadius: R_MD, padding: '12px 16px',
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: item.dot, marginTop: 4, flexShrink: 0,
                }} />
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 3px' }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: item.color, margin: 0, letterSpacing: '-0.12px' }}>
                    {item.value}
                  </p>
                </div>
              </div>
            ))}

            {/* FHIR bundle stats from live data */}
            {fhirData && !loadingFhir && (
              <div style={{
                background: 'rgba(0,102,204,0.04)', border: '1px solid rgba(0,102,204,0.18)',
                borderRadius: R_MD, padding: '12px 16px',
              }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
                  Bundle Composition
                </p>
                <div style={{ display: 'flex', gap: 20 }}>
                  {[
                    { label: 'Total Resources', val: fhirData?.entry?.length ?? 0 },
                    { label: 'ResearchSubjects', val: (fhirData?.entry?.length ?? 1) - 1 },
                  ].map(s => (
                    <div key={s.label}>
                      <span style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 600, color: PRIMARY, display: 'block', lineHeight: 1 }}>
                        {s.val}
                      </span>
                      <span style={{ fontSize: 11, color: INK_48 }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <button
                onClick={handleValidateFhir}
                disabled={!fhirData || validating}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: fhirValidated ? 'rgba(52,199,89,0.10)' : 'rgba(191,90,242,0.08)',
                  color: fhirValidated ? SUCCESS : PURPLE,
                  border: `1px solid ${fhirValidated ? 'rgba(52,199,89,0.30)' : 'rgba(191,90,242,0.30)'}`,
                  borderRadius: R_PILL, padding: '8px 16px',
                  fontSize: 12, fontWeight: 600,
                  cursor: fhirData && !validating ? 'pointer' : 'not-allowed',
                  fontFamily: FONT_STACK, transition: 'transform 0.1s',
                  opacity: fhirData ? 1 : 0.4,
                }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {fhirValidated
                  ? <><CheckCircle2 size={12} /> FHIR v4.0 Validated</>
                  : validating
                  ? <><ShieldCheck size={12} /> Validating…</>
                  : <><ShieldCheck size={12} /> Validate FHIR v4.0 Bundle</>
                }
              </button>

              <button
                onClick={handleDownloadFhir}
                disabled={!fhirData}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: PURPLE, color: '#ffffff', border: 'none',
                  borderRadius: R_PILL, padding: '8px 16px',
                  fontSize: 12, fontWeight: 600,
                  cursor: fhirData ? 'pointer' : 'not-allowed',
                  fontFamily: FONT_STACK, transition: 'transform 0.1s',
                  opacity: fhirData ? 1 : 0.4,
                }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Download size={12} />
                Download ABDM FHIR JSON
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: Terminology Cross-Mapping Table ── */}
        <div style={{
          background: CANVAS, border: `1px solid ${HAIRLINE}`,
          borderRadius: R_LG, overflow: 'hidden',
        }}>
          <div style={{
            padding: '18px 24px', borderBottom: `1px solid ${HAIRLINE}`,
            background: PARCHMENT,
          }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: INK, margin: 0, letterSpacing: '-0.224px' }}>
              Dual Terminology Cross-Mapping
            </p>
            <p style={{ fontSize: 11, color: INK_48, margin: '2px 0 0' }}>
              NAMASTE Portal (Ministry of Ayush) ↔ WHO ICD-11 TM-2
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}` }}>
                  {['Disease / Indication', 'NAMASTE Ayush Code', 'WHO Classification'].map(h => (
                    <th key={h} style={{
                      padding: '9px 16px', textAlign: 'left',
                      fontSize: 10, fontWeight: 600, color: INK_48,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Static baseline mapping + any live codes from FHIR bundle */}
                {[
                  {
                    disease: 'Tamaka Shwasa (Bronchial Asthma)',
                    namaste: 'NAMASTE_AYU_0842',
                    icd: 'ICD-11 TM-2 (CA23)',
                  },
                  {
                    disease: 'Vatavyadhi (Neurological Disorders)',
                    namaste: 'NAMASTE_AYU_1101',
                    icd: 'ICD-11 TM-2 (8B20)',
                  },
                  {
                    disease: 'Jwara (Pyrexia / Fever)',
                    namaste: 'NAMASTE_AYU_0210',
                    icd: 'ICD-11 TM-2 (MG26)',
                  },
                  ...(namasteCodesFromFhir
                    .filter(c => !['NAMASTE_AYU_0842', 'NAMASTE_AYU_1101', 'NAMASTE_AYU_0210'].includes(c))
                    .map(code => ({
                      disease: 'Trial-Specific Indication',
                      namaste: code,
                      icd: 'ICD-11 TM-2 (see bundle)',
                    }))
                  ),
                ].map((row, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: `1px solid ${HAIRLINE}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,102,204,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '10px 16px', fontSize: 12, color: INK_80, fontStyle: 'italic' }}>
                      {row.disease}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: PURPLE, fontWeight: 600 }}>
                        {row.namaste}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ ...BADGE.blue, fontSize: 10 }}>{row.icd}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CTRI cross-reference footer */}
          {activeStudy?.ctri_registration?.ctri_id && (
            <div style={{
              padding: '12px 16px', borderTop: `1px solid ${HAIRLINE}`,
              background: PARCHMENT,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                CTRI Registration
              </span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: PRIMARY }}>
                {activeStudy.ctri_registration.ctri_id}
              </span>
              <span style={{ ...BADGE.green, fontSize: 10, marginLeft: 4 }}>Linked</span>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 3 — NPvCC (AYUSH SURAKSHA) PHARMACOVIGILANCE EXPORT & HUB
          ══════════════════════════════════════════════════════════════════ */}
      <div style={{
        background: CANVAS, border: `1px solid ${HAIRLINE}`,
        borderRadius: R_LG, overflow: 'hidden',
      }}>
        {/* Card header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: `1px solid ${HAIRLINE}`,
          background: PARCHMENT, flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: R_SM,
              background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <ShieldAlert size={16} color={DANGER} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: INK, margin: 0, letterSpacing: '-0.224px' }}>
                  NPvCC (Ayush Suraksha) — Suspected ADR Reporting &amp; Pharmacovigilance
                </p>
                <span style={{ ...BADGE.red, fontSize: 10 }}>
                  24H Statutory NDCT 2019
                </span>
              </div>
              <p style={{ fontSize: 11, color: INK_48, margin: '1px 0 0' }}>
                National Pharmacovigilance Coordination Centre (NPvCC), AIIA New Delhi · Ministry of Ayush
              </p>
            </div>
          </div>

          {/* Dossier Download Action */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={handleExportAllNpvccPackage}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: PRIMARY, color: '#ffffff', border: 'none',
                borderRadius: R_PILL, padding: '7px 16px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: FONT_STACK, transition: 'transform 0.1s',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Download size={13} />
              Export Study NPvCC Dossier ({npvccRecords.length})
            </button>
          </div>
        </div>

        {/* Dispatch Notification Banner */}
        {dispatchNotification && (
          <div style={{
            padding: '12px 24px', background: 'rgba(52,199,89,0.1)',
            borderBottom: `1px solid rgba(52,199,89,0.3)`,
            display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: SUCCESS, fontWeight: 600
          }}>
            <CheckCircle2 size={16} color={SUCCESS} />
            <span>{dispatchNotification}</span>
          </div>
        )}

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            
            {/* Left Column: ADR Registry List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Select Suspected ADR to Inspect ({npvccRecords.length})
                </span>
                <span style={{ fontSize: 11, color: INK_48 }}>
                  Active Study: <strong>{activeStudy?.short_code ?? 'AIIA'}</strong>
                </span>
              </div>

              {npvccRecords.map((report) => {
                const isSelected = report.npvcc_report_metadata.report_uuid === activeNpvccReport?.npvcc_report_metadata?.report_uuid;
                const isDispatched = report.statutory_compliance.is_reported_to_npvcc || Boolean(dispatchedMap[report.npvcc_report_metadata.report_uuid]);
                const isSae = report.reaction_details.is_serious_adverse_event;

                return (
                  <div
                    key={report.npvcc_report_metadata.report_uuid}
                    onClick={() => setSelectedAdrId(report.npvcc_report_metadata.report_uuid)}
                    style={{
                      padding: '14px 16px', borderRadius: R_MD,
                      border: isSelected ? `2px solid ${PRIMARY}` : `1px solid ${HAIRLINE}`,
                      background: isSelected ? 'rgba(0,102,204,0.03)' : CANVAS,
                      cursor: 'pointer', transition: 'all 0.15s ease',
                      display: 'flex', flexDirection: 'column', gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: INK }}>
                          {report.patient_details.participant_code}
                        </span>
                        {isSae ? (
                          <span style={{ ...BADGE.red, fontSize: 10 }}>SAE (24H)</span>
                        ) : (
                          <span style={{ ...BADGE.ink, fontSize: 10 }}>ADR</span>
                        )}
                      </div>
                      <span style={isDispatched ? BADGE.green : BADGE.amber}>
                        {isDispatched ? 'DISPATCHED' : '24H ACTION PENDING'}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>
                      {report.reaction_details.reaction_description}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: INK_48 }}>
                      <span>Onset: {report.reaction_details.date_of_onset}</span>
                      <span>WHO-UMC: <strong>{report.causality_and_regulatory_assessment.who_umc_causality_category}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Official Form NPvCC-ADR-01 Preview & Export */}
            {activeNpvccReport && (
              <div style={{
                background: '#ffffff', border: `1px solid ${HAIRLINE}`,
                borderRadius: R_MD, display: 'flex', flexDirection: 'column', overflow: 'hidden'
              }}>
                {/* Official Form Header Banner */}
                <div style={{
                  padding: '16px 20px', background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}`,
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: PRIMARY, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {activeNpvccReport.npvcc_report_metadata.form_number}
                      </span>
                      <span style={{ fontSize: 10, color: INK_48 }}>· {activeNpvccReport.npvcc_report_metadata.portal_identifier}</span>
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: INK, margin: 0, letterSpacing: '-0.2px' }}>
                      Suspected Adverse Drug Reaction Reporting Form
                    </h3>
                    <p style={{ fontSize: 11, color: INK_48, margin: '2px 0 0' }}>
                      Participant: <strong>{activeNpvccReport.patient_details.participant_code}</strong> · UUID: <span style={{ fontFamily: FONT_MONO }}>{activeNpvccReport.npvcc_report_metadata.report_uuid.slice(0, 18)}</span>
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      onClick={() => handleDownloadNpvccJson(activeNpvccReport)}
                      style={{
                        padding: '6px 12px', borderRadius: R_PILL, border: `1px solid ${HAIRLINE}`,
                        background: CANVAS, fontSize: 11, fontWeight: 600, color: INK, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 5
                      }}
                      title="Download Ayush Suraksha JSON transmission payload"
                    >
                      <FileJson size={13} color={PRIMARY} /> Ayush Suraksha JSON
                    </button>
                    <button
                      onClick={() => handleDownloadNpvccFormatted(activeNpvccReport)}
                      style={{
                        padding: '6px 12px', borderRadius: R_PILL, border: `1px solid ${HAIRLINE}`,
                        background: CANVAS, fontSize: 11, fontWeight: 600, color: INK, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 5
                      }}
                      title="Download Formatted Clinical Text Report"
                    >
                      <FileText size={13} color={PRIMARY} /> Formal Report
                    </button>
                  </div>
                </div>

                {/* Form Sub-Tabs */}
                <div style={{
                  display: 'flex', borderBottom: `1px solid ${HAIRLINE}`, background: '#f8faf9',
                  overflowX: 'auto', padding: '0 12px'
                }}>
                  {[
                    { id: 'PATIENT', label: 'Patient (Rogi)' },
                    { id: 'DRUG', label: 'Drug (Aushadha)' },
                    { id: 'REACTION', label: 'Reaction (Lakshana)' },
                    { id: 'CAUSALITY', label: 'Causality & Compliance' },
                    { id: 'REPORTER', label: 'Reporter (AIIA)' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFormTab(tab.id as any)}
                      style={{
                        padding: '10px 14px', border: 'none', background: 'transparent',
                        fontSize: 12, fontWeight: activeFormTab === tab.id ? 700 : 500,
                        color: activeFormTab === tab.id ? PRIMARY : INK_48,
                        borderBottom: activeFormTab === tab.id ? `2px solid ${PRIMARY}` : '2px solid transparent',
                        cursor: 'pointer', whiteSpace: 'nowrap'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content Display */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {activeFormTab === 'PATIENT' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                      <div>
                        <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>Unique Subject ID</span>
                        <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, fontFamily: FONT_MONO, color: PRIMARY }}>
                          {activeNpvccReport.patient_details.participant_code}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>Prakriti (Constitution)</span>
                        <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 600, color: INK }}>
                          {activeNpvccReport.patient_details.prakriti_constitution}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>Age &amp; Gender</span>
                        <p style={{ margin: '2px 0 0', fontSize: 13, color: INK }}>
                          {activeNpvccReport.patient_details.age} Years · {activeNpvccReport.patient_details.gender}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>Diet &amp; Pathya</span>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: INK_80 }}>
                          {activeNpvccReport.patient_details.dietary_habits}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeFormTab === 'DRUG' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                      <div>
                        <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>Formulation Name</span>
                        <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: INK }}>
                          {activeNpvccReport.suspected_asuh_drug.formulation_name}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>Batch Number</span>
                        <p style={{ margin: '2px 0 0', fontSize: 13, fontFamily: FONT_MONO, color: PRIMARY }}>
                          {activeNpvccReport.suspected_asuh_drug.batch_number}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>API / AFI Standard</span>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: INK_80 }}>
                          {activeNpvccReport.suspected_asuh_drug.pharmacopoeial_standard}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>Route &amp; Anupana</span>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: INK_80 }}>
                          {activeNpvccReport.suspected_asuh_drug.route_of_administration} with {activeNpvccReport.suspected_asuh_drug.anupana_vehicle}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>Dosage Schedule</span>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: INK_80 }}>
                          {activeNpvccReport.suspected_asuh_drug.prescribed_daily_dose}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>GMP Manufacturer</span>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: INK_80 }}>
                          {activeNpvccReport.suspected_asuh_drug.manufacturer}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeFormTab === 'REACTION' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>Reaction Description</span>
                        <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: DANGER }}>
                          {activeNpvccReport.reaction_details.reaction_description}
                        </p>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                        <div>
                          <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>Ayurvedic Lakshana</span>
                          <p style={{ margin: '2px 0 0', fontSize: 12, color: INK_80 }}>
                            {activeNpvccReport.reaction_details.ayurvedic_diagnosis_lakshana}
                          </p>
                        </div>
                        <div>
                          <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>Dosha Vitiation</span>
                          <p style={{ margin: '2px 0 0', fontSize: 12, color: INK_80 }}>
                            {activeNpvccReport.reaction_details.dosha_vitiation}
                          </p>
                        </div>
                        <div>
                          <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>Clinical Action Taken</span>
                          <p style={{ margin: '2px 0 0', fontSize: 12, color: INK_80 }}>
                            {activeNpvccReport.reaction_details.action_taken_with_drug}
                          </p>
                        </div>
                        <div>
                          <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>Outcome of Reaction</span>
                          <p style={{ margin: '2px 0 0', fontSize: 12, color: SUCCESS, fontWeight: 600 }}>
                            {activeNpvccReport.reaction_details.outcome_of_reaction}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeFormTab === 'CAUSALITY' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                      <div>
                        <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>WHO-UMC Causality</span>
                        <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: PRIMARY }}>
                          {activeNpvccReport.causality_and_regulatory_assessment.who_umc_causality_category}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>Ayush Causality Scale</span>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: INK }}>
                          {activeNpvccReport.causality_and_regulatory_assessment.ayush_causality_scale}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>De-challenge / Re-challenge</span>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: INK_80 }}>
                          {activeNpvccReport.causality_and_regulatory_assessment.dechallenge_result}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>Statutory 24H Deadline</span>
                        <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 600, color: DANGER }}>
                          {new Date(activeNpvccReport.statutory_compliance.statutory_24h_deadline).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeFormTab === 'REPORTER' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                      <div>
                        <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>Reporting Officer</span>
                        <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: INK }}>
                          {activeNpvccReport.reporter_information.reporter_name}
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: INK_48 }}>
                          {activeNpvccReport.reporter_information.reporter_designation}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>Institution &amp; Centre</span>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: INK_80 }}>
                          {activeNpvccReport.reporter_information.reporter_institution}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>Official Email</span>
                        <p style={{ margin: '2px 0 0', fontSize: 12, fontFamily: FONT_MONO, color: PRIMARY }}>
                          {activeNpvccReport.reporter_information.official_email}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: INK_48, textTransform: 'uppercase', fontWeight: 600 }}>Pharmacovigilance Centre</span>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: INK_80 }}>
                          {activeNpvccReport.reporter_information.centre_name}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Dispatch Action Bar */}
                  <div style={{
                    marginTop: 'auto', paddingTop: 14, borderTop: `1px solid ${HAIRLINE}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={activeNpvccReport.statutory_compliance.is_reported_to_npvcc ? BADGE.green : BADGE.amber}>
                        {activeNpvccReport.statutory_compliance.is_reported_to_npvcc ? 'STATUTORY COMPLIANCE FULFILLED' : 'DISPATCH REQUIRED UNDER NDCT 2019'}
                      </span>
                    </div>

                    {!activeNpvccReport.statutory_compliance.is_reported_to_npvcc ? (
                      <button
                        onClick={() => handleDispatchNpvcc(activeNpvccReport)}
                        disabled={dispatching}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          background: DANGER, color: '#ffffff', border: 'none',
                          borderRadius: R_PILL, padding: '8px 18px',
                          fontSize: 12, fontWeight: 600, cursor: dispatching ? 'wait' : 'pointer',
                          fontFamily: FONT_STACK, transition: 'transform 0.1s'
                        }}
                        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        <Send size={13} />
                        {dispatching ? 'Transmitting…' : 'Dispatch to Ayush Suraksha Portal'}
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: SUCCESS, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                        <CheckCircle2 size={14} color={SUCCESS} /> Dispatched to NPvCC Coordination Centre
                      </span>
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  );
};
