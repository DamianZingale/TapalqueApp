/**
 * Configuración de la aplicación basada en variables de entorno
 */

export const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090',
  
  // App Information
  appName: import.meta.env.VITE_APP_TITLE || 'Tapalque App',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  
  // Features
  debug: import.meta.env.VITE_DEBUG === 'true',
  enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  
  // Performance
  cacheDuration: parseInt(import.meta.env.VITE_CACHE_DURATION || '3600000'),
  
  // API Endpoints (construidos dinámicamente)
  endpoints: {
    auth: {
      login: '/api/jwt/public/login',
      refresh: '/api/jwt/public/refresh-token',
    },
    users: {
      public: '/api/user/public',
      all: '/api/user/all',
      byId: (id: string) => `/api/user/${id}`,
    },
    servicios: {
      list: '/api/servicio',
      byId: (id: string) => `/api/servicio/${id}`,
      upload: (id: string) => `/api/servicio/imagen/${id}`,
    },
    comercios: {
      list: '/api/comercio/list',
      byId: (id: string) => `/api/comercio/${id}`,
      upload: (id: string) => `/api/comercio/imagen/${id}`,
    },
    gastronomia: {
      list: '/api/gastronomia/findAll',
      upload: (id: string) => `/api/gastronomia/imagen/${id}`,
    },
    hospedajes: {
      list: '/api/hospedajes',
      upload: (id: string) => `/api/hospedaje/imagen/${id}`,
    },
    eventos: {
      list: '/api/eventos',
      upload: (id: string) => `/api/eventos/imagen/${id}`,
    },
    termas: {
      list: '/api/terma',
      upload: (id: string) => `/api/terma/imagen/${id}`,
    },
    espacios: {
      list: '/api/espacio-publico',
      upload: (id: string) => `/api/espacio-publico/imagen/${id}`,
    },
  }
};

/**
 * Determina si estamos en modo desarrollo
 */
export const isDevelopment = config.environment === 'development';

/**
 * Determina si estamos en modo producción
 */
export const isProduction = config.environment === 'production';

/**
 * Log condicional según el entorno
 */
export const log = {
  debug: (...args: any[]) => {
    if (config.debug) {
      console.log(`[DEBUG]`, ...args);
    }
  },
  info: (...args: any[]) => {
    if (config.debug || isDevelopment) {
      console.info(`[INFO]`, ...args);
    }
  },
  warn: (...args: any[]) => {
    console.warn(`[WARN]`, ...args);
  },
  error: (...args: any[]) => {
    console.error(`[ERROR]`, ...args);
  }
};

export default config;