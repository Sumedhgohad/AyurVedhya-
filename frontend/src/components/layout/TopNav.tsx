import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';
import { FONT_STACK, PRIMARY, PRIMARY_ON_DARK, SURFACE_BLACK, INK_48 } from '../../design';

interface TopNavProps {
  onToggleMobile?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onToggleMobile }) => {
  const { user, logout } = useAuth();

  return (
    <header style={{
      height: 64,
      background: '#0c1f16',
      borderBottom: '1px solid rgba(255,255,255,0.12)',
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'saturate(180%) blur(20px)',
      WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: 20, paddingRight: 24,
      fontFamily: FONT_STACK,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }}>

      {/* ── Brand & Mobile Hamburger ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {onToggleMobile && (
          <button
            onClick={onToggleMobile}
            title="Toggle Navigation Menu"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: 8,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#ffffff', cursor: 'pointer',
            }}
            className="md:hidden"
          >
            <Menu size={19} />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/Logo/Final_Logo.png"
            alt="AyurVedhya Logo"
            style={{ width: 36, height: 36, objectFit: 'contain' }}
          />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                AyurVedhya
              </span>
              <span style={{
                fontSize: 10, fontWeight: 700, color: '#52B788',
                background: 'rgba(82,183,136,0.15)',
                border: '1px solid rgba(82,183,136,0.35)',
                padding: '2px 7px', borderRadius: 4,
                letterSpacing: '0.04em', lineHeight: 1.1,
              }}>
                CTMS
              </span>
            </div>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 2 }}>
              All India Institute of Ayurveda
            </span>
          </div>

          <div style={{ width: 1, height: 26, background: 'rgba(255,255,255,0.12)', margin: '0 4px' }} className="hidden sm:block" />

          <div style={{
            display: 'none', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            padding: '4px 12px', borderRadius: 9999,
          }} className="sm:inline-flex">
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#52B788' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#e5e7eb', letterSpacing: '0.03em' }}>
              Ministry of Ayush · ICMR &amp; GCP Validated
            </span>
          </div>
        </div>
      </div>

      {/* ── Right Cluster ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* User identity pill */}
        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.14)',
            padding: '5px 14px 5px 6px', borderRadius: 9999,
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: '#1b6e4e',
              border: '1px solid rgba(255,255,255,0.20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#ffffff', flexShrink: 0,
            }}>
              {user.avatarLetter}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', letterSpacing: '-0.12px' }}>
                {user.fullName}
              </span>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#52B788', letterSpacing: '-0.08px', marginTop: 2 }}>
                {user.roleDisplayName}
              </span>
            </div>
          </div>
        )}

        {/* Logout button — 36×36 circular utility */}
        <button
          onClick={logout}
          title="Sign Out"
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.14)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#9ca3af',
            transition: 'all 0.15s ease', flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,69,58,0.18)';
            e.currentTarget.style.borderColor = 'rgba(255,69,58,0.40)';
            e.currentTarget.style.color = '#ff6b6b';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
            e.currentTarget.style.color = '#9ca3af';
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
};
