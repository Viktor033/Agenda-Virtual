import React from 'react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  tenantName: string;
  themeColor?: string;
  user: {
    email: string;
    name: string;
    role: 'ADMIN' | 'PROFESSIONAL';
  };
  onLogout: () => void;
  isSidebarOpen?: boolean;
  onCloseSidebar?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  tenantName,
  themeColor = 'indigo',
  user,
  onLogout,
  isSidebarOpen = false,
  onCloseSidebar
}) => {
  
  // Generación condicional de ítems del menú lateral según el Rol SaaS del usuario
  const menuItems = user.role === 'ADMIN'
    ? [
        { id: 'saas_billing', label: 'Facturación SaaS', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'saas_users', label: 'Clientes', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { id: 'saas_settings', label: 'Configuración SaaS', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
      ]
    : [
        { id: 'agenda', label: 'Agenda / Turnos', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: 'professionals', label: 'Equipo de Trabajo', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { id: 'services', label: 'Servicios', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
        { id: 'patients', label: 'Pacientes', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { id: 'settings', label: 'Configuración', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
      ];

  // Función para computar las clases de color corporativas según el tema de marca
  const getThemeClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return {
          bg: 'bg-emerald-600',
          shadow: 'shadow-emerald-600/15',
          text: 'text-emerald-400',
          gradient: 'from-emerald-500 to-teal-600 shadow-emerald-500/20',
        };
      case 'violet':
        return {
          bg: 'bg-violet-600',
          shadow: 'shadow-violet-600/15',
          text: 'text-violet-400',
          gradient: 'from-violet-500 to-fuchsia-600 shadow-violet-500/20',
        };
      case 'amber':
        return {
          bg: 'bg-amber-500',
          shadow: 'shadow-amber-500/15',
          text: 'text-amber-400',
          gradient: 'from-amber-500 to-orange-600 shadow-amber-500/20',
        };
      case 'rose':
        return {
          bg: 'bg-rose-500',
          shadow: 'shadow-rose-600/15',
          text: 'text-rose-400',
          gradient: 'from-rose-500 to-pink-600 shadow-rose-500/20',
        };
      case 'indigo':
      default:
        return {
          bg: 'bg-indigo-600',
          shadow: 'shadow-indigo-600/15',
          text: 'text-indigo-400',
          gradient: 'from-indigo-500 to-violet-600 shadow-indigo-500/20',
        };
    }
  };

  const theme = getThemeClasses(themeColor);

  const sidebarContent = (
    <>
      {/* Cabecera Sidebar */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${theme.gradient} flex items-center justify-center font-bold text-lg text-white shadow-md`}>
            {user.role === 'ADMIN' ? 'S' : (tenantName ? tenantName.charAt(0).toUpperCase() : 'A')}
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-white tracking-wide truncate leading-none text-sm">
              {user.role === 'ADMIN' ? 'SaaS Platform' : tenantName}
            </h1>
            <span className={`text-[10px] ${theme.text} font-bold uppercase tracking-wider mt-1 block`}>
              {user.role === 'ADMIN' ? 'Super Admin' : 'Agenda Virtual'}
            </span>
          </div>
        </div>

        {/* Botón de cierre en Móvil */}
        {onCloseSidebar && (
          <button 
            onClick={onCloseSidebar}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white md:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Navegación de Pestañas */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                if (onCloseSidebar) onCloseSidebar();
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? `${theme.bg} text-white shadow-lg ${theme.shadow}`
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <svg
                className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Perfil del Usuario y Cerrar Sesión */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex flex-col gap-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full ${theme.bg} flex items-center justify-center font-bold text-sm text-white shadow-sm shrink-0`}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="text-xs font-semibold text-slate-200 truncate leading-none">{user.name}</h4>
            {user.role === 'ADMIN' && (
              <span className={`text-[8px] px-1.5 py-0.5 rounded-md bg-slate-800/80 ${theme.text} font-bold tracking-wide uppercase border border-slate-700/60 inline-block mt-1`}>
                SaaS Owner
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full py-2.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 hover:border-rose-900/50 text-rose-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 group"
        >
          <svg className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar Sesión
        </button>

        <span className="text-[9px] text-slate-600 font-semibold text-center mt-1 block select-none">
          Desarrollado por <span className="text-slate-500 font-bold hover:text-indigo-400 transition-colors cursor-pointer">VK-Dev-Web</span>
        </span>
      </div>
    </>
  );

  return (
    <>
      {/* 1. BARRA LATERAL PARA ESCRITORIO (md en adelante) */}
      <div className="hidden md:flex w-64 bg-slate-900 text-slate-100 flex-col border-r border-slate-800 shrink-0 h-screen font-sans">
        {sidebarContent}
      </div>

      {/* 2. CAJÓN DESLIZANTE PARA MÓVIL (debajo de md) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 md:hidden font-sans shadow-2xl`}>
        {sidebarContent}
      </div>

      {/* 3. CAPA TRANSLÚCIDA DE BACKDROP PARA MÓVIL */}
      {isSidebarOpen && (
        <div 
          onClick={onCloseSidebar}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden animate-fade-in"
        />
      )}
    </>
  );
};
