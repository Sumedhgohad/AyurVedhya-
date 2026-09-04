import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, LogOut } from 'lucide-react';

export const TopNav: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        height: 44,
        background: '#000000',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 24,
        paddingRight: 24,
        fontFamily:
          "'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: '#0066cc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Activity size={12} color="#fff" />
        </div>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#ffffff',
            letterSpacing: '-0.12px',
            lineHeight: 1,
          }}
        >
          AyurVedhya CTMS
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#2997ff',
            background: 'rgba(0,102,204,0.12)',
            border: '1px solid rgba(0,102,204,0.25)',
            padding: '2px 9px',
            borderRadius: 9999,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          AIIA · Ministry of Ayush
        </span>
      </div>

      {/* Right cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* User pill */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#1d1d1f',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '4px 12px 4px 4px',
              borderRadius: 9999,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#0066cc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 600,
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              {user.avatarLetter}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#ffffff',
                  letterSpacing: '-0.12px',
                }}
              >
                {user.fullName}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 400,
                  color: '#2997ff',
                  letterSpacing: '-0.08px',
                  marginTop: 2,
                }}
              >
                {user.roleDisplayName}
              </span>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          title="Sign Out"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#1d1d1f',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#cccccc',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,69,58,0.1)';
            e.currentTarget.style.borderColor = 'rgba(255,69,58,0.3)';
            e.currentTarget.style.color = '#ff453a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#1d1d1f';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = '#cccccc';
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
};
