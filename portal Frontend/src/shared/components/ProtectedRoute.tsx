import { Navigate } from 'react-router-dom';
import authService from '../../services/authService';
import { ROLES } from '../../shared/constants/constSecciones';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[];
  redirectTo?: string;
}

/**
 * Componente para proteger rutas según autenticación y roles
 *
 * @param children - Componente a renderizar si tiene acceso
 * @param allowedRoles - Array de roles permitidos (opcional, si no se especifica solo verifica autenticación)
 * @param redirectTo - Ruta de redirección si no tiene acceso (default: /login)
 */
export const ProtectedRoute = ({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) => {
  const isAuthenticated = authService.isAuthenticated();
  const userRol = authService.getRolUsuario();

  // Debug - eliminar en producción
  console.log('ProtectedRoute Debug:', {
    isAuthenticated,
    userRol,
    allowedRoles,
    token: authService.getToken(),
    sessionValid: authService.isSessionValid()
  });

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si hay roles permitidos especificados, verificar que el usuario tenga uno de ellos
  if (allowedRoles && allowedRoles.length > 0) {
    // Convertir rol a número si viene como string
    // Backend envía: USER, MODERADOR, ADMINISTRADOR
    const numericRol = typeof userRol === 'string' ?
      (userRol === 'MODERADOR' ? 1 : userRol === 'ADMINISTRADOR' ? 2 : (userRol === 'USER' || userRol === 'USUARIO') ? 3 : null)
      : userRol;
    
    console.log('Verificación de rol:', {
      userRol,
      numericRol,
      allowedRoles,
      includes: numericRol !== null && allowedRoles.includes(numericRol)
    });
    
    if (numericRol === null || !allowedRoles.includes(numericRol)) {
      console.log('Acceso denegado. Rol requerido:', allowedRoles, 'Rol usuario:', userRol, 'Rol numérico:', numericRol);
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
};

/**
 * HOC para proteger rutas solo para usuarios comunes (rol 3)
 */
export const UserOnlyRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={[ROLES.USUARIO]} redirectTo="/">
    {children}
  </ProtectedRoute>
);

/**
 * HOC para proteger rutas solo para admins (rol 2)
 */
export const AdminOnlyRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR]} redirectTo="/">
    {children}
  </ProtectedRoute>
);

/**
 * HOC para proteger rutas solo para moderadores (rol 1)
 */
export const ModeradorOnlyRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <ProtectedRoute allowedRoles={[ROLES.MODERADOR]} redirectTo="/">
    {children}
  </ProtectedRoute>
);
