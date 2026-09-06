import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { Study } from '../types';
import {
  ShieldCheck, FileText, CheckCircle2, AlertTriangle,
  ChevronDown, RefreshCw, Database,
} from 'lucide-react';
import {
  CANVAS, PARCHMENT, HAIRLINE,
  INK, INK_48, INK_80, PRIMARY, SUCCESS, DANGER, WARNING, PURPLE,
  FONT_MONO, FONT_STACK,
  R_MD, R_LG, R_PILL, R_SM,
  TYPE, BADGE,
} from '../design';

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────*/
const fmtBytes = (n: number) => {
  if (n >= 1048576) return `${(n / 1048576).toFixed(1)} MB`;
  if (n >= 1024)    return `${(n / 1024).toFixed(0)} KB`;
  return `${n} B`;
};

const fmtTs = (ts: string) =>
  new Date(ts).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  });

const docTypeBadge = (t: string): React.CSSProperties => {
  if (t.includes('PROTOCOL'))   return BADGE.blue;
  if (t.includes('IEC'))        return BADGE.green;
  if (t.includes('CONSENT'))    return BADGE.purple;
  if (t.includes('CERTIFICATE') || t.includes('ANALYSIS')) return BADGE.amber;
  return BADGE.ink;
};

const docTypeLabel = (t: string) =>
  t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

