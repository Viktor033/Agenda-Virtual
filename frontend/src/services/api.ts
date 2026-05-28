import axios from 'axios';

const api = axios.create({
  // Con el proxy de Vite, usamos rutas relativas en dev.
  // En producción apuntaría al dominio real del backend.
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Interceptor de REQUEST ───────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Resolución del tenantId: subdominio → localStorage → fallback '1'
    const host = window.location.host;
    const parts = host.split('.');
    let tenantId: string;

    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'app') {
      tenantId = parts[0];
    } else {
      tenantId = localStorage.getItem('active_tenant_id') || '1';
    }

    config.headers['X-Tenant-ID'] = tenantId;

    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Interceptor de RESPONSE ──────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido: limpiar sesión y redirigir al login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('active_tenant_id');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
