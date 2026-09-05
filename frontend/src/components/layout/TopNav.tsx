import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, LogOut } from 'lucide-react';
import { FONT_STACK, PRIMARY, PRIMARY_ON_DARK, SURFACE_BLACK, INK_48 } from '../../design';

export const TopNav: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header style={{
      height: 44,
      background: SURFACE_BLACK,
      borderBottom: '1px solid rgba(255,255,255,0.10)',
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'saturate(180%) blur(20px)',
      WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: 24, paddingRight: 24,
      fontFamily: FONT_STACK,
    }}>

      {/* ── Brand ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: PRIMARY,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Activity size={11} color="#fff" strokeWidth={2.5} />
        </div>

        <span style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', letterSpacing: '-0.12px', lineHeight: 1 }}>
          AyurVedhya CTMS
        </span>

        {/* pill badge — Action Blue tint per verge.md */}
        <span style={{
          fontSize: 10, fontWeight: 600, color: PRIMARY_ON_DARK,
          background: 'rgba(0,102,204,0.14)',
          border: '1px solid rgba(0,102,204,0.28)',
          padding: '2px 9px', borderRadius: 9999,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          lineHeight: 1.5,
        }}>
          AIIA · Ministry of Ayush
        </span>
      </div>

      {/* ── Right cluster ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

        {/* User identity pill */}
        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.10)',
            padding: '4px 12px 4px 4px', borderRadius: 9999,
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: PRIMARY,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, color: '#ffffff', flexShrink: 0,
            }}>
              {user.avatarLetter}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#ffffff', letterSpacing: '-0.12px' }}>
                {user.fullName}
              </span>
              <span style={{ fontSize: 10, fontWeight: 400, color: PRIMARY_ON_DARK, letterSpacing: '-0.08px', marginTop: 2 }}>
                {user.roleDisplayName}
              </span>
            </div>
          </div>
        )}

        {/* Logout button — 32×32 circular utility */}
        <button
          onClick={logout}
          title="Sign Out"
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: INK_48,
            transition: 'all 0.12s ease', flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,69,58,0.14)';
            e.currentTarget.style.borderColor = 'rgba(255,69,58,0.35)';
            e.currentTarget.style.color = '#ff453a';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
            e.currentTarget.style.color = INK_48;
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <LogOut size={13} />
        </button>
      </div>
    </header>
  );
};
