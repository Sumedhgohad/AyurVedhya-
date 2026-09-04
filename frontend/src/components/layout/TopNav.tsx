import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, LogOut, ShieldCheck, User } from 'lucide-react';

export const TopNav: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-[#000000] border-b border-white/10 px-6 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md bg-black/90">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#0066cc] flex items-center justify-center text-white shadow-sm">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white tracking-[-0.01em]">AyurVedhya CTMS</h2>
            <span className="text-[10px] font-medium text-[#2997ff] bg-[#0066cc]/15 px-2 py-0.5 rounded-full border border-[#0066cc]/30">
              GCP Validated
            </span>
          </div>
          <p className="text-[11px] text-[#7a7a7a] tracking-tight">All India Institute of Ayurveda | Ministry of Ayush</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User Badge */}
        <div className="flex items-center gap-3 bg-[#1d1d1f] border border-white/10 px-3 py-1.5 rounded-full">
          <div className="w-6 h-6 rounded-full bg-[#0066cc] font-semibold text-[11px] text-white flex items-center justify-center">
            {user?.avatarLetter || 'U'}
          </div>
          <div className="text-left">
            <span className="block text-xs font-semibold text-white tracking-tight">{user?.fullName}</span>
            <span className="block text-[10px] font-medium text-[#2997ff]">{user?.roleDisplayName}</span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 bg-[#1d1d1f] hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-[#cccccc] hover:text-red-400 rounded-full transition-all active:scale-95"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
