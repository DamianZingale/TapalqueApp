import { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Spinner, Alert, Badge } from 'react-bootstrap';
import {
    fetchEstadisticasHospedaje,
    EstadisticasHospedaje
} from '../../../services/fetchEstadisticas';

interface HosteleriaEstadisticasProps {
    businessId: string;
}

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function HosteleriaEstadisticas({ businessId }: HosteleriaEstadisticasProps) {
    const [estadisticas, setEstadisticas] = useState<EstadisticasHospedaje | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        cargarEstadisticas();
    }, [businessId]);

    const cargarEstadisticas = async () => {
        setLoading(true);
        setError(null);
        const data = await fetchEstadisticasHospedaje(businessId);
        if (data) {
            setEstadisticas(data);
        } else {
            setError('No se pudieron cargar las estadísticas');
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Cargando estadísticas...</p>
            </div>
        );
    }

    if (error || !estadisticas) {
        return (
            <Alert variant="warning">
                <Alert.Heading>Sin datos disponibles</Alert.Heading>
                <p>
                    No se pudieron cargar las estadísticas del hospedaje.
                    Esto puede deberse a que aún no hay reservas registradas o a un error de conexión.
                </p>
            </Alert>
        );
    }

    const maxOcupacion = Math.max(...estadisticas.ocupacionSemana, 1);

    return (
        <div>
            {/* Tarjetas de resumen */}
            <Row className="mb-4">
                <Col md={3} className="mb-3">
                    <Card className="text-center shadow-sm h-100 border-primary">
                        <Card.Body>
                            <h6 className="text-muted">Reservas Activas</h6>
                            <h2 className="text-primary">{estadisticas.reservasActivas}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="text-center shadow-sm h-100 border-success">
                        <Card.Body>
                            <h6 className="text-muted">Ocupación Hoy</h6>
                            <h2 className="text-success">{estadisticas.ocupacionHoy}%</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="text-center shadow-sm h-100 border-info">
                        <Card.Body>
                            <h6 className="text-muted">Ingresos del Mes</h6>
                            <h2 className="text-info">${estadisticas.ingresosMes.toLocaleString()}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="text-center shadow-sm h-100 border-warning">
                        <Card.Body>
                            <h6 className="text-muted">Reservas Pendientes</h6>
                            <h2 className={estadisticas.reservasPendientes > 0 ? 'text-warning' : 'text-success'}>
                                {estadisticas.reservasPendientes}
                            </h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                {/* Ocupación semanal */}
                <Col md={5} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <Card.Header>
                            <h5 className="mb-0">Ocupación esta semana</h5>
                        </Card.Header>
                        <Card.Body>
                            {estadisticas.ocupacionSemana.length > 0 ? (
                                <div className="d-flex flex-column gap-2">
                                    {estadisticas.ocupacionSemana.map((valor, idx) => {
                                        const porcentaje = Math.round((valor / maxOcupacion) * 100);
                                        const getBadgeColor = () => {
                                            if (valor >= 80) return 'danger';
                                            if (valor >= 50) return 'warning';
                                            return 'success';
                                        };
                                        return (
                                            <div key={idx} className="d-flex align-items-center gap-2">
                                                <span className="text-muted" style={{ minWidth: '36px', fontSize: '0.85rem' }}>
                                                    {DIAS_SEMANA[idx % 7]}
                                                </span>
                                                <div className="flex-grow-1 bg-light rounded" style={{ height: '20px' }}>
                                                    <div
                                                        className={`bg-${getBadgeColor()} rounded`}
                                                        style={{ width: `${porcentaje}%`, height: '100%', transition: 'width 0.4s' }}
                                                    />
                                                </div>
                                                <Badge bg={getBadgeColor()} style={{ minWidth: '48px' }}>
                                                    {valor}%
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-muted text-center py-3">Sin datos de ocupación</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Reservas por mes */}
                <Col md={7} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <Card.Header>
                            <h5 className="mb-0">Reservas por mes</h5>
                        </Card.Header>
                        <Card.Body>
                            {estadisticas.reservasPorMes.length > 0 ? (
                                <Table hover size="sm">
                                    <thead>
                                        <tr>
                                            <th>Mes</th>
                                            <th className="text-center">Reservas</th>
                                            <th className="text-end">Ingresos</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {estadisticas.reservasPorMes.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.mes}</td>
                                                <td className="text-center">
                                                    <Badge bg="primary">{item.cantidad}</Badge>
                                                </td>
                                                <td className="text-end text-success">
                                                    ${item.ingresos.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="table-dark">
                                        <tr>
                                            <td><strong>Total</strong></td>
                                            <td className="text-center">
                                                <strong>
                                                    {estadisticas.reservasPorMes.reduce((a, b) => a + b.cantidad, 0)}
                                                </strong>
                                            </td>
                                            <td className="text-end">
                                                <strong>
                                                    ${estadisticas.reservasPorMes.reduce((a, b) => a + b.ingresos, 0).toLocaleString()}
                                                </strong>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </Table>
                            ) : (
                                <p className="text-muted text-center py-3">Sin datos de reservas por mes</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
