import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../api/client";
import { Study } from "../types";
import { DEFAULT_AIIA_STUDIES, DEFAULT_DOCUMENTS } from "../types/defaultStudies";
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  RefreshCw,
  Database,
  Lock,
  FileCheck,
  HardDrive,
  Eye,
  X,
  Download,
  Clock,
  User,
} from "lucide-react";
import {
  CANVAS,
  PARCHMENT,
  HAIRLINE,
  INK,
  INK_48,
  INK_80,
  PRIMARY,
  SUCCESS,
  DANGER,
  WARNING,
  PURPLE,
  FONT_MONO,
  FONT_STACK,
  R_MD,
  R_LG,
  R_PILL,
  R_SM,
  TYPE,
  BADGE,
} from "../design";

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────*/

const fmtBytes = (n: number) => {
  if (n >= 1048576) return `${(n / 1048576).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${n} B`;
};

const fmtTs = (ts: string) =>
  new Date(ts).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const isImage = (name: string) => /\.(png|jpg|jpeg|gif|webp)$/i.test(name);

const DOC_META: Record<
  string,
  {
    label: string;
    badge: React.CSSProperties;
    icon: React.ReactNode;
    isConsent?: boolean;
  }
> = {
  PROTOCOL_VERSION: {
    label: "Clinical Protocol",
    badge: BADGE.blue,
    icon: <FileText size={16} color={PRIMARY} />,
  },
  IEC_APPROVAL_LETTER: {
    label: "IEC Clearance Letter",
    badge: BADGE.green,
    icon: <FileCheck size={16} color={SUCCESS} />,
  },
  SIGNED_INFORMED_CONSENT: {
    label: "Signed Informed Consent",
    badge: BADGE.purple,
    icon: <Lock size={16} color={PURPLE} />,
    isConsent: true,
  },
  VERNACULAR_CONSENT_MEDIA: {
    label: "Vernacular Consent Media",
    badge: BADGE.purple,
    icon: <Lock size={16} color={PURPLE} />,
    isConsent: true,
  },
  DRUG_CERTIFICATE_OF_ANALYSIS: {
    label: "Certificate of Analysis",
    badge: BADGE.amber,
    icon: <HardDrive size={16} color={WARNING} />,
  },
};

const resolveMeta = (docType: string) =>
  DOC_META[docType] ?? {
    label: docType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    badge: BADGE.ink,
    icon: <FileText size={16} color={INK_48} />,
  };

/* ─────────────────────────────────────────────────────────────────
   DOCUMENT PREVIEW MODAL
───────────────────────────────────────────────────────────────────*/
interface PreviewModalProps {
  doc: any;
  verifyResult: any | null;
  onClose: () => void;
  onVerify: (id: string) => void;
  verifyLoading: boolean;
}

