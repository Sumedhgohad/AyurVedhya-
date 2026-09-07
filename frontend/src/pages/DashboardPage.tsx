import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { InvestigatorDashboard } from '../components/InvestigatorDashboard';
import { ComplianceDashboard } from '../components/ComplianceDashboard';
import { LeadershipDashboard } from '../components/LeadershipDashboard';
import { Study, SaeClock } from '../types';
import { DEFAULT_AIIA_STUDIES } from '../types/defaultStudies';
import { INK, INK_48, PRIMARY, TYPE } from '../design';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [studies,      setStudies]      = useState<Study[]>(DEFAULT_AIIA_STUDIES);
  const [saeClocks,    setSaeClocks]    = useState<SaeClock[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [allAes,       setAllAes]       = useState<any[]>([]);
  const [deviations,   setDeviations]   = useState<any[]>([]);

  // Single fetch, no polling interval — Leadership dashboard has its own refresh button
  const loadData = useCallback(async () => {
    try {
      const [sRes, saeRes] = await Promise.all([
        api.get('/study/list'),
        api.get('/safety/sae/active-clocks'),
      ]);
      if (Array.isArray(sRes.data) && sRes.data.length > 0) setStudies(sRes.data);
      if (Array.isArray(saeRes.data) && saeRes.data.length > 0) setSaeClocks(saeRes.data);

      const activeStudy = (Array.isArray(sRes.data) && sRes.data[0]) || DEFAULT_AIIA_STUDIES[0];
      if (activeStudy?.id) {
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
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8e4',
        borderRadius: 16,
        padding: '24px 28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03), 0 4px 14px rgba(23,59,42,0.02)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: PRIMARY,
              background: 'rgba(27,110,78,0.10)',
              border: '1px solid rgba(27,110,78,0.22)',
              padding: '2px 10px', borderRadius: 9999,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              AIIA Clinical Operations
            </span>
            <span style={{ fontSize: 12, color: INK_48 }}>· GCP &amp; NDCT 2019 Active</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: INK, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Welcome, {user?.fullName}
          </h1>
          <p style={{ fontSize: 13, color: INK_48, margin: 0 }}>
            Unified research management, trial oversight, and safety reporting workspace.
          </p>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#f8faf9', border: '1px solid #e2e8e4',
          borderRadius: 12, padding: '10px 16px',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#15803d', display: 'inline-block' }} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: INK_48, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Current Persona
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>
              {user?.roleDisplayName}
            </div>
          </div>
        </div>
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
        <LeadershipDashboard
          studies={studies}
          saeClocks={saeClocks}
          refreshData={loadData}
        />
      )}
    </div>
  );
};