/* ─────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────────*/
export const DocumentVaultPage: React.FC = () => {
  const [studies,      setStudies]    = useState<Study[]>([]);
  const [selectedId,   setSelectedId] = useState<string>('');
  const [documents,    setDocuments]  = useState<any[]>([]);
  const [loadingDocs,  setLoadingDocs]= useState(false);
  const [verifyMap,    setVerifyMap]  = useState<Record<string, { loading: boolean; result: any | null }>>({});

  /* ── Load studies once ── */
  useEffect(() => {
    api.get('/study/list').then(r => {
      setStudies(r.data);
      if (r.data.length > 0) setSelectedId(r.data[0].id);
    }).catch(console.error);
  }, []);

  /* ── Load documents when study changes ── */
  const loadDocuments = useCallback(async (studyId: string) => {
    if (!studyId) return;
    setLoadingDocs(true);
    setVerifyMap({});
    try {
      const res = await api.get(`/documents/study/${studyId}`);
      setDocuments(Array.isArray(res.data) ? res.data : []);
    } catch { setDocuments([]); }
    finally { setLoadingDocs(false); }
  }, []);

  useEffect(() => {
    if (selectedId) loadDocuments(selectedId);
  }, [selectedId, loadDocuments]);

  const activeStudy = studies.find(s => s.id === selectedId) ?? null;

  /* ── Verify a single document's integrity ── */
  const handleVerify = async (receiptId: string) => {
    setVerifyMap(m => ({ ...m, [receiptId]: { loading: true, result: null } }));
    try {
      const res = await api.get(`/documents/verify/${receiptId}`);
      setVerifyMap(m => ({ ...m, [receiptId]: { loading: false, result: res.data } }));
    } catch {
      setVerifyMap(m => ({
        ...m,
        [receiptId]: { loading: false, result: { is_tamper_free: false, status: 'VERIFICATION_FAILED' } },
      }));
    }
  };

  /* ═════════════════════════════════════════════════════════════
     RENDER
  ═════════════════════════════════════════════════════════════ */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontFamily: FONT_STACK }}>

      {/* PAGE HEADER */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 600, color: INK, letterSpacing: '-0.374px', lineHeight: 1.47, margin: '0 0 6px' }}>
            eTMF Master Document Vault &amp; Integrity Explorer
          </h1>
          <p style={{ ...TYPE.caption, color: INK_48, margin: 0 }}>
            Electronic Trial Master File — SHA-256 tamper-evident receipts stored in{' '}
            <code style={{ fontFamily: FONT_MONO, fontSize: 12, color: PURPLE, background: 'rgba(191,90,242,0.08)', padding: '1px 6px', borderRadius: 4 }}>
              audit_integrity_db
            </code>
            . Upload documents from within each workflow (Trial Setup, Ethics, Enrollment).
          </p>
        </div>

        {/* Refresh */}
        <button
          onClick={() => loadDocuments(selectedId)}
          disabled={loadingDocs}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: PARCHMENT, color: INK, border: `1px solid ${HAIRLINE}`,
            borderRadius: R_PILL, padding: '8px 18px',
            fontSize: 13, fontWeight: 600,
            cursor: loadingDocs ? 'not-allowed' : 'pointer',
            fontFamily: FONT_STACK, transition: 'transform 0.1s',
            opacity: loadingDocs ? 0.6 : 1,
          }}
          onMouseDown={e => !loadingDocs && (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <RefreshCw size={13} style={{ animation: loadingDocs ? 'spin 0.8s linear infinite' : 'none' }} />
          Refresh
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      {/* PROTOCOL SELECTOR */}
      <div style={{
        background: CANVAS, border: `1px solid ${HAIRLINE}`, borderRadius: R_LG,
        padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: R_SM,
          background: 'rgba(0,102,204,0.08)', border: '1px solid rgba(0,102,204,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Database size={14} color={PRIMARY} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
          Protocol Filter
        </span>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            style={{
              appearance: 'none' as const,
              width: '100%', background: PARCHMENT,
              border: `1px solid ${HAIRLINE}`,
              borderRadius: R_MD, padding: '8px 36px 8px 14px',
              fontSize: 13, fontWeight: 600, color: INK,
              fontFamily: FONT_STACK, cursor: 'pointer', outline: 'none',
            }}
          >
            {studies.length === 0 && <option value="">Loading studies…</option>}
            {studies.map(s => (
              <option key={s.id} value={s.id}>
                [{s.short_code}] {s.title.length > 60 ? s.title.slice(0, 60) + '…' : s.title}
              </option>
            ))}
          </select>
          <ChevronDown size={14} color={INK_48} style={{
            position: 'absolute', right: 12, top: '50%',
            transform: 'translateY(-50%)', pointerEvents: 'none',
          }} />
        </div>
        {activeStudy && (
          <span style={{
            ...BADGE[
              activeStudy.status === 'ENROLLING' ? 'green'
              : activeStudy.status === 'DATA_LOCK' ? 'blue'
              : activeStudy.status === 'CLOSED' ? 'ink'
              : 'amber'
            ],
          }}>
            {activeStudy.status}
          </span>
        )}
        <span style={{ fontSize: 12, color: INK_48, whiteSpace: 'nowrap' }}>
          {documents.length} document{documents.length !== 1 ? 's' : ''} on file
        </span>
      </div>

      {/* eTMF TABLE */}
      <div style={{
        background: CANVAS, border: `1px solid ${HAIRLINE}`,
        borderRadius: R_LG, overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '16px 24px', borderBottom: `1px solid ${HAIRLINE}`,
          background: PARCHMENT,
        }}>
          <ShieldCheck size={15} color={SUCCESS} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: INK, margin: 0, letterSpacing: '-0.224px' }}>
              Electronic Trial Master File (eTMF)
            </p>
            <p style={{ fontSize: 11, color: INK_48, margin: '1px 0 0' }}>
              SHA-256 cryptographic integrity — ALCOA+ compliant append-only receipt ledger
            </p>
          </div>
        </div>

        {loadingDocs ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: INK_48, fontSize: 13 }}>
            Loading documents…
          </div>
        ) : documents.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <FileText size={32} color={INK_48} style={{ opacity: 0.35, marginBottom: 12 }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: INK, margin: '0 0 6px' }}>
              No Documents on File
            </p>
            <p style={{ fontSize: 13, color: INK_48, margin: 0, maxWidth: 420, marginInline: 'auto' }}>
              Documents are uploaded within their workflows — use Trial Setup to attach protocol PDFs,
              Ethics Console for IEC letters, and Enrollment Form for signed consent documents.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '220px' }} />  {/* Name & Category */}
                <col style={{ width: '180px' }} />  {/* Uploaded By */}
                <col style={{ width: '170px' }} />  {/* Timestamp */}
                <col style={{ width: '130px' }} />  {/* Storage Status */}
                <col />                              {/* SHA-256 Hash */}
                <col style={{ width: '180px' }} />  {/* Action + Result */}
              </colgroup>
              <thead>
                <tr style={{ background: PARCHMENT, borderBottom: `1px solid ${HAIRLINE}` }}>
                  {['Document & Category', 'Uploaded By & Role', 'Date / Time (UTC)', 'MinIO Storage', 'SHA-256 Hash', 'Integrity Verification'].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left',
                      fontSize: 10, fontWeight: 600, color: INK_48,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      whiteSpace: 'nowrap', overflow: 'hidden',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => {
                  const vState = verifyMap[doc.id];
                  const result = vState?.result;

                  return (
                    <tr
                      key={doc.id}
                      style={{ borderBottom: `1px solid ${HAIRLINE}`, verticalAlign: 'top' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,102,204,0.025)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Col 1: Document name + category badge */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <FileText size={14} color={PRIMARY} style={{ flexShrink: 0, marginTop: 1 }} />
                          <div>
                            <span style={{
                              fontSize: 12, fontWeight: 600, color: INK,
                              display: 'block', overflow: 'hidden',
                              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              maxWidth: 180,
                            }} title={doc.file_name}>
                              {doc.file_name}
                            </span>
                            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={docTypeBadge(doc.document_type)}>
                                {docTypeLabel(doc.document_type)}
                              </span>
                              <span style={{ fontSize: 10, color: INK_48 }}>
                                {fmtBytes(doc.file_size_bytes)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Col 2: Uploaded by + role */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: 12, color: INK, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {doc.uploaded_by}
                        </span>
                        <span style={{ ...BADGE.blue, fontSize: 9, marginTop: 4, display: 'inline-flex' }}>
                          INVESTIGATOR
                        </span>
                      </td>

                      {/* Col 3: Timestamp */}
                      <td style={{ padding: '12px 14px', fontFamily: FONT_MONO, fontSize: 10, color: INK_80, lineHeight: 1.6 }}>
                        {fmtTs(doc.uploaded_at)}
                      </td>

                      {/* Col 4: MinIO storage status */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: 'rgba(52,199,89,0.07)', border: '1px solid rgba(52,199,89,0.22)',
                          borderRadius: R_PILL, padding: '3px 9px',
                          fontSize: 10, fontWeight: 600, color: SUCCESS,
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: SUCCESS, display: 'inline-block', flexShrink: 0 }} />
                          Stored in S3
                        </div>
                      </td>

                      {/* Col 5: SHA-256 hash */}
                      <td style={{ padding: '12px 14px', overflow: 'hidden' }}>
                        <span
                          title={doc.sha256_hash}
                          style={{
                            fontFamily: FONT_MONO, fontSize: 10, color: PURPLE,
                            display: 'block', overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            background: 'rgba(191,90,242,0.06)',
                            border: '1px solid rgba(191,90,242,0.18)',
                            borderRadius: R_MD, padding: '4px 8px',
                            cursor: 'help',
                          }}
                        >
                          {doc.sha256_hash}
                        </span>
                      </td>

                      {/* Col 6: Verify button + inline result */}
                      <td style={{ padding: '12px 14px' }}>
                        {!result ? (
                          <button
                            onClick={() => handleVerify(doc.id)}
                            disabled={vState?.loading}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              background: vState?.loading ? PARCHMENT : 'rgba(52,199,89,0.08)',
                              color: vState?.loading ? INK_48 : SUCCESS,
                              border: `1px solid ${vState?.loading ? HAIRLINE : 'rgba(52,199,89,0.28)'}`,
                              borderRadius: R_MD, padding: '6px 12px',
                              fontSize: 11, fontWeight: 600,
                              cursor: vState?.loading ? 'not-allowed' : 'pointer',
                              fontFamily: FONT_STACK, transition: 'background 0.1s',
                              whiteSpace: 'nowrap' as const,
                            }}
                          >
                            <ShieldCheck size={12} />
                            {vState?.loading ? 'Verifying…' : 'Verify Integrity'}
                          </button>
                        ) : result.is_tamper_free ? (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: 'rgba(52,199,89,0.07)', border: '1px solid rgba(52,199,89,0.25)',
                            borderRadius: R_MD, padding: '6px 10px',
                            fontSize: 10, fontWeight: 600, color: SUCCESS,
                          }}>
                            <CheckCircle2 size={12} />
                            Verified Authentic
                          </div>
                        ) : (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: 'rgba(255,69,58,0.07)', border: '1px solid rgba(255,69,58,0.28)',
                            borderRadius: R_MD, padding: '6px 10px',
                            fontSize: 10, fontWeight: 600, color: DANGER,
                          }}>
                            <AlertTriangle size={12} />
                            Integrity Breach Detected
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
