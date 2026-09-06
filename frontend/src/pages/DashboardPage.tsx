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
  const [studies,      setStudies]      = useState<Study[]>([]);
  const [saeClocks,    setSaeClocks]    = useState<SaeClock[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [allAes,       setAllAes]       = useState<any[]>([]);
  const [deviations,   setDeviations]   = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [sRes, saeRes] = await Promise.all([
        api.get('/study/list'),
        api.get('/safety/sae/active-clocks'),
      ]);
      setStudies(sRes.data);
      setSaeClocks(saeRes.data);

      const activeStudy = sRes.data[0];
      if (activeStudy?.id) {
        // Fetch supporting data for compliance dashboard — degrade gracefully
        const [pRes, aeRes, devRes] = await Promise.allSettled([
          api.get(`/clinical/participants/study/${activeStudy.id}`),
          api.get(`/safety/ae/study/${activeStudy.id}`),
          api.get(`/clinical/deviations/study/${activeStudy.id}`),
        ]);
        setParticipants(pRes.status === 'fulfilled' && Array.isArray(pRes.value.data) ? pRes.value.data : []);
        setAllAes(aeRes.status === 'fulfilled' && Array.isArray(aeRes.value.data) ? aeRes.value.data : []);
        setDeviations(devRes.status === 'fulfilled' && Array.isArray(devRes.value.data) ? devRes.value.data : []);
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
        <ComplianceDashboard
          studies={studies}
          saeClocks={saeClocks}
          allAes={allAes}
          deviations={deviations}
          refreshData={loadData}
        />
      )}
      {user?.role === 'ROLE_LEADERSHIP' && (
        <LeadershipDashboard studies={studies} />
      )}
    </div>
  );
};
