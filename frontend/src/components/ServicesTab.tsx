import React from 'react';
import { Service } from '../types';

interface ServicesTabProps {
  services: Service[];
  onOpenAddModal: () => void;
  onEditService: (service: Service) => void;
  onDeleteService: (service: Service) => void; // Modificado: Recibe el objeto entero
  userRole: 'ADMIN' | 'PROFESSIONAL';
}

export const ServicesTab: React.FC<ServicesTabProps> = ({
  services,
  onOpenAddModal,
  onEditService,
  onDeleteService,
  userRole,
}) => {
  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Catálogo de Servicios</h2>
          <p className="text-xs text-slate-500 mt-0.5">Administra los servicios activos, sus duraciones de reserva y sus aranceles</p>
        </div>
        
        <button
          onClick={onOpenAddModal}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm shadow-md hover:bg-indigo-700 hover:shadow-indigo-600/10 transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Agregar Servicio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((ser) => (
          <div key={ser.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-5 relative overflow-hidden group">
            
            {/* Banda decorativa lateral sutil */}
            <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-indigo-600" />

            <div className="pl-2">
              <div className="flex justify-between items-start gap-3">
                <h3 className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors">{ser.name}</h3>
                
                {/* Botones de acción siempre visibles en el prototipo */}
                <div className="flex gap-1.5 shrink-0 select-none">
                  <button
                    onClick={() => onEditService(ser)}
                    className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-600 transition-colors"
                    title="Editar Servicio"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDeleteService(ser)} // Modificado: Pasa el objeto completo directamente
                    className="p-1.5 rounded-lg bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 transition-colors"
                    title="Eliminar Servicio"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 mt-3 text-slate-400">
                <svg className="w-4 h-4 text-slate-400 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-semibold text-slate-500">{ser.durationMinutes} minutos de duración</span>
              </div>
            </div>

            <div className="pl-2 border-t border-slate-100 pt-4 flex items-center justify-between">
              <div>
                <span className="block text-slate-400 text-[9px] uppercase font-bold tracking-wide">Tarifa / Arancel</span>
                <span className="text-lg font-extrabold text-emerald-600">${ser.price.toFixed(2)}</span>
              </div>
              <div className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                ID: {ser.id}
              </div>
            </div>
          </div>
        ))}

        {/* Tarjeta rápida de alta siempre visible en el prototipo */}
        <div
          onClick={onOpenAddModal}
          className="border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all duration-200 group min-h-[180px]"
        >
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-200 text-slate-400 group-hover:text-indigo-600 flex items-center justify-center transition-all duration-200">
            <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h4 className="font-bold text-sm text-slate-700 group-hover:text-indigo-600 transition-colors">Nuevo Servicio</h4>
          <p className="text-xs text-slate-400 max-w-[180px]">Haz clic para agregar un nuevo servicio al catálogo general</p>
        </div>
      </div>
    </div>
  );
};
