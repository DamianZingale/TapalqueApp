import { useState, useEffect } from "react";
import { Card, Row, Col, ProgressBar } from "react-bootstrap";
import authService from "../../../services/authService";
import { fetchPedidosByUser } from "../../../services/fetchPedidos";
import { fetchReservasByUser } from "../../../services/fetchReservas";

export const EstadisticasPersonalesTab = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPedidos: 0,
        totalReservas: 0,
        gastadoPedidos: 0,
        gastadoReservas: 0,
        pedidosEntregados: 0,
        reservasActivas: 0,
        restauranteFavorito: "N/A",
        hotelFavorito: "N/A"
    });

    useEffect(() => {
        cargarEstadisticas();
    }, []);

    const cargarEstadisticas = async () => {
        try {
            setLoading(true);
            const user = authService.getUser();
            if (!user?.id) return;

            // Cargar pedidos y reservas
            const [pedidos, reservas] = await Promise.all([
                fetchPedidosByUser(String(user.id)),
                fetchReservasByUser(String(user.id))
            ]);

            // Calcular estadísticas de pedidos
            const gastadoPedidos = pedidos.reduce((sum, p) =>
                sum + (p.totalAmount || p.totalPrice || 0), 0
            );
            const pedidosEntregados = pedidos.filter(p => p.status === "DELIVERED").length;

            // Calcular estadísticas de reservas
            const gastadoReservas = reservas.reduce((sum, r) =>
                sum + (r.totalPrice || 0), 0
            );
            const reservasActivas = reservas.filter(r => r.isActive && !r.isCancelled).length;

            // Restaurante favorito (más pedidos)
            const restauranteCount: { [key: string]: number } = {};
            pedidos.forEach(p => {
                const nombre = p.restaurantName || "Desconocido";
                restauranteCount[nombre] = (restauranteCount[nombre] || 0) + 1;
            });
            const restauranteFavorito = Object.keys(restauranteCount).length > 0
                ? Object.keys(restauranteCount).reduce((a, b) =>
                    restauranteCount[a] > restauranteCount[b] ? a : b
                  )
                : "N/A";

            // Hotel favorito (más reservas)
            const hotelCount: { [key: string]: number } = {};
            reservas.forEach(r => {
                const nombre = r.hotel.hotelName || "Desconocido";
                hotelCount[nombre] = (hotelCount[nombre] || 0) + 1;
            });
            const hotelFavorito = Object.keys(hotelCount).length > 0
                ? Object.keys(hotelCount).reduce((a, b) =>
                    hotelCount[a] > hotelCount[b] ? a : b
                  )
                : "N/A";

            setStats({
                totalPedidos: pedidos.length,
                totalReservas: reservas.length,
                gastadoPedidos,
                gastadoReservas,
                pedidosEntregados,
                reservasActivas,
                restauranteFavorito,
                hotelFavorito
            });
        } catch (error) {
            console.error("Error cargando estadísticas:", error);
        } finally {
            setLoading(false);
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

    const totalGastado = stats.gastadoPedidos + stats.gastadoReservas;
    const porcentajePedidos = totalGastado > 0
        ? (stats.gastadoPedidos / totalGastado) * 100
        : 50;
    const porcentajeReservas = 100 - porcentajePedidos;

    return (
        <>
            {/* Resumen de actividad */}
            <Row className="mb-4">
                <Col md={6} className="mb-4">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-3">
                                <div
                                    className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                                    style={{ width: "60px", height: "60px" }}
                                >
                                    <i className="bi bi-bag-check text-primary" style={{ fontSize: "1.8rem" }}></i>
                                </div>
                                <div className="flex-grow-1">
                                    <small className="text-muted d-block">Total de Pedidos</small>
                                    <h3 className="mb-0">{stats.totalPedidos}</h3>
                                    <small className="text-success">
                                        {stats.pedidosEntregados} entregados
                                    </small>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} className="mb-4">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-3">
                                <div
                                    className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center"
                                    style={{ width: "60px", height: "60px" }}
                                >
                                    <i className="bi bi-calendar-check text-success" style={{ fontSize: "1.8rem" }}></i>
                                </div>
                                <div className="flex-grow-1">
                                    <small className="text-muted d-block">Total de Reservas</small>
                                    <h3 className="mb-0">{stats.totalReservas}</h3>
                                    <small className="text-success">
                                        {stats.reservasActivas} activas
                                    </small>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Gastos totales */}
            <Card className="shadow-sm border-0 mb-4">
                <Card.Header className="bg-white border-0 pt-4">
                    <h5 className="mb-0">Gastos Totales</h5>
                </Card.Header>
                <Card.Body>
                    <div className="text-center mb-4">
                        <h2 className="text-primary mb-0">
                            ${totalGastado.toLocaleString()}
                        </h2>
                        <small className="text-muted">Total gastado en la plataforma</small>
                    </div>

                    <Row>
                        <Col md={6} className="mb-3">
                            <Card className="border h-100">
                                <Card.Body className="text-center">
                                    <i className="bi bi-bag text-primary mb-2" style={{ fontSize: "2rem" }}></i>
                                    <h5>Gastronomía</h5>
                                    <h4 className="text-primary mb-2">
                                        ${stats.gastadoPedidos.toLocaleString()}
                                    </h4>
                                    <ProgressBar
                                        now={porcentajePedidos}
                                        variant="primary"
                                        className="mb-2"
                                        style={{ height: "8px" }}
                                    />
                                    <small className="text-muted">
                                        {porcentajePedidos.toFixed(1)}% del total
                                    </small>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6} className="mb-3">
                            <Card className="border h-100">
                                <Card.Body className="text-center">
                                    <i className="bi bi-building text-success mb-2" style={{ fontSize: "2rem" }}></i>
                                    <h5>Hostelería</h5>
                                    <h4 className="text-success mb-2">
                                        ${stats.gastadoReservas.toLocaleString()}
                                    </h4>
                                    <ProgressBar
                                        now={porcentajeReservas}
                                        variant="success"
                                        className="mb-2"
                                        style={{ height: "8px" }}
                                    />
                                    <small className="text-muted">
                                        {porcentajeReservas.toFixed(1)}% del total
                                    </small>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Favoritos */}
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-0 pt-4">
                    <h5 className="mb-0">Tus Favoritos</h5>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6} className="mb-3">
                            <Card className="border-0 bg-light h-100">
                                <Card.Body>
                                    <div className="d-flex align-items-center gap-3">
                                        <div
                                            className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                                            style={{ width: "50px", height: "50px" }}
                                        >
                                            <i className="bi bi-star-fill"></i>
                                        </div>
                                        <div>
                                            <small className="text-muted d-block">Restaurante favorito</small>
                                            <strong>{stats.restauranteFavorito}</strong>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6} className="mb-3">
                            <Card className="border-0 bg-light h-100">
                                <Card.Body>
                                    <div className="d-flex align-items-center gap-3">
                                        <div
                                            className="rounded-circle bg-success d-flex align-items-center justify-content-center text-white"
                                            style={{ width: "50px", height: "50px" }}
                                        >
                                            <i className="bi bi-heart-fill"></i>
                                        </div>
                                        <div>
                                            <small className="text-muted d-block">Hotel favorito</small>
                                            <strong>{stats.hotelFavorito}</strong>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </>
    );
};
