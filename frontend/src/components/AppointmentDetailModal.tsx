import React from 'react';
import { Appointment, Professional, Service, Patient } from '../types';

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  professionals: Professional[];
  services: Service[];
  patients: Patient[];
  onCancelAppointment: (id: number) => void;
  onConfirmAppointment: (id: number) => void;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  isOpen,
  onClose,
  appointment,
  professionals,
  services,
  patients,
  onCancelAppointment,
  onConfirmAppointment,
}) => {
  if (!isOpen || !appointment) return null;

  // Cruce de datos relacionales
  const professional = professionals.find((p) => p.id === appointment.professionalId);
  const patient = patients.find((p) => p.id === appointment.patientId);
  const service = services.find((s) => s.name === appointment.serviceName);

  const start = new Date(appointment.startTime);
  const end = new Date(appointment.endTime);

  const formattedDate = start.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} a ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  // Iniciales del paciente para su bubble avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300 scale-100">
        
        {/* Cabecera del Modal */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>Detalles de la Reserva</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 font-bold">
                ID: {appointment.id}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Ficha de asignación y estado del turno</p>
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

        {/* Contenido / Información de la Cita */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[450px]">
          
          {/* Bloque 1: Estado del Turno */}
          <div className="flex justify-between items-center bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado Actual:</span>
            {appointment.status === 'confirmed' && (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Confirmado
              </span>
            )}
            {appointment.status === 'pending' && (
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Pendiente
              </span>
            )}
            {appointment.status === 'cancelled' && (
              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Cancelado
              </span>
            )}
          </div>

          {/* Bloque 2: Ficha del Paciente */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Paciente Agendado</h4>
            <div className="border border-slate-100 rounded-xl p-4 flex items-center gap-3.5 shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center font-extrabold text-sm text-white shadow-sm shrink-0">
                {getInitials(appointment.patientName)}
              </div>
              <div className="overflow-hidden flex-1">
                <h5 className="font-bold text-slate-800 text-sm leading-none">{appointment.patientName}</h5>
                {patient ? (
                  <div className="flex flex-col gap-0.5 mt-2 text-[10px] text-slate-500 font-medium">
                    <span>📧 {patient.email}</span>
                    <span>📞 {patient.phone}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 italic block mt-1">Sin información de contacto adicional</span>
                )}
              </div>
            </div>
          </div>

          {/* Bloque 3: Detalle de Cita (Profesional, Servicio, Fecha, Hora) */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Detalles del Servicio</h4>
            
            <div className="grid grid-cols-1 gap-2.5">
              {/* Profesional */}
              {professional && (
                <div className="flex items-center gap-3 border border-slate-100/80 p-3 rounded-xl">
                  <img
                    src={professional.avatar}
                    alt={professional.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-400">Atendido por</span>
                    <span className="text-xs font-bold text-slate-700">{professional.name} ({professional.specialty})</span>
                  </div>
                </div>
              )}

              {/* Servicio y Costo */}
              <div className="flex justify-between items-center border border-slate-100/80 p-3 rounded-xl">
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Servicio solicitado</span>
                  <span className="text-xs font-bold text-slate-700">{appointment.serviceName}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Costo total</span>
                  <span className="text-sm font-extrabold text-emerald-600">
                    ${service ? service.price.toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>

              {/* Fecha y Hora */}
              <div className="flex items-center gap-3 border border-slate-100/80 p-3 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  📅
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400">{formattedTime}</span>
                  <span className="text-xs font-bold text-slate-700 capitalize">{formattedDate}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Botonera de Acciones Rápidas */}
        <div className="p-5 bg-slate-50/50 border-t border-slate-100 flex gap-3 select-none shrink-0">
          {appointment.status !== 'cancelled' && (
            <button
              type="button"
              onClick={() => {
                onCancelAppointment(appointment.id);
                onClose();
              }}
              className="px-4 py-2.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl font-semibold text-xs transition-colors duration-200 flex-1"
            >
              Cancelar Turno
            </button>
          )}

          {appointment.status === 'pending' && (
            <button
              type="button"
              onClick={() => {
                onConfirmAppointment(appointment.id);
                onClose();
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-md transition-all duration-200 flex-1"
            >
              Confirmar Turno
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-xs transition-all duration-200 ${
              appointment.status === 'pending' || appointment.status === 'confirmed' ? 'flex-none min-w-[80px]' : 'flex-1'
            }`}
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
