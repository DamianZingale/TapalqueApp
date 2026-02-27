import { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, ButtonGroup, Form, Alert } from 'react-bootstrap';
import { fetchPedidosByRestaurant, updateEstadoPedido, Pedido, EstadoPedido } from '../../../../services/fetchPedidos';
import { printPedido, printCocina } from '../../utils/printPedido';

export const GestionPedidosTab = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | 'TODOS'>('TODOS');
    const [ordenPor, setOrdenPor] = useState<'reciente' | 'antiguo' | 'monto'>('reciente');

    // TODO: Obtener restaurantId del usuario logueado
    const restaurantId = '1';

    useEffect(() => {
        cargarPedidos();
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
            return (b.totalPrice ?? 0) - (a.totalPrice ?? 0);
        });

    const getEstadoBadge = (estado: EstadoPedido) => {
        const configs: Record<string, { bg: string; text: string }> = {
            [EstadoPedido.RECIBIDO]: { bg: 'warning', text: 'Recibido' },
            [EstadoPedido.EN_PREPARACION]: { bg: 'info', text: 'En preparacion' },
            [EstadoPedido.LISTO]: { bg: 'success', text: 'Listo' },
            [EstadoPedido.EN_DELIVERY]: { bg: 'primary', text: 'En delivery' },
            [EstadoPedido.ENTREGADO]: { bg: 'secondary', text: 'Entregado' },
        };
        const config = configs[estado] ?? { bg: 'dark', text: estado };
        return <Badge bg={config.bg}>{config.text}</Badge>;
    };

    const getSiguienteEstado = (pedido: Pedido): EstadoPedido | null => {
        switch (pedido.status) {
            case EstadoPedido.RECIBIDO:
                return EstadoPedido.EN_PREPARACION;
            case EstadoPedido.EN_PREPARACION:
                return EstadoPedido.LISTO;
            case EstadoPedido.LISTO:
                return pedido.isDelivery ? EstadoPedido.EN_DELIVERY : EstadoPedido.ENTREGADO;
            case EstadoPedido.EN_DELIVERY:
                return EstadoPedido.ENTREGADO;
            default:
                return null;
        }
    };

    const getBotonTexto = (pedido: Pedido): string => {
        switch (pedido.status) {
            case EstadoPedido.RECIBIDO:
                return 'Marcar en preparacion';
            case EstadoPedido.EN_PREPARACION:
                return 'Marcar como listo';
            case EstadoPedido.LISTO:
                return pedido.isDelivery ? 'Enviar a delivery' : 'Marcar entregado';
            case EstadoPedido.EN_DELIVERY:
                return 'Marcar entregado';
            default:
                return '';
        }
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
                <Col md={8}>
                    <h5>Filtrar por estado:</h5>
                    <ButtonGroup className="flex-wrap">
                        <Button
                            variant={filtroEstado === 'TODOS' ? 'primary' : 'outline-primary'}
                            onClick={() => setFiltroEstado('TODOS')}
                        >
                            Todos ({pedidos.length})
                        </Button>
                        <Button
                            variant={filtroEstado === EstadoPedido.RECIBIDO ? 'warning' : 'outline-warning'}
                            onClick={() => setFiltroEstado(EstadoPedido.RECIBIDO)}
                        >
                            Recibidos ({pedidos.filter(p => p.status === EstadoPedido.RECIBIDO).length})
                        </Button>
                        <Button
                            variant={filtroEstado === EstadoPedido.EN_PREPARACION ? 'info' : 'outline-info'}
                            onClick={() => setFiltroEstado(EstadoPedido.EN_PREPARACION)}
                        >
                            En preparacion ({pedidos.filter(p => p.status === EstadoPedido.EN_PREPARACION).length})
                        </Button>
                        <Button
                            variant={filtroEstado === EstadoPedido.LISTO ? 'success' : 'outline-success'}
                            onClick={() => setFiltroEstado(EstadoPedido.LISTO)}
                        >
                            Listos ({pedidos.filter(p => p.status === EstadoPedido.LISTO).length})
                        </Button>
                        <Button
                            variant={filtroEstado === EstadoPedido.EN_DELIVERY ? 'primary' : 'outline-primary'}
                            onClick={() => setFiltroEstado(EstadoPedido.EN_DELIVERY)}
                        >
                            En delivery ({pedidos.filter(p => p.status === EstadoPedido.EN_DELIVERY).length})
                        </Button>
                    </ButtonGroup>
                </Col>

                <Col md={4}>
                    <h5>Ordenar por:</h5>
                    <Form.Select value={ordenPor} onChange={(e) => setOrdenPor(e.target.value as any)}>
                        <option value="reciente">Mas reciente</option>
                        <option value="antiguo">Mas antiguo</option>
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
                                    <div>
                                        {pedido.isDelivery && <Badge bg="dark" className="me-1">Delivery</Badge>}
                                        {getEstadoBadge(pedido.status)}
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <div className="mb-2">
                                        <small className="text-muted">
                                            {new Date(pedido.dateCreated).toLocaleString('es-AR')}
                                        </small>
                                    </div>

                                    {/* Info del cliente */}
                                    {(pedido.userName || pedido.userPhone) && (
                                        <div className="mb-2 p-2 bg-light rounded">
                                            {pedido.userName && <div><strong>Cliente:</strong> {pedido.userName}</div>}
                                            {pedido.userPhone && <div><strong>Tel:</strong> {pedido.userPhone}</div>}
                                            {pedido.isDelivery && pedido.deliveryAddress && (
                                                <div><strong>Direccion:</strong> {pedido.deliveryAddress}</div>
                                            )}
                                        </div>
                                    )}

                                    <h6 className="mb-2">Productos:</h6>
                                    <ul className="list-unstyled small">
                                        {pedido.items.map((item, idx) => (
                                            <li key={idx}>
                                                <Badge bg="light" text="dark" className="me-1">
                                                    {item.itemQuantity ?? item.quantity}x
                                                </Badge>
                                                {item.itemName ?? item.productName} - ${item.itemPrice ?? item.unitPrice}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="border-top pt-2 mt-2">
                                        <strong>Total: ${(pedido.totalPrice ?? pedido.totalAmount ?? 0).toFixed(2)}</strong>
                                    </div>

                                    {/* Info de pago */}
                                    <div className="mt-2">
                                        {pedido.paidWithMercadoPago && (
                                            <>
                                                <Badge bg="success">Pagado con MP</Badge>
                                                {pedido.mercadoPagoId && (
                                                    <small className="d-block text-muted mt-1">
                                                        MP ID: {pedido.mercadoPagoId}
                                                    </small>
                                                )}
                                            </>
                                        )}
                                        {pedido.paidWithCash && (
                                            <Badge bg="warning" text="dark" className="border">
                                                {pedido.isDelivery ? 'Paga en destino' : 'Paga al retirar'}
                                            </Badge>
                                        )}
                                    </div>
                                </Card.Body>
                                <Card.Footer className="d-flex flex-column gap-2">
                                    {getSiguienteEstado(pedido) && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="w-100"
                                            onClick={() => cambiarEstado(pedido.id, getSiguienteEstado(pedido)!)}
                                        >
                                            {getBotonTexto(pedido)}
                                        </Button>
                                    )}
                                    {pedido.status === EstadoPedido.ENTREGADO && (
                                        <div className="text-center text-success fw-bold">
                                            Completado
                                        </div>
                                    )}
                                    <div className="d-flex gap-1">
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            className="flex-fill"
                                            onClick={() => printCocina(pedido)}
                                        >
                                            <i className="bi bi-printer me-1"></i>
                                            Cocina
                                        </Button>
                                        <Button
                                            variant="outline-dark"
                                            size="sm"
                                            className="flex-fill"
                                            onClick={() => printPedido(pedido)}
                                        >
                                            <i className="bi bi-receipt me-1"></i>
                                            Caja
                                        </Button>
                                    </div>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};
