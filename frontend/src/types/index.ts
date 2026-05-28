export interface Professional {
  id: number;
  name: string;
  avatar: string;
  specialty: string;
  color: string;
  email?: string;
  plan?: string;
  status?: 'active' | 'suspended';
  role?: 'specialist' | 'secretary';
  password?: string; // Nuevo: contraseña de acceso personalizada para clientes del SaaS
  rubro?: string;
}

export interface Service {
  id: number;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Appointment {
  id: number;
  professionalId: number;
  patientId: number;
  patientName: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
}
