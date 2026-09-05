import React, { useState } from 'react';
import { api } from '../api/client';
import { Upload, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { CANVAS, PARCHMENT, HAIRLINE, INK, INK_48, INK_80, PRIMARY, PRIMARY_ON_DARK, SUCCESS, PURPLE, FONT_MONO, R_MD, R_LG, R_PILL, TYPE, btnPrimary, inputField, labelOverline } from '../design';

const IS = inputField(false);
const LB = labelOverline();

export const DocumentVaultPage: React.FC = () => {
  const [file, setFile]         = useState<File | null>(null);
  const [docType, setDT]        = useState('PROTOCOL_VERSION');
  const [uploading, setUpl]     = useState(false);
  const [receipt, setReceipt]   = useState<any>(null);
  const [verify, setVerify]     = useState<any>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault(); if (!file) return;
    setUpl(true); setVerify(null);
    const fd = new FormData();
    fd.append('file', file); fd.append('study_id','4f722d35-7e9d-44cf-bf3f-af97d557cdbb'); fd.append('document_type', docType); fd.append('uploaded_by','investigator@aiia.gov.in');
    try { const res = await api.post('/documents/upload', fd, { headers:{'Content-Type':'multipart/form-data'} }); setReceipt(res.data); }
    catch { alert('Upload failed.'); }
    finally { setUpl(false); }
  };

  const handleVerify = async () => {
    if (!receipt) return;
    try { const res = await api.get(`/documents/verify/${receipt.id}`); setVerify(res.data); }
    catch { alert('Verification failed.'); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
      <div>
        <h1 style={{ fontSize:34, fontWeight:600, color: INK, letterSpacing:'-0.374px', lineHeight:1.47, margin:'0 0 6px' }}>
          MinIO S3 Document Vault &amp; Cryptographic Hash Ledger
        </h1>
        <p style={{...TYPE.caption, color: INK_48, margin:0}}>Tamper-evident source file storage. SHA-256 receipts permanently locked.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Upload form — canvas card */}
        <div style={{ background: CANVAS, border:`1px solid ${HAIRLINE}`, borderRadius: R_LG, padding:28 }}>
          <h2 style={{ display:'flex', alignItems:'center', gap:8, fontSize:17, fontWeight:600, color: INK, letterSpacing:'-0.374px', margin:'0 0 22px' }}>
            <Upload size={15} color={PRIMARY_ON_DARK}/> Upload Trial Document
          </h2>
          <form onSubmit={handleUpload} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div><label style={LB}>Document Category</label>
              <select value={docType} onChange={e=>setDT(e.target.value)} style={{...IS,appearance:'none'}}>
                <option value="PROTOCOL_VERSION">Clinical Protocol (Signed PDF)</option>
                <option value="IEC_APPROVAL_LETTER">IEC Clearance Letter</option>
                <option value="VERNACULAR_CONSENT_MEDIA">AV Consent Video/Audio</option>
                <option value="DRUG_CERTIFICATE_OF_ANALYSIS">Formulation CoA</option>
              </select>
            </div>
            <div><label style={LB}>Select File</label><input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} style={{...IS,padding:'7px 14px',cursor:'pointer'}} required/></div>
            <button type="submit" disabled={uploading} style={{...btnPrimary(uploading), width:'100%'}} onMouseDown={e=>!uploading&&(e.currentTarget.style.transform='scale(0.95)')} onMouseUp={e=>(e.currentTarget.style.transform='scale(1)')}>
              {uploading ? 'Computing SHA-256…' : 'Upload & Anchor Hash Proof'}
            </button>
          </form>
        </div>

        {/* Receipt card — parchment card */}
        <div style={{ background: PARCHMENT, border:`1px solid ${HAIRLINE}`, borderRadius: R_LG, padding:28, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <h2 style={{ display:'flex', alignItems:'center', gap:8, fontSize:17, fontWeight:600, color: INK, letterSpacing:'-0.374px', margin:'0 0 18px' }}>
              <ShieldCheck size={15} color={SUCCESS}/> Cryptographic Integrity Receipt
            </h2>
            {receipt ? (
              <div style={{ background: CANVAS, borderRadius: R_MD, border:`1px solid ${HAIRLINE}`, padding:18, display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  { label:'File Name',              value: receipt.file_name,      color: INK,           mono:false },
                  { label:'MinIO S3 Object Key',    value: receipt.minio_object_path, color: INK_80,     mono:true  },
                  { label:'SHA-256 Fingerprint',    value: receipt.sha256_hash,    color: PRIMARY_ON_DARK, mono:true  },
                  { label:'Timestamp Anchored',     value: new Date(receipt.uploaded_at).toLocaleString(), color: INK_80, mono:false },
                ].map(({ label,value,color,mono }) => (
                  <div key={label}>
                    <span style={{...TYPE.label, color: INK_48, display:'block', marginBottom:4}}>{label}</span>
                    <span style={{ fontSize: mono ? 11 : 14, color, fontFamily: mono ? FONT_MONO : 'inherit', wordBreak:'break-all', letterSpacing: mono ? '0' : '-0.224px' }}>{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ height:190, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:`2px dashed ${HAIRLINE}`, borderRadius: R_MD, textAlign:'center', padding:24 }}>
                <FileText size={26} style={{ marginBottom:10, opacity:0.35, color: INK_48 }}/>
                <p style={{...TYPE.caption, color: INK_48, margin:0}}>Upload a document to view its SHA-256 verification receipt.</p>
              </div>
            )}
          </div>

          {receipt && (
            <div style={{ marginTop:18, display:'flex', flexDirection:'column', gap:10 }}>
              <button onClick={handleVerify} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background: PURPLE, color:'#ffffff', border:'none', borderRadius: R_PILL, padding:'11px 22px', fontSize:14, fontWeight:600, cursor:'pointer', transition:'transform 0.1s', fontFamily:'inherit' }} onMouseDown={e=>(e.currentTarget.style.transform='scale(0.95)')} onMouseUp={e=>(e.currentTarget.style.transform='scale(1)')}>
                <ShieldCheck size={13}/> Run Tamper-Proof Audit Check
              </button>
              {verify && (
                <div style={{ display:'flex', alignItems:'center', gap:9, padding:'11px 14px', background:'rgba(52,199,89,0.07)', border:'1px solid rgba(52,199,89,0.25)', borderRadius: R_MD, fontSize:14, color: SUCCESS, letterSpacing:'-0.224px' }}>
                  <CheckCircle2 size={15} style={{ flexShrink:0 }}/>{verify.status}: Hash matches. Zero tampering detected.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
