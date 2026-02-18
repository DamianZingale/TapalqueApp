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

  const [isLoggedIn, setIsLoggedIn] = useState(authService.isAuthenticated());

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
        <div className="d-flex align-items-center gap-2 text-white">
          {isLoggedIn && <NotificationBell />}
        </div>
        <Navbar.Toggle aria-controls="main-navbar" />

        <Navbar.Collapse id="main-navbar" className="d-lg-flex">
          <Nav className="mx-auto">
            <Nav.Link as={Link} to="/termas" onClick={() => setExpanded(false)}>
              Térmas Tapalque
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/gastronomia"
              onClick={() => setExpanded(false)}
            >
              Gastronomía
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/hospedaje"
              onClick={() => setExpanded(false)}
            >
              Hospedajes
            </Nav.Link>
          </Nav>

          <div className="d-flex align-items-center gap-2 text-white">
            <BotonSesion isLoggedIn={isLoggedIn} onLogout={handleLogout} />
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
