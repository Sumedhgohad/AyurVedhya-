import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, Shield, Users, Building2, Lock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
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
    <div className="min-h-screen bg-[#000000] text-white flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      {/* Background Soft Glow - verge.md minimal drop glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0066cc]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Tile Card */}
      <div className="w-full max-w-md bg-[#1d1d1f] border border-white/10 rounded-[18px] p-8 shadow-2xl relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-[#0066cc] rounded-full text-white shadow-lg shadow-[#0066cc]/30 mb-2">
            <Activity className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white">AyurVedhya CTMS</h1>
          <p className="text-xs text-[#7a7a7a]">All India Institute of Ayurveda | Ministry of Ayush</p>
          <div className="inline-block bg-[#000000] border border-white/10 text-[11px] text-[#2997ff] px-3 py-1 rounded-full font-medium mt-1">
            GCP & NDCT 2019 Regulatory Portal
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-[11px] text-xs text-[#ff453a] font-medium text-center">
            {error}
          </div>
        )}

        {/* Manual Credentials Form */}
        <form onSubmit={handleManualLogin} className="mt-6 space-y-4 text-xs">
          <div>
            <label className="block text-[#7a7a7a] font-medium mb-1.5 uppercase text-[10px] tracking-wider">Official Ayush Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. investigator@aiia.gov.in"
              className="w-full bg-[#000000] border border-white/10 rounded-[11px] px-4 py-3 text-white placeholder-[#7a7a7a] focus:outline-none focus:border-[#0066cc] transition-colors text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-[#7a7a7a] font-medium mb-1.5 uppercase text-[10px] tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#000000] border border-white/10 rounded-[11px] px-4 py-3 text-white placeholder-[#7a7a7a] focus:outline-none focus:border-[#0066cc] transition-colors text-sm"
              required
            />
          </div>

          {/* Primary Action Blue Pill Button per verge.md */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0066cc] hover:bg-[#0052a3] text-white font-normal py-3.5 rounded-full transition-all shadow-lg shadow-[#0066cc]/25 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 text-sm"
          >
            <Lock className="w-4 h-4" />
            {loading ? 'Authenticating...' : 'Sign In via Keycloak IAM'}
          </button>
        </form>

        {/* Quick Persona Access for Judges / Evaluation */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#7a7a7a] text-center mb-3">
            Quick Persona Login (Evaluation Mode)
          </span>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuick('PI')}
              className="p-3 bg-[#000000] hover:bg-white/5 border border-white/10 hover:border-[#2997ff]/50 rounded-[14px] text-center group transition-all active:scale-95"
            >
              <Users className="w-4 h-4 text-[#2997ff] mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="block text-[11px] font-medium text-[#cccccc]">Investigator</span>
            </button>

            <button
              onClick={() => handleQuick('SAFETY')}
              className="p-3 bg-[#000000] hover:bg-white/5 border border-white/10 hover:border-purple-500/50 rounded-[14px] text-center group transition-all active:scale-95"
            >
              <Shield className="w-4 h-4 text-[#bf5af2] mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="block text-[11px] font-medium text-[#cccccc]">Safety / IEC</span>
            </button>

            <button
              onClick={() => handleQuick('DIRECTOR')}
              className="p-3 bg-[#000000] hover:bg-white/5 border border-white/10 hover:border-[#34c759]/50 rounded-[14px] text-center group transition-all active:scale-95"
            >
              <Building2 className="w-4 h-4 text-[#34c759] mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="block text-[11px] font-medium text-[#cccccc]">Leadership</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
