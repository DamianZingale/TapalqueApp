import api from '../../../shared/utils/api';

export const comercioAPI = {
  getComercios: () => api.get('/comercio/list'),
  
  getComercioById: (id: number) => api.get(`/comercio/${id}`),
  
  createComercio: (data: any) => api.post('/comercio', data),
  
  updateComercio: (id: number, data: any) => api.put(`/comercio/${id}`, data),
  
  deleteComercio: (id: number) => api.delete(`/comercio/${id}`),
  
  getAdministradores: () => api.get('/user/administradores'),
};