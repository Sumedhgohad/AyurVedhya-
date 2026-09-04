import React from 'react';
import { UserRole } from '../types';

interface Props {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
}

export const Header: React.FC<Props> = ({ activeRole, setActiveRole }) => {
  return (
    <header style={{ background: '#000000', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      className="sticky top-0 z-50 px-6 h-11 flex items-center justify-between">
      {/* Logo + Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#0066cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-white font-semibold" style={{ fontSize: 14, letterSpacing: '-0.12px' }}>AyurVedhya CTMS</span>
          <span style={{ fontSize: 11, color: '#0066cc', background: 'rgba(0,102,204,0.12)', border: '1px solid rgba(0,102,204,0.3)', padding: '1px 7px', borderRadius: 9999 }}>AIIA · Ministry of Ayush</span>
        </div>
      </div>

      {/* Role Switcher — pill style per verge.md */}
      <nav className="flex items-center gap-1" style={{ background: '#1d1d1f', padding: '3px', borderRadius: 9999 }}>
        {([
          { role: 'ROLE_INVESTIGATOR' as UserRole, label: 'Investigator (PI)' },
          { role: 'ROLE_COMPLIANCE_OFFICER' as UserRole, label: 'Compliance & Safety' },
          { role: 'ROLE_LEADERSHIP' as UserRole, label: 'AIIA Leadership' },
        ]).map(({ role, label }) => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            style={{
              fontSize: 12,
              fontWeight: activeRole === role ? 600 : 400,
              letterSpacing: '-0.12px',
              padding: '5px 14px',
              borderRadius: 9999,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: activeRole === role ? '#0066cc' : 'transparent',
              color: activeRole === role ? '#ffffff' : '#cccccc',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
};
