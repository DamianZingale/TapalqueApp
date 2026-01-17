import { useState } from "react";
import { Container, Nav, Tab, Badge } from "react-bootstrap";
import { TermasSection } from "./sections/TermasSection";
import { EventosSection } from "./sections/EventosSection";
import { ComerciosSection } from "./sections/ComerciosSection";
import { ServiciosSection } from "./sections/ServiciosSection";
import { EspaciosPublicosSection } from "./sections/EspaciosPublicosSection";
import { HospedajesSection } from "./sections/HospedajesSection";
import { GastronomiaSection } from "./sections/GastronomiaSection";

export default function ModeradorDashboard() {
    const [activeKey, setActiveKey] = useState("comercios");

    const secciones = [
        { key: "comercios", titulo: "Comercios" },
        { key: "servicios", titulo: "Servicios" },
        { key: "eventos", titulo: "Eventos" },
        { key: "espacios", titulo: "Espacios Públicos" },
        { key: "hospedajes", titulo: "Hospedajes" },
        { key: "gastronomia", titulo: "Gastronomía" },
        { key: "termas", titulo: "Termas (solo editar)" },
    ];

    return (
        <Container fluid className="py-3">
            <div className="mb-3">
                <h4>Panel de Moderador</h4>
                <Badge bg="secondary">Gestión de contenido</Badge>
            </div>

            <Tab.Container activeKey={activeKey} onSelect={(k) => setActiveKey(k || "comercios")}>
                <Nav variant="tabs" className="mb-3 flex-wrap">
                    {secciones.map((sec) => (
                        <Nav.Item key={sec.key}>
                            <Nav.Link eventKey={sec.key} className="px-3 py-2">
                                {sec.titulo}
                            </Nav.Link>
                        </Nav.Item>
                    ))}
                </Nav>

                <Tab.Content>
                    <Tab.Pane eventKey="comercios"><ComerciosSection /></Tab.Pane>
                    <Tab.Pane eventKey="servicios"><ServiciosSection /></Tab.Pane>
                    <Tab.Pane eventKey="eventos"><EventosSection /></Tab.Pane>
                    <Tab.Pane eventKey="espacios"><EspaciosPublicosSection /></Tab.Pane>
                    <Tab.Pane eventKey="hospedajes"><HospedajesSection /></Tab.Pane>
                    <Tab.Pane eventKey="gastronomia"><GastronomiaSection /></Tab.Pane>
                    <Tab.Pane eventKey="termas"><TermasSection /></Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </Container>
    );
}
