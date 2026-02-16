import axios from 'axios';
import authService from '../../services/authService';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<boolean> | null = null;

function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = authService.refreshAccessToken().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

// Interceptor para agregar token de autorización
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshed = await tryRefresh();
      if (refreshed) {
        originalRequest.headers.Authorization = `Bearer ${authService.getToken()}`;
        return api(originalRequest);
      }

      authService.logout();
      alert('Tu sesión ha expirado. Por favor, iniciá sesión nuevamente.');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
