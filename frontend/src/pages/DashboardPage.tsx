import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { InvestigatorDashboard } from '../components/InvestigatorDashboard';
import { ComplianceDashboard } from '../components/ComplianceDashboard';
import { LeadershipDashboard } from '../components/LeadershipDashboard';
import { Study, SaeClock } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [studies, setStudies] = useState<Study[]>([]);
  const [saeClocks, setSaeClocks] = useState<SaeClock[]>([]);

  const loadData = async () => {
    try {
      const [sRes, saeRes] = await Promise.all([
        api.get('/study/list'),
        api.get('/safety/sae/active-clocks'),
      ]);
      setStudies(sRes.data);
      setSaeClocks(saeRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-[-0.02em]">
          Welcome, {user?.fullName}
        </h1>
        <p className="text-xs text-[#7a7a7a] mt-1">
          Active Role Persona: <strong className="text-[#2997ff]">{user?.roleDisplayName}</strong>
        </p>
      </div>

      {user?.role === 'ROLE_INVESTIGATOR' && (
        <InvestigatorDashboard studies={studies} refreshData={loadData} />
      )}
      {user?.role === 'ROLE_COMPLIANCE_OFFICER' && (
        <ComplianceDashboard studies={studies} saeClocks={saeClocks} refreshData={loadData} />
      )}
      {user?.role === 'ROLE_LEADERSHIP' && (
        <LeadershipDashboard studies={studies} />
      )}
    </div>
  );
};
