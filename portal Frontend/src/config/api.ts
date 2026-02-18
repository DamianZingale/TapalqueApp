// portal Frontend/src/config/api.ts
import authService from '../services/authService';

const API_BASE_URL = '/api';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

let refreshPromise: Promise<boolean> | null = null;

function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = authService.refreshAccessToken().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

export const apiRequest = async <T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const buildConfig = (): RequestOptions => {
    const config: RequestOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const token = authService.getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return config;
  };

  try {
    const response = await fetch(url, buildConfig());

    if (response.status === 401 || response.status === 403) {
      // 401 = token expirado, 403 = token inválido/sin permisos
      // En ambos casos intentamos refresh; si falla, redirigimos al login
      const refreshed = await tryRefresh();
      if (refreshed) {
        const retryResponse = await fetch(url, buildConfig());
        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }
        return (await retryResponse.json()) as T;
      }

      authService.logout();
      alert('Tu sesión ha expirado. Por favor, iniciá sesión nuevamente.');
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const api = {
  get: <T = unknown>(endpoint: string): Promise<T> =>
    apiRequest<T>(endpoint, { method: 'GET' }),

  post: <T = unknown>(endpoint: string, data: unknown): Promise<T> =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T = unknown>(endpoint: string, data: unknown): Promise<T> =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: <T = unknown>(endpoint: string): Promise<T> =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),

  patch: <T = unknown>(endpoint: string, data: unknown): Promise<T> =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

export const publicApi = {
  post: async <T = unknown>(endpoint: string, data: unknown): Promise<T> => {
    const response = await fetch(`/api${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()) as T;
  },
};

export default api;
