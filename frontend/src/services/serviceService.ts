import api from './api';
import { Service } from '../types';

export async function getServices(): Promise<Service[]> {
  const { data } = await api.get<Service[]>('/services');
  return data;
}

export async function createService(service: Omit<Service, 'id'>): Promise<Service> {
  const { data } = await api.post<Service>('/services', service);
  return data;
}

export async function updateService(id: number, service: Partial<Service>): Promise<Service> {
  const { data } = await api.put<Service>(`/services/${id}`, service);
  return data;
}

export async function deleteService(id: number): Promise<void> {
  await api.delete(`/services/${id}`);
}
