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

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onClose }) => {
  const { user } = useAuth();
  const role = user?.role;
  const filtered = NAV.filter(item => role && item.roles.includes(role));

  const sidebarContent = (
    <aside style={{
      width: 252,
      minHeight: 'calc(100vh - 52px)',
      background: CANVAS,
      borderRight: `1px solid ${HAIRLINE}`,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px 14px 18px',
      flexShrink: 0,
      fontFamily: FONT_STACK,
    }}>

      <div>
        {/* Section overline label */}
        <p style={{
          fontSize: 10, fontWeight: 700, color: INK_48,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          padding: '0 10px', margin: '0 0 10px',
        }}>
          Clinical CTMS Modules
        </p>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {filtered.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => { if (onClose) onClose(); }}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 14px', borderRadius: 12,
                fontSize: 13, fontWeight: isActive ? 600 : 500,
                letterSpacing: '-0.01em',
                color: isActive ? '#ffffff' : INK,
                background: isActive ? PRIMARY : 'transparent',
                boxShadow: isActive ? '0 2px 8px rgba(27,110,78,0.25)' : 'none',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              })}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                if (!el.style.background.includes('1b6e4e')) {
                  el.style.background = 'rgba(27,110,78,0.06)';
                  el.style.color = PRIMARY;
                }
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                if (!el.style.background.includes('1b6e4e')) {
                  el.style.background = 'transparent';
                  el.style.color = INK;
                }
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <item.icon size={15} style={{ flexShrink: 0 }} />
                <span style={{ lineHeight: 1.3 }}>{item.label}</span>
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* System status card */}
      <div style={{
        background: '#f1f5f3',
        border: `1px solid ${HAIRLINE}`,
        borderRadius: 14, padding: '12px 14px',
        marginTop: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: SUCCESS, display: 'inline-block',
            boxShadow: '0 0 6px rgba(21,128,61,0.4)',
          }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: SUCCESS, letterSpacing: '-0.01em' }}>
            Gateway Connected
          </span>
        </div>
        <p style={{ fontSize: 11, color: INK_48, letterSpacing: '-0.005em', margin: 0, lineHeight: 1.3 }}>
          Keycloak IAM · 4 Isolated DBs Active
        </p>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop In-Flow Sidebar */}
      <div className="hidden md:block sticky top-[52px] h-[calc(100vh-52px)] flex-shrink-0 z-30">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          />
          {/* Drawer */}
          <div className="relative z-10 shadow-2xl h-full overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
