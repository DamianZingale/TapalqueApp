import { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, ButtonGroup, Form, Alert, Modal } from 'react-bootstrap';
import { fetchReservasByHotel, cancelarReserva, crearReservaExterna, Reserva } from '../../../../services/fetchReservas';

interface FormReservaExterna {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
    amountPaid: number;
    paymentType: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA';
    notas: string;
}

const initialFormData: FormReservaExterna = {
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    checkInDate: '',
    checkOutDate: '',
    totalPrice: 0,
    amountPaid: 0,
    paymentType: 'EFECTIVO',
    notas: ''
};

export const GestionReservasTab = () => {
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState<'TODAS' | 'ACTIVAS' | 'PAGADAS' | 'CANCELADAS'>('TODAS');
    const [ordenPor, setOrdenPor] = useState<'reciente' | 'checkIn' | 'monto'>('checkIn');
    const [modalReservaExterna, setModalReservaExterna] = useState(false);
    const [formData, setFormData] = useState<FormReservaExterna>(initialFormData);
    const [guardando, setGuardando] = useState(false);
    const [errorForm, setErrorForm] = useState<string | null>(null);

    // TODO: Obtener hotelId del usuario logueado
    const hotelId = '1';

    useEffect(() => {
        cargarReservas();
    }, []);

    const cargarReservas = async () => {
        setLoading(true);
        const data = await fetchReservasByHotel(hotelId);
        setReservas(data);
        setLoading(false);
    };

    const handleCancelarReserva = async (reservaId: string) => {
        if (window.confirm('¿Está seguro de cancelar esta reserva?')) {
            const exito = await cancelarReserva(reservaId);
            if (exito) {
                setReservas(prev =>
                    prev.map(r => r.id === reservaId ? { ...r, isCancelled: true, isActive: false } : r)
                );
            } else {
                alert('Error al cancelar la reserva');
            }
        }
    };

    const handleCrearReservaExterna = async () => {
        setErrorForm(null);

        // Validaciones
        if (!formData.customerName.trim()) {
            setErrorForm('El nombre del cliente es obligatorio');
            return;
        }
        if (!formData.checkInDate || !formData.checkOutDate) {
            setErrorForm('Las fechas de check-in y check-out son obligatorias');
            return;
        }
        if (new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) {
            setErrorForm('La fecha de check-out debe ser posterior al check-in');
            return;
        }
        if (formData.totalPrice <= 0) {
            setErrorForm('El precio total debe ser mayor a 0');
            return;
        }

        setGuardando(true);
        try {
            const reservaData = {
                customer: {
                    customerId: `ext-${Date.now()}`,
                    customerName: formData.customerName
                },
                hotel: {
                    hotelId: hotelId,
                    hotelName: 'Hotel' // Se actualizará desde el backend
                },
                stayPeriod: {
                    checkInDate: formData.checkInDate,
                    checkOutDate: formData.checkOutDate
                },
                payment: {
                    isPaid: formData.amountPaid >= formData.totalPrice,
                    hasPendingAmount: formData.amountPaid < formData.totalPrice,
                    isDeposit: formData.amountPaid > 0 && formData.amountPaid < formData.totalPrice,
                    paymentType: formData.paymentType,
                    amountPaid: formData.amountPaid,
                    totalAmount: formData.totalPrice,
                    remainingAmount: formData.totalPrice - formData.amountPaid
                },
                totalPrice: formData.totalPrice,
                isActive: true,
                isCancelled: false
            };

            const nuevaReserva = await crearReservaExterna(reservaData);
            if (nuevaReserva) {
                setReservas(prev => [nuevaReserva, ...prev]);
                setModalReservaExterna(false);
                setFormData(initialFormData);
                alert('Reserva creada exitosamente');
            } else {
                setErrorForm('Error al crear la reserva. Intente nuevamente.');
            }
        } catch (error) {
            console.error('Error:', error);
            setErrorForm('Error al crear la reserva. Intente nuevamente.');
        } finally {
            setGuardando(false);
        }
    };

    const reservasFiltradas = reservas
        .filter(r => {
            if (filtroEstado === 'ACTIVAS') return r.isActive && !r.isCancelled;
            if (filtroEstado === 'PAGADAS') return r.payment.isPaid;
            if (filtroEstado === 'CANCELADAS') return r.isCancelled;
            return true;
        })
        .sort((a, b) => {
            if (ordenPor === 'reciente') return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
            if (ordenPor === 'checkIn') return new Date(a.stayPeriod.checkInDate).getTime() - new Date(b.stayPeriod.checkInDate).getTime();
            return b.totalPrice - a.totalPrice;
        });

    const getEstadoBadge = (reserva: Reserva) => {
        if (reserva.isCancelled) return <Badge bg="danger">Cancelada</Badge>;
        if (reserva.payment.isPaid) return <Badge bg="success">Pagada</Badge>;
        if (reserva.payment.hasPendingAmount) return <Badge bg="warning">Pago Parcial</Badge>;
        if (reserva.isActive) return <Badge bg="info">Activa</Badge>;
        return <Badge bg="secondary">Pendiente</Badge>;
    };

    const calcularNoches = (checkIn: string, checkOut: string): number => {
        const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
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
                            variant={filtroEstado === 'TODAS' ? 'primary' : 'outline-primary'}
                            onClick={() => setFiltroEstado('TODAS')}
                        >
                            Todas ({reservas.length})
                        </Button>
                        <Button
                            variant={filtroEstado === 'ACTIVAS' ? 'info' : 'outline-info'}
                            onClick={() => setFiltroEstado('ACTIVAS')}
                        >
                            Activas ({reservas.filter(r => r.isActive && !r.isCancelled).length})
                        </Button>
                        <Button
                            variant={filtroEstado === 'PAGADAS' ? 'success' : 'outline-success'}
                            onClick={() => setFiltroEstado('PAGADAS')}
                        >
                            Pagadas ({reservas.filter(r => r.payment.isPaid).length})
                        </Button>
                        <Button
                            variant={filtroEstado === 'CANCELADAS' ? 'danger' : 'outline-danger'}
                            onClick={() => setFiltroEstado('CANCELADAS')}
                        >
                            Canceladas ({reservas.filter(r => r.isCancelled).length})
                        </Button>
                    </ButtonGroup>
                </Col>

                <Col md={4}>
                    <h5>Ordenar por:</h5>
                    <Form.Select value={ordenPor} onChange={(e) => setOrdenPor(e.target.value as any)}>
                        <option value="checkIn">Fecha de entrada</option>
                        <option value="reciente">Más reciente</option>
                        <option value="monto">Mayor monto</option>
                    </Form.Select>
                </Col>

                <Col md={2} className="d-flex align-items-end">
                    <Button variant="success" className="w-100" onClick={() => setModalReservaExterna(true)}>
                        + Reserva Externa
                    </Button>
                </Col>
            </Row>

            {/* Lista de reservas */}
            {reservasFiltradas.length === 0 ? (
                <Alert variant="info">No hay reservas con este filtro</Alert>
            ) : (
                <Row>
                    {reservasFiltradas.map(reserva => (
                        <Col md={6} lg={4} key={reserva.id} className="mb-3">
                            <Card className="h-100 shadow-sm">
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <span className="fw-bold">Reserva #{reserva.id.slice(0, 8)}</span>
                                    {getEstadoBadge(reserva)}
                                </Card.Header>
                                <Card.Body>
                                    <h6 className="mb-2">Cliente</h6>
                                    <p className="mb-2">{reserva.customer.customerName}</p>

                                    <h6 className="mb-2">Fechas</h6>
                                    <div className="mb-2">
                                        <Badge bg="primary" className="me-1">Check-in:</Badge>
                                        {new Date(reserva.stayPeriod.checkInDate).toLocaleDateString('es-AR')}
                                    </div>
                                    <div className="mb-2">
                                        <Badge bg="primary" className="me-1">Check-out:</Badge>
                                        {new Date(reserva.stayPeriod.checkOutDate).toLocaleDateString('es-AR')}
                                    </div>
                                    <div className="mb-2">
                                        <Badge bg="info">
                                            {calcularNoches(reserva.stayPeriod.checkInDate, reserva.stayPeriod.checkOutDate)} noches
                                        </Badge>
                                    </div>

                                    <div className="border-top pt-2 mt-2">
                                        <strong>Total: ${reserva.totalPrice.toFixed(2)}</strong>
                                        {reserva.payment.hasPendingAmount && (
                                            <div className="mt-1">
                                                <small className="text-warning">
                                                    Pagado: ${reserva.payment.amountPaid.toFixed(2)}
                                                    <br />
                                                    Pendiente: ${reserva.payment.remainingAmount.toFixed(2)}
                                                </small>
                                            </div>
                                        )}
                                    </div>

                                    {reserva.mercadoPagoId && (
                                        <div className="mt-2">
                                            <Badge bg="success">Pagado con MP</Badge>
                                            <small className="d-block text-muted mt-1">
                                                MP ID: {reserva.mercadoPagoId}
                                            </small>
                                        </div>
                                    )}
                                </Card.Body>
                                <Card.Footer>
                                    {!reserva.isCancelled && (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="w-100"
                                            onClick={() => handleCancelarReserva(reserva.id)}
                                        >
                                            ❌ Cancelar Reserva
                                        </Button>
                                    )}
                                    {reserva.isCancelled && (
                                        <div className="text-center text-danger">
                                            Reserva cancelada
                                        </div>
                                    )}
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Modal para crear reserva externa */}
            <Modal show={modalReservaExterna} onHide={() => { setModalReservaExterna(false); setFormData(initialFormData); setErrorForm(null); }} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Crear Reserva Externa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorForm && <Alert variant="danger">{errorForm}</Alert>}

                    <h6 className="mb-3">Datos del Cliente</h6>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nombre completo *</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.customerName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                                    placeholder="Nombre del huésped"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Teléfono</Form.Label>
                                <Form.Control
                                    type="tel"
                                    value={formData.customerPhone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                                    placeholder="+54 9 11 1234-5678"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={formData.customerEmail}
                                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                                    placeholder="cliente@email.com"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <hr />
                    <h6 className="mb-3">Fechas de Estadía</h6>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Check-in *</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.checkInDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, checkInDate: e.target.value }))}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Check-out *</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.checkOutDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, checkOutDate: e.target.value }))}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    {formData.checkInDate && formData.checkOutDate && (
                        <Alert variant="info" className="py-2">
                            <small>
                                <strong>Noches:</strong> {calcularNoches(formData.checkInDate, formData.checkOutDate)}
                            </small>
                        </Alert>
                    )}

                    <hr />
                    <h6 className="mb-3">Información de Pago</h6>
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Precio Total *</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={formData.totalPrice}
                                    onChange={(e) => setFormData(prev => ({ ...prev, totalPrice: Number(e.target.value) }))}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Monto Pagado</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    max={formData.totalPrice}
                                    value={formData.amountPaid}
                                    onChange={(e) => setFormData(prev => ({ ...prev, amountPaid: Number(e.target.value) }))}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Forma de Pago</Form.Label>
                                <Form.Select
                                    value={formData.paymentType}
                                    onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value as 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' }))}
                                >
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="TRANSFERENCIA">Transferencia</option>
                                    <option value="TARJETA">Tarjeta</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    {formData.totalPrice > 0 && formData.amountPaid < formData.totalPrice && (
                        <Alert variant="warning" className="py-2">
                            <small>
                                <strong>Saldo pendiente:</strong> ${(formData.totalPrice - formData.amountPaid).toLocaleString()}
                            </small>
                        </Alert>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>Notas adicionales</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={formData.notas}
                            onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                            placeholder="Observaciones, pedidos especiales, etc."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { setModalReservaExterna(false); setFormData(initialFormData); }}>
                        Cancelar
                    </Button>
                    <Button variant="success" onClick={handleCrearReservaExterna} disabled={guardando}>
                        {guardando ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Guardando...
                            </>
                        ) : (
                            'Crear Reserva'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
