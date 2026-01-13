// BotonSesion.tsx
import { Nav, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';

interface BotonSesionProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export const BotonSesion = ({ isLoggedIn, onLogout }: BotonSesionProps) => {
  const user = authService.getUser();

  if (isLoggedIn) {
    // Usuario autenticado - Mostrar dropdown con perfil
    return (
      <NavDropdown
        title={user?.nombre || user?.firtName || 'Mi Cuenta'}
        id="user-dropdown"
        align="end"
      >
        <NavDropdown.Item as={Link} to="/perfil">
          👤 Mi Perfil
        </NavDropdown.Item>
        <NavDropdown.Item as={Link} to="/mis-pedidos">
          📦 Mis Pedidos
        </NavDropdown.Item>
        <NavDropdown.Item as={Link} to="/mis-reservas">
          📅 Mis Reservas
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
