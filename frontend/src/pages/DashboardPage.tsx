import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { InvestigatorDashboard } from '../components/InvestigatorDashboard';
import { ComplianceDashboard } from '../components/ComplianceDashboard';
import { LeadershipDashboard } from '../components/LeadershipDashboard';
import { Study, SaeClock } from '../types';
import { INK, INK_48, PRIMARY, TYPE } from '../design';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [studies, setStudies]         = useState<Study[]>([]);
  const [saeClocks, setSaeClocks]     = useState<SaeClock[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [sRes, saeRes] = await Promise.all([
        api.get('/study/list'),
        api.get('/safety/sae/active-clocks'),
      ]);
      setStudies(sRes.data);
      setSaeClocks(saeRes.data);

      // Fetch real participant count for the active study
      const activeStudy = sRes.data[0];
      if (activeStudy?.id) {
        try {
          const pRes = await api.get(`/clinical/participants/study/${activeStudy.id}`);
          setParticipants(Array.isArray(pRes.data) ? pRes.data : []);
        } catch {
          // endpoint may not exist yet — degrade gracefully
          setParticipants([]);
        }
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    loadData();
    const t = setInterval(loadData, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page title */}
      <div>
        <h1 style={{ ...TYPE.displayMd, color: INK, margin: '0 0 6px', fontFamily: "'SF Pro Display','Inter',system-ui,sans-serif" }}>
          Welcome, {user?.fullName}
        </h1>
        <p style={{ ...TYPE.caption, color: INK_48, margin: 0 }}>
          Active Role Persona:{' '}
          <strong style={{ color: PRIMARY, fontWeight: 600 }}>{user?.roleDisplayName}</strong>
        </p>
      </div>

      {user?.role === 'ROLE_INVESTIGATOR' && (
        <InvestigatorDashboard
          studies={studies}
          participants={participants}
          saeClocks={saeClocks}
          refreshData={loadData}
        />
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
