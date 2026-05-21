import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { CalendarGrid } from '../components/CalendarGrid';
import { NewAppointmentModal } from '../components/NewAppointmentModal';
import { NewProfessionalModal } from '../components/NewProfessionalModal';
import { NewServiceModal } from '../components/NewServiceModal';
import { NewPatientModal } from '../components/NewPatientModal';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { AppointmentDetailModal } from '../components/AppointmentDetailModal';
import { NewSaaSUserModal } from '../components/NewSaaSUserModal';
import { SuccessModal } from '../components/SuccessModal';
import { ProfessionalsTab } from '../components/ProfessionalsTab';
import { ServicesTab } from '../components/ServicesTab';
import { PatientsTab } from '../components/PatientsTab';
import { SettingsTab } from '../components/SettingsTab';
import { SaaSAdminTab } from '../components/SaaSAdminTab';
import { SaaSUsersTab } from '../components/SaaSUsersTab';
import { WhatsAppBotTab } from '../components/WhatsAppBotTab';
import { Professional, Appointment, Service, Patient } from '../types';

interface DashboardProps {
  user: {
    email: string;
    name: string;
    role: 'ADMIN' | 'PROFESSIONAL';
    professionalId?: number;
  };
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  // Inicialización de la pestaña predeterminada según el Rol SaaS
  const [currentTab, setCurrentTab] = useState<string>(
    user.role === 'ADMIN' ? 'saas_billing' : 'agenda'
  );
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Estado de nombre comercial y tema visual corporativo (wow factor)
  const [tenantName, setTenantName] = useState<string>('Agenda Virtual');
  const [themeColor, setThemeColor] = useState<string>('indigo');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Estados de Modales
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isProfModalOpen, setIsProfModalOpen] = useState<boolean>(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState<boolean>(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState<boolean>(false);
  const [isSaaSUserModalOpen, setIsSaaSUserModalOpen] = useState<boolean>(false);
  
  // Estados para Modal de Confirmación de Eliminación Customizado (Premium UX)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState<boolean>(false);
  const [deleteModalTitle, setDeleteModalTitle] = useState<string>('');
  const [deleteModalItemName, setDeleteModalItemName] = useState<string>('');
  const [deleteModalDescription, setDeleteModalDescription] = useState<string>('');
  const [onConfirmDeleteCallback, setOnConfirmDeleteCallback] = useState<(() => void) | null>(null);

  // Estados para Visualización de Detalles de Turno (Custom Modal)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Estados para Notificación de Éxito Premium (Bouncing Checkmark)
  const [isSuccessOpen, setIsSuccessOpen] = useState<boolean>(false);
  const [successTitle, setSuccessTitle] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Parámetros para creación de turnos
  const [targetProfId, setTargetProfId] = useState<number | undefined>(undefined);
  const [targetHour, setTargetHour] = useState<number | undefined>(undefined);

  // Estados para Edición CRUD
  const [selectedServiceToEdit, setSelectedServiceToEdit] = useState<Service | null>(null);
  const [selectedPatientToEdit, setSelectedPatientToEdit] = useState<Patient | null>(null);
  const [selectedSaaSUserToEdit, setSelectedSaaSUserToEdit] = useState<Professional | null>(null);
  const [selectedProfToEdit, setSelectedProfToEdit] = useState<Professional | null>(null); // Nuevo: edición de personal de consultorio

  // Lista mutable de profesionales (Inquilinos/Usuarios del SaaS) con información extendida
  const [allProfessionals, setAllProfessionals] = useState<Professional[]>(() => {
    const saved = localStorage.getItem('saas_clients');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      { id: 1, name: 'Clara Ortega', specialty: 'Especialista Senior', avatar: 'https://images.unsplash.com/photo-1594824813573-246434e33963?w=100&h=100&fit=crop', color: 'indigo', email: 'clara@gmail.com', plan: 'Premium Dental', status: 'active', role: 'specialist', password: 'admin' },
      { id: 2, name: 'Mateo Ramos', specialty: 'Especialista Técnico', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop', color: 'emerald', email: 'mateo@gmail.com', plan: 'Plan Estándar', status: 'active', role: 'specialist', password: 'admin' },
      { id: 3, name: 'Sofia Ortiz', specialty: 'Asesor General', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop', color: 'violet', email: 'sofia@gmail.com', plan: 'Plan Estándar', status: 'active', role: 'specialist', password: 'admin' }
    ];
  });

  // Efecto reactivo para persistir los clientes en localStorage ante cualquier alta, edición o baja
  React.useEffect(() => {
    localStorage.setItem('saas_clients', JSON.stringify(allProfessionals));
  }, [allProfessionals]);

  // Filtrado de segregación por Rol (Un profesional solo ve su propia agenda en el CALENDARIO)
  const professionals = user.role === 'PROFESSIONAL' 
    ? allProfessionals.filter(p => p.id === user.professionalId)
    : allProfessionals;

  // Lista mutable de Servicios (Estado React)
  const [services, setServices] = useState<Service[]>([
    { id: 1, name: 'Consulta de Diagnóstico', durationMinutes: 30, price: 35.00 },
    { id: 2, name: 'Servicio Estándar', durationMinutes: 60, price: 80.00 },
    { id: 3, name: 'Asesoría Personalizada', durationMinutes: 45, price: 50.00 }
  ]);

  // Lista mutable de Pacientes (Estado React)
  const [patients, setPatients] = useState<Patient[]>([
    { id: 1, name: 'Juan Pérez', email: 'juan@gmail.com', phone: '+54 9 11 2233-4455' },
    { id: 2, name: 'Maria Sosa', email: 'maria@gmail.com', phone: '+54 9 11 9988-7766' },
    { id: 3, name: 'Roberto Gil', email: 'roberto@gmail.com', phone: '+54 9 11 5544-3322' }
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: 101, professionalId: 1, patientId: 1, patientName: 'Juan Pérez', serviceName: 'Consulta de Diagnóstico', startTime: '2026-05-19T09:00:00', endTime: '2026-05-19T09:30:00', status: 'confirmed' },
    { id: 102, professionalId: 1, patientId: 2, patientName: 'Maria Sosa', serviceName: 'Asesoría Personalizada', startTime: '2026-05-19T10:30:00', endTime: '2026-05-19T11:15:00', status: 'pending' },
    { id: 103, professionalId: 2, patientId: 3, patientName: 'Roberto Gil', serviceName: 'Servicio Estándar', startTime: '2026-05-19T10:00:00', endTime: '2026-05-19T11:00:00', status: 'confirmed' }
  ]);

  const handleTimeSlotClick = (professionalId: number, hour: number) => {
    setTargetProfId(professionalId);
    setTargetHour(hour);
    setIsModalOpen(true);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  // Cancelar Turno reactivamente
  const handleCancelAppointment = (id: number) => {
    setAppointments(appointments.map(app => app.id === id 
      ? { ...app, status: 'cancelled' } 
      : app
    ));
    setSuccessTitle('¡Cita Cancelada!');
    setSuccessMessage('El turno se ha marcado como cancelado y se tachó del calendario.');
    setIsSuccessOpen(true);
  };

  // Confirmar Turno reactivamente
  const handleConfirmAppointment = (id: number) => {
    setAppointments(appointments.map(app => app.id === id 
      ? { ...app, status: 'confirmed' } 
      : app
    ));
    setSuccessTitle('¡Cita Confirmada!');
    setSuccessMessage('El estado del turno se actualizó a confirmado satisfactoriamente.');
    setIsSuccessOpen(true);
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const handleCreateAppointment = (data: {
    professionalId: number;
    patientId: number;
    serviceId: number;
    startTime: string;
  }) => {
    const selectedService = services.find(s => s.id === data.serviceId);
    const selectedPatient = patients.find(p => p.id === data.patientId);
    
    if (!selectedService || !selectedPatient) return;

    const start = new Date(data.startTime);
    const end = new Date(start.getTime() + selectedService.durationMinutes * 60 * 1000);
    
    const formatISO = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:00`;
    };

    const newApp: Appointment = {
      id: Date.now(),
      professionalId: data.professionalId,
      patientId: data.patientId,
      patientName: selectedPatient.name,
      serviceName: selectedService.name,
      startTime: formatISO(start),
      endTime: formatISO(end),
      status: 'confirmed'
    };

    setAppointments([...appointments, newApp]);
    setIsModalOpen(false);

    // Disparador de Notificación de Éxito
    setSuccessTitle('¡Cita Agendada!');
    setSuccessMessage(`El turno para ${selectedPatient.name} fue registrado con éxito.`);
    setIsSuccessOpen(true);
  };

  // Creación y Edición del Personal de la Clínica (Profesionales o Secretarios/as)
  const handleCreateOrUpdateProfessional = (data: {
    id?: number;
    name: string;
    specialty: string;
    color: string;
    role: 'specialist' | 'secretary';
    avatar?: string; // foto de perfil cargada en Base64
  }) => {
    if (data.id) {
      // Modificar Personal Existente
      setAllProfessionals(allProfessionals.map(p => p.id === data.id
        ? { 
            ...p, 
            name: data.name, 
            specialty: data.specialty, 
            color: data.role === 'secretary' ? 'slate' : data.color, 
            role: data.role,
            avatar: data.avatar || p.avatar // usar avatar nuevo si se cargó, sino mantener el anterior
          }
        : p
      ));
      setSuccessTitle('¡Ficha Actualizada!');
      setSuccessMessage(`Los datos de "${data.name}" fueron guardados correctamente.`);
    } else {
      // Registrar Nuevo Personal
      const avatars = data.role === 'secretary'
        ? [
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop', // Secretaria 1
            'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop', // Secretaria 2
            'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop'  // Secretario 1
          ]
        : [
            'https://images.unsplash.com/photo-1594824813573-246434e33963?w=150&h=150&fit=crop',
            'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop',
            'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop'
          ];
      const randomAvatar = avatars[allProfessionals.length % avatars.length];

      const newProf: Professional = {
        id: Date.now(),
        name: data.name,
        specialty: data.specialty,
        avatar: data.avatar || randomAvatar, // usar foto subida por usuario, sino el fallback aleatorio
        color: data.color,
        role: data.role,
        email: `${data.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        plan: 'Plan Estándar',
        status: 'active'
      };

      setAllProfessionals([...allProfessionals, newProf]);
      setSuccessTitle('¡Miembro Registrado!');
      setSuccessMessage(data.role === 'secretary' 
        ? `El secretario/a "${data.name}" fue agregado correctamente al equipo administrativo.`
        : `El profesional "${data.name}" se incorporó con éxito al equipo clínico.`
      );
    }
    
    setIsProfModalOpen(false);
    setSelectedProfToEdit(null);
    setIsSuccessOpen(true);
  };

  // Orquestador Custom Confirm Delete: Miembro del equipo de trabajo
  const handleRequestDeleteProfessional = (prof: Professional) => {
    setDeleteModalTitle('Dar de Baja Miembro');
    setDeleteModalItemName(prof.name);
    setDeleteModalDescription(`¿Estás seguro de que deseas desvincular a "${prof.name}" de la clínica? Se suspenderá su acceso y se desactivará su agenda del calendario.`);

    setOnConfirmDeleteCallback(() => () => {
      setAllProfessionals(prev => prev.filter(p => p.id !== prof.id));
      setIsConfirmDeleteOpen(false);
      setSuccessTitle('¡Baja Procesada!');
      setSuccessMessage(`El miembro de equipo "${prof.name}" fue removido exitosamente.`);
      setIsSuccessOpen(true);
    });

    setIsConfirmDeleteOpen(true);
  };

  // Lógica CRUD de Servicios: Crear o Actualizar
  const handleCreateOrUpdateService = (data: {
    id?: number;
    name: string;
    durationMinutes: number;
    price: number;
  }) => {
    if (data.id) {
      setServices(services.map(s => s.id === data.id 
        ? { ...s, name: data.name, durationMinutes: data.durationMinutes, price: data.price } 
        : s
      ));
      setSuccessTitle('¡Servicio Actualizado!');
      setSuccessMessage(`Las tarifas y aranceles del servicio "${data.name}" se editaron.`);
    } else {
      const newService: Service = {
        id: Date.now(),
        name: data.name,
        durationMinutes: data.durationMinutes,
        price: data.price
      };
      setServices([...services, newService]);
      setSuccessTitle('¡Servicio Creado!');
      setSuccessMessage(`El servicio "${data.name}" fue incorporado al catálogo comercial.`);
    }
    setIsServiceModalOpen(false);
    setSelectedServiceToEdit(null);
    setIsSuccessOpen(true);
  };

  // Orquestador Custom Confirm Delete: Servicio
  const handleRequestDeleteService = (service: Service) => {
    setDeleteModalTitle('Eliminar Servicio Comercial');
    setDeleteModalItemName(service.name);
    setDeleteModalDescription(`¿Estás seguro de que deseas eliminar "${service.name}" del catálogo? Esto removerá la opción para futuras agendaciones.`);
    
    setOnConfirmDeleteCallback(() => () => {
      setServices(prevServices => prevServices.filter(s => s.id !== service.id));
      setIsConfirmDeleteOpen(false);
      setSuccessTitle('¡Servicio Eliminado!');
      setSuccessMessage(`El servicio "${service.name}" fue removido exitosamente.`);
      setIsSuccessOpen(true);
    });
    
    setIsConfirmDeleteOpen(true);
  };

  // Lógica CRUD de Pacientes: Crear o Actualizar
  const handleCreateOrUpdatePatient = (data: {
    id?: number;
    name: string;
    email: string;
    phone: string;
  }) => {
    if (data.id) {
      setPatients(patients.map(p => p.id === data.id
        ? { ...p, name: data.name, email: data.email, phone: data.phone }
        : p
      ));
      setAppointments(appointments.map(app => app.patientId === data.id
        ? { ...app, patientName: data.name }
        : app
      ));
      setSuccessTitle('¡Paciente Actualizado!');
      setSuccessMessage(`La ficha de contacto del paciente "${data.name}" se actualizó.`);
    } else {
      const newPatient: Patient = {
        id: Date.now(),
        name: data.name,
        email: data.email,
        phone: data.phone
      };
      setPatients([...patients, newPatient]);
      setSuccessTitle('¡Paciente Registrado!');
      setSuccessMessage(`El paciente "${data.name}" se dio de alta correctamente.`);
    }
    setIsPatientModalOpen(false);
    setSelectedPatientToEdit(null);
    setIsSuccessOpen(true);
  };

  // Orquestador Custom Confirm Delete: Paciente
  const handleRequestDeletePatient = (patient: Patient) => {
    setDeleteModalTitle('Eliminar Ficha de Paciente');
    setDeleteModalItemName(patient.name);
    setDeleteModalDescription(`¿Estás seguro de que deseas eliminar la ficha médica y de contacto de "${patient.name}"? Los turnos agendados previamente mantendrán un registro histórico.`);

    setOnConfirmDeleteCallback(() => () => {
      setPatients(prevPatients => prevPatients.filter(p => p.id !== patient.id));
      setIsConfirmDeleteOpen(false);
      setSuccessTitle('¡Paciente Eliminado!');
      setSuccessMessage(`La ficha médica de "${patient.name}" fue borrada.`);
      setIsSuccessOpen(true);
    });

    setIsConfirmDeleteOpen(true);
  };

  // ==========================================
  //   LÓGICA CRUD SAAS DE USUARIOS / INQUILINOS
  // ==========================================

  const handleCreateOrUpdateSaaSUser = (data: {
    id?: number;
    name: string;
    specialty: string;
    email: string;
    color: string;
    plan: string;
    status: 'active' | 'suspended';
    password?: string;
  }) => {
    if (data.id) {
      // Modificar inquilino
      setAllProfessionals(allProfessionals.map(p => p.id === data.id
        ? { 
            ...p, 
            name: data.name, 
            specialty: data.specialty, 
            email: data.email, 
            color: data.color, 
            plan: data.plan, 
            status: data.status,
            password: data.password || p.password
          }
        : p
      ));
      setSuccessTitle('¡Cliente Configurado!');
      setSuccessMessage(`Las credenciales y plan de "${data.name}" fueron actualizadas.`);
    } else {
      // Dar de alta nuevo inquilino
      const avatars = [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop'
      ];
      const randomAvatar = avatars[allProfessionals.length % avatars.length];

      const newTenant: Professional = {
        id: Date.now(),
        name: data.name,
        specialty: data.specialty,
        avatar: randomAvatar,
        color: data.color,
        email: data.email,
        plan: data.plan,
        status: data.status,
        role: 'specialist',
        password: data.password || 'admin' // password personalizado
      };
      setAllProfessionals([...allProfessionals, newTenant]);
      setSuccessTitle('¡Cliente Registrado!');
      setSuccessMessage(`La cuenta de "${data.name}" se creó de forma satisfactoria.`);
    }
    setIsSaaSUserModalOpen(false);
    setSelectedSaaSUserToEdit(null);
    setIsSuccessOpen(true);
  };

  const handleRequestDeleteSaaSUser = (tenant: Professional) => {
    setDeleteModalTitle('Eliminar Cuenta de Inquilino');
    setDeleteModalItemName(tenant.name);
    setDeleteModalDescription(`¿Estás seguro de que deseas dar de baja permanentemente a "${tenant.name}" del SaaS? Esto suspenderá todo acceso a su Agenda de forma inmediata.`);

    setOnConfirmDeleteCallback(() => () => {
      setAllProfessionals(prev => prev.filter(p => p.id !== tenant.id));
      setIsConfirmDeleteOpen(false);
      setSuccessTitle('¡Inquilino Eliminado!');
      setSuccessMessage(`La cuenta del cliente "${tenant.name}" fue removida.`);
      setIsSuccessOpen(true);
    });

    setIsConfirmDeleteOpen(true);
  };

  // Función para obtener las clases de estilo del tema dinámico del dashboard
  const getThemeClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return {
          bg: 'bg-emerald-600 hover:bg-emerald-700',
          badge: 'bg-emerald-50 border-emerald-100 text-emerald-600',
          focus: 'focus:ring-emerald-500/20 focus:border-emerald-500',
          shadow: 'hover:shadow-emerald-600/10',
        };
      case 'violet':
        return {
          bg: 'bg-violet-600 hover:bg-violet-700',
          badge: 'bg-violet-50 border-violet-100 text-violet-600',
          focus: 'focus:ring-violet-500/20 focus:border-violet-500',
          shadow: 'hover:shadow-violet-600/10',
        };
      case 'amber':
        return {
          bg: 'bg-amber-500 hover:bg-amber-600',
          badge: 'bg-amber-50 border-amber-100 text-amber-600',
          focus: 'focus:ring-amber-500/20 focus:border-amber-500',
          shadow: 'hover:shadow-amber-500/10',
        };
      case 'rose':
        return {
          bg: 'bg-rose-500 hover:bg-rose-600',
          badge: 'bg-rose-50 border-rose-100 text-rose-600',
          focus: 'focus:ring-rose-500/20 focus:border-rose-500',
          shadow: 'hover:shadow-rose-600/10',
        };
      case 'indigo':
      default:
        return {
          bg: 'bg-indigo-600 hover:bg-indigo-700',
          badge: 'bg-indigo-50 border-indigo-100 text-indigo-600',
          focus: 'focus:ring-indigo-500/20 focus:border-indigo-500',
          shadow: 'hover:shadow-indigo-600/10',
        };
    }
  };

  const theme = getThemeClasses(themeColor);

  return (
    <div className="flex bg-slate-50 h-screen w-screen overflow-hidden text-slate-800 animate-fade-in">
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        tenantName={tenantName} 
        themeColor={themeColor}
        user={user}
        onLogout={onLogout}
        isSidebarOpen={isMobileSidebarOpen}
        onCloseSidebar={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            {/* Botón Hamburguesa Móvil */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 -ml-1 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 md:hidden transition-colors"
              title="Abrir Menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-sm md:text-xl font-bold text-slate-800 flex items-center gap-1.5 md:gap-2">
              <span className="hidden sm:inline">Panel de Control</span>
              <span className="text-slate-300 font-normal hidden sm:inline">|</span>
              <span className="text-xs md:text-sm font-medium text-slate-500 truncate max-w-[140px] sm:max-w-none">Hola, {user.name}</span>
            </h2>
            <div className={`px-2 py-0.5 md:px-2.5 md:py-1 rounded-full ${theme.badge} text-[10px] md:text-xs font-semibold shrink-0`}>
              {user.role === 'ADMIN' ? 'SaaS' : 'Agenda'}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Buscador visible únicamente para inquilinos */}
            {user.role !== 'ADMIN' && (
              <div className="relative hidden sm:block">
                <input
                  type="text"
                  placeholder="Buscar turno..."
                  className={`w-40 lg:w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${theme.focus}`}
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col gap-5 md:gap-6 font-sans">
          
          {/* ========================================== */}
          {/*   VISTAS DEL INQUILINO (PROFESSIONAL)      */}
          {/* ========================================== */}
          
          {/* VISTA AGENDA */}
          {user.role !== 'ADMIN' && currentTab === 'agenda' && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shrink-0 gap-3">
                <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-between sm:justify-start">
                  <button
                    onClick={() => changeDate(-1)}
                    className="p-1.5 md:p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors duration-150"
                  >
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="font-bold text-slate-800 text-xs md:text-base text-center select-none truncate max-w-[200px] sm:max-w-none">
                    {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h2>
                  <button
                    onClick={() => changeDate(1)}
                    className="p-1.5 md:p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors duration-150"
                  >
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setTargetProfId(user.role === 'PROFESSIONAL' ? user.professionalId : undefined);
                    setTargetHour(undefined);
                    setIsModalOpen(true);
                  }}
                  className={`w-full sm:w-auto px-5 py-2.5 ${theme.bg} text-white rounded-xl font-semibold text-xs md:text-sm shadow-md ${theme.shadow} transition-all duration-200 flex items-center justify-center gap-2`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Nuevo Turno
                </button>
              </div>


              <CalendarGrid
                professionals={professionals}
                appointments={appointments}
                selectedDate={selectedDate}
                onTimeSlotClick={handleTimeSlotClick}
                onAppointmentClick={handleAppointmentClick}
              />
            </>
          )}

          {/* VISTA PROFESIONALES */}
          {user.role !== 'ADMIN' && currentTab === 'professionals' && (
            <ProfessionalsTab
              professionals={allProfessionals}
              onOpenAddModal={() => {
                setSelectedProfToEdit(null);
                setIsProfModalOpen(true);
              }}
              onEditProfessional={(prof) => {
                setSelectedProfToEdit(prof);
                setIsProfModalOpen(true);
              }}
              onDeleteProfessional={handleRequestDeleteProfessional}
              userRole={user.role}
            />
          )}

          {/* VISTA SERVICIOS */}
          {user.role !== 'ADMIN' && currentTab === 'services' && (
            <ServicesTab
              services={services}
              onOpenAddModal={() => {
                setSelectedServiceToEdit(null);
                setIsServiceModalOpen(true);
              }}
              onEditService={(ser) => {
                setSelectedServiceToEdit(ser);
                setIsServiceModalOpen(true);
              }}
              onDeleteService={handleRequestDeleteService}
              userRole={user.role}
            />
          )}

          {/* VISTA PACIENTES */}
          {user.role !== 'ADMIN' && currentTab === 'patients' && (
            <PatientsTab
              patients={patients}
              onOpenAddModal={() => {
                setSelectedPatientToEdit(null);
                setIsPatientModalOpen(true);
              }}
              onEditPatient={(pat) => {
                setSelectedPatientToEdit(pat);
                setIsPatientModalOpen(true);
              }}
              onDeletePatient={handleRequestDeletePatient}
            />
          )}

          {/* VISTA BOT DE WHATSAPP */}
          {user.role !== 'ADMIN' && currentTab === 'whatsapp_bot' && (
            <WhatsAppBotTab />
          )}

          {/* VISTA CONFIGURACION */}
          {user.role !== 'ADMIN' && currentTab === 'settings' && (
            <SettingsTab
              tenantName={tenantName}
              setTenantName={setTenantName}
              themeColor={themeColor}
              setThemeColor={setThemeColor}
            />
          )}

          {/* ========================================== */}
          {/*   VISTAS DEL SUPER ADMIN DEL SAAS (ADMIN)  */}
          {/* ========================================== */}
          
          {/* PESTAÑA: FACTURACIÓN SAAS */}
          {user.role === 'ADMIN' && currentTab === 'saas_billing' && (
            <SaaSAdminTab />
          )}

          {/* PESTAÑA: GESTIÓN DE USUARIOS / INQUILINOS SAAS */}
          {user.role === 'ADMIN' && currentTab === 'saas_users' && (
            <SaaSUsersTab
              users={allProfessionals}
              onOpenAddModal={() => {
                setSelectedSaaSUserToEdit(null);
                setIsSaaSUserModalOpen(true);
              }}
              onEditUser={(tenant) => {
                setSelectedSaaSUserToEdit(tenant);
                setIsSaaSUserModalOpen(true);
              }}
              onDeleteUser={handleRequestDeleteSaaSUser}
            />
          )}

          {/* PESTAÑA: CONFIGURACIÓN GLOBAL SAAS */}
          {user.role === 'ADMIN' && currentTab === 'saas_settings' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-6 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Configuración Global del SaaS</h2>
                <p className="text-xs text-slate-500 mt-0.5">Controla la infraestructura técnica y los webhooks de facturación automatizados</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div className="border border-slate-150 rounded-xl p-5">
                  <h4 className="font-bold text-xs text-slate-700 uppercase mb-3">Pasarelas de Pago Habilitadas</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-xs font-semibold">Stripe Checkout API</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded">ACTIVO</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-xs font-semibold">MercadoPago Subscriptions</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded">ACTIVO</span>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-150 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-700 uppercase mb-2">Notificaciones de Cobro</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      El sistema envía un recordatorio automático por correo 5 días antes del vencimiento mensual de cada inquilino.
                    </p>
                  </div>
                  <button
                    onClick={() => alert('Prueba de Notificación Masiva enviada a los servidores de cola.')}
                    className="w-full mt-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
                  >
                    Simular Envío de Recordatorios
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VISTA EN CONSTRUCCIÓN (OTRAS PESTAÑAS) */}
          {currentTab !== 'agenda' && currentTab !== 'professionals' && currentTab !== 'services' && 
           currentTab !== 'patients' && currentTab !== 'settings' && currentTab !== 'whatsapp_bot' &&
           currentTab !== 'saas_billing' && currentTab !== 'saas_users' && currentTab !== 'saas_settings' && (
            <div className="flex-1 bg-white border border-slate-100 rounded-2xl flex flex-col items-center justify-center p-12 text-slate-400">
              <svg className="w-16 h-16 text-slate-300 stroke-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="mt-4 font-semibold text-sm">Contenido de la pestaña en construcción</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal de Agendación de Turnos */}
      <NewAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        professionals={professionals}
        services={services}
        patients={patients}
        defaultProfessionalId={targetProfId}
        defaultHour={targetHour}
        onSubmit={handleCreateAppointment}
      />

      {/* Modal de Creación y Edición de Profesionales */}
      <NewProfessionalModal
        isOpen={isProfModalOpen}
        onClose={() => {
          setIsProfModalOpen(false);
          setSelectedProfToEdit(null);
        }}
        professionalToEdit={selectedProfToEdit}
        onSubmit={handleCreateOrUpdateProfessional}
      />

      {/* Modal de Creación y Edición de Servicios */}
      <NewServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => {
          setIsServiceModalOpen(false);
          setSelectedServiceToEdit(null);
        }}
        serviceToEdit={selectedServiceToEdit}
        onSubmit={handleCreateOrUpdateService}
      />

      {/* Modal de Creación y Edición de Pacientes */}
      <NewPatientModal
        isOpen={isPatientModalOpen}
        onClose={() => {
          setIsPatientModalOpen(false);
          setSelectedPatientToEdit(null);
        }}
        patientToEdit={selectedPatientToEdit}
        onSubmit={handleCreateOrUpdatePatient}
      />

      {/* Modal Customizado de Confirmación de Eliminación (Premium UX) */}
      <ConfirmDeleteModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setOnConfirmDeleteCallback(null);
        }}
        onConfirm={onConfirmDeleteCallback || (() => {})}
        title={deleteModalTitle}
        itemName={deleteModalItemName}
        description={deleteModalDescription}
      />

      {/* Modal de Detalle de Cita (Premium UX) */}
      <AppointmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        professionals={allProfessionals}
        services={services}
        patients={patients}
        onCancelAppointment={handleCancelAppointment}
        onConfirmAppointment={handleConfirmAppointment}
      />

      {/* Modal de Registro y Modificación de Usuarios Inquilinos (Premium UX) */}
      <NewSaaSUserModal
        isOpen={isSaaSUserModalOpen}
        onClose={() => {
          setIsSaaSUserModalOpen(false);
          setSelectedSaaSUserToEdit(null);
        }}
        userToEdit={selectedSaaSUserToEdit}
        onSubmit={handleCreateOrUpdateSaaSUser}
      />

      {/* Modal de Notificación de Éxito Premium (wow effect) */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={successTitle}
        message={successMessage}
      />
    </div>
  );
};
