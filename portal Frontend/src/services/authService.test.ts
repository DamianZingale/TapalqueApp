import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './authService';

// Mock de jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn()
}));

import { jwtDecode } from 'jwt-decode';

const mockedJwtDecode = vi.mocked(jwtDecode);

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Token Management', () => {
    it('debe guardar el token en localStorage', () => {
      const token = 'test-token-123';
      authService.setToken(token);

      expect(localStorage.setItem).toHaveBeenCalledWith('token', token);
    });

    it('debe obtener el token de localStorage', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('stored-token');

      const token = authService.getToken();

      expect(localStorage.getItem).toHaveBeenCalledWith('token');
      expect(token).toBe('stored-token');
    });

    it('debe retornar null si no hay token', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const token = authService.getToken();

      expect(token).toBeNull();
    });
  });

  describe('Authentication Status', () => {
    it('isAuthenticated debe retornar true si hay token', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('valid-token');

      expect(authService.isAuthenticated()).toBe(true);
    });

    it('isAuthenticated debe retornar false si no hay token', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('User Data', () => {
    it('debe guardar datos del usuario', () => {
      const userData = { id: 1, nombre: 'Test User', email: 'test@example.com' };

      authService.setUser(userData);

      expect(localStorage.setItem).toHaveBeenCalledWith('user_data', JSON.stringify(userData));
    });

    it('debe obtener datos del usuario', () => {
      const userData = { id: 1, nombre: 'Test User' };
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(userData));

      const result = authService.getUser();

      expect(result).toEqual(userData);
    });

    it('debe retornar null si no hay datos de usuario', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const result = authService.getUser();

      expect(result).toBeNull();
    });

    it('debe retornar null si los datos están mal formateados', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('invalid-json');

      const result = authService.getUser();

      expect(result).toBeNull();
    });
  });

  describe('Refresh Token', () => {
    it('debe guardar refresh token', () => {
      const refreshToken = 'refresh-token-123';

      authService.setRefreshToken(refreshToken);

      expect(localStorage.setItem).toHaveBeenCalledWith('refresh_token', refreshToken);
    });

    it('debe obtener refresh token', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('stored-refresh-token');

      const token = authService.getRefreshToken();

      expect(localStorage.getItem).toHaveBeenCalledWith('refresh_token');
      expect(token).toBe('stored-refresh-token');
    });
  });

  describe('Token Decoding', () => {
    it('debe decodificar el token y obtener el rol', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('valid-token');
      mockedJwtDecode.mockReturnValue({ sub: 'test@example.com', rol: 2, exp: Date.now() / 1000 + 3600 });

      const rol = authService.getRolUsuario();

      expect(rol).toBe(2);
    });

    it('debe retornar null si no hay token para obtener rol', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const rol = authService.getRolUsuario();

      expect(rol).toBeNull();
    });

    it('debe decodificar el token y obtener el nombre', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('valid-token');
      mockedJwtDecode.mockReturnValue({ sub: 'test@example.com', nombre: 'Test User', exp: Date.now() / 1000 + 3600 });

      const nombre = authService.getNombreUsuario();

      expect(nombre).toBe('Test User');
    });

    it('debe retornar null si error al decodificar token', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('invalid-token');
      mockedJwtDecode.mockImplementation(() => { throw new Error('Invalid token'); });

      const rol = authService.getRolUsuario();

      expect(rol).toBeNull();
    });

    it('debe decodificar token completo', () => {
      const payload = { sub: 'test@example.com', rol: 1, nombre: 'Admin', exp: Date.now() / 1000 + 3600 };
      vi.mocked(localStorage.getItem).mockReturnValue('valid-token');
      mockedJwtDecode.mockReturnValue(payload);

      const decoded = authService.decodeToken();

      expect(decoded).toEqual(payload);
    });

    it('debe aceptar token como parámetro en decodeToken', () => {
      const payload = { sub: 'test@example.com', exp: Date.now() / 1000 + 3600 };
      mockedJwtDecode.mockReturnValue(payload);

      const decoded = authService.decodeToken('custom-token');

      expect(mockedJwtDecode).toHaveBeenCalledWith('custom-token');
      expect(decoded).toEqual(payload);
    });
  });

  describe('Token Expiration', () => {
    it('debe detectar token expirado', () => {
      const expiredPayload = { sub: 'test@example.com', exp: Date.now() / 1000 - 3600 };
      vi.mocked(localStorage.getItem).mockReturnValue('expired-token');
      mockedJwtDecode.mockReturnValue(expiredPayload);

      const isExpired = authService.isTokenExpired();

      expect(isExpired).toBe(true);
    });

    it('debe detectar token válido (no expirado)', () => {
      const validPayload = { sub: 'test@example.com', exp: Date.now() / 1000 + 3600 };
      vi.mocked(localStorage.getItem).mockReturnValue('valid-token');
      mockedJwtDecode.mockReturnValue(validPayload);

      const isExpired = authService.isTokenExpired();

      expect(isExpired).toBe(false);
    });

    it('debe retornar true si no hay exp en el token', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('no-exp-token');
      mockedJwtDecode.mockReturnValue({ sub: 'test@example.com' });

      const isExpired = authService.isTokenExpired();

      expect(isExpired).toBe(true);
    });

    it('isSessionValid debe retornar true para sesión válida', () => {
      const validPayload = { sub: 'test@example.com', exp: Date.now() / 1000 + 3600 };
      vi.mocked(localStorage.getItem).mockReturnValue('valid-token');
      mockedJwtDecode.mockReturnValue(validPayload);

      const isValid = authService.isSessionValid();

      expect(isValid).toBe(true);
    });

    it('isSessionValid debe retornar false si no hay token', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const isValid = authService.isSessionValid();

      expect(isValid).toBe(false);
    });
  });

  describe('Role Checking', () => {
    it('hasRole debe retornar true si el rol coincide', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('valid-token');
      mockedJwtDecode.mockReturnValue({ sub: 'test@example.com', rol: 2, exp: Date.now() / 1000 + 3600 });

      expect(authService.hasRole(2)).toBe(true);
    });

    it('hasRole debe retornar false si el rol no coincide', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('valid-token');
      mockedJwtDecode.mockReturnValue({ sub: 'test@example.com', rol: 3, exp: Date.now() / 1000 + 3600 });

      expect(authService.hasRole(2)).toBe(false);
    });

    it('hasAnyRole debe retornar true si tiene alguno de los roles', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('valid-token');
      mockedJwtDecode.mockReturnValue({ sub: 'test@example.com', rol: 2, exp: Date.now() / 1000 + 3600 });

      expect(authService.hasAnyRole([1, 2, 3])).toBe(true);
    });

    it('hasAnyRole debe retornar false si no tiene ninguno de los roles', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('valid-token');
      mockedJwtDecode.mockReturnValue({ sub: 'test@example.com', rol: 5, exp: Date.now() / 1000 + 3600 });

      expect(authService.hasAnyRole([1, 2, 3])).toBe(false);
    });

    it('hasAnyRole debe retornar false si no hay token', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      expect(authService.hasAnyRole([1, 2, 3])).toBe(false);
    });
  });

  describe('Logout', () => {
    it('debe eliminar token y datos de usuario al cerrar sesión', () => {
      authService.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user_data');
    });
  });
});
