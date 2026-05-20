import React, { useState, useEffect } from 'react';
import { Professional, Service, Patient } from '../types';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionals: Professional[];
  services: Service[];
  patients: Patient[];
  defaultProfessionalId?: number;
  defaultHour?: number;
  onSubmit: (data: {
    professionalId: number;
    patientId: number;
    serviceId: number;
    startTime: string;
  }) => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  professionals,
  services,
  patients,
  defaultProfessionalId,
  defaultHour,
  onSubmit,
}) => {
  const [professionalId, setProfessionalId] = useState<number>(0);
  const [patientId, setPatientId] = useState<number>(0);
  const [serviceId, setServiceId] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('08:00');

  useEffect(() => {
    if (isOpen) {
      if (defaultProfessionalId) setProfessionalId(defaultProfessionalId);
      else if (professionals.length > 0) setProfessionalId(professionals[0].id);

      if (defaultHour) {
        setTime(`${defaultHour.toString().padStart(2, '0')}:00`);
      } else {
        setTime('08:00');
      }

      if (services.length > 0) setServiceId(services[0].id);
      if (patients.length > 0) setPatientId(patients[0].id);
    }
  }, [isOpen, defaultProfessionalId, defaultHour, professionals, services, patients]);

  if (!isOpen) return null;

  const selectedService = services.find((s) => s.id === serviceId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!professionalId || !patientId || !serviceId || !date || !time) return;

    const startTimeISO = `${date}T${time}:00`;
    onSubmit({
      professionalId,
      patientId,
      serviceId,
      startTime: startTimeISO,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300 scale-100">
        
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Registrar Nuevo Turno</h3>
            <p className="text-xs text-slate-500 mt-0.5">Completa los datos de la cita</p>
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
          {/* Campo Paciente */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Paciente / Cliente</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
            >
              {patients.map((pat) => (
                <option key={pat.id} value={pat.id}>
                  {pat.name} ({pat.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Campo Profesional */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Profesional</label>
            <select
              value={professionalId}
              onChange={(e) => setProfessionalId(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
            >
              {professionals.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name} - {prof.specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Campo Servicio */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Servicio Solicitado</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
            >
              {services.map((ser) => (
                <option key={ser.id} value={ser.id}>
                  {ser.name} - {ser.durationMinutes} min (${ser.price})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Hora de Inicio</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 font-medium"
              />
            </div>
          </div>

          {selectedService && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between mt-1.5">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Duración Estimada</span>
                <span className="text-sm font-semibold text-slate-700">{selectedService.durationMinutes} minutos</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Total a Cobrar</span>
                <span className="text-base font-bold text-emerald-600">${selectedService.price}</span>
              </div>
            </div>
          )}

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
              Agendar Turno
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
