import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
  tenantId?: number | null;
}

export interface LoginResponse {
  token: string;
  email: string;
  role: string;
  tenantId: number;
  expiresIn: number;
}

export interface UserSession {
  email: string;
  name: string;
  role: 'ADMIN' | 'PROFESSIONAL';
  tenantId: number;
  professionalId?: number;
}

/**
 * Llama al endpoint POST /api/v1/auth/login.
 * Guarda el token y el tenantId en localStorage.
 * Devuelve la sesión lista para el estado de React.
 */
export async function login(request: LoginRequest): Promise<UserSession> {
  const { data } = await api.post<LoginResponse>('/auth/login', request);

  // Persistir token y tenant para los interceptores de axios
  localStorage.setItem('auth_token', data.token);
  localStorage.setItem('active_tenant_id', String(data.tenantId));

  // Derivar nombre amigable del email (ej. "clara@gmail.com" → "Clara")
  const rawName = data.email.split('@')[0];
  const friendlyName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const role = data.role.toUpperCase() as 'ADMIN' | 'PROFESSIONAL';

  return {
    email: data.email,
    name: role === 'ADMIN' ? 'Administrador Global' : `Dr/a. ${friendlyName}`,
    role,
    tenantId: data.tenantId,
  };
}

/**
 * Limpia la sesión del usuario del localStorage.
 */
export function logout(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('active_tenant_id');
}
