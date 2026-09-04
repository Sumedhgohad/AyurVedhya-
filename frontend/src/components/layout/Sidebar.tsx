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

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role;

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

  const filteredNav = navItems.filter((item) => role && item.roles.includes(role));

  return (
    <aside className="w-64 bg-[#1d1d1f] border-r border-white/10 flex flex-col justify-between p-4 min-h-[calc(100vh-3.5rem)] sticky top-14">
      <div className="space-y-6">
        <div className="px-3 py-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7a7a7a]">
            Navigation Module
          </span>
        </div>

        <nav className="space-y-1.5">
          {filteredNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-normal transition-all active:scale-95 ${
                  isActive
                    ? 'bg-[#0066cc] text-white font-medium shadow-md shadow-[#0066cc]/20'
                    : 'text-[#cccccc] hover:text-white hover:bg-white/5'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                <span className="tracking-tight">{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-[#ff453a] text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="bg-[#000000] p-3.5 rounded-[18px] border border-white/10 text-[11px] space-y-1">
        <div className="flex items-center gap-2 text-[#34c759] font-medium">
          <div className="w-2 h-2 rounded-full bg-[#34c759] animate-ping" />
          Gateway Connected
        </div>
        <p className="text-[#7a7a7a] text-[10px]">4 Isolated DBs | Redis Bus Active</p>
      </div>
    </aside>
  );
};
