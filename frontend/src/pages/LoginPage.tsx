import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, Users, Shield, Building2 } from 'lucide-react';

const T = {
  bg: '#000000',
  tile: '#1d1d1f',
  tileBorder: 'rgba(255,255,255,0.08)',
  inkLight: '#ffffff',
  inkMuted: '#cccccc',
  inkDim: '#7a7a7a',
  primary: '#0066cc',
  primaryFocus: '#0071e3',
  primaryOnDark: '#2997ff',
  danger: '#ff453a',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: '#000000',
  border: `1px solid rgba(255,255,255,0.12)`,
  borderRadius: 11,
  padding: '11px 16px',
  color: '#ffffff',
  fontSize: 17,
  fontWeight: 400,
  lineHeight: 1.47,
  letterSpacing: '-0.374px',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s ease',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: '#7a7a7a',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: 7,
};

export const LoginPage: React.FC = () => {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await login(email, password);
    setLoading(false);
    if (ok) navigate('/dashboard');
    else setError('Invalid credentials. Please verify your email and password.');
  };

  const handleQuick = async (role: 'PI' | 'SAFETY' | 'DIRECTOR') => {
    setLoading(true);
    await quickLogin(role);
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        fontFamily:
          "'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: T.tile,
          border: `1px solid ${T.tileBorder}`,
          borderRadius: 18,
          padding: 40,
          boxShadow: 'rgba(0,0,0,0.22) 3px 5px 30px 0',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: T.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 16px rgba(0,102,204,0.3)',
            }}
          >
            <Activity size={24} color="#fff" />
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: T.inkLight,
              letterSpacing: '-0.28px',
              lineHeight: 1.1,
              margin: '0 0 8px',
            }}
          >
            AyurVedhya CTMS
          </h1>
          <p
            style={{
              fontSize: 14,
              color: T.inkDim,
              letterSpacing: '-0.224px',
              margin: '0 0 12px',
            }}
          >
            All India Institute of Ayurveda · Ministry of Ayush
          </p>
          <span
            style={{
              display: 'inline-block',
              fontSize: 11,
              fontWeight: 400,
              color: T.primaryOnDark,
              background: 'rgba(0,102,204,0.1)',
              border: '1px solid rgba(0,102,204,0.25)',
              padding: '3px 12px',
              borderRadius: 9999,
              letterSpacing: '-0.08px',
            }}
          >
            GCP &amp; NDCT 2019 Regulatory Portal
          </span>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: 'rgba(255,69,58,0.08)',
              border: '1px solid rgba(255,69,58,0.3)',
              borderRadius: 11,
              padding: '11px 16px',
              fontSize: 14,
              color: T.danger,
              letterSpacing: '-0.224px',
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleManualLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Official Ayush Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="investigator@aiia.gov.in"
              style={{
                ...inputStyle,
                borderColor: emailFocus ? T.primaryFocus : 'rgba(255,255,255,0.12)',
              }}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                ...inputStyle,
                borderColor: passwordFocus ? T.primaryFocus : 'rgba(255,255,255,0.12)',
              }}
              onFocus={() => setPasswordFocus(true)}
              onBlur={() => setPasswordFocus(false)}
              required
            />
          </div>

          {/* Primary CTA — pill button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: T.primary,
              color: '#ffffff',
              fontSize: 17,
              fontWeight: 400,
              letterSpacing: '-0.374px',
              padding: '11px 22px',
              borderRadius: 9999,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'transform 0.1s ease',
              fontFamily: 'inherit',
              width: '100%',
              marginTop: 4,
            }}
            onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Lock size={16} />
            {loading ? 'Authenticating…' : 'Sign In via Keycloak IAM'}
          </button>
        </form>

        {/* Quick persona access */}
        <div
          style={{
            marginTop: 32,
            paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#7a7a7a',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              textAlign: 'center',
              marginBottom: 14,
            }}
          >
            Quick Persona Login · Evaluation Mode
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { role: 'PI' as const, icon: Users, label: 'Investigator', color: T.primaryOnDark },
              { role: 'SAFETY' as const, icon: Shield, label: 'Safety / IEC', color: '#bf5af2' },
              { role: 'DIRECTOR' as const, icon: Building2, label: 'Leadership', color: '#34c759' },
            ].map(({ role, icon: Icon, label, color }) => (
              <button
                key={role}
                onClick={() => handleQuick(role)}
                disabled={loading}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 7,
                  padding: '14px 8px',
                  background: '#000000',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget.style.borderColor = `${color}50`);
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.03)');
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)');
                  (e.currentTarget.style.background = '#000000');
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Icon size={16} color={color} />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: T.inkMuted,
                    letterSpacing: '-0.08px',
                    lineHeight: 1.2,
                    textAlign: 'center',
                  }}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fine-print footer */}
      <p
        style={{
          marginTop: 24,
          fontSize: 12,
          color: '#7a7a7a',
          letterSpacing: '-0.12px',
          textAlign: 'center',
        }}
      >
        Secured by Keycloak IAM · ISO 27001 · GCP Validated
      </p>
    </div>
  );
};
