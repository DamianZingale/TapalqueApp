import { useState } from "react";
import { Container, Row, Col, Card, Nav, Tab } from "react-bootstrap";
import { PerfilTab } from "../components/PerfilTab";
import { MisPedidosTab } from "../components/MisPedidosTab";
import { MisReservasTab } from "../components/MisReservasTab";
import { EstadisticasPersonalesTab } from "../components/EstadisticasPersonalesTab";
import authService from "../../../services/authService";

export default function UserDashboard() {
    const [activeTab, setActiveTab] = useState<string>("perfil");
    const user = authService.getUser();

    return (
        <Container fluid className="py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
            {/* Header del Dashboard */}
            <Row className="mb-4">
                <Col>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="py-4">
                            <Row className="align-items-center">
                                <Col md={8}>
                                    <h2 className="mb-2">
                                        ¡Hola, {user?.nombre || "Usuario"}! 👋
                                    </h2>
                                    <p className="text-muted mb-0">
                                        Bienvenido a tu panel personal. Aquí puedes ver tus pedidos, reservas y gestionar tu perfil.
                                    </p>
                                </Col>
                                <Col md={4} className="text-end">
                                    <div className="d-flex justify-content-end align-items-center gap-3">
                                        <div className="text-center">
                                            <div className="h3 mb-0 text-primary" id="total-pedidos">-</div>
                                            <small className="text-muted">Pedidos</small>
                                        </div>
                                        <div className="text-center">
                                            <div className="h3 mb-0 text-success" id="total-reservas">-</div>
                                            <small className="text-muted">Reservas</small>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Tabs del Dashboard */}
            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || "perfil")}>
                <Row>
                    {/* Sidebar de navegación */}
                    <Col md={3} className="mb-4">
                        <Card className="shadow-sm border-0 sticky-top" style={{ top: "20px" }}>
                            <Card.Header className="bg-white border-0 pt-4">
                                <h5 className="mb-0">Mi Panel</h5>
                            </Card.Header>
                            <Card.Body className="px-0">
                                <Nav variant="pills" className="flex-column">
                                    <Nav.Item>
                                        <Nav.Link
                                            eventKey="perfil"
                                            className="d-flex align-items-center gap-2 px-4 py-3"
                                        >
                                            <i className="bi bi-person-circle" style={{ fontSize: "1.2rem" }}></i>
                                            <span>Mi Perfil</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            eventKey="pedidos"
                                            className="d-flex align-items-center gap-2 px-4 py-3"
                                        >
                                            <i className="bi bi-bag-check" style={{ fontSize: "1.2rem" }}></i>
                                            <span>Mis Pedidos</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            eventKey="reservas"
                                            className="d-flex align-items-center gap-2 px-4 py-3"
                                        >
                                            <i className="bi bi-calendar-check" style={{ fontSize: "1.2rem" }}></i>
                                            <span>Mis Reservas</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            eventKey="estadisticas"
                                            className="d-flex align-items-center gap-2 px-4 py-3"
                                        >
                                            <i className="bi bi-graph-up" style={{ fontSize: "1.2rem" }}></i>
                                            <span>Estadísticas</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Contenido de las tabs */}
                    <Col md={9}>
                        <Tab.Content>
                            <Tab.Pane eventKey="perfil">
                                <PerfilTab />
                            </Tab.Pane>
                            <Tab.Pane eventKey="pedidos">
                                <MisPedidosTab />
                            </Tab.Pane>
                            <Tab.Pane eventKey="reservas">
                                <MisReservasTab />
                            </Tab.Pane>
                            <Tab.Pane eventKey="estadisticas">
                                <EstadisticasPersonalesTab />
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
        </Container>
    );
}
