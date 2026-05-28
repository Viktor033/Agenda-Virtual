import React, { useState } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { UserSession, logout } from './services/authService';

function App() {
  const [user, setUser] = useState<UserSession | null>(null);

  const handleLogout = () => {
    logout(); // limpia token y tenantId del localStorage
    setUser(null);
  };

  return (
    <div className="w-screen h-screen overflow-hidden">
      {!user ? (
        <Login onLogin={(session) => setUser(session)} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
