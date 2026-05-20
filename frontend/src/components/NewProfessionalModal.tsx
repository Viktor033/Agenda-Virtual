import React, { useState, useEffect } from 'react';
import { Professional } from '../types';

interface NewProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionalToEdit: Professional | null;
  onSubmit: (data: {
    id?: number;
    name: string;
    specialty: string;
    color: string;
    role: 'specialist' | 'secretary';
    avatar?: string;
  }) => void;
}

export const NewProfessionalModal: React.FC<NewProfessionalModalProps> = ({
  isOpen,
  onClose,
  professionalToEdit,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [color, setColor] = useState('indigo');
  const [role, setRole] = useState<'specialist' | 'secretary'>('specialist');
  const [avatar, setAvatar] = useState<string>(''); // Estado para la imagen en Base64

  // Precargar datos si estamos editando
  useEffect(() => {
    if (professionalToEdit) {
      setName(professionalToEdit.name);
      setSpecialty(professionalToEdit.specialty);
      setColor(professionalToEdit.color);
      setRole(professionalToEdit.role || 'specialist');
      setAvatar(professionalToEdit.avatar || '');
    } else {
      setName('');
      setSpecialty('');
      setColor('indigo');
      setRole('specialist');
      setAvatar('');
    }
  }, [professionalToEdit, isOpen]);

  if (!isOpen) return null;

  // Lector de archivo y conversión a Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string); // guarda el DataURL Base64
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const finalSpecialty = role === 'secretary' && !specialty 
      ? 'Administración & Recepción' 
      : specialty || 'Especialista';

    onSubmit({
      id: professionalToEdit?.id,
      name,
      specialty: finalSpecialty,
      color: role === 'secretary' ? 'slate' : color,
      role,
      avatar: avatar || undefined,
    });
  };

  const colors = [
    { id: 'indigo', label: 'Índigo', bg: 'bg-indigo-500' },
    { id: 'emerald', label: 'Esmeralda', bg: 'bg-emerald-500' },
    { id: 'violet', label: 'Violeta', bg: 'bg-violet-500' },
    { id: 'amber', label: 'Ámbar', bg: 'bg-amber-500' },
    { id: 'rose', label: 'Rosa', bg: 'bg-rose-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300 scale-100">
        
        {/* Cabecera */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {professionalToEdit ? 'Modificar Miembro' : 'Agregar al Equipo'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 animate-pulse-slow">
              {professionalToEdit ? 'Configura la ficha del personal' : 'Suma un profesional o secretario/a a tu consultorio'}
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[500px]">
          
          {/* Carga de Imagen de Perfil (Fidelity UX) */}
          <div className="flex flex-col items-center gap-2 select-none pt-1">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full border-2 border-slate-150 shadow-md overflow-hidden bg-slate-50 flex items-center justify-center transition-all duration-200 group-hover:scale-102">
                {avatar ? (
                  <img src={avatar} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Botón Flotante de Subida */}
              <label 
                htmlFor="professional-avatar-upload" 
                className="absolute bottom-0 right-0 p-1.5 bg-indigo-650 hover:bg-indigo-750 text-white rounded-full shadow-md cursor-pointer transition-all border-2 border-white hover:scale-110 flex items-center justify-center"
                title="Subir foto de perfil"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
              
              <input
                id="professional-avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {avatar ? 'Imagen Cargada ✓' : 'Subir Foto'}
            </span>
          </div>

          {/* Selector de Rol */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">Rol en el Consultorio</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRole('specialist');
                  if (specialty === 'Administración & Recepción') setSpecialty('');
                }}
                className={`py-3 px-4 border rounded-xl font-bold text-xs transition-all flex flex-col items-center gap-1.5 ${
                  role === 'specialist'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 ring-2 ring-indigo-500/25'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🩺 Especialista</span>
                <span className="text-[9px] font-normal text-slate-400">Tiene agenda y turnos</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setRole('secretary');
                  if (!specialty) setSpecialty('Administración & Recepción');
                }}
                className={`py-3 px-4 border rounded-xl font-bold text-xs transition-all flex flex-col items-center gap-1.5 ${
                  role === 'secretary'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 ring-2 ring-indigo-500/25'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>💼 Secretario/a</span>
                <span className="text-[9px] font-normal text-slate-400">Gestiona administrativamente</span>
              </button>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Nombre Completo *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === 'specialist' ? 'ej. Dra. Clara Ortega' : 'ej. Srta. Sandra Gómez'}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-700 placeholder-slate-400"
            />
          </div>

          {/* Especialidad / Cargo */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Especialidad / Cargo</label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder={role === 'specialist' ? 'ej. Especialista Senior' : 'ej. Administración & Recepción'}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-700 placeholder-slate-400"
            />
          </div>

          {/* Selector de Color (Oculto para secretarias) */}
          {role === 'specialist' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Color Distintivo de Agenda</label>
              <div className="flex gap-3">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    className={`w-9 h-9 rounded-full ${c.bg} flex items-center justify-center transition-all duration-200 ${
                      color === c.id 
                        ? 'ring-4 ring-offset-2 ring-indigo-500 scale-105' 
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    title={c.label}
                  >
                    {color === c.id && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botonera de pie */}
          <div className="flex gap-3 justify-end mt-4 border-t border-slate-100 pt-5 select-none">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-xs hover:bg-slate-50 transition-colors flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-xs hover:bg-indigo-700 shadow-md hover:shadow-indigo-500/10 transition-all flex-1"
            >
              {professionalToEdit ? 'Guardar Cambios' : (role === 'specialist' ? 'Guardar Profesional' : 'Guardar Secretario/a')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
