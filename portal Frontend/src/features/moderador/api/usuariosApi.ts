import api from '../../../shared/utils/api';

export const usuariosAPI = {
  getAllUsers: () => api.get('/user/all'),
  
  updateUserRole: (userId: number, role: string) =>
    api.put(`/user/${userId}/role`, { role }),
  
  createModerador: (userData: any) =>
    api.post('/user/moderador/create', userData),
  
  getAdministradores: () => api.get('/user/administradores'),
};