import React, { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { UserSession, logout } from './services/authService';

function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [view, setView] = useState<'landing' | 'login'>('landing');

  const handleLogout = () => {
    logout(); // limpia token y tenantId del localStorage
    setUser(null);
    setView('landing');
  };

  const handleRegisterSuccess = (email: string, tenantId: number) => {
    localStorage.setItem('active_tenant_id', tenantId.toString());
    setView('login');
  };

  return (
    <div className="w-screen h-screen overflow-hidden">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : view === 'landing' ? (
        <LandingPage
          onNavigateToLogin={() => setView('login')}
          onSelectPlan={() => {}}
          onRegisterSuccess={handleRegisterSuccess}
        />
      ) : (
        <div className="w-full h-full relative">
          <button
            onClick={() => setView('landing')}
            className="absolute top-6 left-6 z-50 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            ← Volver al Inicio
          </button>
          <Login onLogin={(session) => setUser(session)} />
        </div>
      )}
    </div>
  );
}

export default App;
