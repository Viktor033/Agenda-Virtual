import React, { useState } from 'react';

interface LoginProps {
  onLogin: (user: {
    email: string;
    name: string;
    role: 'ADMIN' | 'PROFESSIONAL';
    professionalId?: number;
  }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState(() => localStorage.getItem('remembered_email') || '');
  const [password, setPassword] = useState(() => localStorage.getItem('remembered_password') || '');
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('remembered_email'));
  const [showPassword, setShowPassword] = useState(false);
  const [isRecoverMode, setIsRecoverMode] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoverSuccess, setRecoverSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSuccessLogin = (user: {
    email: string;
    name: string;
    role: 'ADMIN' | 'PROFESSIONAL';
    professionalId?: number;
  }) => {
    if (rememberMe) {
      localStorage.setItem('remembered_email', email.trim());
      localStorage.setItem('remembered_password', password);
    } else {
      localStorage.removeItem('remembered_email');
      localStorage.removeItem('remembered_password');
    }
    onLogin(user);
  };

  const handleRecoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRecoverSuccess('');

    if (!recoverEmail) {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }

    const emailLower = recoverEmail.toLowerCase().trim();
    if (!emailLower.includes('@')) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    // Consulta en localStorage o credenciales fijas para mostrar una simulación más real de recuperación
    const savedClients = localStorage.getItem('saas_clients');
    let found = false;
    let simulatedPassword = '';

    if (emailLower === 'admin@gmail.com') {
      found = true;
      simulatedPassword = 'admin';
    } else if (['clara@gmail.com', 'mateo@gmail.com', 'sofia@gmail.com'].includes(emailLower)) {
      found = true;
      simulatedPassword = 'admin';
    } else if (savedClients) {
      try {
        const clientsList = JSON.parse(savedClients);
        const matched = clientsList.find((c: any) => c.email?.toLowerCase().trim() === emailLower);
        if (matched) {
          found = true;
          simulatedPassword = matched.password || 'admin';
        }
      } catch (err) {
        // ignore
      }
    } else if (emailLower.includes('@')) {
      // Cualquier otro correo también lo dejamos pasar como simulación
      found = true;
      simulatedPassword = 'admin';
    }

