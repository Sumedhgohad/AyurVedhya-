import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FolderKanban, Users, ShieldAlert,
  FileCheck, HardDrive, History, Share2, Wifi,
} from 'lucide-react';
import {
  FONT_STACK, CANVAS, HAIRLINE, INK, INK_48, MUTED_DARK,
  PRIMARY, DANGER, SUCCESS,
} from '../../design';

const NAV = [
  { label: 'Overview & KPIs',           path: '/dashboard',       icon: LayoutDashboard, roles: ['ROLE_INVESTIGATOR','ROLE_COMPLIANCE_OFFICER','ROLE_LEADERSHIP'] },
  { label: 'Trial Setup',                path: '/studies',         icon: FolderKanban,    roles: ['ROLE_INVESTIGATOR','ROLE_COMPLIANCE_OFFICER','ROLE_LEADERSHIP'] },
  { label: 'Subject Registration',    path: '/participants',    icon: Users,           roles: ['ROLE_INVESTIGATOR','ROLE_LEADERSHIP'] },
  { label: 'SAE Safety Center',         path: '/safety',          icon: ShieldAlert,     roles: ['ROLE_INVESTIGATOR','ROLE_COMPLIANCE_OFFICER','ROLE_LEADERSHIP']},
  { label: 'Ethics (IEC) & CTRI',       path: '/ethics-ctri',     icon: FileCheck,       roles: ['ROLE_COMPLIANCE_OFFICER','ROLE_LEADERSHIP'] },
  { label: 'Document Vault',   path: '/documents',       icon: HardDrive,       roles: ['ROLE_INVESTIGATOR','ROLE_COMPLIANCE_OFFICER','ROLE_LEADERSHIP'] },
  { label: 'Audit Explorer',     path: '/audit-trail',     icon: History,         roles: ['ROLE_COMPLIANCE_OFFICER','ROLE_LEADERSHIP'] },
  { label: 'FHIR & CDISC Export',       path: '/interoperability',icon: Share2,          roles: ['ROLE_INVESTIGATOR','ROLE_COMPLIANCE_OFFICER','ROLE_LEADERSHIP'] },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role;
  const filtered = NAV.filter(item => role && item.roles.includes(role));

  return (
    <aside style={{
      width: 248,
      minHeight: 'calc(100vh - 44px)',
      position: 'sticky', top: 44,
      background: CANVAS,
      borderRight: `1px solid ${HAIRLINE}`,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 12px 20px',
      flexShrink: 0,
      fontFamily: FONT_STACK,
    }}>

      <div>
        {/* Section overline label */}
        <p style={{
          fontSize: 10, fontWeight: 600, color: INK_48,
          textTransform: 'uppercase', letterSpacing: '0.10em',
          padding: '0 10px', margin: '0 0 10px',
        }}>
          Navigation
        </p>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px', borderRadius: 9999,
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                letterSpacing: '-0.12px',
                color: isActive ? '#ffffff' : INK,
                background: isActive ? PRIMARY : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.12s ease',
              })}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                if (!el.style.background.includes('0066cc')) {
                  el.style.background = 'rgba(0,102,204,0.06)';
                  el.style.color = PRIMARY;
                }
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                if (!el.style.background.includes('0066cc')) {
                  el.style.background = 'transparent';
                  el.style.color = INK;
                }
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <item.icon size={14} style={{ flexShrink: 0 }} />
                <span style={{ lineHeight: 1.3 }}>{item.label}</span>
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* System status card — parchment bg per verge.md footer */}
      <div style={{
        background: '#f5f5f7',
        border: `1px solid ${HAIRLINE}`,
        borderRadius: 14, padding: '12px 14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: SUCCESS, display: 'inline-block',
          }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: SUCCESS, letterSpacing: '-0.12px' }}>
            Gateway Connected
          </span>
        </div>
        <p style={{ fontSize: 11, color: INK_48, letterSpacing: '-0.08px', margin: 0 }}>
          4 Isolated DBs · Redis Bus Active
        </p>
      </div>
    </aside>
  );
};
