import { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, ButtonGroup, Form, Alert, Modal, InputGroup } from 'react-bootstrap';
import { DateRangePicker, DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { es } from 'date-fns/locale';
import { fetchReservasByHotel, cancelarReserva, crearReservaExterna, Reserva } from '../../../../services/fetchReservas';
import { fetchHospedajes } from '../../../../services/fetchHospedajes';
import { fetchHabitacionesByHospedaje, type Habitacion } from '../../../../services/fetchHabitaciones';
import { fetchPolitica, type PoliticaReservas } from '../../../../services/fetchPolitica';
import { PhoneInput } from '../../../../shared/components/PhoneInput';
import { authService } from '../../../../services/authService';
import { useWebSocket } from '../../../admin-negocios/hooks/useWebSocket';
import { useNotifications } from '../../../../shared/context/NotificationContext';

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
    roomNumber: number | '';
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
    notas: '',
    roomNumber: ''
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
    const [showCalendar, setShowCalendar] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: undefined,
        endDate: undefined,
        key: 'selection'
    });

    const [hotelId, setHotelId] = useState('');
    const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
    const [politica, setPolitica] = useState<PoliticaReservas | null>(null);
    const { registerAdminTopic } = useNotifications();
    const { lastMessage } = useWebSocket(hotelId, 'HOSPEDAJE');

    // Carga el hospedaje que pertenece al usuario logueado
    useEffect(() => {
        const loadHotelId = async () => {
            const user = authService.getUser();
            if (!user?.id) return;
            const hospedajes = await fetchHospedajes();
            const mio = hospedajes.find(h => String(h.userId) === String(user.id));
            if (mio) setHotelId(String(mio.id));
        };
        loadHotelId();
    }, []);

    // Cuando se tiene hotelId: cargar reservas, habitaciones, política y registrar tópico persistente
    useEffect(() => {
        if (!hotelId) return;
        cargarReservas();
        fetchHabitacionesByHospedaje(hotelId).then(habs => setHabitaciones(habs));
        registerAdminTopic(hotelId, 'HOSPEDAJE');
        fetchPolitica(hotelId).then(pol => { if (pol) setPolitica(pol); });
    }, [hotelId]);

    // Actualizaciones en tiempo real vía WebSocket (UI local)
    useEffect(() => {
        if (!lastMessage) return;
        if (lastMessage.type === 'reserva:nueva') {
            const nueva = lastMessage.payload as Reserva;
            setReservas(prev => [nueva, ...prev]);
        } else if (lastMessage.type === 'reserva:actualizada') {
            const actualizada = lastMessage.payload as Reserva;
            setReservas(prev =>
                prev.map(r => r.id === actualizada.id ? actualizada : r)
            );
        }
    }, [lastMessage]);

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
        if (formData.roomNumber === '' || Number(formData.roomNumber) <= 0) {
            setErrorForm('El número de habitación es obligatorio');
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
                roomNumber: Number(formData.roomNumber),
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

    const handleDateSelect = (ranges: any) => {
        const { startDate, endDate } = ranges.selection;
        if (startDate && endDate) {
            setDateRange({
                startDate,
                endDate,
                key: 'selection'
            });
            setFormData(prev => ({
                ...prev,
                checkInDate: startDate.toISOString().split('T')[0],
                checkOutDate: endDate.toISOString().split('T')[0]
            }));
        }
    };

    const formatFecha = (date: Date | undefined): string => {
        if (!date) return 'Seleccionar fecha';
        return date.toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const openCalendar = () => {
        setShowCalendar(true);
        if (formData.checkInDate && formData.checkOutDate) {
            setDateRange({
                startDate: new Date(formData.checkInDate),
                endDate: new Date(formData.checkOutDate),
                key: 'selection'
            });
        }
    };

    const resetModal = () => {
        setModalReservaExterna(false);
        setFormData(initialFormData);
        setErrorForm(null);
        setDateRange({ startDate: undefined, endDate: undefined, key: 'selection' });
        setShowCalendar(false);
    };

    const toLocalDateStr = (date: Date): string => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const getOccupiedDatesForRoom = (roomNum: number): Set<string> => {
        const occupied = new Set<string>();
        reservas
            .filter(r => r.roomNumber === roomNum && r.isActive && !r.isCancelled)
            .forEach(r => {
                const start = new Date(r.stayPeriod.checkInDate);
                const end = new Date(r.stayPeriod.checkOutDate);
                start.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);
                const current = new Date(start);
                while (current < end) {
                    occupied.add(toLocalDateStr(current));
                    current.setDate(current.getDate() + 1);
                }
            });
        return occupied;
    };

    const occupiedDatesSet = formData.roomNumber !== ''
        ? getOccupiedDatesForRoom(Number(formData.roomNumber))
        : new Set<string>();

    const dayContentRenderer = (date: Date) => {
        const dateStr = toLocalDateStr(date);
        const isOccupied = occupiedDatesSet.has(dateStr);
        return (
            <div style={{
                background: isOccupied ? 'rgba(220, 53, 69, 0.38)' : 'rgba(25, 135, 84, 0.28)',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 'auto',
                color: isOccupied ? '#842029' : '#0a3622',
                fontWeight: 500,
                pointerEvents: 'none',
            }}>
                {date.getDate()}
            </div>
        );
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
            {/* Indicador de política de reservas */}
            {politica && (
                <Alert variant={politica.reservasHabilitadas ? 'success' : 'danger'} className="py-2 mb-3">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <strong>
                            {politica.reservasHabilitadas ? 'Reservas online activas' : 'Reservas online desactivadas'}
                        </strong>
                        {politica.reservasHabilitadas && politica.politicaFdsActiva && (
                            <Badge bg="info">Mín. 2 noches Jue-Dom activo</Badge>
                        )}
                        <small className="text-muted ms-auto">
                            Gestioná la política desde el panel de Reservas
                        </small>
                    </div>
                </Alert>
            )}

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
                                <Card.Header className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <span className="fw-bold d-block">Reserva #{reserva.id.slice(0, 8)}</span>
                                        {reserva.dateCreated && (
                                            <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                                                Registrada: {(reserva.dateCreated.endsWith('Z') ? new Date(reserva.dateCreated) : new Date(reserva.dateCreated + 'Z')).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                                            </small>
                                        )}
                                    </div>
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
            <Modal show={modalReservaExterna} onHide={resetModal} size="lg">
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
                                <PhoneInput
                                    value={formData.customerPhone}
                                    onChange={(val) => setFormData(prev => ({ ...prev, customerPhone: val }))}
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
                    <h6 className="mb-3">Habitación y Fechas</h6>

                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Habitación *</Form.Label>
                                <Form.Select
                                    value={formData.roomNumber === '' ? '' : String(formData.roomNumber)}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '') {
                                            setFormData(prev => ({ ...prev, roomNumber: '', checkInDate: '', checkOutDate: '' }));
                                        } else {
                                            const newRoom = Number(val);
                                            const hab = habitaciones.find(h => h.numero === newRoom);
                                            setFormData(prev => ({
                                                ...prev,
                                                roomNumber: newRoom,
                                                checkInDate: '',
                                                checkOutDate: '',
                                                totalPrice: hab?.precio ?? prev.totalPrice
                                            }));
                                        }
                                        setShowCalendar(false);
                                        setDateRange({ startDate: undefined, endDate: undefined, key: 'selection' });
                                    }}
                                >
                                    <option value="">-- Seleccionar habitación --</option>
                                    {habitaciones.map(hab => (
                                        <option key={hab.id} value={String(hab.numero)}>
                                            Hab. {hab.numero} — {hab.titulo} (${hab.precio.toLocaleString()})
                                        </option>
                                    ))}
                                </Form.Select>
                                {formData.roomNumber !== '' && (
                                    <Form.Text className="text-muted">
                                        {reservas.filter(r => r.roomNumber === Number(formData.roomNumber) && r.isActive && !r.isCancelled).length} reserva(s) activa(s)
                                    </Form.Text>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>

                    {formData.roomNumber === '' ? (
                        <Alert variant="secondary" className="py-2 mb-3">
                            <small>Ingrese el número de habitación para ver disponibilidad en el calendario.</small>
                        </Alert>
                    ) : (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Seleccionar fechas *</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        value={dateRange.startDate && dateRange.endDate ?
                                            `${formatFecha(dateRange.startDate)} - ${formatFecha(dateRange.endDate)}` :
                                            'Click para seleccionar fechas'
                                        }
                                        readOnly
                                        onClick={openCalendar}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <Button variant="outline-primary" onClick={openCalendar}>
                                        📅 Calendario
                                    </Button>
                                </InputGroup>
                                <Form.Text className="text-muted">
                                    Click en el campo o botón para seleccionar check-in y check-out
                                </Form.Text>
                            </Form.Group>

                            {showCalendar && (
                                <Card className="mb-3">
                                    <Card.Body className="p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                                            <h6 className="mb-0">Habitación {formData.roomNumber}</h6>
                                            <div className="d-flex align-items-center gap-3">
                                                <small className="d-flex align-items-center gap-1">
                                                    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: 'rgba(220, 53, 69, 0.7)' }} />
                                                    Ocupado
                                                </small>
                                                <small className="d-flex align-items-center gap-1">
                                                    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: 'rgba(25, 135, 84, 0.7)' }} />
                                                    Disponible
                                                </small>
                                                <Button variant="outline-secondary" size="sm" onClick={() => setShowCalendar(false)}>
                                                    ✕ Cerrar
                                                </Button>
                                            </div>
                                        </div>
                                        <DateRangePicker
                                            onChange={handleDateSelect}
                                            ranges={[dateRange]}
                                            months={2}
                                            direction="horizontal"
                                            locale={es}
                                            showDateDisplay={false}
                                            rangeColors={['#0d6efd', '#3ecf8e', '#fed14c']}
                                            dayContentRenderer={dayContentRenderer}
                                        />
                                        {dateRange.startDate && dateRange.endDate && (
                                            <Alert variant="info" className="mt-3 mb-0">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>Check-in:</strong> {formatFecha(dateRange.startDate)}<br />
                                                        <strong>Check-out:</strong> {formatFecha(dateRange.endDate)}<br />
                                                        <strong>Noches:</strong> {calcularNoches(
                                                            dateRange.startDate.toISOString().split('T')[0],
                                                            dateRange.endDate.toISOString().split('T')[0]
                                                        )}
                                                    </div>
                                                    <Button variant="success" size="sm" onClick={() => setShowCalendar(false)}>
                                                        Confirmar fechas
                                                    </Button>
                                                </div>
                                            </Alert>
                                        )}
                                    </Card.Body>
                                </Card>
                            )}
                            {formData.checkInDate && formData.checkOutDate && (
                                <Alert variant="info" className="py-2">
                                    <small>
                                        <strong>Noches:</strong> {calcularNoches(formData.checkInDate, formData.checkOutDate)}
                                    </small>
                                </Alert>
                            )}
                        </>
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
                    <Button variant="secondary" onClick={resetModal}>
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