    if (found) {
      setRecoverSuccess(`¡Enlace enviado! Hemos enviado las instrucciones de recuperación a ${emailLower}. (Simulación: Tu contraseña actual es "${simulatedPassword}")`);
    } else {
      setError('El correo ingresado no se encuentra registrado en el sistema.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    const emailLower = email.toLowerCase().trim();

    // 1. Acceso del Super Administrador del SaaS
    if (emailLower === 'admin@gmail.com' && password === 'admin') {
      handleSuccessLogin({
        email: emailLower,
        name: 'Administrador Global',
        role: 'ADMIN'
      });
      return;
    } 

    // 2. Consulta y validación dinámica de Clientes B2B creados en localStorage
    const savedClients = localStorage.getItem('saas_clients');
    if (savedClients) {
      try {
        const clientsList = JSON.parse(savedClients);
        const matched = clientsList.find((c: any) => c.email?.toLowerCase().trim() === emailLower);
        if (matched) {
          const requiredPassword = matched.password || 'admin';
          if (password === requiredPassword) {
            handleSuccessLogin({
              email: emailLower,
              name: matched.name,
              role: 'PROFESSIONAL',
              professionalId: matched.id
            });
            return;
          } else {
            setError('Contraseña incorrecta.');
            return;
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // 3. Cuentas Fijas de Profesionales Registrados (Fallback)
    if (emailLower === 'clara@gmail.com' && password === 'admin') {
      handleSuccessLogin({
        email: emailLower,
        name: 'Clara Ortega',
        role: 'PROFESSIONAL',
        professionalId: 1
      });
      return;
    } 
    
    if (emailLower === 'mateo@gmail.com' && password === 'admin') {
      handleSuccessLogin({
        email: emailLower,
        name: 'Mateo Ramos',
        role: 'PROFESSIONAL',
        professionalId: 2
      });
      return;
    } 
    
    if (emailLower === 'sofia@gmail.com' && password === 'admin') {
      handleSuccessLogin({
        email: emailLower,
        name: 'Sofia Ortiz',
        role: 'PROFESSIONAL',
        professionalId: 3
      });
      return;
    } 

    // 3. Login Inteligente Dinámico para cualquier otro Profesional creado por el Administrador
    if (emailLower.includes('@') && password === 'admin') {
      // Extrae un nombre amigable del email (ej. "giselle" desde "giselle@gmail.com")
      const rawName = emailLower.split('@')[0];
      const friendlyName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      handleSuccessLogin({
        email: emailLower,
        name: `Dra/Dr. ${friendlyName}`,
        role: 'PROFESSIONAL',
        professionalId: 1 // Asigna la agenda principal para la simulación
      });
      return;
    }

    setError('Credenciales inválidas. Verifica el correo e ingresa la contraseña configurada por el Administrador.');
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden select-none">
      
      {/* Círculos decorativos de fondo con desenfoque */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px] -top-20 -left-20 animate-pulse" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[100px] -bottom-20 -right-20 animate-pulse delay-700" />

      <div className="w-full max-w-md p-8 bg-slate-900/40 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md flex flex-col gap-6 animate-fade-in relative z-10">
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-xl text-white shadow-xl shadow-indigo-500/20">
            S
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-2">SaaS Agenda Multi</h2>
          <p className="text-xs text-slate-400">
            {isRecoverMode ? 'Recuperación de credenciales' : 'Ingreso unificado para Super Admin y Profesionales'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 font-medium">
            {error}
          </div>
        )}

        {recoverSuccess && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-medium animate-fade-in">
            {recoverSuccess}
          </div>
        )}

        {!isRecoverMode ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ej. admin@gmail.com o clara@gmail.com"
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-12 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1 select-none">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  rememberMe
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'border-slate-800 bg-slate-950/50 group-hover:border-slate-700'
                }`}>
                  {rememberMe && (
                    <svg className="w-2.5 h-2.5 stroke-[3.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">Recordar contraseña</span>
              </label>
              
              <button
                type="button"
                onClick={() => {
                  setIsRecoverMode(true);
                  setError('');
                  setRecoverSuccess('');
                }}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-500 active:scale-[0.98] shadow-lg shadow-indigo-600/25 transition-all duration-200 mt-2"
            >
              Iniciar Sesión
            </button>
          </form>
        ) : (
          <form onSubmit={handleRecoverSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Correo Registrado</label>
              <input
                type="email"
                value={recoverEmail}
                onChange={(e) => setRecoverEmail(e.target.value)}
                placeholder="ej. admin@gmail.com o clara@gmail.com"
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-500 active:scale-[0.98] shadow-lg shadow-indigo-600/25 transition-all duration-200 mt-2"
            >
              Enviar Enlace de Recuperación
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRecoverMode(false);
                setError('');
                setRecoverSuccess('');
              }}
              className="w-full py-2.5 bg-slate-950/30 border border-slate-800/80 text-slate-300 rounded-xl font-semibold text-xs hover:bg-slate-900/60 transition-all duration-200 text-center"
            >
              Volver al Inicio de Sesión
            </button>
          </form>
        )}

        <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-center">Credenciales Rápidas:</span>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-medium">
            <div className="p-2 rounded-lg bg-slate-950/20 border border-slate-800/50">
              <span className="text-indigo-400 block font-semibold">Super Admin SaaS</span>
              <span>admin@gmail.com (clave: admin)</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/20 border border-slate-800/50">
              <span className="text-emerald-400 block font-semibold">Profesional Clara</span>
              <span>clara@gmail.com (clave: admin)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer corporativo */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-slate-500 font-semibold select-none z-10">
        &copy; {new Date().getFullYear()} <span className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors cursor-pointer">VK-Dev-Web</span>. Todos los derechos reservados.
      </footer>
    </div>
  );
};
