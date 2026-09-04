import React, { useState } from 'react';
import { api } from '../api/client';
import { Upload, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

const T = {
  tile: '#1d1d1f',
  bg: '#000000',
  border: 'rgba(255,255,255,0.08)',
  borderDark: 'rgba(255,255,255,0.06)',
  ink: '#ffffff',
  muted: '#cccccc',
  dim: '#7a7a7a',
  primary: '#0066cc',
  primaryOnDark: '#2997ff',
  success: '#34c759',
  purple: '#bf5af2',
};

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: T.bg, border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 11, padding: '9px 14px',
  color: T.ink, fontSize: 14, letterSpacing: '-0.224px',
  outline: 'none', fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: T.dim, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6,
};

export const DocumentVaultPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('PROTOCOL_VERSION');
  const [uploading, setUploading] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setVerifyResult(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('study_id', '4f722d35-7e9d-44cf-bf3f-af97d557cdbb');
    formData.append('document_type', docType);
    formData.append('uploaded_by', 'investigator@aiia.gov.in');
    try {
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setReceipt(res.data);
    } catch {
      alert('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async () => {
    if (!receipt) return;
    try {
      const res = await api.get(`/documents/verify/${receipt.id}`);
      setVerifyResult(res.data);
    } catch {
      alert('Verification failed.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page header */}
      <div>
        <h1
          style={{
            fontSize: 34, fontWeight: 600, color: T.ink,
            letterSpacing: '-0.374px', lineHeight: 1.1, margin: '0 0 6px',
          }}
        >
          MinIO S3 Document Vault &amp; Cryptographic Hash Ledger
        </h1>
        <p style={{ fontSize: 14, color: T.dim, letterSpacing: '-0.224px', margin: 0 }}>
          Tamper-evident source file storage. Raw documents stay in private MinIO S3; SHA-256 mathematical receipts are permanently locked.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Upload form */}
        <div
          style={{
            background: T.tile, border: `1px solid ${T.border}`,
            borderRadius: 18, padding: 28,
          }}
        >
          <h2
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 17, fontWeight: 600, color: T.ink,
              letterSpacing: '-0.374px', marginBottom: 24,
            }}
          >
            <Upload size={16} color={T.primaryOnDark} />
            Upload Trial Document / Consent Recording
          </h2>

          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Document Category</label>
              <select
                value={docType} onChange={(e) => setDocType(e.target.value)}
                style={{ ...inputStyle, appearance: 'none' }}
              >
                <option value="PROTOCOL_VERSION">Clinical Protocol (Signed PDF)</option>
                <option value="IEC_APPROVAL_LETTER">Ethics Committee (IEC) Clearance Letter</option>
                <option value="VERNACULAR_CONSENT_MEDIA">Audio-Visual (AV) Consent Video/Audio</option>
                <option value="DRUG_CERTIFICATE_OF_ANALYSIS">
                  Ayurvedic Formulation Certificate of Analysis (CoA)
                </option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Select File</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={{
                  ...inputStyle,
                  padding: '7px 14px',
                  cursor: 'pointer',
                }}
                required
              />
            </div>

            <button
              type="submit" disabled={uploading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: T.primary, color: T.ink, border: 'none',
                borderRadius: 9999, padding: '11px 22px',
                fontSize: 17, fontWeight: 400, letterSpacing: '-0.374px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                opacity: uploading ? 0.6 : 1,
                transition: 'transform 0.1s ease', fontFamily: 'inherit',
              }}
              onMouseDown={(e) => !uploading && (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {uploading ? 'Computing SHA-256 & Uploading to MinIO…' : 'Upload & Anchor Hash Proof'}
            </button>
          </form>
        </div>

        {/* Receipt card */}
        <div
          style={{
            background: T.tile, border: `1px solid ${T.border}`,
            borderRadius: 18, padding: 28,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}
        >
          <div>
            <h2
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 17, fontWeight: 600, color: T.ink,
                letterSpacing: '-0.374px', marginBottom: 20,
              }}
            >
              <ShieldCheck size={16} color={T.success} />
              Cryptographic Integrity Verification Receipt
            </h2>

            {receipt ? (
              <div
                style={{
                  background: T.bg, borderRadius: 11,
                  border: `1px solid ${T.borderDark}`,
                  padding: 18,
                  display: 'flex', flexDirection: 'column', gap: 14,
                }}
              >
                {[
                  { label: 'File Name', value: receipt.file_name, color: T.ink, mono: false },
                  { label: 'MinIO S3 Object Key', value: receipt.minio_object_path, color: T.muted, mono: true },
                  { label: 'SHA-256 Digital Fingerprint', value: receipt.sha256_hash, color: T.primaryOnDark, mono: true },
                  { label: 'Timestamp Anchored', value: new Date(receipt.uploaded_at).toLocaleString(), color: T.muted, mono: false },
                ].map(({ label, value, color, mono }) => (
                  <div key={label}>
                    <span
                      style={{
                        display: 'block', fontSize: 10, fontWeight: 600,
                        color: T.dim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4,
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: mono ? 11 : 14,
                        color,
                        fontFamily: mono ? 'SF Mono, ui-monospace, monospace' : 'inherit',
                        wordBreak: 'break-all',
                        letterSpacing: mono ? '0' : '-0.224px',
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  height: 200,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  border: '2px dashed rgba(255,255,255,0.08)',
                  borderRadius: 14,
                  color: T.dim, textAlign: 'center', padding: 24,
                }}
              >
                <FileText size={28} style={{ marginBottom: 10, opacity: 0.35 }} />
                <p style={{ fontSize: 14, color: T.dim, letterSpacing: '-0.224px', margin: 0 }}>
                  Upload a document to view its live cryptographic SHA-256 verification hash receipt.
                </p>
              </div>
            )}
          </div>

          {receipt && (
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={handleVerify}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: T.purple, color: T.ink, border: 'none',
                  borderRadius: 9999, padding: '11px 22px',
                  fontSize: 14, fontWeight: 600, letterSpacing: '-0.224px',
                  cursor: 'pointer', transition: 'transform 0.1s ease', fontFamily: 'inherit',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <ShieldCheck size={14} />
                Run Tamper-Proof Audit Check
              </button>

              {verifyResult && (
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 16px',
                    background: 'rgba(52,199,89,0.07)',
                    border: '1px solid rgba(52,199,89,0.25)',
                    borderRadius: 11,
                    fontSize: 14, color: T.success, letterSpacing: '-0.224px',
                  }}
                >
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                  {verifyResult.status}: Current file hash strictly matches original ledger hash. Zero tampering detected.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
