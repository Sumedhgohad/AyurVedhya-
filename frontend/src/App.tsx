import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { StudiesPage } from './pages/StudiesPage';
import { ParticipantsPage } from './pages/ParticipantsPage';
import { SafetyPage } from './pages/SafetyPage';
import { EthicsCtriPage } from './pages/EthicsCtriPage';
import { DocumentVaultPage } from './pages/DocumentVaultPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { InteroperabilityPage } from './pages/InteroperabilityPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage initialMode="login" />} />
          <Route path="/signup" element={<LoginPage initialMode="signup" />} />

          {/* Authenticated Application Shell */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/studies" element={<StudiesPage />} />
            <Route path="/participants" element={<ParticipantsPage />} />
            <Route path="/safety" element={<SafetyPage />} />
            <Route path="/ethics-ctri" element={<EthicsCtriPage />} />
            <Route path="/documents" element={<DocumentVaultPage />} />
            <Route path="/audit-trail" element={<AuditTrailPage />} />
            <Route path="/interoperability" element={<InteroperabilityPage />} />

            {/* Subpaths for compatibility if accessed via /dashboard/* */}
            <Route path="/dashboard/studies" element={<Navigate to="/studies" replace />} />
            <Route path="/dashboard/participants" element={<Navigate to="/participants" replace />} />
            <Route path="/dashboard/safety" element={<Navigate to="/safety" replace />} />
            <Route path="/dashboard/ethics-ctri" element={<Navigate to="/ethics-ctri" replace />} />
            <Route path="/dashboard/documents" element={<Navigate to="/documents" replace />} />
            <Route path="/dashboard/audit-trail" element={<Navigate to="/audit-trail" replace />} />
            <Route path="/dashboard/interoperability" element={<Navigate to="/interoperability" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
