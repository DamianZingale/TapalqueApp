import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-dark text-light py-4 mt-auto">
            <Container>
                <Row className="align-items-center">
                    <Col md={6} className="text-center text-md-end">
                        <Link to="#" className="text-light text-decoration-none me-3">Nosotros</Link>
                        <Link to="#" className="text-light text-decoration-none me-3">Terminos y condiciones</Link>
                    </Col>
                    <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
                        <small>Desarrollado por <a className="text-light text-decoration-none" target="_blank" href="https://www.linkedin.com/in/damian-zingale-7a89bb114/">Damian</a>, <a className="text-light text-decoration-none" target="_blank" href="https://www.linkedin.com/in/santiago-lamot-/">Santiago</a> y <a className="text-light text-decoration-none" target="_blank" href="https://www.linkedin.com/in/nahuelncejas?">Nahuel</a></small>
                        <br/>
                        <small>&copy; {new Date().getFullYear()} Tapalqué App. Todos los derechos reservados.</small>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
}