import { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ThemeToggleButton } from './components/ThemeToggleButton';
import { UserSession, logout } from './services/authService';

function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [view, setView] = useState<'landing' | 'login'>('landing');
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('app_theme_mode');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('app_theme_mode', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('app_theme_mode', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const handleLogout = () => {
    logout(); // limpia token y tenantId del localStorage
    setUser(null);
    setView('landing');
  };

  const handleRegisterSuccess = (email: string, tenantId: number) => {
    localStorage.setItem('active_tenant_id', tenantId.toString());
    localStorage.setItem('remembered_email', email);
    setView('login');
  };

  return (
    <div className="w-full min-h-[100dvh] overflow-x-hidden">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} isDark={isDark} onToggleTheme={toggleTheme} />
      ) : view === 'landing' ? (
        <LandingPage
          onNavigateToLogin={() => setView('login')}
          onSelectPlan={() => {}}
          onRegisterSuccess={handleRegisterSuccess}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
      ) : (
        <div className="w-full min-h-[100dvh] relative">
          <div className="fixed sm:absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 z-50 flex items-center justify-between pointer-events-none">
            <button
              onClick={() => setView('landing')}
              className="pointer-events-auto px-3.5 py-2 sm:px-4 sm:py-2 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-white/10 rounded-xl text-xs font-semibold text-white transition shadow-lg"
            >
              ← Volver al Inicio
            </button>
            <div className="pointer-events-auto">
              <ThemeToggleButton isDark={isDark} onToggle={toggleTheme} />
            </div>
          </div>
          <Login onLogin={(session) => setUser(session)} />
        </div>
      )}
    </div>
  );
}

export default App;
