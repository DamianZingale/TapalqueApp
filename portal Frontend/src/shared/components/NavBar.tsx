import { useEffect, useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BotonSesion } from "./BotonSesion";

export default function NavBar() {
    const [expanded, setExpanded] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoggedIn, setisLoggedIn] = useState(true);
    // Cierra el menú cuando cambia la ruta
    useEffect(() => {
        setExpanded(false);
    }, [location]);
    
    const handleLogout = () => {
        setisLoggedIn(false);
        navigate("/");
    };

    return (
        <Navbar
            bg="dark"
            variant="dark"
            expand="lg"
            sticky="top"
            expanded={expanded}
            onToggle={() => setExpanded(!expanded)}>
            <Container>
                <Navbar.Brand as={Link} to="/" onClick={() => setExpanded(false)}>
                    Tapalqué App
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="main-navbar" />
                <Navbar.Collapse id="main-navbar">
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to="/termas">Termas</Nav.Link>
                        <Nav.Link as={Link} to="/gastronomia">Gastronomía</Nav.Link>
                        <Nav.Link as={Link} to="/hospedaje">Hospedajes</Nav.Link>
                        <Nav.Link as={Link} to="/comercio">Comercios</Nav.Link>
                        <BotonSesion isLoggedIn={isLoggedIn} onLogout={handleLogout} />
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}