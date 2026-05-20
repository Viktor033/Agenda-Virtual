import React from 'react';
import { Patient } from '../types';

interface PatientsTabProps {
  patients: Patient[];
  onOpenAddModal: () => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patient: Patient) => void; // Modificado: Recibe el objeto entero
}

export const PatientsTab: React.FC<PatientsTabProps> = ({
  patients,
  onOpenAddModal,
  onEditPatient,
  onDeletePatient,
}) => {
  // Función para obtener iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Función para obtener un gradiente decorativo basado en la primera letra del nombre
  const getGradientByName = (name: string) => {
    const charCode = name.charCodeAt(0) || 65;
    const gradients = [
      'from-indigo-500 to-indigo-600',
      'from-emerald-500 to-emerald-600',
      'from-violet-500 to-violet-600',
      'from-amber-500 to-amber-600',
      'from-rose-500 to-rose-600',
    ];
    return gradients[charCode % gradients.length];
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Ficheros de Pacientes / Clientes</h2>
          <p className="text-xs text-slate-500 mt-0.5">Administra el listado de pacientes registrados, sus correos y teléfonos de contacto</p>
        </div>
        
        <button
          onClick={onOpenAddModal}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm shadow-md hover:bg-indigo-700 hover:shadow-indigo-600/10 transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Agregar Paciente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((pat) => (
          <div key={pat.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4 relative overflow-hidden group">
            
            {/* Círculo con Iniciales del Paciente */}
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${getGradientByName(pat.name)} flex items-center justify-center font-extrabold text-sm text-white shrink-0 shadow-md`}>
              {getInitials(pat.name)}
            </div>

            {/* Ficha descriptiva */}
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-start gap-1">
                <h3 className="font-bold text-slate-800 text-sm truncate group-hover:text-indigo-600 transition-colors pr-12">{pat.name}</h3>
                
                {/* Botonera de acciones rápidas */}
                <div className="absolute top-5 right-5 flex gap-1 bg-white/80 p-0.5 rounded-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-sm select-none">
                  <button
                    onClick={() => onEditPatient(pat)}
                    className="p-1 rounded hover:bg-slate-100 text-indigo-600 transition-colors"
                    title="Editar Ficha"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDeletePatient(pat)} // Modificado: Pasa el objeto completo directamente
                    className="p-1 rounded hover:bg-slate-100 text-rose-600 transition-colors"
                    title="Eliminar Paciente"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col gap-0.5 mt-2 text-slate-500 text-[11px] font-medium">
                <span className="truncate flex items-center gap-1">
                  <span className="text-slate-400">📧</span> {pat.email}
                </span>
                <span className="truncate flex items-center gap-1">
                  <span className="text-slate-400">📞</span> {pat.phone}
                </span>
              </div>
            </div>

          </div>
        ))}

        {/* Tarjeta de invitación rápida para nuevos pacientes */}
        <div
          onClick={onOpenAddModal}
          className="border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all duration-200 group min-h-[96px]"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-200 text-slate-400 group-hover:text-indigo-600 flex items-center justify-center transition-all duration-200">
            <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h4 className="font-bold text-sm text-slate-700 group-hover:text-indigo-600 transition-colors">Nuevo Paciente</h4>
        </div>
      </div>
    </div>
  );
};
