import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Shield, FileText, Users, BarChart3, Lock,
  ArrowRight, CheckCircle2, Building2, Zap
} from 'lucide-react';
import {
  FONT_STACK, PARCHMENT, CANVAS, HAIRLINE, INK, INK_48, INK_80,
  PRIMARY, PRIMARY_FOCUS, PRIMARY_ON_DARK, SUCCESS, PURPLE,
  R_MD, R_LG, R_PILL, PRODUCT_SHADOW, TYPE,
  btnPrimary,
} from '../design';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: PARCHMENT,
      fontFamily: FONT_STACK,
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* ── Navigation ── */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 40px',
        borderBottom: `1px solid ${HAIRLINE}`,
        background: CANVAS,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: PRIMARY,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={20} color="#fff" strokeWidth={2} />
          </div>
          <span style={{
            fontSize: 18, fontWeight: 600, color: INK,
            letterSpacing: '-0.18px',
          }}>
            AyurVedhya CTMS
          </span>
        </div>

        <button
          onClick={() => navigate('/login')}
          style={{
            ...btnPrimary(false),
            padding: '10px 24px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Lock size={16} />
          Sign In
        </button>
      </nav>

      {/* ── Hero Section ── */}
      <section style={{
        padding: '80px 40px',
        textAlign: 'center',
        background: `linear-gradient(180deg, ${CANVAS} 0%, ${PARCHMENT} 100%)`,
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(52,199,89,0.08)',
            border: '1px solid rgba(52,199,89,0.22)',
            borderRadius: R_PILL,
            padding: '6px 16px',
            marginBottom: 24,
          }}>
            <CheckCircle2 size={14} color={SUCCESS} />
            <span style={{
              fontSize: 12, fontWeight: 600, color: SUCCESS,
              letterSpacing: '-0.08px',
            }}>
              GCP & NDCT 2019 Compliant
            </span>
          </div>

          <h1 style={{
            fontSize: 52, fontWeight: 700, color: INK,
            letterSpacing: '-0.52px', lineHeight: 1.1,
            marginBottom: 20,
          }}>
            Clinical Trial Management System
            <br />
            <span style={{ color: PRIMARY }}>for Ayurveda Research</span>
          </h1>

          <p style={{
            ...TYPE.body, fontSize: 18, color: INK_48,
            lineHeight: 1.6, marginBottom: 40,
            maxWidth: 700, margin: '0 auto 40px',
          }}>
            All India Institute of Ayurveda · Ministry of Ayush
            <br />
            End-to-end trial oversight, patient safety monitoring, and regulatory compliance
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                ...btnPrimary(false),
                padding: '14px 32px',
                fontSize: 15,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Get Started
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '14px 32px',
                fontSize: 15, fontWeight: 600,
                background: CANVAS,
                color: INK,
                border: `1px solid ${HAIRLINE}`,
                borderRadius: R_MD,
                cursor: 'pointer',
                fontFamily: FONT_STACK,
                transition: 'all 0.14s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = PRIMARY;
                e.currentTarget.style.background = 'rgba(0,102,204,0.04)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = HAIRLINE;
                e.currentTarget.style.background = CANVAS;
              }}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section style={{ padding: '80px 40px', background: CANVAS }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{
              fontSize: 36, fontWeight: 700, color: INK,
              letterSpacing: '-0.36px', lineHeight: 1.2,
              marginBottom: 16,
            }}>
              Comprehensive Trial Management
            </h2>
            <p style={{ ...TYPE.body, color: INK_48, fontSize: 16 }}>
              Built for regulatory compliance and operational excellence
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
          }}>
            {[
              {
                icon: Shield,
                title: 'Patient Safety',
                description: 'Real-time pharmacovigilance with automated SAE reporting and safety signal detection',
                color: '#bf5af2',
              },
              {
                icon: FileText,
                title: 'eTMF Document Vault',
                description: 'SHA-256 tamper-evident document storage with MinIO S3 integration',
                color: PRIMARY,
              },
              {
                icon: Users,
                title: 'Subject Enrollment',
                description: 'Informed consent management with vernacular language support',
                color: '#34c759',
              },
              {
                icon: BarChart3,
                title: 'AI-Powered Analytics',
                description: 'Predictive insights for accrual velocity and milestone forecasting',
                color: '#ff9500',
              },
              {
                icon: Building2,
                title: 'Regulatory Compliance',
                description: 'CTRI integration, ethics committee workflows, and audit trail logging',
                color: '#ff375f',
              },
              {
                icon: Zap,
                title: 'Interoperability',
                description: 'ABDM health data bridge and NDHM compliance for seamless data exchange',
                color: '#00c7be',
              },
            ].map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                style={{
                  background: PARCHMENT,
                  border: `1px solid ${HAIRLINE}`,
                  borderRadius: R_LG,
                  padding: 28,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = PRODUCT_SHADOW;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: R_MD,
                  background: `${color}12`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon size={24} color={color} />
                </div>
                <h3 style={{
                  fontSize: 18, fontWeight: 600, color: INK,
                  marginBottom: 10, letterSpacing: '-0.18px',
                }}>
                  {title}
                </h3>
                <p style={{ ...TYPE.caption, color: INK_48, lineHeight: 1.6 }}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section style={{
        padding: '80px 40px',
        background: PRIMARY,
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 36, fontWeight: 700, color: '#fff',
            letterSpacing: '-0.36px', lineHeight: 1.2,
            marginBottom: 16,
          }}>
            Ready to Transform Your Clinical Trials?
          </h2>
          <p style={{
            fontSize: 18, color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.6, marginBottom: 32,
          }}>
            Join the All India Institute of Ayurveda in advancing Ayurveda research
            with modern, compliant clinical trial management.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '16px 40px',
              fontSize: 16, fontWeight: 600,
              background: '#fff',
              color: PRIMARY,
              border: 'none',
              borderRadius: R_MD,
              cursor: 'pointer',
              fontFamily: FONT_STACK,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              transition: 'all 0.14s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Lock size={18} />
            Sign In to Portal
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding: '40px',
        background: CANVAS,
        borderTop: `1px solid ${HAIRLINE}`,
        textAlign: 'center',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, marginBottom: 16,
        }}>
          <Activity size={20} color={INK_48} />
          <span style={{
            fontSize: 16, fontWeight: 600, color: INK_48,
          }}>
            AyurVedhya CTMS
          </span>
        </div>
        <p style={{ ...TYPE.caption, color: INK_48, marginBottom: 8 }}>
          All India Institute of Ayurveda · Ministry of Ayush
        </p>
        <p style={{ ...TYPE.caption, color: INK_48, fontSize: 11 }}>
          Secured by Keycloak IAM · ISO 27001 · GCP Validated · NDCT 2019 Compliant
        </p>
      </footer>
    </div>
  );
};
