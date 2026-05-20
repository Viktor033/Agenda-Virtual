import React, { useState } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

interface UserSession {
  email: string;
  name: string;
  role: 'ADMIN' | 'PROFESSIONAL';
  professionalId?: number;
}

function App() {
  const [user, setUser] = useState<UserSession | null>(null);

  return (
    <div className="w-screen h-screen overflow-hidden">
      {!user ? (
        <Login onLogin={(session) => setUser(session)} />
      ) : (
        <Dashboard user={user} onLogout={() => setUser(null)} />
      )}
    </div>
  );
}

export default App;
