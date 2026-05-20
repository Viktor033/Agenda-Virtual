import React from 'react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  description?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  description = 'Esta acción es destructiva y no se puede deshacer. ¿Realmente deseas continuar?',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white w-full max-w-sm rounded-2xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300 scale-100">
        
        {/* Cabecera / Área del Ícono de Alerta */}
        <div className="p-6 pb-2 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mb-4 animate-pulse">
            <svg className="w-6 h-6 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h3 className="text-base font-bold text-slate-800 leading-snug">{title}</h3>
          
          <div className="mt-3 px-2 py-1.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-700 w-full truncate">
            {itemName}
          </div>

          <p className="text-xs text-slate-500 mt-3 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Botonera de Confirmación */}
        <div className="p-5 bg-slate-50/50 border-t border-slate-100 mt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 text-slate-600 bg-white rounded-xl font-semibold text-xs hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl font-semibold text-xs hover:bg-rose-700 shadow-md hover:shadow-rose-600/10 transition-all"
          >
            Confirmar Eliminar
          </button>
        </div>

      </div>
    </div>
  );
};
