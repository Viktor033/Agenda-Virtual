import api from './api';
import { Patient } from '../types';

export async function getPatients(): Promise<Patient[]> {
  const { data } = await api.get<Patient[]>('/patients');
  return data;
}

export async function createPatient(patient: Omit<Patient, 'id'>): Promise<Patient> {
  const { data } = await api.post<Patient>('/patients', patient);
  return data;
}

export async function updatePatient(id: number, patient: Partial<Patient>): Promise<Patient> {
  const { data } = await api.put<Patient>(`/patients/${id}`, patient);
  return data;
}

export async function deletePatient(id: number): Promise<void> {
  await api.delete(`/patients/${id}`);
}
