import { Navigate } from 'react-router-dom';
import authService from '../../services/authService';

// Roles: 1 = Moderador, 2 = Administrador, 3 = Usuario
export const ROLES = {
    MODERADOR: 1,
    ADMINISTRADOR: 2,
    USUARIO: 3
};

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
    redirectTo = '/login'
}: ProtectedRouteProps) => {
    const isAuthenticated = authService.isAuthenticated();
    const userRol = authService.getRolUsuario();

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si hay roles permitidos especificados, verificar que el usuario tenga uno de ellos
    if (allowedRoles && allowedRoles.length > 0) {
        if (userRol === null || !allowedRoles.includes(userRol)) {
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
 * HOC para proteger rutas solo para admins y moderadores (roles 1 y 2)
 */
export const AdminOnlyRoute = ({ children }: { children: React.ReactNode }) => (
    <ProtectedRoute allowedRoles={[ROLES.MODERADOR, ROLES.ADMINISTRADOR]} redirectTo="/">
        {children}
    </ProtectedRoute>
);

/**
 * HOC para proteger rutas solo para admins (rol 2)
 */
export const SuperAdminOnlyRoute = ({ children }: { children: React.ReactNode }) => (
    <ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR]} redirectTo="/">
        {children}
    </ProtectedRoute>
);

/**
 * HOC para proteger rutas solo para moderadores (rol 1)
 */
export const ModeradorOnlyRoute = ({ children }: { children: React.ReactNode }) => (
    <ProtectedRoute allowedRoles={[ROLES.MODERADOR]} redirectTo="/">
        {children}
    </ProtectedRoute>
);
