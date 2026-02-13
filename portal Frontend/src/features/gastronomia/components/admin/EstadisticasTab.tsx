import { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, Spinner, Alert, Form } from 'react-bootstrap';
import {
    fetchEstadisticasGastronomia,
    EstadisticasGastronomia
} from '../../../../services/fetchEstadisticas';

export const EstadisticasTab = () => {
    const [estadisticas, setEstadisticas] = useState<EstadisticasGastronomia | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [periodoVentas, setPeriodoVentas] = useState<'hoy' | 'semana' | 'mes'>('hoy');

    // TODO: Obtener restaurantId del usuario logueado
    const restaurantId = '1';

    useEffect(() => {
        cargarEstadisticas();
    }, []);

    const cargarEstadisticas = async () => {
        setLoading(true);
        setError(null);
        const data = await fetchEstadisticasGastronomia(restaurantId);
        if (data) {
            setEstadisticas(data);
        } else {
            setError("No se pudieron cargar las estadísticas");
        }
        setLoading(false);
    };

    const getIngresosSegunPeriodo = () => {
        if (!estadisticas) return 0;
        switch (periodoVentas) {
            case 'hoy': return estadisticas.ingresosHoy;
            case 'semana': return estadisticas.ingresosSemana;
            case 'mes': return estadisticas.ingresosMes;
        }
    };

    const getPedidosSegunPeriodo = () => {
        if (!estadisticas) return 0;
        switch (periodoVentas) {
            case 'hoy': return estadisticas.pedidosHoy;
            case 'semana': return estadisticas.pedidosSemana;
            case 'mes': return estadisticas.pedidosMes;
        }
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
                    No se pudieron cargar las estadísticas del restaurante.
                    Esto puede deberse a que aún no hay pedidos registrados o a un error de conexión.
                </p>
            </Alert>
        );
    }

    return (
        <div>
            {/* Selector de período */}
            <Row className="mb-4">
                <Col md={4}>
                    <Form.Group>
                        <Form.Label>Período de análisis</Form.Label>
                        <Form.Select
                            value={periodoVentas}
                            onChange={(e) => setPeriodoVentas(e.target.value as 'hoy' | 'semana' | 'mes')}
                        >
                            <option value="hoy">Hoy</option>
                            <option value="semana">Esta semana</option>
                            <option value="mes">Este mes</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            {/* Tarjetas de resumen */}
            <Row>
                <Col md={3} className="mb-3">
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted">
                                Pedidos {periodoVentas === 'hoy' ? 'Hoy' : periodoVentas === 'semana' ? 'Semana' : 'Mes'}
                            </h6>
                            <h2 className="text-primary">{getPedidosSegunPeriodo()}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted">
                                Ingresos {periodoVentas === 'hoy' ? 'Hoy' : periodoVentas === 'semana' ? 'Semana' : 'Mes'}
                            </h6>
                            <h2 className="text-success">${getIngresosSegunPeriodo().toLocaleString()}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted">Promedio por Pedido</h6>
                            <h2 className="text-info">${estadisticas.promedioPedido.toLocaleString()}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted">Pedidos Pendientes</h6>
                            <h2 className={estadisticas.pedidosPendientes > 0 ? "text-warning" : "text-success"}>
                                {estadisticas.pedidosPendientes}
                            </h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Platos más vendidos y Estados de pedidos */}
            <Row className="mt-4">
                <Col md={7}>
                    <Card className="shadow-sm h-100">
                        <Card.Header>
                            <h5 className="mb-0">Platos Más Vendidos</h5>
                        </Card.Header>
                        <Card.Body>
                            {estadisticas.platosMasVendidos.length > 0 ? (
                                <Table hover size="sm">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Plato</th>
                                            <th className="text-center">Cantidad</th>
                                            <th className="text-end">Ingresos</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {estadisticas.platosMasVendidos.slice(0, 5).map((plato, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    {idx === 0 && <Badge bg="warning" text="dark">1</Badge>}
                                                    {idx === 1 && <Badge bg="secondary">2</Badge>}
                                                    {idx === 2 && <Badge bg="info">3</Badge>}
                                                    {idx > 2 && <span className="text-muted">{idx + 1}</span>}
                                                </td>
                                                <td><strong>{plato.nombre}</strong></td>
                                                <td className="text-center">{plato.cantidad}</td>
                                                <td className="text-end text-success">${plato.ingresos.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <p className="text-muted text-center py-3">No hay datos de ventas aún</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={5}>
                    <Card className="shadow-sm h-100">
                        <Card.Header>
                            <h5 className="mb-0">Pedidos por Estado</h5>
                        </Card.Header>
                        <Card.Body>
                            {estadisticas.pedidosPorEstado.length > 0 ? (
                                <div className="d-flex flex-column gap-2">
                                    {estadisticas.pedidosPorEstado.map((item, idx) => {
                                        const totalPedidos = estadisticas.pedidosPorEstado.reduce((a, b) => a + b.cantidad, 0);
                                        const porcentaje = totalPedidos > 0 ? ((item.cantidad / totalPedidos) * 100).toFixed(1) : 0;
                                        const getBadgeColor = (estado: string) => {
                                            switch (estado.toLowerCase()) {
                                                case 'pendiente': return 'warning';
                                                case 'pagado': return 'info';
                                                case 'listo': return 'success';
                                                case 'entregado': return 'secondary';
                                                default: return 'primary';
                                            }
                                        };
                                        return (
                                            <div key={idx} className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                                                <Badge bg={getBadgeColor(item.estado)} className="px-3 py-2">
                                                    {item.estado}
                                                </Badge>
                                                <span>
                                                    <strong>{item.cantidad}</strong>
                                                    <small className="text-muted ms-2">({porcentaje}%)</small>
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-muted text-center py-3">No hay datos de pedidos aún</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Ventas por día */}
            {estadisticas.ventasPorDia.length > 0 && (
                <Row className="mt-4">
                    <Col md={12}>
                        <Card className="shadow-sm">
                            <Card.Header>
                                <h5 className="mb-0">Ventas de los últimos 7 días</h5>
                            </Card.Header>
                            <Card.Body>
                                <Table hover>
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th className="text-center">Pedidos</th>
                                            <th className="text-end">Ingresos</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {estadisticas.ventasPorDia.map((dia, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    {new Date(dia.fecha).toLocaleDateString('es-AR', {
                                                        weekday: 'long',
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </td>
                                                <td className="text-center">{dia.pedidos}</td>
                                                <td className="text-end text-success">${dia.ingresos.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="table-dark">
                                        <tr>
                                            <td><strong>Total</strong></td>
                                            <td className="text-center">
                                                <strong>
                                                    {estadisticas.ventasPorDia.reduce((a, b) => a + b.pedidos, 0)}
                                                </strong>
                                            </td>
                                            <td className="text-end">
                                                <strong>
                                                    ${estadisticas.ventasPorDia.reduce((a, b) => a + b.ingresos, 0).toLocaleString()}
                                                </strong>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </div>
    );
};
