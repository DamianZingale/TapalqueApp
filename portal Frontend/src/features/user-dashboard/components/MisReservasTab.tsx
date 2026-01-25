import { useState, useEffect } from "react";
import { Card, Row, Col, Badge, Button, Alert, Modal } from "react-bootstrap";
import authService from "../../../services/authService";
import { fetchReservasByUser, cancelarReserva, type Reserva } from "../../../services/fetchReservas";

export const MisReservasTab = () => {
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState<"TODAS" | "ACTIVAS" | "PAGADAS" | "CANCELADAS">("TODAS");
    const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null);
    const [modalDetalle, setModalDetalle] = useState(false);
    const [cancelando, setCancelando] = useState(false);

    useEffect(() => {
        cargarReservas();
        // Actualizar cada 30 segundos
        const interval = setInterval(cargarReservas, 30000);
        return () => clearInterval(interval);
    }, []);

    const cargarReservas = async () => {
        try {
            setLoading(true);
            const user = authService.getUser();
            if (!user?.id) return;

            const data = await fetchReservasByUser(String(user.id));
            setReservas(data);

            // Actualizar contador en el header
            const totalElement = document.getElementById("total-reservas");
            if (totalElement) totalElement.textContent = String(data.length);
        } catch (error) {
            console.error("Error cargando reservas:", error);
        } finally {
            setLoading(false);
        }
    };

    const reservasFiltradas = reservas.filter(r => {
        if (filtroEstado === "ACTIVAS") return r.isActive && !r.isCancelled;
        if (filtroEstado === "PAGADAS") return r.payment.isPaid;
        if (filtroEstado === "CANCELADAS") return r.isCancelled;
        return true;
    });

    const calcularNoches = (checkIn: string, checkOut: string): number => {
        const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const verDetalle = (reserva: Reserva) => {
        setReservaSeleccionada(reserva);
        setModalDetalle(true);
    };

    const handleCancelar = async () => {
        if (!reservaSeleccionada) return;

        if (!window.confirm("¿Estás seguro de que deseas cancelar esta reserva?")) return;

        try {
            setCancelando(true);
            const success = await cancelarReserva(reservaSeleccionada.id);
            if (success) {
                alert("Reserva cancelada correctamente");
                setModalDetalle(false);
                cargarReservas();
            } else {
                alert("Error al cancelar la reserva");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error al cancelar la reserva");
        } finally {
            setCancelando(false);
        }
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
                            <h5 className="mb-0">Mis Reservas</h5>
                        </Col>
                        <Col xs="auto">
                            <Badge bg="success" pill>
                                {reservasFiltradas.length} {reservasFiltradas.length === 1 ? "reserva" : "reservas"}
                            </Badge>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body>
                    {/* Filtros */}
                    <div className="mb-4 d-flex gap-2 flex-wrap">
                        <Badge
                            bg={filtroEstado === "TODAS" ? "primary" : "secondary"}
                            style={{ cursor: "pointer", padding: "8px 16px" }}
                            onClick={() => setFiltroEstado("TODAS")}
                        >
                            Todas
                        </Badge>
                        <Badge
                            bg={filtroEstado === "ACTIVAS" ? "success" : "secondary"}
                            style={{ cursor: "pointer", padding: "8px 16px" }}
                            onClick={() => setFiltroEstado("ACTIVAS")}
                        >
                            Activas
                        </Badge>
                        <Badge
                            bg={filtroEstado === "PAGADAS" ? "info" : "secondary"}
                            style={{ cursor: "pointer", padding: "8px 16px" }}
                            onClick={() => setFiltroEstado("PAGADAS")}
                        >
                            Pagadas
                        </Badge>
                        <Badge
                            bg={filtroEstado === "CANCELADAS" ? "danger" : "secondary"}
                            style={{ cursor: "pointer", padding: "8px 16px" }}
                            onClick={() => setFiltroEstado("CANCELADAS")}
                        >
                            Canceladas
                        </Badge>
                    </div>

                    {/* Lista de reservas */}
                    {reservasFiltradas.length === 0 ? (
                        <Alert variant="info">
                            <i className="bi bi-info-circle me-2"></i>
                            No tienes reservas {filtroEstado !== "TODAS" && `con estado "${filtroEstado}"`}.
                        </Alert>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {reservasFiltradas.map(reserva => {
                                const noches = calcularNoches(
                                    reserva.stayPeriod.checkInDate,
                                    reserva.stayPeriod.checkOutDate
                                );

                                return (
                                    <Card key={reserva.id} className="border">
                                        <Card.Body>
                                            <Row className="align-items-center">
                                                <Col md={3}>
                                                    <div className="mb-2">
                                                        <small className="text-muted">Reserva #{reserva.id}</small>
                                                    </div>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {reserva.isCancelled ? (
                                                            <Badge bg="danger">Cancelada</Badge>
                                                        ) : reserva.isActive ? (
                                                            <Badge bg="success">Activa</Badge>
                                                        ) : (
                                                            <Badge bg="secondary">Inactiva</Badge>
                                                        )}
                                                        {reserva.payment.isPaid && (
                                                            <Badge bg="info">Pagada</Badge>
                                                        )}
                                                    </div>
                                                </Col>
                                                <Col md={3}>
                                                    <small className="text-muted d-block">Hotel</small>
                                                    <strong>{reserva.hotel.hotelName}</strong>
                                                </Col>
                                                <Col md={3}>
                                                    <small className="text-muted d-block">Fechas</small>
                                                    <div className="small">
                                                        <div>
                                                            <i className="bi bi-calendar-check me-1"></i>
                                                            {new Date(reserva.stayPeriod.checkInDate).toLocaleDateString("es-AR")}
                                                        </div>
                                                        <div>
                                                            <i className="bi bi-calendar-x me-1"></i>
                                                            {new Date(reserva.stayPeriod.checkOutDate).toLocaleDateString("es-AR")}
                                                        </div>
                                                        <Badge bg="light" text="dark" className="mt-1">
                                                            {noches} {noches === 1 ? "noche" : "noches"}
                                                        </Badge>
                                                    </div>
                                                </Col>
                                                <Col md={2}>
                                                    <small className="text-muted d-block">Total</small>
                                                    <strong className="text-success">
                                                        ${reserva.totalPrice?.toLocaleString() || "0"}
                                                    </strong>
                                                    {reserva.payment.hasPendingAmount && (
                                                        <div>
                                                            <small className="text-warning">
                                                                Pendiente: ${reserva.payment.remainingAmount?.toLocaleString()}
                                                            </small>
                                                        </div>
                                                    )}
                                                </Col>
                                                <Col md={1} className="text-end">
                                                    <Button
                                                        size="sm"
                                                        variant="outline-primary"
                                                        onClick={() => verDetalle(reserva)}
                                                    >
                                                        Ver
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Modal de detalle */}
            <Modal show={modalDetalle} onHide={() => setModalDetalle(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Detalle de Reserva #{reservaSeleccionada?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {reservaSeleccionada && (
                        <>
                            <Row className="mb-4">
                                <Col md={6}>
                                    <h6>Información de la Reserva</h6>
                                    <div className="mb-2">
                                        <strong>Hotel:</strong> {reservaSeleccionada.hotel.hotelName}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Estado:</strong>{" "}
                                        {reservaSeleccionada.isCancelled ? (
                                            <Badge bg="danger">Cancelada</Badge>
                                        ) : reservaSeleccionada.isActive ? (
                                            <Badge bg="success">Activa</Badge>
                                        ) : (
                                            <Badge bg="secondary">Inactiva</Badge>
                                        )}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Check-in:</strong>{" "}
                                        {new Date(reservaSeleccionada.stayPeriod.checkInDate).toLocaleDateString("es-AR")}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Check-out:</strong>{" "}
                                        {new Date(reservaSeleccionada.stayPeriod.checkOutDate).toLocaleDateString("es-AR")}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Noches:</strong>{" "}
                                        {calcularNoches(
                                            reservaSeleccionada.stayPeriod.checkInDate,
                                            reservaSeleccionada.stayPeriod.checkOutDate
                                        )}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Fecha de creación:</strong>{" "}
                                        {new Date(reservaSeleccionada.dateCreated).toLocaleDateString("es-AR")}
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <h6>Información de Pago</h6>
                                    <div className="mb-2">
                                        <strong>Estado de pago:</strong>{" "}
                                        <Badge bg={reservaSeleccionada.payment.isPaid ? "success" : "warning"}>
                                            {reservaSeleccionada.payment.isPaid ? "Pagado" : "Pendiente"}
                                        </Badge>
                                    </div>
                                    <div className="mb-2">
                                        <strong>Tipo de pago:</strong> {reservaSeleccionada.payment.paymentType || "N/A"}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Total:</strong>{" "}
                                        <span className="h5 text-success">
                                            ${reservaSeleccionada.payment.totalAmount?.toLocaleString() || "0"}
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <strong>Pagado:</strong> ${reservaSeleccionada.payment.amountPaid?.toLocaleString() || "0"}
                                    </div>
                                    {reservaSeleccionada.payment.hasPendingAmount && (
                                        <div className="mb-2">
                                            <strong>Saldo pendiente:</strong>{" "}
                                            <span className="text-warning">
                                                ${reservaSeleccionada.payment.remainingAmount?.toLocaleString() || "0"}
                                            </span>
                                        </div>
                                    )}
                                    {reservaSeleccionada.mercadoPagoId && (
                                        <div className="mb-2">
                                            <strong>ID Mercado Pago:</strong> {reservaSeleccionada.mercadoPagoId}
                                        </div>
                                    )}
                                </Col>
                            </Row>

                            {reservaSeleccionada.payment.isDeposit && (
                                <Alert variant="info">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Esta reserva requiere el pago del saldo restante al momento del check-in.
                                </Alert>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {reservaSeleccionada && !reservaSeleccionada.isCancelled && (
                        <Button
                            variant="danger"
                            onClick={handleCancelar}
                            disabled={cancelando}
                        >
                            {cancelando ? "Cancelando..." : "Cancelar Reserva"}
                        </Button>
                    )}
                    <Button variant="secondary" onClick={() => setModalDetalle(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
