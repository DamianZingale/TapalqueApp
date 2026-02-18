import { useState, useEffect } from "react";
import { Card, Row, Col, Badge, Button, Alert, Modal } from "react-bootstrap";
import authService from "../../../services/authService";
import { fetchPedidosByUser, type Pedido, EstadoPedido } from "../../../services/fetchPedidos";
import { useNotifications } from "../../../shared/context/NotificationContext";

const estadoLabel: Record<string, { bg: string; text: string }> = {
    [EstadoPedido.RECIBIDO]: { bg: "warning", text: "Recibido" },
    [EstadoPedido.EN_PREPARACION]: { bg: "info", text: "En preparacion" },
    [EstadoPedido.LISTO]: { bg: "primary", text: "Listo" },
    [EstadoPedido.EN_DELIVERY]: { bg: "dark", text: "En camino" },
    [EstadoPedido.ENTREGADO]: { bg: "success", text: "Entregado" },
};

export const MisPedidosTab = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | "TODOS">("TODOS");
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
    const [modalDetalle, setModalDetalle] = useState(false);
    const { notifications } = useNotifications();

    const lastEstadoNotif = notifications.find((n) => n.type === 'pedido:estado');

    useEffect(() => {
        cargarPedidos();
        const interval = setInterval(cargarPedidos, 30000);
        return () => clearInterval(interval);
    }, [lastEstadoNotif?.id]);

    const cargarPedidos = async () => {
        try {
            setLoading(true);
            const user = authService.getUser();
            if (!user?.id) return;

            const data = await fetchPedidosByUser(String(user.id));
            setPedidos(data);

            const totalElement = document.getElementById("total-pedidos");
            if (totalElement) totalElement.textContent = String(data.length);
        } catch (error) {
            console.error("Error cargando pedidos:", error);
        } finally {
            setLoading(false);
        }
    };

    const pedidosFiltrados = pedidos.filter(p =>
        filtroEstado === "TODOS" || p.status === filtroEstado
    );

    const getEstadoBadge = (estado: EstadoPedido) => {
        const config = estadoLabel[estado] ?? { bg: "secondary", text: estado };
        return <Badge bg={config.bg}>{config.text}</Badge>;
    };

    const verDetalle = (pedido: Pedido) => {
        setPedidoSeleccionado(pedido);
        setModalDetalle(true);
    };

    if (loading) {
        return (
            <Card className="shadow-sm border-0">
                <Card.Body className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </Card.Body>
            </Card>
        );
    }

    return (
        <>
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-0 pt-4">
                    <Row className="align-items-center">
                        <Col>
                            <h5 className="mb-0">Mis Pedidos</h5>
                        </Col>
                        <Col xs="auto">
                            <Badge bg="primary" pill>
                                {pedidosFiltrados.length} {pedidosFiltrados.length === 1 ? "pedido" : "pedidos"}
                            </Badge>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body>
                    {/* Filtros */}
                    <div className="mb-4 d-flex gap-2 flex-wrap">
                        <Badge
                            bg={filtroEstado === "TODOS" ? "primary" : "secondary"}
                            style={{ cursor: "pointer", padding: "8px 16px" }}
                            onClick={() => setFiltroEstado("TODOS")}
                        >
                            Todos
                        </Badge>
                        <Badge
                            bg={filtroEstado === EstadoPedido.RECIBIDO ? "warning" : "secondary"}
                            style={{ cursor: "pointer", padding: "8px 16px" }}
                            onClick={() => setFiltroEstado(EstadoPedido.RECIBIDO)}
                        >
                            Recibidos
                        </Badge>
                        <Badge
                            bg={filtroEstado === EstadoPedido.EN_PREPARACION ? "info" : "secondary"}
                            style={{ cursor: "pointer", padding: "8px 16px" }}
                            onClick={() => setFiltroEstado(EstadoPedido.EN_PREPARACION)}
                        >
                            En preparacion
                        </Badge>
                        <Badge
                            bg={filtroEstado === EstadoPedido.LISTO ? "primary" : "secondary"}
                            style={{ cursor: "pointer", padding: "8px 16px" }}
                            onClick={() => setFiltroEstado(EstadoPedido.LISTO)}
                        >
                            Listos
                        </Badge>
                        <Badge
                            bg={filtroEstado === EstadoPedido.EN_DELIVERY ? "dark" : "secondary"}
                            style={{ cursor: "pointer", padding: "8px 16px" }}
                            onClick={() => setFiltroEstado(EstadoPedido.EN_DELIVERY)}
                        >
                            En camino
                        </Badge>
                        <Badge
                            bg={filtroEstado === EstadoPedido.ENTREGADO ? "success" : "secondary"}
                            style={{ cursor: "pointer", padding: "8px 16px" }}
                            onClick={() => setFiltroEstado(EstadoPedido.ENTREGADO)}
                        >
                            Entregados
                        </Badge>
                    </div>

                    {/* Lista de pedidos */}
                    {pedidosFiltrados.length === 0 ? (
                        <Alert variant="info">
                            <i className="bi bi-info-circle me-2"></i>
                            No tenes pedidos {filtroEstado !== "TODOS" && `con estado "${filtroEstado}"`}.
                        </Alert>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {pedidosFiltrados.map(pedido => (
                                <Card key={pedido.id} className="border">
                                    <Card.Body>
                                        <Row className="align-items-center">
                                            <Col md={3}>
                                                <div className="mb-2">
                                                    <small className="text-muted">Pedido #{pedido.id.slice(0, 8)}</small>
                                                </div>
                                                <div>
                                                    {pedido.isDelivery && <Badge bg="dark" className="me-1">Delivery</Badge>}
                                                    {getEstadoBadge(pedido.status)}
                                                </div>
                                            </Col>
                                            <Col md={3}>
                                                <small className="text-muted d-block">Restaurante</small>
                                                <strong>{pedido.restaurantName || pedido.restaurant?.restaurantName || "N/A"}</strong>
                                            </Col>
                                            <Col md={2}>
                                                <small className="text-muted d-block">Fecha</small>
                                                <span>{new Date(pedido.dateCreated).toLocaleDateString("es-AR")}</span>
                                            </Col>
                                            <Col md={2}>
                                                <small className="text-muted d-block">Total</small>
                                                <strong className="text-success">
                                                    ${(pedido.totalPrice ?? pedido.totalAmount ?? 0).toLocaleString()}
                                                </strong>
                                            </Col>
                                            <Col md={2} className="text-end">
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    onClick={() => verDetalle(pedido)}
                                                >
                                                    Ver detalle
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Modal de detalle */}
            <Modal show={modalDetalle} onHide={() => setModalDetalle(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Detalle del Pedido #{pedidoSeleccionado?.id?.slice(0, 8)}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {pedidoSeleccionado && (
                        <>
                            <Row className="mb-4">
                                <Col md={6}>
                                    <h6>Informacion del Pedido</h6>
                                    <div className="mb-2">
                                        <strong>Estado:</strong> {getEstadoBadge(pedidoSeleccionado.status)}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Restaurante:</strong> {pedidoSeleccionado.restaurantName || pedidoSeleccionado.restaurant?.restaurantName || "N/A"}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Fecha:</strong> {new Date(pedidoSeleccionado.dateCreated).toLocaleString("es-AR")}
                                    </div>
                                    {pedidoSeleccionado.isDelivery && pedidoSeleccionado.deliveryAddress && (
                                        <div className="mb-2">
                                            <strong>Direccion de entrega:</strong> {pedidoSeleccionado.deliveryAddress}
                                        </div>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <h6>Informacion de Pago</h6>
                                    <div className="mb-2">
                                        <strong>Metodo:</strong>{" "}
                                        {pedidoSeleccionado.paidWithMercadoPago && <Badge bg="success">Mercado Pago</Badge>}
                                        {pedidoSeleccionado.paidWithCash && <Badge bg="secondary">Efectivo</Badge>}
                                    </div>
                                    {pedidoSeleccionado.payment?.isPaid !== undefined && (
                                        <div className="mb-2">
                                            <strong>Estado de pago:</strong>{" "}
                                            <Badge bg={pedidoSeleccionado.payment.isPaid ? "success" : "warning"}>
                                                {pedidoSeleccionado.payment.isPaid ? "Pagado" : "Pendiente"}
                                            </Badge>
                                        </div>
                                    )}
                                    {pedidoSeleccionado.mercadoPagoId && (
                                        <div className="mb-2">
                                            <strong>ID de Pago MP:</strong> {pedidoSeleccionado.mercadoPagoId}
                                        </div>
                                    )}
                                    <div className="mb-2">
                                        <strong>Total:</strong>{" "}
                                        <span className="text-success h5">
                                            ${(pedidoSeleccionado.totalPrice ?? pedidoSeleccionado.totalAmount ?? 0).toLocaleString()}
                                        </span>
                                    </div>
                                </Col>
                            </Row>

                            <h6 className="mb-3">Items del Pedido</h6>
                            <div className="table-responsive">
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th className="text-center">Cantidad</th>
                                            <th className="text-end">Precio Unit.</th>
                                            <th className="text-end">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pedidoSeleccionado.items?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.itemName || item.productName || `Item ${idx + 1}`}</td>
                                                <td className="text-center">{item.itemQuantity ?? item.quantity}</td>
                                                <td className="text-end">${(item.itemPrice ?? item.unitPrice ?? 0).toLocaleString()}</td>
                                                <td className="text-end">
                                                    <strong>${((item.itemPrice ?? item.unitPrice ?? 0) * (item.itemQuantity ?? item.quantity)).toLocaleString()}</strong>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModalDetalle(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
