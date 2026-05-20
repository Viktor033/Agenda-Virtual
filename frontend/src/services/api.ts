import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    let tenantId = '';

    const host = window.location.host;
    const parts = host.split('.');
    
    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'app') {
      tenantId = parts[0];
    } else {
      tenantId = localStorage.getItem('active_tenant_id') || '10';
    }

    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
