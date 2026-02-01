import api from '../../../shared/utils/api';

export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/jwt/public/login', credentials),
  
  register: (userData: any) =>
    api.post('/user/public/register', userData),
  
  verifyEmail: (token: string) =>
    api.get(`/user/public/verify?token=${token}`),
};