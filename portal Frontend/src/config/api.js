 portal Frontend/src/config/api.js

// URL base de la API - todas las llamadas irán a través de /api/
const API_BASE_URL = '/api';

// Función helper para hacer peticiones
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Si hay token, agregarlo
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Métodos HTTP comunes
export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  
  post: (endpoint, data) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  put: (endpoint, data) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
  
  patch: (endpoint, data) => apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

// Ejemplos de uso en tus componentes:
// import { api } from './config/api';
// 
// const usuarios = await api.get('/usuarios');
// const nuevoUsuario = await api.post('/usuarios', { nombre: 'Juan' });
// const actualizado = await api.put('/usuarios/1', { nombre: 'Juan Actualizado' });
// await api.delete('/usuarios/1');