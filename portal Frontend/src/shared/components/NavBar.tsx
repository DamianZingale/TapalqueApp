import { useEffect, useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
    const [expanded, setExpanded] = useState(false);
    const location = useLocation();

    // Cierra el menú cuando cambia la ruta
    useEffect(() => {
        setExpanded(false);
    }, [location]);
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
                        <Nav.Link
                            as={Link}
                            to="/login"
                            className="border border-light rounded-3 px-3 text-white"
                        >
                            Iniciar Sesión
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}