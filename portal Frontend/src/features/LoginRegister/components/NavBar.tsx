import { Container, Nav, Navbar } from "react-bootstrap"
import { Link, useLocation } from "react-router-dom"

export const NavBar = () => {
    const location = useLocation();
    const isLoginPage = location.pathname === "/login";

    return (
        <Navbar bg="dark" variant="dark" sticky="top">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    Tapalqué App
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="main-navbar" />
                    <Nav className="ms-auto">
                        {isLoginPage ? (
                            <Nav.Link as={Link} to="/register">Registrarse</Nav.Link>
                        ) : (
                            <Nav.Link as={Link} to="/login">Iniciar Sesión</Nav.Link>
                        )}
                    </Nav>
            </Container>
        </Navbar>
    );
};