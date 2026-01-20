import { useState } from 'react';
import { Accordion, Badge, Container } from 'react-bootstrap';
import { ComerciosSection } from './sections/ComerciosSection';
import { EspaciosPublicosSection } from './sections/EspaciosPublicosSection';
import { EventosSection } from './sections/EventosSection';
import { GastronomiaSection } from './sections/GastronomiaSection';
import { HospedajesSection } from './sections/HospedajesSection';
import { ServiciosSection } from './sections/ServiciosSection';
import { TermasSection } from './sections/TermasSection';
import { UsuariosSection } from './sections/UsuariosSection';

const secciones = [
  { key: 'usuarios', titulo: 'Usuarios', componente: <UsuariosSection /> },
  { key: 'comercios', titulo: 'Comercios', componente: <ComerciosSection /> },
  { key: 'servicios', titulo: 'Servicios', componente: <ServiciosSection /> },
  { key: 'eventos', titulo: 'Eventos', componente: <EventosSection /> },
  { key: 'espacios', titulo: 'Espacios Públicos', componente: <EspaciosPublicosSection /> },
  { key: 'hospedajes', titulo: 'Hospedajes', componente: <HospedajesSection /> },
  { key: 'gastronomia', titulo: 'Gastronomía', componente: <GastronomiaSection /> },
  { key: 'termas', titulo: 'Termas', componente: <TermasSection /> },
];

export default function ModeradorDashboard() {
  const [activeKey, setActiveKey] = useState<string | null>('usuarios');

  return (
    <Container fluid className="py-3">
      <div className="mb-4">
        <h4 className="mb-1">Panel de Moderador</h4>
        <Badge bg="secondary">Gestión de contenido público</Badge>
      </div>

      <Accordion activeKey={activeKey} onSelect={(k) => setActiveKey(k as string | null)}>
        {secciones.map((seccion) => (
          <Accordion.Item eventKey={seccion.key} key={seccion.key}>
            <Accordion.Header>{seccion.titulo}</Accordion.Header>
            <Accordion.Body>{seccion.componente}</Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </Container>
  );
}
