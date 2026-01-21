import { useState, useEffect } from "react";
import { Card, Row, Col, Badge, Button, Alert, Modal } from "react-bootstrap";
import authService from "../../../services/authService";
import { fetchPedidosByUser, type Pedido, EstadoPedido } from "../../../services/fetchPedidos";

export const MisPedidosTab = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | "TODOS">("TODOS");
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
    const [modalDetalle, setModalDetalle] = useState(false);

    useEffect(() => {
        cargarPedidos();
        // Actualizar cada 30 segundos
        const interval = setInterval(cargarPedidos, 30000);
        return () => clearInterval(interval);
    }, []);

    const cargarPedidos = async () => {
        try {
            setLoading(true);
            const user = authService.getUser();
            if (!user?.id) return;

            const data = await fetchPedidosByUser(String(user.id));
            setPedidos(data);

            // Actualizar contador en el header
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
        const badges = {
            [EstadoPedido.PENDING]: { bg: "warning", text: "Pendiente" },
            [EstadoPedido.PAID]: { bg: "info", text: "Pagado" },
            [EstadoPedido.READY]: { bg: "primary", text: "Listo" },
            [EstadoPedido.DELIVERED]: { bg: "success", text: "Entregado" }
        };
        const badge = badges[estado];
        return <Badge bg={badge.bg}>{badge.text}</Badge>;
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
                            bg={filtroEstado === EstadoPedido.PENDING ? "warning" : "secondary"}
                            style={{ cursor: "pointer", padding: "8px 16px" }}
                            onClick={() => setFiltroEstado(EstadoPedido.PENDING)}
                        >
                            Pendientes
                        </Badge>
                        <Badge
                            bg={filtroEstado === EstadoPedido.PAID ? "info" : "secondary"}
                            style={{ cursor: "pointer", padding: "8px 16px" }}
                            onClick={() => setFiltroEstado(EstadoPedido.PAID)}
                        >
                            Pagados
                        </Badge>
                        <Badge
                            bg={filtroEstado === EstadoPedido.READY ? "primary" : "secondary"}
                            style={{ cursor: "pointer", padding: "8px 16px" }}
                            onClick={() => setFiltroEstado(EstadoPedido.READY)}
                        >
                            Listos
                        </Badge>
                        <Badge
                            bg={filtroEstado === EstadoPedido.DELIVERED ? "success" : "secondary"}
                            style={{ cursor: "pointer", padding: "8px 16px" }}
                            onClick={() => setFiltroEstado(EstadoPedido.DELIVERED)}
                        >
                            Entregados
                        </Badge>
                    </div>

                    {/* Lista de pedidos */}
                    {pedidosFiltrados.length === 0 ? (
                        <Alert variant="info">
                            <i className="bi bi-info-circle me-2"></i>
                            No tienes pedidos {filtroEstado !== "TODOS" && `con estado "${filtroEstado}"`}.
                        </Alert>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {pedidosFiltrados.map(pedido => (
                                <Card key={pedido.id} className="border">
                                    <Card.Body>
                                        <Row className="align-items-center">
                                            <Col md={3}>
                                                <div className="mb-2">
                                                    <small className="text-muted">Pedido #{pedido.id}</small>
                                                </div>
                                                <div>
                                                    {getEstadoBadge(pedido.status)}
                                                </div>
                                            </Col>
                                            <Col md={3}>
                                                <small className="text-muted d-block">Restaurante</small>
                                                <strong>{pedido.restaurantName || "N/A"}</strong>
                                            </Col>
                                            <Col md={2}>
                                                <small className="text-muted d-block">Fecha</small>
                                                <span>{new Date(pedido.dateCreated).toLocaleDateString("es-AR")}</span>
                                            </Col>
                                            <Col md={2}>
                                                <small className="text-muted d-block">Total</small>
                                                <strong className="text-success">
                                                    ${pedido.totalAmount?.toLocaleString() || "0"}
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
                    <Modal.Title>Detalle del Pedido #{pedidoSeleccionado?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {pedidoSeleccionado && (
                        <>
                            <Row className="mb-4">
                                <Col md={6}>
                                    <h6>Información del Pedido</h6>
                                    <div className="mb-2">
                                        <strong>Estado:</strong> {getEstadoBadge(pedidoSeleccionado.status)}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Restaurante:</strong> {pedidoSeleccionado.restaurantName || "N/A"}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Fecha:</strong> {new Date(pedidoSeleccionado.dateCreated).toLocaleString("es-AR")}
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <h6>Información de Pago</h6>
                                    <div className="mb-2">
                                        <strong>Estado de pago:</strong>{" "}
                                        <Badge bg={pedidoSeleccionado.payment.isPaid ? "success" : "warning"}>
                                            {pedidoSeleccionado.payment.isPaid ? "Pagado" : "Pendiente"}
                                        </Badge>
                                    </div>
                                    {pedidoSeleccionado.payment.paymentId && (
                                        <div className="mb-2">
                                            <strong>ID de Pago:</strong> {pedidoSeleccionado.payment.paymentId}
                                        </div>
                                    )}
                                    <div className="mb-2">
                                        <strong>Total:</strong>{" "}
                                        <span className="text-success h5">
                                            ${pedidoSeleccionado.totalAmount?.toLocaleString() || "0"}
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
                                                <td>{item.productName || `Item ${idx + 1}`}</td>
                                                <td className="text-center">{item.quantity}</td>
                                                <td className="text-end">${item.unitPrice?.toLocaleString() || "0"}</td>
                                                <td className="text-end">
                                                    <strong>${((item.unitPrice || 0) * item.quantity).toLocaleString()}</strong>
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
