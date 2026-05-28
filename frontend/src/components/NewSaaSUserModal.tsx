import React, { useState, useEffect } from 'react';
import { Professional } from '../types';

interface NewSaaSUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: Professional | null;
  onSubmit: (data: {
    id?: number;
    name: string;
    specialty: string;
    email: string;
    color: string;
    plan: string;
    status: 'active' | 'suspended';
    password?: string;
    rubro?: string;
  }) => void;
}

export const NewSaaSUserModal: React.FC<NewSaaSUserModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [email, setEmail] = useState('');
  const [color, setColor] = useState('indigo');
  const [plan, setPlan] = useState('Plan Estándar');
  const [status, setStatus] = useState<'active' | 'suspended'>('active');
  const [password, setPassword] = useState('admin'); // Contraseña por defecto "admin" para facilitar pruebas
  const [rubro, setRubro] = useState('Medicina');
  const [customRubro, setCustomRubro] = useState('');

  // Precargar datos si estamos editando
  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setSpecialty(userToEdit.specialty);
      setEmail(userToEdit.email || '');
      setColor(userToEdit.color);
      setPlan(userToEdit.plan || 'Plan Estándar');
      setStatus(userToEdit.status || 'active');
      setPassword(userToEdit.password || 'admin');
      
      const predefOptions = ['Medicina', 'Veterinaria', 'Peluquería', 'Barbería'];
      if (userToEdit.rubro) {
        if (predefOptions.includes(userToEdit.rubro)) {
          setRubro(userToEdit.rubro);
          setCustomRubro('');
        } else {
          setRubro('Otro');
          setCustomRubro(userToEdit.rubro);
        }
      } else if (userToEdit.specialty) {
        if (predefOptions.includes(userToEdit.specialty)) {
          setRubro(userToEdit.specialty);
          setCustomRubro('');
        } else {
          setRubro('Otro');
          setCustomRubro(userToEdit.specialty);
        }
      } else {
        setRubro('Medicina');
        setCustomRubro('');
      }
    } else {
      setName('');
      setSpecialty('Medicina');
      setEmail('');
      setColor('indigo');
      setPlan('Plan Estándar');
      setStatus('active');
      setPassword('admin');
      setRubro('Medicina');
      setCustomRubro('');
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRubro = rubro === 'Otro' ? customRubro : rubro;
    if (!name || !email || !password || !finalRubro) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }
    onSubmit({
      id: userToEdit?.id,
      name,
      specialty: finalRubro,
      email,
      color,
      plan,
      status,
      password,
      rubro: finalRubro
    });
  };

  const colors = [
    { id: 'indigo', label: 'Índigo' },
    { id: 'emerald', label: 'Esmeralda' },
    { id: 'violet', label: 'Violeta' },
    { id: 'amber', label: 'Ámbar' },
    { id: 'rose', label: 'Rosa' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300 scale-100">
        
        {/* Cabecera */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {userToEdit ? 'Configurar Cuenta de Cliente' : 'Dar de Alta Nuevo Cliente'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 animate-pulse-slow">Asigna credenciales, plan y color corporativo del cliente</p>
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
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[400px]">
            
            {/* Nombre */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Nombre o Razón Social *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej. Dra. Giselle Herrera / Clínica Dental"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all font-semibold text-slate-700"
                required
              />
            </div>

            {/* Rubro Comercial */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Rubro Comercial *</label>
              <select
                value={rubro}
                onChange={(e) => {
                  const val = e.target.value;
                  setRubro(val);
                  if (val !== 'Otro') {
                    setSpecialty(val);
                  } else {
                    setSpecialty(customRubro);
                  }
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 font-semibold text-slate-700 transition-all"
              >
                <option value="Medicina">🩺 Medicina</option>
                <option value="Veterinaria">🐾 Veterinaria</option>
                <option value="Peluquería">✂️ Peluquería</option>
                <option value="Barbería">💈 Barbería</option>
                <option value="Otro">🏷️ Otro (Personalizado)</option>
              </select>
            </div>

            {/* Rubro Personalizado (Condicional) */}
            {rubro === 'Otro' && (
              <div className="animate-slide-down">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Especificar Rubro *</label>
                <input
                  type="text"
                  value={customRubro}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomRubro(val);
                    setSpecialty(val);
                  }}
                  placeholder="ej. Centro de Estética, Kinesiología"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all font-semibold text-slate-700"
                  required
                />
              </div>
            )}

            {/* Email de Login */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Correo de Acceso (Login) *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ej. herrera@gmail.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all font-semibold text-slate-700"
                required
              />
            </div>

            {/* Contraseña Inicial */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Contraseña de Acceso (Password) *</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la clave para el cliente"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all font-semibold text-slate-700"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Plan de cobro */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Plan SaaS</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 font-semibold text-slate-700"
                >
                  <option value="Plan Estándar">Plan Estándar</option>
                  <option value="Premium Dental">Premium Dental</option>
                  <option value="Platinum Ilimitado">Platinum Ilimitado</option>
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Estado de Cuenta</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'suspended')}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 font-semibold text-slate-700"
                >
                  <option value="active">Activo</option>
                  <option value="suspended">Suspendido ⚠️</option>
                </select>
              </div>
            </div>

            {/* Selector de color */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Color de Agenda Corporativa</label>
              <div className="flex gap-2 mt-1">
                {colors.map((c) => {
                  const isSelected = color === c.id;
                  let bgClass = 'bg-indigo-500';
                  if (c.id === 'emerald') bgClass = 'bg-emerald-500';
                  if (c.id === 'violet') bgClass = 'bg-violet-500';
                  if (c.id === 'amber') bgClass = 'bg-amber-500';
                  if (c.id === 'rose') bgClass = 'bg-rose-500';

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColor(c.id)}
                      className={`w-7 h-7 rounded-lg ${bgClass} transition-transform ${
                        isSelected ? 'ring-2 ring-slate-400 ring-offset-2 scale-110' : 'hover:scale-105'
                      }`}
                      title={c.label}
                    />
                  );
                })}
              </div>
            </div>

          </div>

          {/* Botones de pie */}
          <div className="p-5 bg-slate-50/50 border-t border-slate-100 flex gap-3 select-none">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 bg-white rounded-xl font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-xs transition-all shadow-md"
            >
              {userToEdit ? 'Guardar Cambios' : 'Registrar Cliente'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
