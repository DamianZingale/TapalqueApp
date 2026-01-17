// BotonSesion.tsx
import { Nav, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';

interface BotonSesionProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

// Roles: 1 = Moderador, 2 = Administrador, 3 = Usuario
const ROLES = {
  MODERADOR: 1,
  ADMINISTRADOR: 2,
  USUARIO: 3
};

export const BotonSesion = ({ isLoggedIn, onLogout }: BotonSesionProps) => {
  const user = authService.getUser();
  const userRol = authService.getRolUsuario();

  // Verificar roles
  const esModerador = userRol === ROLES.MODERADOR;
  const esAdmin = userRol === ROLES.ADMINISTRADOR;
  const esUsuarioComun = userRol === ROLES.USUARIO;

  if (isLoggedIn) {
    // Usuario autenticado - Mostrar dropdown según rol
    return (
      <NavDropdown
        title={user?.nombre || user?.firtName || 'Mi Cuenta'}
        id="user-dropdown"
        align="end"
      >
        {/* Solo usuarios comunes ven el panel de usuario */}
        {esUsuarioComun && (
          <>
            <NavDropdown.Item as={Link} to="/dashboard">
              📊 Mi Panel
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item as={Link} to="/dashboard">
              📦 Mis Pedidos
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/dashboard">
              📅 Mis Reservas
            </NavDropdown.Item>
            <NavDropdown.Divider />
          </>
        )}

        {/* Moderador ve acceso a su panel */}
        {esModerador && (
          <>
            <NavDropdown.Item as={Link} to="/moderador">
              🛠️ Panel de Moderador
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

        <NavDropdown.Item as={Link} to="/perfil">
          👤 Mi Perfil
        </NavDropdown.Item>
        <NavDropdown.Divider />
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
