import api from './api';
import { Appointment } from '../types';

export interface CreateAppointmentDTO {
  professionalId: number;
  patientId: number;
  serviceId: number;
  startTime: string; // ISO 8601
}

export async function getAppointments(): Promise<Appointment[]> {
  const { data } = await api.get<Appointment[]>('/appointments');
  return data;
}

export async function createAppointment(dto: CreateAppointmentDTO): Promise<Appointment> {
  const { data } = await api.post<Appointment>('/appointments', dto);
  return data;
}

export async function updateAppointmentStatus(
  id: number,
  status: 'pending' | 'confirmed' | 'cancelled'
): Promise<Appointment> {
  const { data } = await api.patch<Appointment>(`/appointments/${id}/status`, { status });
  return data;
}

export async function deleteAppointment(id: number): Promise<void> {
  await api.delete(`/appointments/${id}`);
}
