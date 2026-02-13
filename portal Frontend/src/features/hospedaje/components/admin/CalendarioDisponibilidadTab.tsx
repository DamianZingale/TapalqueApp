import { Card, Alert } from 'react-bootstrap';

export const CalendarioDisponibilidadTab = () => {
    return (
        <div>
            <Alert variant="info">
                <strong>Vista de Calendario</strong>
                <p className="mb-0">
                    Aquí se mostrará un calendario interactivo con la disponibilidad de habitaciones,
                    reservas confirmadas, bloqueos temporales, etc.
                </p>
            </Alert>

            <Card>
                <Card.Header>
                    <h5>Calendario de Disponibilidad</h5>
                </Card.Header>
                <Card.Body style={{ minHeight: '400px' }}>
                    <div className="text-center text-muted py-5">
                        <h4>Próximamente</h4>
                        <p>Calendario interactivo con react-calendar o similar</p>
                        <ul className="list-unstyled mt-3">
                            <li>✓ Ver disponibilidad por día</li>
                            <li>✓ Filtrar por tipo de habitación</li>
                            <li>✓ Ver reservas confirmadas</li>
                            <li>✓ Bloquear fechas manualmente</li>
                        </ul>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};
