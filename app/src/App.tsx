// Root auth shell + router. Mirrors the prototype's three states (resolving →
// signed-out → signed-in) and routes the four surfaces under one SPA.
import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { Spinner } from './components/ui';
import { Login } from './auth/Login';
import { Launcher } from './apps/Launcher';
import { MaintenanceApp } from './apps/maintenance/MaintenanceApp';
import { ProfileApp } from './apps/profile/ProfileApp';
import { RentApp } from './apps/rent/RentApp';
import { TenantApp } from './apps/tenant/TenantApp';

function useLightTheme() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);
}

function AuthGate() {
  const { status } = useAuth();
  useLightTheme(); // auth + launcher render on the light canvas, like the prototype

  if (status === 'resolving') return <Spinner label="Loading your suite…" />;
  if (status === 'out') return <Login />;

  return (
    <Routes>
      <Route path="/" element={<Launcher />} />
      <Route path="/maintenance" element={<MaintenanceApp />} />
      <Route path="/rent" element={<RentApp />} />
      <Route path="/tenant-bridge" element={<TenantApp />} />
      <Route path="/profile" element={<ProfileApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthGate />
      </BrowserRouter>
    </AuthProvider>
  );
}
