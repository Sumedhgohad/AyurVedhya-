import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  ShieldAlert,
  FileCheck,
  HardDrive,
  History,
  Share2,
} from 'lucide-react';

const navItems = [
  {
    label: 'Overview & KPIs',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ROLE_INVESTIGATOR', 'ROLE_COMPLIANCE_OFFICER', 'ROLE_LEADERSHIP'],
  },
  {
    label: 'Trial Protocols & Batches',
    path: '/studies',
    icon: FolderKanban,
    roles: ['ROLE_INVESTIGATOR', 'ROLE_COMPLIANCE_OFFICER', 'ROLE_LEADERSHIP'],
  },
  {
    label: 'Patients & Hybrid CRFs',
    path: '/participants',
    icon: Users,
    roles: ['ROLE_INVESTIGATOR', 'ROLE_LEADERSHIP'],
  },
  {
    label: '24h SAE Safety Center',
    path: '/safety',
    icon: ShieldAlert,
    roles: ['ROLE_INVESTIGATOR', 'ROLE_COMPLIANCE_OFFICER', 'ROLE_LEADERSHIP'],
    badge: 'NDCT 24h',
    badgeDanger: true,
  },
  {
    label: 'Ethics (IEC) & CTRI',
    path: '/ethics-ctri',
    icon: FileCheck,
    roles: ['ROLE_COMPLIANCE_OFFICER', 'ROLE_LEADERSHIP'],
  },
  {
    label: 'Document Vault & Hashes',
    path: '/documents',
    icon: HardDrive,
    roles: ['ROLE_INVESTIGATOR', 'ROLE_COMPLIANCE_OFFICER', 'ROLE_LEADERSHIP'],
  },
  {
    label: 'ALCOA+ Audit Explorer',
    path: '/audit-trail',
    icon: History,
    roles: ['ROLE_COMPLIANCE_OFFICER', 'ROLE_LEADERSHIP'],
  },
  {
    label: 'FHIR & CDISC Export',
    path: '/interoperability',
    icon: Share2,
    roles: ['ROLE_INVESTIGATOR', 'ROLE_COMPLIANCE_OFFICER', 'ROLE_LEADERSHIP'],
  },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role;
  const filtered = navItems.filter((item) => role && item.roles.includes(role));

  return (
    <aside
      style={{
        width: 240,
        minHeight: 'calc(100vh - 44px)',
        position: 'sticky',
        top: 44,
        background: '#000000',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 12px',
        flexShrink: 0,
      }}
    >
      <div>
        {/* Section label */}
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#7a7a7a',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '0 10px',
            marginBottom: 12,
          }}
        >
          Navigation
        </p>

        {/* Nav links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                letterSpacing: '-0.12px',
                color: isActive ? '#ffffff' : '#cccccc',
                background: isActive ? '#0066cc' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.12s ease',
              })}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                if (!el.style.background.includes('0066cc')) {
                  el.style.background = 'rgba(255,255,255,0.05)';
                  el.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                if (!el.style.background.includes('0066cc')) {
                  el.style.background = 'transparent';
                  el.style.color = '#cccccc';
                }
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <item.icon size={14} style={{ flexShrink: 0 }} />
                <span style={{ lineHeight: 1.2 }}>{item.label}</span>
              </span>
              {item.badge && (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: '#ffffff',
                    background: '#ff453a',
                    padding: '2px 7px',
                    borderRadius: 9999,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
                    flexShrink: 0,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* System status footer */}
      <div
        style={{
          background: '#0d0d0d',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14,
          padding: '12px 14px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#34c759',
              display: 'inline-block',
              boxShadow: '0 0 0 2px rgba(52,199,89,0.25)',
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#34c759',
              letterSpacing: '-0.12px',
            }}
          >
            Gateway Connected
          </span>
        </div>
        <p
          style={{
            fontSize: 11,
            color: '#7a7a7a',
            letterSpacing: '-0.08px',
            margin: 0,
          }}
        >
          4 Isolated DBs · Redis Bus Active
        </p>
      </div>
    </aside>
  );
};