const DocumentPreviewModal: React.FC<PreviewModalProps> = ({
  doc,
  verifyResult,
  onClose,
  onVerify,
  verifyLoading,
}) => {
  const meta = resolveMeta(doc.document_type);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const isImg = isImage(doc.file_name);
  const previewUrlRef = useRef<string | null>(null);

  // Fetch authenticated blob when modal opens
  useEffect(() => {
    if (!doc) return;

    const fetchPreview = async () => {
      setPreviewLoading(true);
      try {
        const response = await api.get(`/documents/preview/${doc.id}`, {
          responseType: "blob",
        });
        const contentType = response.headers["content-type"] as string | undefined;
        const fileBlob = new Blob([response.data], {
          type: contentType || "application/pdf",
        });
        const localUrl = URL.createObjectURL(fileBlob);
        previewUrlRef.current = localUrl;
        setPreviewUrl(localUrl);
      } catch (err) {
        console.error("Failed to load document preview:", err);
        alert("Failed to load document preview.");
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchPreview();

    // Cleanup function to revoke object URL
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, [doc]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: FONT_STACK,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: CANVAS,
          borderRadius: R_LG,
          width: "100%",
          maxWidth: 1080,
          maxHeight: "calc(100vh - 40px)",
          display: "flex",
          flexDirection: "column",
          border: `1px solid ${HAIRLINE}`,
          overflow: "hidden",
        }}
      >
        {/* ── MODAL HEADER ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 22px",
            borderBottom: `1px solid ${HAIRLINE}`,
            background: PARCHMENT,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: R_SM,
              flexShrink: 0,
              background: CANVAS,
              border: `1px solid ${HAIRLINE}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {meta.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: INK,
                margin: "0 0 3px",
                letterSpacing: "-0.224px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={doc.file_name}
            >
              {doc.file_name}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={meta.badge}>{meta.label}</span>
              <span style={{ fontSize: 11, color: INK_48 }}>
                {fmtBytes(doc.file_size_bytes)}
              </span>
            </div>
          </div>

          {/* Download button */}
          <button
            onClick={async () => {
              if (!previewUrl) return;
              try {
                const response = await api.get(`/documents/preview/${doc.id}`, {
                  responseType: "blob",
                });
                const contentType = response.headers["content-type"] as string | undefined;
                const fileBlob = new Blob([response.data], {
                  type: contentType || "application/pdf",
                });
                const downloadUrl = URL.createObjectURL(fileBlob);
                const a = document.createElement("a");
                a.href = downloadUrl;
                a.download = doc.file_name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(downloadUrl);
              } catch (err) {
                console.error("Failed to download document:", err);
                alert("Failed to download document.");
              }
            }}
            disabled={!previewUrl}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: previewUrl ? "rgba(0,102,204,0.07)" : PARCHMENT,
              color: previewUrl ? PRIMARY : INK_48,
              border: `1px solid ${previewUrl ? "rgba(0,102,204,0.22)" : HAIRLINE}`,
              borderRadius: R_MD,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: previewUrl ? "pointer" : "not-allowed",
              whiteSpace: "nowrap",
              transition: "background 0.1s",
              opacity: previewUrl ? 1 : 0.6,
            }}
            onMouseEnter={(e) =>
              previewUrl &&
              (e.currentTarget.style.background = "rgba(0,102,204,0.14)")
            }
            onMouseLeave={(e) =>
              previewUrl &&
              (e.currentTarget.style.background = "rgba(0,102,204,0.07)")
            }
          >
            <Download size={12} /> Download
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: INK_48,
              padding: 6,
              borderRadius: R_MD,
              display: "flex",
              alignItems: "center",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = PARCHMENT)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── BODY: preview + sidebar ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden min-h-0">
          {/* Preview area */}
          <div className="md:col-span-8 min-h-[280px] sm:min-h-[360px]"
            style={{
              background: "#1a1a1c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {previewLoading ? (
              <div style={{ color: INK_48, fontSize: 13 }}>
                Loading preview…
              </div>
            ) : previewUrl ? (
              isImg ? (
                <img
                  src={previewUrl}
                  alt={doc.file_name}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    borderRadius: R_MD,
                  }}
                />
              ) : (
                <iframe
                  src={previewUrl}
                  title={doc.file_name}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    display: "block",
                  }}
                />
              )
            ) : (
              <div style={{ color: INK_48, fontSize: 13 }}>
                Failed to load preview
              </div>
            )}
          </div>

          {/* Metadata & verification sidebar */}
          <div
            className="md:col-span-4 border-t md:border-t-0 md:border-l flex flex-col overflow-y-auto"
            style={{
              borderColor: HAIRLINE,
            }}
          >
            {/* Privacy notice for consent docs */}
            {(meta as any).isConsent && (
              <div
                style={{
                  background: "rgba(191,90,242,0.06)",
                  borderBottom: `1px solid rgba(191,90,242,0.18)`,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <Lock
                  size={13}
                  color={PURPLE}
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                <p
                  style={{
                    fontSize: 11,
                    color: PURPLE,
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  <strong>DPDP Act 2023 &amp; GCP Protected.</strong> Access
                  restricted to authorised institutional oversight and
                  regulatory inspection.
                </p>
              </div>
            )}

            <div
              style={{
                padding: "18px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              {/* Uploaded by */}
              <MetaRow
                icon={<User size={13} color={INK_48} />}
                label="Uploaded By"
                value={doc.uploaded_by}
                badge={
                  <span style={{ ...BADGE.blue, fontSize: 9 }}>
                    INVESTIGATOR
                  </span>
                }
              />

              {/* Timestamp */}
              <MetaRow
                icon={<Clock size={13} color={INK_48} />}
                label="Date / Time (UTC)"
                value={fmtTs(doc.uploaded_at)}
                mono
              />

              {/* Storage status */}
              <MetaRow
                icon={<HardDrive size={13} color={SUCCESS} />}
                label="MinIO Storage"
                value=""
                badge={
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background: "rgba(52,199,89,0.07)",
                      border: "1px solid rgba(52,199,89,0.22)",
                      borderRadius: R_PILL,
                      padding: "2px 8px",
                      fontSize: 10,
                      fontWeight: 600,
                      color: SUCCESS,
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: SUCCESS,
                        display: "inline-block",
                      }}
                    />
                    Stored in S3
                  </span>
                }
              />

              {/* SHA-256 */}
              <div>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: INK_48,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    margin: "0 0 6px",
                  }}
                >
                  SHA-256 Fingerprint
                </p>
                <p
                  title={doc.sha256_hash}
                  style={{
                    fontSize: 9,
                    color: PURPLE,
                    margin: 0,
                    fontFamily: FONT_MONO,
                    background: "rgba(191,90,242,0.06)",
                    border: "1px solid rgba(191,90,242,0.18)",
                    borderRadius: R_MD,
                    padding: "6px 8px",
                    wordBreak: "break-all",
                    lineHeight: 1.6,
                    letterSpacing: "0.02em",
                    cursor: "text",
                  }}
                >
                  {doc.sha256_hash}
                </p>
              </div>

              {/* Integrity verification */}
              <div>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: INK_48,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    margin: "0 0 8px",
                  }}
                >
                  Cryptographic Integrity
                </p>
                {!verifyResult ? (
                  <button
                    onClick={() => onVerify(doc.id)}
                    disabled={verifyLoading}
                    style={{
                      width: "100%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      background: verifyLoading
                        ? PARCHMENT
                        : "rgba(52,199,89,0.08)",
                      color: verifyLoading ? INK_48 : SUCCESS,
                      border: `1px solid ${verifyLoading ? HAIRLINE : "rgba(52,199,89,0.28)"}`,
                      borderRadius: R_MD,
                      padding: "8px 14px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: verifyLoading ? "not-allowed" : "pointer",
                      fontFamily: FONT_STACK,
                    }}
                  >
                    <ShieldCheck size={13} />
                    {verifyLoading ? "Verifying…" : "Run Integrity Check"}
                  </button>
                ) : verifyResult.is_tamper_free ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      background: "rgba(52,199,89,0.07)",
                      border: "1px solid rgba(52,199,89,0.25)",
                      borderRadius: R_MD,
                      padding: "10px 12px",
                    }}
                  >
                    <CheckCircle2
                      size={14}
                      color={SUCCESS}
                      style={{ flexShrink: 0, marginTop: 1 }}
                    />
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: SUCCESS,
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      Cryptographically Verified Authentic — Matches MinIO
                      Ledger. Zero modification detected.
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      background: "rgba(255,69,58,0.07)",
                      border: "1px solid rgba(255,69,58,0.28)",
                      borderRadius: R_MD,
                      padding: "10px 12px",
                    }}
                  >
                    <AlertTriangle
                      size={14}
                      color={DANGER}
                      style={{ flexShrink: 0, marginTop: 1 }}
                    />
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: DANGER,
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      Integrity Breach Detected — File has been tampered with.
                      Report to Compliance Officer immediately.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Small reusable metadata row for the sidebar */
const MetaRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  badge?: React.ReactNode;
}> = ({ icon, label, value, mono, badge }) => (
  <div>
    <div
      style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}
    >
      {icon}
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: INK_48,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
    </div>
    {badge ?? (
      <p
        style={{
          fontSize: 12,
          color: INK_80,
          margin: 0,
          fontFamily: mono ? FONT_MONO : FONT_STACK,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </p>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   DOCUMENT CARD
───────────────────────────────────────────────────────────────────*/
interface DocCardProps {
  doc: any;
  verifyState: { loading: boolean; result: any | null } | undefined;
  onVerify: (id: string) => void;
  onPreview: (doc: any) => void;
}

const DocCard: React.FC<DocCardProps> = ({
  doc,
  verifyState,
  onVerify,
  onPreview,
}) => {
  const meta = resolveMeta(doc.document_type);
  const result = verifyState?.result;

  return (
    <div
      style={{
        background: CANVAS,
        border: `1px solid ${HAIRLINE}`,
        borderRadius: R_LG,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.boxShadow =
          "0 2px 12px rgba(0,0,0,0.08)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.boxShadow = "none")
      }
    >
      {/* Card header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${HAIRLINE}`,
          background: PARCHMENT,
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: R_SM,
            flexShrink: 0,
            background: CANVAS,
            border: `1px solid ${HAIRLINE}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {meta.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: INK,
              margin: "0 0 4px",
              letterSpacing: "-0.12px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={doc.file_name}
          >
            {doc.file_name}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap" as const,
            }}
          >
            <span style={meta.badge}>{meta.label}</span>
            <span style={{ fontSize: 10, color: INK_48 }}>
              {fmtBytes(doc.file_size_bytes)}
            </span>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div
        style={{
          padding: "14px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          flex: 1,
        }}
      >
        <div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: INK_48,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "block",
              marginBottom: 3,
            }}
          >
            Uploaded By
          </span>
          <p
            style={{
              fontSize: 12,
              color: INK_80,
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {doc.uploaded_by}
          </p>
        </div>
        <div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: INK_48,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "block",
              marginBottom: 3,
            }}
          >
            Date &amp; Time
          </span>
          <p
            style={{
              fontSize: 12,
              color: INK_80,
              margin: 0,
              fontFamily: FONT_MONO,
            }}
          >
            {fmtTs(doc.uploaded_at)}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "rgba(52,199,89,0.07)",
              border: "1px solid rgba(52,199,89,0.22)",
              borderRadius: R_PILL,
              padding: "3px 10px",
              fontSize: 10,
              fontWeight: 600,
              color: SUCCESS,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: SUCCESS,
                display: "inline-block",
              }}
            />
            Stored in MinIO S3
          </div>
        </div>
        <div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: INK_48,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "block",
              marginBottom: 3,
            }}
          >
            SHA-256 Fingerprint
          </span>
          <p
            title={doc.sha256_hash}
            style={{
              fontSize: 10,
              color: PURPLE,
              margin: 0,
              fontFamily: FONT_MONO,
              background: "rgba(191,90,242,0.06)",
              border: "1px solid rgba(191,90,242,0.18)",
              borderRadius: R_MD,
              padding: "5px 9px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              cursor: "help",
              letterSpacing: "0.02em",
            }}
          >
            {doc.sha256_hash}
          </p>
        </div>
      </div>

      {/* Card footer — two action buttons */}
      <div
        style={{
          padding: "12px 20px",
          borderTop: `1px solid ${HAIRLINE}`,
          background: PARCHMENT,
          display: "flex",
          gap: 8,
        }}
      >
        {/* Preview button */}
        <button
          onClick={() => onPreview(doc)}
          style={{
            flex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            background: "rgba(0,102,204,0.08)",
            color: PRIMARY,
            border: "1px solid rgba(0,102,204,0.22)",
            borderRadius: R_MD,
            padding: "8px 10px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: FONT_STACK,
            transition: "background 0.1s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(0,102,204,0.14)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(0,102,204,0.08)")
          }
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <Eye size={13} /> Preview
        </button>

        {/* Verify button / result */}
        {!result ? (
          <button
            onClick={() => onVerify(doc.id)}
            disabled={verifyState?.loading}
            style={{
              flex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              background: verifyState?.loading
                ? HAIRLINE
                : "rgba(52,199,89,0.08)",
              color: verifyState?.loading ? INK_48 : SUCCESS,
              border: `1px solid ${verifyState?.loading ? HAIRLINE : "rgba(52,199,89,0.28)"}`,
              borderRadius: R_MD,
              padding: "8px 10px",
              fontSize: 12,
              fontWeight: 600,
              cursor: verifyState?.loading ? "not-allowed" : "pointer",
              fontFamily: FONT_STACK,
              transition: "background 0.1s",
            }}
            onMouseDown={(e) =>
              !verifyState?.loading &&
              (e.currentTarget.style.transform = "scale(0.97)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <ShieldCheck size={13} />
            {verifyState?.loading ? "Verifying…" : "Verify"}
          </button>
        ) : result.is_tamper_free ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              background: "rgba(52,199,89,0.07)",
              border: "1px solid rgba(52,199,89,0.25)",
              borderRadius: R_MD,
              padding: "8px 10px",
              fontSize: 11,
              fontWeight: 600,
              color: SUCCESS,
            }}
          >
            <CheckCircle2 size={12} /> Verified
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              background: "rgba(255,69,58,0.07)",
              border: "1px solid rgba(255,69,58,0.28)",
              borderRadius: R_MD,
              padding: "8px 10px",
              fontSize: 11,
              fontWeight: 600,
              color: DANGER,
            }}
          >
            <AlertTriangle size={12} /> Tampered
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────────*/
export const DocumentVaultPage: React.FC = () => {
  const [studies, setStudies] = useState<Study[]>(DEFAULT_AIIA_STUDIES);
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_AIIA_STUDIES[0]?.id || "");
  const [documents, setDocuments] = useState<any[]>(DEFAULT_DOCUMENTS);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [verifyMap, setVerifyMap] = useState<
    Record<string, { loading: boolean; result: any | null }>
  >({});
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  useEffect(() => {
    api
      .get("/study/list")
      .then((r) => {
        if (Array.isArray(r.data) && r.data.length > 0) {
          setStudies(r.data);
          setSelectedId(r.data[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const loadDocuments = useCallback(async (studyId: string) => {
    if (!studyId) return;
    setLoadingDocs(true);
    setVerifyMap({});
    try {
      const res = await api.get(`/documents/study/${studyId}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setDocuments(res.data);
      } else if (studyId === DEFAULT_AIIA_STUDIES[0]?.id) {
        setDocuments(DEFAULT_DOCUMENTS);
      } else {
        setDocuments([]);
      }
    } catch {
      if (studyId === DEFAULT_AIIA_STUDIES[0]?.id) {
        setDocuments(DEFAULT_DOCUMENTS);
      } else {
        setDocuments([]);
      }
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) loadDocuments(selectedId);
  }, [selectedId, loadDocuments]);

  const activeStudy = studies.find((s) => s.id === selectedId) ?? null;

  const handleVerify = async (receiptId: string) => {
    setVerifyMap((m) => ({
      ...m,
      [receiptId]: { loading: true, result: null },
    }));
    try {
      const res = await api.get(`/documents/verify/${receiptId}`);
      setVerifyMap((m) => ({
        ...m,
        [receiptId]: { loading: false, result: res.data },
      }));
    } catch {
      setVerifyMap((m) => ({
        ...m,
        [receiptId]: { loading: false, result: { is_tamper_free: false } },
      }));
    }
  };

  const categoryCounts = documents.reduce<Record<string, number>>((acc, d) => {
    const label = resolveMeta(d.document_type).label;
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  const previewVerifyState = previewDoc ? verifyMap[previewDoc.id] : undefined;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 28,
        fontFamily: FONT_STACK,
      }}
    >
      {/* Preview modal */}
      {previewDoc && (
        <DocumentPreviewModal
          doc={previewDoc}
          verifyResult={previewVerifyState?.result ?? null}
          verifyLoading={previewVerifyState?.loading ?? false}
          onClose={() => setPreviewDoc(null)}
          onVerify={handleVerify}
        />
      )}

      {/* PAGE HEADER */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 14,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 600,
              color: INK,
              letterSpacing: "-0.374px",
              lineHeight: 1.47,
              margin: "0 0 6px",
            }}
          >
            eTMF Master Document Vault
          </h1>
          <p style={{ ...TYPE.caption, color: INK_48, margin: 0 }}>
            Electronic Trial Master File — SHA-256 tamper-evident receipts
            anchored in{" "}
            <code
              style={{
                fontFamily: FONT_MONO,
                fontSize: 12,
                color: PURPLE,
                background: "rgba(191,90,242,0.08)",
                padding: "1px 6px",
                borderRadius: 4,
              }}
            >
              audit_integrity_db
            </code>
            . Preview, verify, or open any document inline without downloading.
          </p>
        </div>
        <button
          onClick={() => loadDocuments(selectedId)}
          disabled={loadingDocs}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: PARCHMENT,
            color: INK,
            border: `1px solid ${HAIRLINE}`,
            borderRadius: R_PILL,
            padding: "8px 18px",
            fontSize: 13,
            fontWeight: 600,
            cursor: loadingDocs ? "not-allowed" : "pointer",
            fontFamily: FONT_STACK,
            transition: "transform 0.1s",
            opacity: loadingDocs ? 0.6 : 1,
          }}
          onMouseDown={(e) =>
            !loadingDocs && (e.currentTarget.style.transform = "scale(0.95)")
          }
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <RefreshCw
            size={13}
            style={{
              animation: loadingDocs ? "spin 0.8s linear infinite" : "none",
            }}
          />
          Refresh
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      {/* PROTOCOL SELECTOR */}
      <div
        style={{
          background: CANVAS,
          border: `1px solid ${HAIRLINE}`,
          borderRadius: R_LG,
          padding: "16px 22px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: R_SM,
            background: "rgba(0,102,204,0.08)",
            border: "1px solid rgba(0,102,204,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Database size={14} color={PRIMARY} />
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: INK_48,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            whiteSpace: "nowrap",
          }}
        >
          Active Protocol
        </span>
        <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{
              appearance: "none" as const,
              width: "100%",
              background: PARCHMENT,
              border: `1px solid ${HAIRLINE}`,
              borderRadius: R_MD,
              padding: "8px 36px 8px 14px",
              fontSize: 13,
              fontWeight: 600,
              color: INK,
              fontFamily: FONT_STACK,
              cursor: "pointer",
              outline: "none",
            }}
          >
            {studies.length === 0 && <option value="">Loading studies…</option>}
            {studies.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.short_code}]{" "}
                {s.title.length > 58 ? s.title.slice(0, 58) + "…" : s.title}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            color={INK_48}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
        </div>
        {activeStudy && (
          <span
            style={
              activeStudy.status === "ENROLLING"
                ? BADGE.green
                : activeStudy.status === "DATA_LOCK"
                  ? BADGE.blue
                  : activeStudy.status === "CLOSED"
                    ? BADGE.ink
                    : BADGE.amber
            }
          >
            {activeStudy.status}
          </span>
        )}
        {Object.entries(categoryCounts).map(([label, count]) => (
          <span key={label} style={{ ...BADGE.ink, fontSize: 10 }}>
            {count} {label}
          </span>
        ))}
        {documents.length === 0 && !loadingDocs && (
          <span style={{ fontSize: 12, color: INK_48 }}>
            No documents on file
          </span>
        )}
      </div>

      {/* DOCUMENT CARDS */}
      {loadingDocs ? (
        <div
          style={{
            background: CANVAS,
            border: `1px solid ${HAIRLINE}`,
            borderRadius: R_LG,
            padding: "48px 24px",
            textAlign: "center",
            color: INK_48,
            fontSize: 13,
          }}
        >
          Loading documents…
        </div>
      ) : documents.length === 0 ? (
        <div
          style={{
            background: CANVAS,
            border: `1px solid ${HAIRLINE}`,
            borderRadius: R_LG,
            padding: "60px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "rgba(0,102,204,0.07)",
              border: "1px solid rgba(0,102,204,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText size={24} color={PRIMARY} style={{ opacity: 0.6 }} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: INK, margin: 0 }}>
            No Documents on File
          </p>
          <p
            style={{
              fontSize: 13,
              color: INK_48,
              margin: 0,
              maxWidth: 440,
              lineHeight: 1.6,
            }}
          >
            Documents are attached during their respective workflows — use{" "}
            <strong style={{ color: INK }}>Trial Setup</strong> for protocol
            PDFs, the <strong style={{ color: INK }}>Ethics Console</strong> for
            IEC clearance letters, and the{" "}
            <strong style={{ color: INK }}>Enrollment Form</strong> for signed
            informed consent documents.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {documents.map((doc) => (
            <DocCard
              key={doc.id}
              doc={doc}
              verifyState={verifyMap[doc.id]}
              onVerify={handleVerify}
              onPreview={setPreviewDoc}
            />
          ))}
        </div>
      )}
    </div>
  );
};
