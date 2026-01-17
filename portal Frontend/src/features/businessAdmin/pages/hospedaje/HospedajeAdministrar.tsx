import { useState, useEffect } from 'react';
import {
  Card, Row, Col, Button, Badge, Form, Alert, Spinner, Tabs, Tab, Modal
} from 'react-bootstrap';
import { fetchReservasByHotel, cancelarReserva, crearReservaExterna } from '../../../../services/fetchReservas';
import { useWebSocket } from '../../hooks/useWebSocket';
import type { Reserva, FormReservaExterna, EstadoReservaColor } from '../../types';
import { getColorEstadoReserva } from '../../types';

interface HospedajeAdministrarProps {
  businessId: string;
  businessName: string;
}

const initialFormReserva: FormReservaExterna = {
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

export function HospedajeAdministrar({ businessId, businessName }: HospedajeAdministrarProps) {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<'TODAS' | 'ACTIVAS' | 'PAGADAS' | 'CANCELADAS'>('TODAS');
  const [ordenPor, setOrdenPor] = useState<'reciente' | 'checkIn' | 'monto'>('checkIn');
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'danger'; texto: string } | null>(null);

  // Tab activo
  const [activeTab, setActiveTab] = useState<'activas' | 'historial'>('activas');

  // Filtros de historial
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

  // Modal crear reserva
  const [modalCrear, setModalCrear] = useState(false);
  const [formReserva, setFormReserva] = useState<FormReservaExterna>(initialFormReserva);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // WebSocket
  const { isConnected, lastMessage } = useWebSocket(businessId, 'HOSPEDAJE');

  useEffect(() => {
    cargarReservas();
  }, [businessId]);

  // Manejar mensajes WebSocket
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'reserva:nueva') {
        const nuevaReserva = lastMessage.payload as Reserva;
        setReservas(prev => [nuevaReserva, ...prev]);
        playNotificationSound();
        setMensaje({ tipo: 'success', texto: '¡Nueva reserva recibida!' });
      } else if (lastMessage.type === 'reserva:actualizada') {
        const reservaActualizada = lastMessage.payload as Reserva;
        setReservas(prev => prev.map(r =>
          r.id === reservaActualizada.id ? reservaActualizada : r
        ));
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    } catch (e) {
      console.log('No se pudo reproducir sonido');
    }
  };

  const cargarReservas = async () => {
    try {
      setLoading(true);
      const data = await fetchReservasByHotel(businessId);
      setReservas(data);
    } catch (error) {
      console.error('Error cargando reservas:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar las reservas' });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y ordenar reservas
  const reservasFiltradas = reservas
    .filter(r => {
      if (filtroEstado === 'ACTIVAS' && !r.isActive) return false;
      if (filtroEstado === 'PAGADAS' && !r.payment.isPaid) return false;
      if (filtroEstado === 'CANCELADAS' && !r.isCancelled) return false;

      // Filtrar por fecha si estamos en historial
      if (activeTab === 'historial') {
        const fechaReserva = new Date(r.dateCreated);
        if (fechaDesde) {
          const desde = new Date(fechaDesde);
          if (fechaReserva < desde) return false;
        }
        if (fechaHasta) {
          const hasta = new Date(fechaHasta);
          hasta.setHours(23, 59, 59);
          if (fechaReserva > hasta) return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (ordenPor) {
        case 'reciente':
          return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
        case 'checkIn':
          return new Date(a.stayPeriod.checkInDate).getTime() - new Date(b.stayPeriod.checkInDate).getTime();
        case 'monto':
          return b.totalPrice - a.totalPrice;
        default:
          return 0;
      }
    });

  // Reservas activas (no canceladas y activas)
  const reservasActivas = reservasFiltradas.filter(r => r.isActive && !r.isCancelled);

  // Cancelar reserva
  const handleCancelarReserva = async (reserva: Reserva) => {
    if (!window.confirm(`¿Estás seguro de cancelar la reserva de ${reserva.customer.customerName}?`)) return;

    try {
      const result = await cancelarReserva(reserva.id);

      if (result) {
        setReservas(reservas.map(r =>
          r.id === reserva.id ? { ...r, isCancelled: true, isActive: false } : r
        ));
        setMensaje({ tipo: 'success', texto: 'Reserva cancelada' });
      }
    } catch (error) {
      console.error('Error cancelando reserva:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cancelar la reserva' });
    }
  };

  // Crear reserva externa
  const handleCrearReserva = async () => {
    setErrorForm(null);

    if (!formReserva.customerName.trim()) {
      setErrorForm('El nombre del cliente es obligatorio');
      return;
    }
    if (!formReserva.checkInDate || !formReserva.checkOutDate) {
      setErrorForm('Las fechas de check-in y check-out son obligatorias');
      return;
    }
    if (new Date(formReserva.checkOutDate) <= new Date(formReserva.checkInDate)) {
      setErrorForm('La fecha de check-out debe ser posterior al check-in');
      return;
    }
    if (formReserva.totalPrice <= 0) {
      setErrorForm('El precio total debe ser mayor a 0');
      return;
    }

    try {
      setGuardando(true);

      const nuevaReserva: Partial<Reserva> = {
        customer: {
          customerId: '',
          customerName: formReserva.customerName,
          customerPhone: formReserva.customerPhone,
          customerEmail: formReserva.customerEmail
        },
        hotel: {
          hotelId: businessId,
          hotelName: businessName
        },
        stayPeriod: {
          checkInDate: formReserva.checkInDate,
          checkOutDate: formReserva.checkOutDate
        },
        payment: {
          isPaid: formReserva.amountPaid >= formReserva.totalPrice,
          hasPendingAmount: formReserva.amountPaid < formReserva.totalPrice,
          isDeposit: formReserva.amountPaid > 0 && formReserva.amountPaid < formReserva.totalPrice,
          paymentType: formReserva.paymentType,
          amountPaid: formReserva.amountPaid,
          totalAmount: formReserva.totalPrice,
          remainingAmount: formReserva.totalPrice - formReserva.amountPaid
        },
        totalPrice: formReserva.totalPrice,
        isActive: true,
        isCancelled: false,
        notas: formReserva.notas
      };

      const creada = await crearReservaExterna(nuevaReserva);

      if (creada) {
        setReservas([creada, ...reservas]);
        setModalCrear(false);
        setFormReserva(initialFormReserva);
        setMensaje({ tipo: 'success', texto: 'Reserva creada correctamente' });
      }
    } catch (error) {
      console.error('Error creando reserva:', error);
      setErrorForm('Error al crear la reserva');
    } finally {
      setGuardando(false);
    }
  };

  // Calcular totales del historial
  const calcularTotales = () => {
    const filtradas = reservasFiltradas;
    return {
      cantidad: filtradas.length,
      total: filtradas.reduce((sum, r) => sum + r.totalPrice, 0),
      pagado: filtradas.reduce((sum, r) => sum + r.payment.amountPaid, 0),
      pendiente: filtradas.reduce((sum, r) => sum + r.payment.remainingAmount, 0)
    };
  };

  const totales = calcularTotales();

  // Calcular noches
  const calcularNoches = (checkIn: string, checkOut: string): number => {
    const inicio = new Date(checkIn);
    const fin = new Date(checkOut);
    const diff = fin.getTime() - inicio.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando reservas...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Indicador de conexión */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <span
            className={`rounded-circle ${isConnected ? 'bg-success' : 'bg-danger'}`}
            style={{ width: '12px', height: '12px', display: 'inline-block' }}
          />
          <small className="text-muted">
            {isConnected ? 'Conectado - Actualizaciones en tiempo real' : 'Desconectado - Reconectando...'}
          </small>
        </div>
        <div className="d-flex gap-2">
          <Button variant="success" size="sm" onClick={() => setModalCrear(true)}>
            + Crear Reserva Manual
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={cargarReservas}>
            🔄 Actualizar
          </Button>
        </div>
      </div>

      {mensaje && (
        <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje(null)}>
          {mensaje.texto}
        </Alert>
      )}

      {/* Leyenda de colores */}
      <Card className="mb-3">
        <Card.Body className="py-2">
          <small className="text-muted me-3">Código de colores:</small>
          <Badge bg="danger" className="me-2">🔴 En ejecución / Paga al ingreso</Badge>
          <Badge bg="warning" text="dark" className="me-2">🟡 Con adelanto/garantía</Badge>
          <Badge className="me-2" style={{ backgroundColor: '#fd7e14', color: 'white' }}>🟠 Pago completo</Badge>
        </Card.Body>
      </Card>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k as 'activas' | 'historial')} className="mb-3">
        {/* Tab Reservas Activas */}
        <Tab eventKey="activas" title={`📅 Activas (${reservasActivas.length})`}>
          {/* Filtros */}
          <Row className="mb-3 g-2">
            <Col md={4}>
              <Form.Select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as typeof filtroEstado)}
              >
                <option value="TODAS">Todas</option>
                <option value="ACTIVAS">Activas</option>
                <option value="PAGADAS">Pagadas</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select
                value={ordenPor}
                onChange={(e) => setOrdenPor(e.target.value as typeof ordenPor)}
              >
                <option value="checkIn">Por fecha de ingreso</option>
                <option value="reciente">Más reciente</option>
                <option value="monto">Mayor monto</option>
              </Form.Select>
            </Col>
          </Row>

          {/* Lista de reservas */}
          <Row xs={1} md={2} lg={3} className="g-3">
            {reservasActivas.map(reserva => (
              <Col key={reserva.id}>
                <ReservaCard reserva={reserva} onCancelar={handleCancelarReserva} />
              </Col>
            ))}
          </Row>

          {reservasActivas.length === 0 && (
            <div className="text-center py-5">
              <div style={{ fontSize: '4rem' }}>📭</div>
              <h4>No hay reservas activas</h4>
              <p className="text-muted">Las nuevas reservas aparecerán aquí automáticamente</p>
            </div>
          )}
        </Tab>

        {/* Tab Historial */}
        <Tab eventKey="historial" title="📊 Historial">
          {/* Filtros de fecha */}
          <Card className="mb-3">
            <Card.Body>
              <Row className="align-items-end g-2">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Desde</Form.Label>
                    <Form.Control
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Hasta</Form.Label>
                    <Form.Control
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value as typeof filtroEstado)}
                  >
                    <option value="TODAS">Todas</option>
                    <option value="ACTIVAS">Activas</option>
                    <option value="PAGADAS">Pagadas</option>
                    <option value="CANCELADAS">Canceladas</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setFechaDesde('');
                      setFechaHasta('');
                      setFiltroEstado('TODAS');
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Resumen */}
          <Row className="mb-3 g-3">
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3>{totales.cantidad}</h3>
                  <small className="text-muted">Reservas</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center bg-success text-white">
                <Card.Body>
                  <h3>${totales.total.toLocaleString()}</h3>
                  <small>Total</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center bg-primary text-white">
                <Card.Body>
                  <h3>${totales.pagado.toLocaleString()}</h3>
                  <small>Cobrado</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center bg-warning">
                <Card.Body>
                  <h3>${totales.pendiente.toLocaleString()}</h3>
                  <small>Pendiente</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Lista de reservas del historial */}
          <Row xs={1} md={2} lg={3} className="g-3">
            {reservasFiltradas.map(reserva => (
              <Col key={reserva.id}>
                <ReservaCard reserva={reserva} onCancelar={handleCancelarReserva} showHistorial />
              </Col>
            ))}
          </Row>

          {reservasFiltradas.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted">No hay reservas en el período seleccionado</p>
            </div>
          )}
        </Tab>
      </Tabs>

      {/* Modal Crear Reserva */}
      <Modal show={modalCrear} onHide={() => setModalCrear(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Crear Reserva Manual</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorForm && <Alert variant="danger">{errorForm}</Alert>}

          <h6 className="text-muted mb-3">Datos del Cliente</h6>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre completo *</Form.Label>
                <Form.Control
                  type="text"
                  value={formReserva.customerName}
                  onChange={(e) => setFormReserva({ ...formReserva, customerName: e.target.value })}
                  placeholder="Nombre y apellido"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="tel"
                  value={formReserva.customerPhone}
                  onChange={(e) => setFormReserva({ ...formReserva, customerPhone: e.target.value })}
                  placeholder="Número de contacto"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={formReserva.customerEmail}
              onChange={(e) => setFormReserva({ ...formReserva, customerEmail: e.target.value })}
              placeholder="correo@ejemplo.com"
            />
          </Form.Group>

          <hr />
          <h6 className="text-muted mb-3">Datos de la Reserva</h6>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Check-in *</Form.Label>
                <Form.Control
                  type="date"
                  value={formReserva.checkInDate}
                  onChange={(e) => setFormReserva({ ...formReserva, checkInDate: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Check-out *</Form.Label>
                <Form.Control
                  type="date"
                  value={formReserva.checkOutDate}
                  onChange={(e) => setFormReserva({ ...formReserva, checkOutDate: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>

          {formReserva.checkInDate && formReserva.checkOutDate && (
            <Alert variant="info" className="py-2">
              <strong>{calcularNoches(formReserva.checkInDate, formReserva.checkOutDate)} noches</strong>
            </Alert>
          )}

          <hr />
          <h6 className="text-muted mb-3">Datos del Pago</h6>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Precio total *</Form.Label>
                <Form.Control
                  type="number"
                  value={formReserva.totalPrice}
                  onChange={(e) => setFormReserva({ ...formReserva, totalPrice: Number(e.target.value) })}
                  min={0}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Monto pagado</Form.Label>
                <Form.Control
                  type="number"
                  value={formReserva.amountPaid}
                  onChange={(e) => setFormReserva({ ...formReserva, amountPaid: Number(e.target.value) })}
                  min={0}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Forma de pago</Form.Label>
                <Form.Select
                  value={formReserva.paymentType}
                  onChange={(e) => setFormReserva({ ...formReserva, paymentType: e.target.value as FormReservaExterna['paymentType'] })}
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="TARJETA">Tarjeta</option>
                  <option value="MERCADOPAGO">MercadoPago</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {formReserva.totalPrice > 0 && formReserva.amountPaid < formReserva.totalPrice && (
            <Alert variant="warning" className="py-2">
              Saldo pendiente: <strong>${(formReserva.totalPrice - formReserva.amountPaid).toLocaleString()}</strong>
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Notas</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formReserva.notas}
              onChange={(e) => setFormReserva({ ...formReserva, notas: e.target.value })}
              placeholder="Observaciones adicionales..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalCrear(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleCrearReserva} disabled={guardando}>
            {guardando ? <Spinner size="sm" /> : 'Crear Reserva'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// Componente Card de Reserva
interface ReservaCardProps {
  reserva: Reserva;
  onCancelar: (reserva: Reserva) => void;
  showHistorial?: boolean;
}

function ReservaCard({ reserva, onCancelar, showHistorial }: ReservaCardProps) {
  const colorEstado = getColorEstadoReserva(reserva);

  const getColorBg = (color: EstadoReservaColor): string => {
    switch (color) {
      case 'ROJO':
        return 'danger';
      case 'AMARILLO':
        return 'warning';
      case 'NARANJA':
        return 'warning'; // Bootstrap no tiene naranja, usamos estilo inline
      default:
        return 'secondary';
    }
  };

  const calcularNoches = (): number => {
    const inicio = new Date(reserva.stayPeriod.checkInDate);
    const fin = new Date(reserva.stayPeriod.checkOutDate);
    const diff = fin.getTime() - inicio.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <Card
      className="h-100"
      style={{
        borderLeft: `4px solid ${colorEstado === 'ROJO' ? '#dc3545' : colorEstado === 'AMARILLO' ? '#ffc107' : '#fd7e14'}`
      }}
    >
      <Card.Header className="d-flex justify-content-between align-items-center">
        <small className="text-muted">
          #{reserva.id.slice(-6).toUpperCase()}
        </small>
        {reserva.isCancelled ? (
          <Badge bg="dark">Cancelada</Badge>
        ) : (
          <Badge
            bg={colorEstado === 'NARANJA' ? undefined : getColorBg(colorEstado)}
            text={colorEstado === 'AMARILLO' ? 'dark' : undefined}
            style={colorEstado === 'NARANJA' ? { backgroundColor: '#fd7e14', color: 'white' } : undefined}
          >
            {colorEstado === 'ROJO' && '🔴 Paga al ingreso'}
            {colorEstado === 'AMARILLO' && '🟡 Con adelanto'}
            {colorEstado === 'NARANJA' && '🟠 Pago completo'}
          </Badge>
        )}
      </Card.Header>
      <Card.Body>
        {/* Cliente */}
        <div className="mb-2">
          <strong>👤 {reserva.customer.customerName}</strong>
          {reserva.customer.customerPhone && (
            <div className="small text-muted">📞 {reserva.customer.customerPhone}</div>
          )}
          {reserva.customer.customerEmail && (
            <div className="small text-muted">📧 {reserva.customer.customerEmail}</div>
          )}
        </div>

        {/* Fechas */}
        <div className="mb-2 p-2 bg-light rounded">
          <Row>
            <Col>
              <small className="text-muted">Check-in</small>
              <div><strong>{new Date(reserva.stayPeriod.checkInDate).toLocaleDateString('es-AR')}</strong></div>
            </Col>
            <Col className="text-center">
              <Badge bg="secondary">{calcularNoches()} noches</Badge>
            </Col>
            <Col className="text-end">
              <small className="text-muted">Check-out</small>
              <div><strong>{new Date(reserva.stayPeriod.checkOutDate).toLocaleDateString('es-AR')}</strong></div>
            </Col>
          </Row>
        </div>

        {/* Pago */}
        <div className="mb-2">
          <div className="d-flex justify-content-between">
            <span>Total:</span>
            <strong>${reserva.totalPrice.toLocaleString()}</strong>
          </div>
          <div className="d-flex justify-content-between text-success">
            <span>Pagado:</span>
            <span>${reserva.payment.amountPaid.toLocaleString()}</span>
          </div>
          {reserva.payment.remainingAmount > 0 && (
            <div className="d-flex justify-content-between text-warning">
              <span>Pendiente:</span>
              <span>${reserva.payment.remainingAmount.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Comprobante */}
        {reserva.payment.paymentReceiptPath && (
          <div className="mb-2">
            <a
              href={reserva.payment.paymentReceiptPath}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-primary w-100"
            >
              📄 Ver comprobante
            </a>
          </div>
        )}

        {/* Notas */}
        {reserva.notas && (
          <div className="small text-muted border-top pt-2 mt-2">
            📝 {reserva.notas}
          </div>
        )}
      </Card.Body>

      {/* Botón de cancelar */}
      {!showHistorial && !reserva.isCancelled && (
        <Card.Footer>
          <Button
            variant="outline-danger"
            size="sm"
            className="w-100"
            onClick={() => onCancelar(reserva)}
          >
            Cancelar Reserva
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
}
