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
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="studies" element={<StudiesPage />} />
            <Route path="participants" element={<ParticipantsPage />} />
            <Route path="safety" element={<SafetyPage />} />
            <Route path="ethics-ctri" element={<EthicsCtriPage />} />
            <Route path="documents" element={<DocumentVaultPage />} />
            <Route path="audit-trail" element={<AuditTrailPage />} />
            <Route path="interoperability" element={<InteroperabilityPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
