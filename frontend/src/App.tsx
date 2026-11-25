import { useState } from 'react';
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

  const handleRegisterSuccess = (_email: string, tenantId: number) => {
    localStorage.setItem('active_tenant_id', tenantId.toString());
    setView('login');
  };

  return (
    <div className="w-full min-h-[100dvh] overflow-x-hidden">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : view === 'landing' ? (
        <LandingPage
          onNavigateToLogin={() => setView('login')}
          onSelectPlan={() => {}}
          onRegisterSuccess={handleRegisterSuccess}
        />
      ) : (
        <div className="w-full min-h-[100dvh] relative">
          <button
            onClick={() => setView('landing')}
            className="fixed sm:absolute top-4 left-4 sm:top-6 sm:left-6 z-50 px-3.5 py-2 sm:px-4 sm:py-2 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-white/10 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition shadow-lg"
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
