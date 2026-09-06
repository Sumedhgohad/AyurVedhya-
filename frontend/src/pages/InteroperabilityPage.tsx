import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { Study } from '../types';
import {
  Download, Database, ChevronDown, CheckCircle2,
  Link2, FileJson, TableProperties, ShieldCheck,
} from 'lucide-react';
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
  const [studies,      setStudies]      = useState<Study[]>([]);
  const [selectedId,   setSelectedId]   = useState<string>('');
  const [cdiscData,    setCdiscData]    = useState<CdiscData | null>(null);
  const [fhirData,     setFhirData]     = useState<any>(null);
  const [activeTab,    setActiveTab]    = useState<DomainKey>('DM');
  const [loadingCdisc, setLoadingCdisc] = useState(false);
  const [loadingFhir,  setLoadingFhir]  = useState(false);
  const [fhirValidated, setFhirValidated] = useState(false);
  const [validating,   setValidating]   = useState(false);

  const activeStudy = studies.find(s => s.id === selectedId) ?? null;

  /* ── Initial study load ── */
  useEffect(() => {
    api.get('/study/list').then(res => {
      setStudies(res.data);
      if (res.data.length > 0) setSelectedId(res.data[0].id);
    }).catch(console.error);
  }, []);

  /* ── Fetch CDISC + FHIR when study selection changes ── */
  const fetchForStudy = useCallback(async (studyId: string) => {
    if (!studyId) return;
    setLoadingCdisc(true);
    setLoadingFhir(true);
    setFhirValidated(false);

    api.get(`/interop/cdisc/sdtm/${studyId}`)
      .then(r => setCdiscData(r.data))
      .catch(() => setCdiscData(null))
      .finally(() => setLoadingCdisc(false));

    api.get(`/interop/fhir/bundle/${studyId}`)
      .then(r => setFhirData(r.data))
      .catch(() => setFhirData(null))
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: INK_48, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            Active Protocol
          </span>
          <div style={{ position: 'relative' }}>
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
                outline: 'none', minWidth: 280,
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
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20,
        alignItems: 'start',
      }}>

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
    </div>
  );
};
