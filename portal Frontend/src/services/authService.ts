// portal Frontend/src/services/authService.ts
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'token';
const USER_KEY = 'user_data';

interface JwtPayload {
  sub: string;
  nombre?: string;
  fullName?: string;
  rol?: number | string; // Backend envía string, frontend convierte a número
  exp: number;
  iat?: number;
  [key: string]: string | number | boolean | undefined;
}

interface UserData {
  id?: number | string;
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  dni?: string;
  direccion?: string;
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

  // Obtener rol del usuario desde el token (convertido a número)
  // Backend envía: USER, MODERADOR, ADMINISTRADOR como strings
  // Frontend usa: 3=USER, 1=MODERADOR, 2=ADMINISTRADOR
  getRolUsuario(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = jwtDecode<JwtPayload>(token);
      const rol = payload.rol;

      // Si ya es número, devolverlo directamente
      if (typeof rol === 'number') return rol;

      // Si es string, convertir al número correspondiente
      if (typeof rol === 'string') {
        switch (rol) {
          case 'MODERADOR': return 1;
          case 'ADMINISTRADOR': return 2;
          case 'USER': return 3;
          default: return null;
        }
      }

      return null;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  },

  // Obtener nombre del usuario desde el token
  // Backend envía fullName (firstName del usuario)
  getNombreUsuario(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = jwtDecode<JwtPayload>(token);
      return payload.fullName ?? payload.nombre ?? null;
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

  // Verificar si el usuario tiene datos completos para reservas/pedidos
  hasCompleteProfileForReservations(): boolean {
    const user = this.getUser();
    if (!user) return false;
    return !!(user.nombre && user.telefono && user.dni);
  },

  // Obtener campos faltantes para reservas
  getMissingFieldsForReservations(): string[] {
    const user = this.getUser();
    if (!user) return ['nombre', 'telefono', 'dni'];
    const missing: string[] = [];
    if (!user.nombre) missing.push('nombre');
    if (!user.telefono) missing.push('teléfono');
    if (!user.dni) missing.push('DNI');
    return missing;
  },

  // Sincronizar datos del usuario desde el backend
  // Retorna true si los datos están completos para reservas
  async syncUserFromBackend(): Promise<boolean> {
    const user = this.getUser();
    if (!user?.id || !user?.email) return false;

    try {
      const response = await fetch(`/api/user/profile/me?email=${encodeURIComponent(user.email)}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) return false;

      const userData = await response.json();

      // Actualizar localStorage con datos del backend
      this.setUser({
        ...user,
        nombre: userData.nombre,
        apellido: userData.apellido,
        email: userData.email,
        telefono: userData.telefono,
        dni: userData.dni,
        direccion: userData.direccion,
      });

      // Verificar si ahora tiene datos completos
      return !!(userData.nombre && userData.telefono && userData.dni);
    } catch (error) {
      console.error('Error sincronizando datos del usuario:', error);
      return false;
    }
  },
};

export default authService;

// Exportar tipos para usar en otros archivos
export type { JwtPayload, UserData };
