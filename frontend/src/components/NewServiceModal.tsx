import React, { useState, useEffect } from 'react';
import { Service } from '../types';

interface NewServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit?: Service | null; // Nuevo prop opcional
  onSubmit: (data: {
    id?: number;
    name: string;
    durationMinutes: number;
    price: number;
  }) => void;
}

export const NewServiceModal: React.FC<NewServiceModalProps> = ({
  isOpen,
  onClose,
  serviceToEdit,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [price, setPrice] = useState<number>(10);

  // Efecto para cargar los datos del servicio a editar cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (serviceToEdit) {
        setName(serviceToEdit.name);
        setDurationMinutes(serviceToEdit.durationMinutes);
        setPrice(serviceToEdit.price);
      } else {
        setName('');
        setDurationMinutes(30);
        setPrice(10);
      }
    }
  }, [isOpen, serviceToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || durationMinutes <= 0 || price < 0) return;

    onSubmit({
      id: serviceToEdit ? serviceToEdit.id : undefined,
      name,
      durationMinutes,
      price,
    });

    setName('');
    setDurationMinutes(30);
    setPrice(10);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300 scale-100 font-sans">
        
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {serviceToEdit ? 'Editar Servicio' : 'Registrar Servicio'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {serviceToEdit ? 'Actualiza los datos del servicio seleccionado' : 'Agrega una nueva opción al catálogo de servicios'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Nombre del Servicio</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej. Consulta General Especializada"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Duración (Minutos)</label>
              <input
                type="number"
                required
                min={5}
                max={480}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Precio ($)</label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-4 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 shadow-md hover:shadow-indigo-500/10 transition-all"
            >
              {serviceToEdit ? 'Actualizar Servicio' : 'Guardar Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
