import { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, ButtonGroup, Form, Alert } from 'react-bootstrap';
import { fetchPedidosByRestaurant, updateEstadoPedido, Pedido, EstadoPedido } from '../../../../services/fetchPedidos';

export const GestionPedidosTab = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | 'TODOS'>('TODOS');
    const [ordenPor, setOrdenPor] = useState<'reciente' | 'antiguo' | 'monto'>('reciente');

    // TODO: Obtener restaurantId del usuario logueado
    const restaurantId = '1';

    useEffect(() => {
        cargarPedidos();
        // Actualizar cada 30 segundos para tiempo real
        const interval = setInterval(cargarPedidos, 30000);
        return () => clearInterval(interval);
    }, []);

    const cargarPedidos = async () => {
        setLoading(true);
        const data = await fetchPedidosByRestaurant(restaurantId);
        setPedidos(data);
        setLoading(false);
    };

    const cambiarEstado = async (pedidoId: string, nuevoEstado: EstadoPedido) => {
        const exito = await updateEstadoPedido(pedidoId, nuevoEstado);
        if (exito) {
            setPedidos(prev =>
                prev.map(p => p.id === pedidoId ? { ...p, status: nuevoEstado, dateUpdated: new Date().toISOString() } : p)
            );
        } else {
            alert('Error al actualizar el estado del pedido');
        }
    };

    const pedidosFiltrados = pedidos
        .filter(p => filtroEstado === 'TODOS' || p.status === filtroEstado)
        .sort((a, b) => {
            if (ordenPor === 'reciente') return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
            if (ordenPor === 'antiguo') return new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();
            return b.totalPrice - a.totalPrice;
        });

    const getEstadoBadge = (estado: EstadoPedido) => {
        const configs = {
            [EstadoPedido.PENDING]: { bg: 'warning', text: 'Pendiente' },
            [EstadoPedido.PAID]: { bg: 'info', text: 'Pagado' },
            [EstadoPedido.READY]: { bg: 'success', text: 'Listo' },
            [EstadoPedido.DELIVERED]: { bg: 'secondary', text: 'Entregado' },
        };
        const config = configs[estado];
        return <Badge bg={config.bg}>{config.text}</Badge>;
    };

    const getSiguienteEstado = (estadoActual: EstadoPedido): EstadoPedido | null => {
        const flujo: Record<EstadoPedido, EstadoPedido | null> = {
            [EstadoPedido.PENDING]: EstadoPedido.PAID,
            [EstadoPedido.PAID]: EstadoPedido.READY,
            [EstadoPedido.READY]: EstadoPedido.DELIVERED,
            [EstadoPedido.DELIVERED]: null,
        };
        return flujo[estadoActual];
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Filtros y controles */}
            <Row className="mb-4">
                <Col md={6}>
                    <h5>Filtrar por estado:</h5>
                    <ButtonGroup>
                        <Button
                            variant={filtroEstado === 'TODOS' ? 'primary' : 'outline-primary'}
                            onClick={() => setFiltroEstado('TODOS')}
                        >
                            Todos ({pedidos.length})
                        </Button>
                        <Button
                            variant={filtroEstado === EstadoPedido.PENDING ? 'warning' : 'outline-warning'}
                            onClick={() => setFiltroEstado(EstadoPedido.PENDING)}
                        >
                            Pendiente ({pedidos.filter(p => p.status === EstadoPedido.PENDING).length})
                        </Button>
                        <Button
                            variant={filtroEstado === EstadoPedido.PAID ? 'info' : 'outline-info'}
                            onClick={() => setFiltroEstado(EstadoPedido.PAID)}
                        >
                            Pagado ({pedidos.filter(p => p.status === EstadoPedido.PAID).length})
                        </Button>
                        <Button
                            variant={filtroEstado === EstadoPedido.READY ? 'success' : 'outline-success'}
                            onClick={() => setFiltroEstado(EstadoPedido.READY)}
                        >
                            Listo ({pedidos.filter(p => p.status === EstadoPedido.READY).length})
                        </Button>
                    </ButtonGroup>
                </Col>

                <Col md={6}>
                    <h5>Ordenar por:</h5>
                    <Form.Select value={ordenPor} onChange={(e) => setOrdenPor(e.target.value as any)}>
                        <option value="reciente">Más reciente</option>
                        <option value="antiguo">Más antiguo</option>
                        <option value="monto">Mayor monto</option>
                    </Form.Select>
                </Col>
            </Row>

            {/* Lista de pedidos */}
            {pedidosFiltrados.length === 0 ? (
                <Alert variant="info">No hay pedidos con este filtro</Alert>
            ) : (
                <Row>
                    {pedidosFiltrados.map(pedido => (
                        <Col md={6} lg={4} key={pedido.id} className="mb-3">
                            <Card className="h-100 shadow-sm">
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <span className="fw-bold">Pedido #{pedido.id.slice(0, 8)}</span>
                                    {getEstadoBadge(pedido.status)}
                                </Card.Header>
                                <Card.Body>
                                    <div className="mb-2">
                                        <small className="text-muted">
                                            {new Date(pedido.dateCreated).toLocaleString('es-AR')}
                                        </small>
                                    </div>

                                    <h6 className="mb-2">Productos:</h6>
                                    <ul className="list-unstyled small">
                                        {pedido.items.map((item, idx) => (
                                            <li key={idx}>
                                                <Badge bg="light" text="dark" className="me-1">{item.itemQuantity}x</Badge>
                                                {item.itemName} - ${item.itemPrice}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="border-top pt-2 mt-2">
                                        <strong>Total: ${pedido.totalPrice.toFixed(2)}</strong>
                                    </div>

                                    {pedido.paidWithMercadoPago && (
                                        <div className="mt-2">
                                            <Badge bg="success">Pagado con MP</Badge>
                                            {pedido.mercadoPagoId && (
                                                <small className="d-block text-muted mt-1">
                                                    MP ID: {pedido.mercadoPagoId}
                                                </small>
                                            )}
                                        </div>
                                    )}
                                </Card.Body>
                                <Card.Footer>
                                    {getSiguienteEstado(pedido.status) && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="w-100"
                                            onClick={() => cambiarEstado(pedido.id, getSiguienteEstado(pedido.status)!)}
                                        >
                                            {pedido.status === EstadoPedido.PAID && '👨‍🍳 Marcar en Preparación'}
                                            {pedido.status === EstadoPedido.PENDING && '💰 Marcar como Pagado'}
                                            {pedido.status === EstadoPedido.READY && '✅ Marcar Entregado'}
                                        </Button>
                                    )}
                                    {pedido.status === EstadoPedido.DELIVERED && (
                                        <div className="text-center text-success">
                                            ✓ Completado
                                        </div>
                                    )}
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};
