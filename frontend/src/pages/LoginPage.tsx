import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, Users, Shield, Building2, ArrowLeft } from 'lucide-react';
import {
  FONT_STACK, PARCHMENT, CANVAS, HAIRLINE, INK, INK_48, INK_80,
  PRIMARY, PRIMARY_FOCUS, PRIMARY_ON_DARK, DANGER,
  R_MD, R_LG, R_PILL, PRODUCT_SHADOW, TYPE,
  btnPrimary, inputField, labelOverline,
} from '../design';

export const LoginPage: React.FC = () => {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [emailFocus, setEF]       = useState(false);
  const [passFocus, setPF]        = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
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
    <div style={{
      minHeight: '100vh', background: PARCHMENT,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px',
      fontFamily: FONT_STACK, WebkitFontSmoothing: 'antialiased',
      position: 'relative',
    }}>
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          color: INK_48,
          cursor: 'pointer',
          padding: '8px 12px',
          borderRadius: R_MD,
          fontFamily: FONT_STACK,
          fontSize: 14,
          fontWeight: 500,
          transition: 'background 0.14s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = PARCHMENT)}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div style={{
        width: '100%', maxWidth: 440,
        background: CANVAS,
        border: `1px solid ${HAIRLINE}`,
        borderRadius: R_LG,
        padding: 40,
        boxShadow: PRODUCT_SHADOW,
      }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          {/* Logo circle */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: PRIMARY,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 4px 20px rgba(0,102,204,0.3)',
          }}>
            <Activity size={30} color="#fff" strokeWidth={2} />
          </div>

          {/* 32px headline */}
          <h1 style={{
            fontSize: 32, fontWeight: 700, color: INK,
            letterSpacing: '-0.32px', lineHeight: 1.15,
            margin: '0 0 10px',
            fontFamily: FONT_STACK,
          }}>
            AyurVedhya CTMS
          </h1>

          {/* 14px caption subtitle */}
          <p style={{ ...TYPE.caption, color: INK_48, margin: '0 0 16px', fontSize: 14 }}>
            All India Institute of Ayurveda · Ministry of Ayush
          </p>

          {/* Pill badge */}
          <span style={{
            display: 'inline-block',
            fontSize: 11, fontWeight: 600, color: PRIMARY,
            background: 'rgba(0,102,204,0.08)',
            border: `1px solid rgba(0,102,204,0.22)`,
            padding: '4px 16px', borderRadius: R_PILL,
            letterSpacing: '-0.08px',
          }}>
            GCP &amp; NDCT 2019 Regulatory Portal
          </span>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{
            background: 'rgba(255,69,58,0.07)',
            border: '1px solid rgba(255,69,58,0.28)',
            borderRadius: R_MD, padding: '11px 16px',
            fontSize: 14, color: DANGER,
            letterSpacing: '-0.224px', marginBottom: 20, textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* ── Login form ── */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelOverline()}>Official Ayush Email</label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="investigator@aiia.gov.in"
              style={inputField(emailFocus)}
              onFocus={() => setEF(true)} onBlur={() => setEF(false)}
              required
            />
          </div>

          <div>
            <label style={labelOverline()}>Password</label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputField(passFocus)}
              onFocus={() => setPF(true)} onBlur={() => setPF(false)}
              required
            />
          </div>

          {/* Primary blue pill CTA */}
          <button
            type="submit" disabled={loading}
            style={{ ...btnPrimary(loading), width: '100%', marginTop: 8 }}
            onMouseDown={e => !loading && (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Lock size={15} />
            {loading ? 'Authenticating…' : 'Sign In via Keycloak IAM'}
          </button>
        </form>

        {/* ── Quick persona login ── */}
        <div style={{
          marginTop: 36, paddingTop: 28,
          borderTop: `1px solid ${HAIRLINE}`,
        }}>
          <p style={{
            fontSize: 10, fontWeight: 600, color: INK_48,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            textAlign: 'center', margin: '0 0 16px',
          }}>
            Quick Persona Login · Evaluation Mode
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {([
              { role: 'PI'       as const, icon: Users,     label: 'Investigator', color: PRIMARY      },
              { role: 'SAFETY'   as const, icon: Shield,    label: 'Safety / IEC', color: '#bf5af2'    },
              { role: 'DIRECTOR' as const, icon: Building2, label: 'Leadership',   color: '#34c759'    },
            ]).map(({ role, icon: Icon, label, color }) => (
              <button
                key={role}
                onClick={() => handleQuick(role)}
                disabled={loading}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 10,
                  padding: '16px 10px',
                  background: PARCHMENT,
                  border: `1px solid ${HAIRLINE}`,
                  borderRadius: R_LG,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.14s ease',
                  fontFamily: FONT_STACK,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `${color}60`;
                  e.currentTarget.style.background  = `${color}08`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = HAIRLINE;
                  e.currentTarget.style.background  = PARCHMENT;
                }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Icon size={18} color={color} />
                <span style={{ fontSize: 11, fontWeight: 600, color: INK_80, letterSpacing: '-0.08px', lineHeight: 1.2, textAlign: 'center' }}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
