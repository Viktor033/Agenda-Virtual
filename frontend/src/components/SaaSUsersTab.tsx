import React from 'react';
import { Professional } from '../types';

const getRubroBadge = (rubro: string | undefined, specialty: string) => {
  const normalized = rubro?.toLowerCase().trim() || specialty?.toLowerCase().trim() || 'medicina';
  
  if (normalized.includes('medicina')) {
    return {
      text: rubro || 'Medicina',
      emoji: '🩺',
      classes: 'bg-blue-50 text-blue-700 border-blue-150',
    };
  }
  if (normalized.includes('veterinaria')) {
    return {
      text: rubro || 'Veterinaria',
      emoji: '🐾',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-150',
    };
  }
  if (normalized.includes('peluquería') || normalized.includes('peluqueria')) {
    return {
      text: rubro || 'Peluquería',
      emoji: '✂️',
      classes: 'bg-purple-50 text-purple-700 border-purple-150',
    };
  }
  if (normalized.includes('barbería') || normalized.includes('barberia')) {
    return {
      text: rubro || 'Barbería',
      emoji: '💈',
      classes: 'bg-amber-50 text-amber-700 border-amber-150',
    };
  }
  return {
    text: rubro || specialty || 'Otro',
    emoji: '🏷️',
    classes: 'bg-slate-50 text-slate-700 border-slate-200',
  };
};

interface SaaSUsersTabProps {
  users: Professional[];
  onOpenAddModal: () => void;
  onEditUser: (user: Professional) => void;
  onDeleteUser: (user: Professional) => void;
}

export const SaaSUsersTab: React.FC<SaaSUsersTabProps> = ({
  users,
  onOpenAddModal,
  onEditUser,
  onDeleteUser,
}) => {
  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      
      {/* Cabecera */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800">Gestión de Clientes (SaaS)</h2>
          <p className="text-xs text-slate-500 mt-0.5">Agrega, edita y configura los clientes (consultorios/profesionales) activos que usan el sistema</p>
        </div>
        
        <button
          onClick={onOpenAddModal}
          className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Registrar Cliente
        </button>
      </div>

      {/* Grilla de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u) => {
          let accentBg = 'bg-indigo-500';
          if (u.color === 'emerald') accentBg = 'bg-emerald-500';
          if (u.color === 'violet') accentBg = 'bg-violet-500';
          if (u.color === 'amber') accentBg = 'bg-amber-500';
          if (u.color === 'rose') accentBg = 'bg-rose-500';

          const isActive = u.status !== 'suspended';

          return (
            <div key={u.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-5 relative overflow-hidden group">
              
              {/* Línea decorativa del color de la agenda del cliente */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${accentBg}`} />

              {/* Botones de acción flotantes en hover */}
              <div className="absolute top-4 right-4 flex gap-1 bg-white/90 p-0.5 rounded-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm select-none">
                <button
                  onClick={() => onEditUser(u)}
                  className="p-1 rounded hover:bg-slate-100 text-indigo-600 transition-colors"
                  title="Configurar Cliente"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteUser(u)}
                  className="p-1 rounded hover:bg-slate-100 text-rose-600 transition-colors"
                  title="Dar de Baja Cliente"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Contenido Ficha */}
              <div className="flex items-start gap-4">
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-100 shrink-0"
                />
                <div className="overflow-hidden flex-1">
                  <h3 className="font-bold text-slate-800 text-sm truncate leading-snug group-hover:text-indigo-600 transition-colors pr-14">
                    {u.name}
                  </h3>
                  
                  {/* Badge de Rubro */}
                  {(() => {
                    const badge = getRubroBadge(u.rubro, u.specialty);
                    return (
                      <div className="mt-1">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-bold tracking-wide ${badge.classes}`}>
                          <span>{badge.emoji}</span>
                          <span>{badge.text}</span>
                        </span>
                      </div>
                    );
                  })()}
                  
                  <span className="text-[10px] text-slate-500 font-medium truncate block mt-2.5">
                    📧 {u.email || 'sin-correo@gmail.com'}
                  </span>
                </div>
              </div>

              {/* Pie de la Ficha */}
              <div className="border-t border-slate-50 pt-4 flex items-center justify-between">
                <div>
                  <span className="block text-[8px] uppercase font-bold text-slate-400">Plan contratado</span>
                  <span className="text-xs font-bold text-slate-700">{u.plan || 'Plan Estándar'}</span>
                </div>
                
                {/* Badge de Estado */}
                {isActive ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-bold">
                    ACTIVO
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100 text-[9px] font-bold">
                    SUSPENDIDO
                  </span>
                )}
              </div>

            </div>
          );
        })}

        {/* Tarjeta punteada de invitación */}
        <div
          onClick={onOpenAddModal}
          className="border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all duration-200 group min-h-[140px]"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-slate-100 group-hover:border-slate-200 text-slate-400 flex items-center justify-center transition-all duration-200">
            <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h4 className="font-bold text-xs text-slate-600 transition-colors">Nuevo Cliente / Consultorio</h4>
        </div>
      </div>

    </div>
  );
};
