import { Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function NavBar() {
    return (
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    Tapalqué App
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="main-navbar" />
                <Navbar.Collapse id="main-navbar">
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to="/termas">Termas</Nav.Link>
                        <Nav.Link as={Link} to="/gastronomia">Gastronomía</Nav.Link>
                        <Nav.Link as={Link} to="/hospedaje">Hospedajes</Nav.Link>
                        <Nav.Link as={Link} to="/comercio">Comercios</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}