import { Card, Table, Badge, Button, Alert } from 'react-bootstrap';

export const GestionHabitacionesTab = () => {
    // Mock data de habitaciones
    const habitaciones = [
        {
            id: 1,
            numero: '101',
            tipo: 'Simple',
            capacidad: 2,
            precio: 5000,
            disponible: true,
            servicios: ['WiFi', 'TV', 'Aire acondicionado']
        },
        {
            id: 2,
            numero: '102',
            tipo: 'Doble',
            capacidad: 4,
            precio: 8000,
            disponible: true,
            servicios: ['WiFi', 'TV', 'Aire acondicionado', 'Minibar']
        },
        {
            id: 3,
            numero: '201',
            tipo: 'Suite',
            capacidad: 4,
            precio: 12000,
            disponible: false,
            servicios: ['WiFi', 'TV', 'Aire acondicionado', 'Minibar', 'Jacuzzi']
        },
    ];

    return (
        <div>
            <Alert variant="info">
                <strong>Gestión de Habitaciones</strong>
                <p className="mb-0">
                    Administre las habitaciones del hospedaje/hotel: agregar, editar, eliminar, y gestionar servicios.
                </p>
            </Alert>

            <div className="mb-3 d-flex justify-content-between align-items-center">
                <h5>Lista de Habitaciones</h5>
                <Button variant="success">+ Agregar Habitación</Button>
            </div>

            <Table striped bordered hover responsive>
                <thead className="table-dark">
                    <tr>
                        <th>Número</th>
                        <th>Tipo</th>
                        <th>Capacidad</th>
                        <th>Precio/Noche</th>
                        <th>Servicios</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {habitaciones.map(hab => (
                        <tr key={hab.id}>
                            <td><strong>{hab.numero}</strong></td>
                            <td><Badge bg="primary">{hab.tipo}</Badge></td>
                            <td>{hab.capacidad} personas</td>
                            <td><strong>${hab.precio}</strong></td>
                            <td>
                                {hab.servicios.map((s, idx) => (
                                    <Badge key={idx} bg="light" text="dark" className="me-1 mb-1">
                                        {s}
                                    </Badge>
                                ))}
                            </td>
                            <td>
                                <Badge bg={hab.disponible ? 'success' : 'warning'}>
                                    {hab.disponible ? 'Disponible' : 'Ocupada'}
                                </Badge>
                            </td>
                            <td>
                                <Button size="sm" variant="primary" className="me-2">
                                    ✏️ Editar
                                </Button>
                                <Button size="sm" variant="danger">
                                    🗑️ Eliminar
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Card className="mt-3">
                <Card.Body>
                    <p className="text-muted mb-0">
                        <strong>Nota:</strong> Los datos mostrados son de ejemplo. Conectar con backend para gestión completa.
                    </p>
                </Card.Body>
            </Card>
        </div>
    );
};
