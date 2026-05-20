import React from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white w-full max-w-xs rounded-2xl border border-slate-100 shadow-2xl p-6 text-center flex flex-col items-center gap-4 transform transition-all duration-300 scale-100 animate-scale-up select-none">
        
        {/* Ícono de Check Circular Animado Premium */}
        <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/10 animate-bounce mt-2 shrink-0">
          <svg className="w-8 h-8 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Textos */}
        <div className="flex flex-col gap-1.5">
          <h3 className="font-extrabold text-slate-800 text-base">{title}</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed px-2">{message}</p>
        </div>

        {/* Botón de Aceptar */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/10 transition-all duration-200 mt-2"
        >
          Aceptar
        </button>

      </div>
    </div>
  );
};
