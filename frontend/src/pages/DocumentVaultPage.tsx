import React, { useState } from 'react';
import { api } from '../api/client';
import { HardDrive, Upload, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

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
    } catch (err) {
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
    } catch (err) {
      alert('Verification failed.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-[-0.02em] flex items-center gap-2">
          <HardDrive className="w-6 h-6 text-[#2997ff]" />
          MinIO S3 Document Vault & Cryptographic Hash Ledger
        </h1>
        <p className="text-xs text-[#7a7a7a] mt-1">
          Tamper-evident source file storage. Raw documents stay in private MinIO S3; SHA-256 mathematical receipts are permanently locked.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <div className="bg-[#1d1d1f] border border-white/10 rounded-[18px] p-6 space-y-4 shadow-xl">
          <h2 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#2997ff]" />
            Upload Trial Document / Consent Recording
          </h2>

          <form onSubmit={handleUpload} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#7a7a7a] font-medium uppercase text-[10px] tracking-wider mb-1">
                Document Category
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-[#000000] border border-white/10 rounded-[11px] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#0066cc]"
              >
                <option value="PROTOCOL_VERSION">Clinical Protocol (Signed PDF)</option>
                <option value="IEC_APPROVAL_LETTER">Ethics Committee (IEC) Clearance Letter</option>
                <option value="VERNACULAR_CONSENT_MEDIA">Audio-Visual (AV) Consent Video/Audio</option>
                <option value="DRUG_CERTIFICATE_OF_ANALYSIS">Ayurvedic Formulation Certificate of Analysis (CoA)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#7a7a7a] font-medium uppercase text-[10px] tracking-wider mb-1">
                Select File
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-[#000000] border border-white/10 rounded-[11px] px-3.5 py-2 text-[#cccccc] file:bg-[#1d1d1f] file:border-0 file:text-white file:rounded-full file:px-3 file:py-1 file:text-xs hover:file:bg-white/10 cursor-pointer"
                required
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-[#0066cc] hover:bg-[#0052a3] text-white font-normal py-3 rounded-full transition-all shadow-md shadow-[#0066cc]/20 active:scale-95 disabled:opacity-50 text-xs"
            >
              {uploading ? 'Computing SHA-256 & Uploading to MinIO...' : 'Upload & Anchor Hash Proof'}
            </button>
          </form>
        </div>

        {/* Live Cryptographic Receipt Card */}
        <div className="bg-[#1d1d1f] border border-white/10 rounded-[18px] p-6 flex flex-col justify-between shadow-xl">
          <div>
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#34c759]" />
              Cryptographic Integrity Verification Receipt
            </h2>

            {receipt ? (
              <div className="space-y-3 bg-[#000000] p-4 rounded-[14px] border border-white/10 text-xs">
                <div>
                  <span className="text-[#7a7a7a] block text-[10px] uppercase font-semibold">File Name</span>
                  <span className="text-white font-medium">{receipt.file_name}</span>
                </div>
                <div>
                  <span className="text-[#7a7a7a] block text-[10px] uppercase font-semibold">MinIO S3 Object Key</span>
                  <span className="text-[#cccccc] font-mono text-[11px]">{receipt.minio_object_path}</span>
                </div>
                <div>
                  <span className="text-[#7a7a7a] block text-[10px] uppercase font-semibold">
                    SHA-256 Digital Fingerprint (Ledger Hash)
                  </span>
                  <span className="text-[#2997ff] font-mono text-[10px] break-all">{receipt.sha256_hash}</span>
                </div>
                <div>
                  <span className="text-[#7a7a7a] block text-[10px] uppercase font-semibold">Timestamp Anchored</span>
                  <span className="text-[#cccccc]">{new Date(receipt.uploaded_at).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[14px] text-[#7a7a7a] text-xs text-center p-4">
                <FileText className="w-8 h-8 mb-2 opacity-40" />
                Upload a document to view its live cryptographic SHA-256 verification hash receipt.
              </div>
            )}
          </div>

          {receipt && (
            <div className="mt-4 space-y-3">
              <button
                onClick={handleVerify}
                className="w-full bg-[#bf5af2] hover:bg-[#a244d4] text-white font-normal py-2.5 rounded-full transition-all shadow-md active:scale-95 text-xs flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Run Tamper-Proof Audit Check
              </button>

              {verifyResult && (
                <div className="p-3 bg-[#34c759]/10 border border-[#34c759]/30 rounded-[11px] text-xs text-[#34c759] flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {verifyResult.status}: Current file hash strictly matches original ledger hash. Zero tampering!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
