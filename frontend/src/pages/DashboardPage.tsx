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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page header */}
      <div>
        <h1
          style={{
            fontSize: 34,
            fontWeight: 600,
            color: '#ffffff',
            letterSpacing: '-0.374px',
            lineHeight: 1.1,
            margin: '0 0 6px',
          }}
        >
          Welcome, {user?.fullName}
        </h1>
        <p
          style={{
            fontSize: 14,
            color: '#7a7a7a',
            letterSpacing: '-0.224px',
            margin: 0,
          }}
        >
          Active Role Persona:{' '}
          <strong style={{ color: '#2997ff', fontWeight: 600 }}>
            {user?.roleDisplayName}
          </strong>
        </p>
      </div>

      {/* Role-dispatched dashboard */}
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
