import React from 'react';
import { Professional } from '../types';

interface ProfessionalsTabProps {
  professionals: Professional[];
  onOpenAddModal: () => void;
  onEditProfessional: (prof: Professional) => void;
  onDeleteProfessional: (prof: Professional) => void;
  userRole: 'ADMIN' | 'PROFESSIONAL';
}

export const ProfessionalsTab: React.FC<ProfessionalsTabProps> = ({
  professionals,
  onOpenAddModal,
  onEditProfessional,
  onDeleteProfessional,
  userRole,
}) => {
  const specialists = professionals.filter(p => p.role !== 'secretary');
  const secretaries = professionals.filter(p => p.role === 'secretary');

  return (
    <div className="flex flex-col gap-8 animate-fade-in font-sans pb-10">
      
      {/* Cabecera Principal */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-800 font-sans">Equipo de Trabajo</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Administra los profesionales médicos y el personal de secretaría activa</p>
        </div>
        
        <button
          onClick={onOpenAddModal}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-xs shadow-md hover:bg-indigo-700 hover:shadow-indigo-600/10 transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Agregar Miembro
        </button>
      </div>

      {/* ========================================== */}
      {/*   SECCIÓN 1: ESPECIALISTAS CON AGENDA      */}
      {/* ========================================== */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <span>🩺 Especialistas & Médicos Activos</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">{specialists.length}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialists.map((prof) => {
            let badgeColorClasses = 'bg-indigo-50 border-indigo-100 text-indigo-600';
            if (prof.color === 'emerald') badgeColorClasses = 'bg-emerald-50 border-emerald-100 text-emerald-600';
            if (prof.color === 'violet') badgeColorClasses = 'bg-violet-50 border-violet-100 text-violet-600';
            if (prof.color === 'amber') badgeColorClasses = 'bg-amber-50 border-amber-100 text-amber-600';
            if (prof.color === 'rose') badgeColorClasses = 'bg-rose-50 border-rose-100 text-rose-600';

            return (
              <div key={prof.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center text-center gap-4 group relative overflow-hidden">
                
                {/* Botones de acción flotantes en hover */}
                <div className="absolute top-4 right-4 flex gap-1 bg-white/95 p-0.5 rounded-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm select-none z-10">
                  <button
                    onClick={() => onEditProfessional(prof)}
                    className="p-1 rounded hover:bg-slate-100 text-indigo-600 transition-colors"
                    title="Modificar Miembro"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDeleteProfessional(prof)}
                    className="p-1 rounded hover:bg-slate-100 text-rose-600 transition-colors"
                    title="Dar de Baja"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Línea de color superior */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                  prof.color === 'emerald' ? 'bg-emerald-500' :
                  prof.color === 'violet' ? 'bg-violet-500' :
                  prof.color === 'amber' ? 'bg-amber-500' :
                  prof.color === 'rose' ? 'bg-rose-500' : 'bg-indigo-500'
                }`} />

                <img
                  src={prof.avatar}
                  alt={prof.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white ring-4 ring-slate-100/50 mt-2 transition-transform duration-200 group-hover:scale-105"
                />

                <div>
                  <h3 className="font-bold text-slate-800 text-base leading-none">{prof.name}</h3>
                  <span className="text-xs text-slate-400 font-medium block mt-1.5">{prof.specialty}</span>
                </div>

                <div className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider ${badgeColorClasses}`}>
                  ID de Agenda: {prof.color}
                </div>

                <div className="w-full border-t border-slate-100 pt-4 mt-2 grid grid-cols-2 text-xs font-semibold text-slate-500">
                  <div className="border-r border-slate-100">
                    <span className="block text-slate-400 text-[10px] uppercase font-bold">Agenda</span>
                    <span className="text-emerald-500 block mt-0.5">Activo</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase font-bold">Horarios</span>
                    <span className="text-slate-700 block mt-0.5">Lunes a Viernes</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Tarjeta rápida de invitación a Especialistas */}
          <div
            onClick={onOpenAddModal}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all duration-200 group min-h-[230px]"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-200 text-slate-400 group-hover:text-indigo-600 flex items-center justify-center transition-all duration-200">
              <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h4 className="font-bold text-xs text-slate-700 group-hover:text-indigo-600 transition-colors">Nuevo Especialista</h4>
            <p className="text-[10px] text-slate-400 max-w-[160px]">Agrega un médico o técnico especialista con turnos</p>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/*   SECCIÓN 2: PERSONAL DE SECRETARÍA        */}
      {/* ========================================== */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <span>💼 Soporte Administrativo & Recepción</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">{secretaries.length}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {secretaries.map((sec) => (
            <div key={sec.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center text-center gap-4 group relative overflow-hidden">
              
              {/* Botones de acción flotantes en hover */}
              <div className="absolute top-4 right-4 flex gap-1 bg-white/95 p-0.5 rounded-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm select-none z-10">
                <button
                  onClick={() => onEditProfessional(sec)}
                  className="p-1 rounded hover:bg-slate-100 text-indigo-600 transition-colors"
                  title="Modificar Miembro"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteProfessional(sec)}
                  className="p-1 rounded hover:bg-slate-100 text-rose-600 transition-colors"
                  title="Dar de Baja"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Línea de color superior administrativo */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-400" />

              <img
                src={sec.avatar}
                alt={sec.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white ring-4 ring-slate-100/50 mt-2 transition-transform duration-200 group-hover:scale-105"
              />

              <div>
                <h3 className="font-bold text-slate-800 text-base leading-none">{sec.name}</h3>
                <span className="text-xs text-slate-400 font-medium block mt-1.5">{sec.specialty}</span>
              </div>

              <div className="px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-500 text-[9px] font-bold uppercase tracking-wider">
                Rol: Secretaría
              </div>

              <div className="w-full border-t border-slate-100 pt-4 mt-2 grid grid-cols-2 text-xs font-semibold text-slate-500">
                <div className="border-r border-slate-100">
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">Estado</span>
                  <span className="text-emerald-500 block mt-0.5">Activo</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">Funciones</span>
                  <span className="text-slate-700 block mt-0.5">Control de Agenda</span>
                </div>
              </div>
            </div>
          ))}

          {secretaries.length === 0 && (
            <div className="col-span-full border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl p-8 text-center text-slate-400 text-xs font-medium">
              💼 Aún no has registrado secretarios/as. Añade asistentes administrativos para gestionar las agendas del equipo.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
