import api from '../../../shared/utils/api';

export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/jwt/public/login', credentials),

  register: (userData: any) =>
    api.post('/user/public/register', userData),

  verifyEmail: (token: string) =>
    api.get(`/user/public/verify?token=${token}`),

  forgotPassword: (email: string) =>
    api.post('/user/public/forgot-password', { email }),

  validateResetToken: (token: string) =>
    api.get(`/user/public/validate-reset-token?token=${token}`),

  resetPassword: (token: string, password: string) =>
    api.post('/user/public/reset-password', { token, password }),
};