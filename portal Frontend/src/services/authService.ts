// portal Frontend/src/services/authService.ts
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'token';
const USER_KEY = 'user_data';

interface JwtPayload {
  sub: string;
  nombre?: string;
  rol?: number;
  exp: number;
  iat?: number;
  [key: string]: string | number | boolean | undefined;
}

interface UserData {
  id?: number | string;
  nombre?: string;
  email?: string;
  rol?: number;
  [key: string]: string | number | boolean | undefined;
}

export const authService = {
  // Guardar token después del login
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Verificar si hay token (usuario está autenticado)
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Guardar datos del usuario
  setUser(userData: UserData): void {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  },

  // Obtener datos del usuario
  getUser(): UserData | null {
    const userData = localStorage.getItem(USER_KEY);
    if (!userData) return null;

    try {
      return JSON.parse(userData) as UserData;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },
  // Guardar refresh token
  setRefreshToken(refreshToken: string): void {
    localStorage.setItem('refresh_token', refreshToken);
  },

  // Obtener refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  },

  // Obtener rol del usuario desde el token
  getRolUsuario(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = jwtDecode<JwtPayload>(token);
      return payload.rol ?? null;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  },

  // Obtener nombre del usuario desde el token
  getNombreUsuario(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = jwtDecode<JwtPayload>(token);
      return payload.nombre ?? null;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  },

  // Cerrar sesión (limpiar todo)
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Decodificar JWT completo
  decodeToken(token?: string): JwtPayload | null {
    const tokenToUse = token ?? this.getToken();
    if (!tokenToUse) return null;

    try {
      return jwtDecode<JwtPayload>(tokenToUse);
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  },

  // Verificar si el token expiró
  isTokenExpired(token?: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded?.exp) return true;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  },

  // Verificar si la sesión es válida
  isSessionValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  },

  // Verificar si el usuario tiene un rol específico
  hasRole(role: number): boolean {
    const userRole = this.getRolUsuario();
    return userRole === role;
  },

  // Verificar si el usuario tiene uno de varios roles
  hasAnyRole(roles: number[]): boolean {
    const userRole = this.getRolUsuario();
    return userRole !== null && roles.includes(userRole);
  },
};

export default authService;

// Exportar tipos para usar en otros archivos
export type { JwtPayload, UserData };
