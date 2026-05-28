import api from './api';

// El backend devuelve un subconjunto de campos; mapeamos a lo que necesita el frontend
export interface ProfessionalDTO {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
}

export async function getProfessionals(): Promise<ProfessionalDTO[]> {
  const { data } = await api.get<ProfessionalDTO[]>('/professionals');
  return data;
}

export async function createProfessional(prof: Omit<ProfessionalDTO, 'id'>): Promise<ProfessionalDTO> {
  const { data } = await api.post<ProfessionalDTO>('/professionals', prof);
  return data;
}

export async function updateProfessional(id: number, prof: Partial<ProfessionalDTO>): Promise<ProfessionalDTO> {
  const { data } = await api.put<ProfessionalDTO>(`/professionals/${id}`, prof);
  return data;
}

export async function deleteProfessional(id: number): Promise<void> {
  await api.delete(`/professionals/${id}`);
}
