// BotonSesion.tsx
import { Nav, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import { ROLES } from '../constants/constSecciones';

interface BotonSesionProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export const BotonSesion = ({ isLoggedIn, onLogout }: BotonSesionProps) => {
  const user = authService.getUser();
  const userRol = authService.getRolUsuario();

  // Verificar roles usando números
  const esModerador = userRol === ROLES.MODERADOR;
  const esAdmin = userRol === ROLES.ADMINISTRADOR;
  const esUsuarioComun = userRol === ROLES.USUARIO;

  if (isLoggedIn) {
    // Usuario autenticado - Mostrar dropdown según rol
    return (
      <NavDropdown
        title={user?.nombre || user?.firtName || 'Mi Cuenta'}
        id="user-dropdown"
        align={{ lg: 'end' }}
      >
        {/* Solo usuarios comunes ven el panel de usuario */}
        {esUsuarioComun && (
          <>
            <NavDropdown.Item as={Link} to="/dashboard">
              📊 Mi Panel
            </NavDropdown.Item>

            <NavDropdown.Divider />
          </>
        )}

        {/* Admin ve acceso a administración */}
        {esAdmin && (
          <>
            <NavDropdown.Item as={Link} to="/admin/select-business">
              ⚙️ Panel de Administración
            </NavDropdown.Item>
            <NavDropdown.Divider />
          </>
        )}

        {/* Moderador ve acceso al panel de moderador */}
        {esModerador && (
          <>
            <NavDropdown.Item as={Link} to="/moderador">
              ⚙️ Panel Administrador Gral
            </NavDropdown.Item>
            <NavDropdown.Divider />
          </>
        )}
        <NavDropdown.Item onClick={onLogout}>🚪 Cerrar Sesión</NavDropdown.Item>
      </NavDropdown>
    );
  }

  // Usuario NO autenticado - Mostrar botones de login/registro
  return (
    <>
      <Nav.Link as={Link} to="/login">
        Iniciar Sesión
      </Nav.Link>
      <Nav.Link as={Link} to="/register">
        Registrarse
      </Nav.Link>
    </>
  );
};
