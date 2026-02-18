import { useEffect, useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { BotonSesion } from './BotonSesion';
import { NotificationBell } from './NotificationBell';

export default function NavBar() {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Verificar autenticación real
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isAuthenticated());

  // Actualizar estado cuando cambia la ruta (por si el usuario hizo login/logout)
  useEffect(() => {
    setExpanded(false);
    setIsLoggedIn(authService.isAuthenticated());
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      sticky="top"
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" onClick={() => setExpanded(false)}>
          <img
            src="/logo-tapalque.png"
            alt=""
            width="28"
            height="28"
            className="d-inline-block align-top me-2"
          />
          Tapalqué App
        </Navbar.Brand>
        {/* Bell y sesión siempre visibles (fuera del collapse) */}
        <div className="d-flex align-items-center ms-auto me-1">
          {isLoggedIn && <NotificationBell />}
          <BotonSesion isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        </div>

        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-lg-auto">
            <Nav.Link as={Link} to="/termas" onClick={() => setExpanded(false)}>
              Térmas Tapalque
            </Nav.Link>
            <Nav.Link as={Link} to="/gastronomia" onClick={() => setExpanded(false)}>
              Gastronomía
            </Nav.Link>
            <Nav.Link as={Link} to="/hospedaje" onClick={() => setExpanded(false)}>
              Hospedajes
            </Nav.Link>
            <Nav.Link as={Link} to="/comercio" onClick={() => setExpanded(false)}>
              Comercios
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
