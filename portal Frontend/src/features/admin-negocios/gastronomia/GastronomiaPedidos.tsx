import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
  Tab,
  Tabs,
} from 'react-bootstrap';
import {
  fetchPedidosByRestaurant,
  updateEstadoPedido,
} from '../../../services/fetchPedidos';
import { useWebSocket } from '../hooks/useWebSocket';
import {
  EstadoPedido,
  getEstadoPedidoBadge,
  getSiguienteEstadoPedido,
  getTextoBotonSiguienteEstado,
  type Pedido,
} from '../types';

interface GastronomiaPedidosProps {
  businessId: string;
  businessName: string;
  allowDelivery: boolean;
  deliveryPrice: number;
}

export function GastronomiaPedidos({ businessId }: GastronomiaPedidosProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | 'TODOS'>(
    'TODOS'
  );
  const [ordenPor, setOrdenPor] = useState<'reciente' | 'antiguo' | 'monto'>(
    'reciente'
  );
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'danger';
    texto: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'activos' | 'historial'>(
    'activos'
  );

  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

  const { isConnected, lastMessage } = useWebSocket(businessId, 'GASTRONOMIA');

  useEffect(() => {
    cargarPedidos();
  }, [businessId]);

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'pedido:nuevo') {
        const nuevoPedido = lastMessage.payload as Pedido;
        setPedidos((prev) => [nuevoPedido, ...prev]);
        playNotificationSound();
        setMensaje({ tipo: 'success', texto: '¡Nuevo pedido recibido!' });
      } else if (lastMessage.type === 'pedido:actualizado') {
        const pedidoActualizado = lastMessage.payload as Pedido;
        setPedidos((prev) =>
          prev.map((p) =>
            p.id === pedidoActualizado.id ? pedidoActualizado : p
          )
        );
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
      console.log('No se pudo reproducir sonido:', e);
    }
  };

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const data = await fetchPedidosByRestaurant(businessId);
      setPedidos(data);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar los pedidos' });
    } finally {
      setLoading(false);
    }
  };

  const pedidosFiltrados = pedidos
    .filter((p) => {
      if (filtroEstado !== 'TODOS' && p.status !== filtroEstado) return false;

      if (activeTab === 'historial') {
        const fechaPedido = new Date(p.dateCreated);
        if (fechaDesde) {
          const desde = new Date(fechaDesde);
          if (fechaPedido < desde) return false;
        }
        if (fechaHasta) {
          const hasta = new Date(fechaHasta);
          hasta.setHours(23, 59, 59);
          if (fechaPedido > hasta) return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (ordenPor) {
        case 'reciente':
          return (
            new Date(b.dateCreated).getTime() -
            new Date(a.dateCreated).getTime()
          );
        case 'antiguo':
          return (
            new Date(a.dateCreated).getTime() -
            new Date(b.dateCreated).getTime()
          );
        case 'monto':
          return (
            (b.totalPrice || b.totalAmount || 0) -
            (a.totalPrice || a.totalAmount || 0)
          );
        default:
          return 0;
      }
    });

  const pedidosActivos = pedidosFiltrados.filter(
    (p) => p.status !== EstadoPedido.ENTREGADO
  );

  const handleCambiarEstado = async (pedido: Pedido) => {
    const siguienteEstado = getSiguienteEstadoPedido(
      pedido.status,
      pedido.isDelivery
    );
    if (!siguienteEstado) return;

    try {
      const result = await updateEstadoPedido(pedido.id, siguienteEstado);

      if (result) {
        setPedidos(
          pedidos.map((p) =>
            p.id === pedido.id ? { ...p, status: siguienteEstado } : p
          )
        );
        setMensaje({
          tipo: 'success',
          texto: `Pedido marcado como ${getEstadoPedidoBadge(siguienteEstado).texto}`,
        });
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cambiar el estado' });
    }
  };

  const calcularTotales = () => {
    const filtrados = pedidosFiltrados;
    return {
      cantidad: filtrados.length,
      total: filtrados.reduce(
        (sum, p) => sum + (p.totalPrice || p.totalAmount || 0),
        0
      ),
      efectivo: filtrados
        .filter((p) => p.paidWithCash)
        .reduce((sum, p) => sum + (p.totalPrice || p.totalAmount || 0), 0),
      mercadoPago: filtrados
        .filter((p) => p.paidWithMercadoPago)
        .reduce((sum, p) => sum + (p.totalPrice || p.totalAmount || 0), 0),
    };
  };

  const totales = calcularTotales();

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <span
            className={`rounded-circle ${isConnected ? 'bg-success' : 'bg-danger'}`}
            style={{ width: '12px', height: '12px', display: 'inline-block' }}
          />
          <small className="text-muted">
            {isConnected
              ? 'Conectado - Actualizaciones en tiempo real'
              : 'Desconectado - Reconectando...'}
          </small>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={cargarPedidos}>
          Actualizar
        </Button>
      </div>

      {mensaje && (
        <Alert
          variant={mensaje.tipo}
          dismissible
          onClose={() => setMensaje(null)}
        >
          {mensaje.texto}
        </Alert>
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k as 'activos' | 'historial')}
        className="mb-3"
      >
        <Tab eventKey="activos" title={`Activos (${pedidosActivos.length})`}>
          <Row className="mb-3 g-2">
            <Col md={4}>
              <Form.Select
                value={filtroEstado}
                onChange={(e) =>
                  setFiltroEstado(e.target.value as typeof filtroEstado)
                }
              >
                <option value="TODOS">Todos los estados</option>
                <option value="RECIBIDO">Recibido</option>
                <option value="EN_PREPARACION">En Preparación</option>
                <option value="LISTO">Listo</option>
                <option value="EN_DELIVERY">En Delivery</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select
                value={ordenPor}
                onChange={(e) => setOrdenPor(e.target.value as typeof ordenPor)}
              >
                <option value="reciente">Más reciente</option>
                <option value="antiguo">Más antiguo</option>
                <option value="monto">Mayor monto</option>
              </Form.Select>
            </Col>
          </Row>

          <Row xs={1} md={2} lg={3} className="g-3">
            {pedidosActivos.map((pedido) => (
              <Col key={pedido.id}>
                <PedidoCard
                  pedido={pedido}
                  onCambiarEstado={handleCambiarEstado}
                />
              </Col>
            ))}
          </Row>

          {pedidosActivos.length === 0 && (
            <div className="text-center py-5">
              <div style={{ fontSize: '4rem' }}>📭</div>
              <h4>No hay pedidos activos</h4>
              <p className="text-muted">
                Los nuevos pedidos aparecerán aquí automáticamente
              </p>
            </div>
          )}
        </Tab>

        <Tab eventKey="historial" title="Historial">
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
                    onChange={(e) =>
                      setFiltroEstado(e.target.value as typeof filtroEstado)
                    }
                  >
                    <option value="TODOS">Todos los estados</option>
                    <option value="ENTREGADO">Entregados</option>
                    <option value="EN_DELIVERY">En Delivery</option>
                    <option value="LISTO">Listos</option>
                    <option value="EN_PREPARACION">En Preparación</option>
                    <option value="RECIBIDO">Recibidos</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setFechaDesde('');
                      setFechaHasta('');
                      setFiltroEstado('TODOS');
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row className="mb-3 g-3">
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3>{totales.cantidad}</h3>
                  <small className="text-muted">Pedidos</small>
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
              <Card className="text-center">
                <Card.Body>
                  <h3>${totales.efectivo.toLocaleString()}</h3>
                  <small className="text-muted">Efectivo</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3>${totales.mercadoPago.toLocaleString()}</h3>
                  <small className="text-muted">MercadoPago</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row xs={1} md={2} lg={3} className="g-3">
            {pedidosFiltrados.map((pedido) => (
              <Col key={pedido.id}>
                <PedidoCard
                  pedido={pedido}
                  onCambiarEstado={handleCambiarEstado}
                  showHistorial
                />
              </Col>
            ))}
          </Row>

          {pedidosFiltrados.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted">
                No hay pedidos en el período seleccionado
              </p>
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
}

interface PedidoCardProps {
  pedido: Pedido;
  onCambiarEstado: (pedido: Pedido) => void;
  showHistorial?: boolean;
}

function PedidoCard({
  pedido,
  onCambiarEstado,
  showHistorial,
}: PedidoCardProps) {
  const estadoBadge = getEstadoPedidoBadge(pedido.status);
  const siguienteEstado = getSiguienteEstadoPedido(
    pedido.status,
    pedido.isDelivery
  );
  const textoBoton = getTextoBotonSiguienteEstado(
    pedido.status,
    pedido.isDelivery
  );
  const total = pedido.totalPrice || pedido.totalAmount || 0;

  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <small className="text-muted">
          #{pedido.id.slice(-6).toUpperCase()}
        </small>
        <Badge
          bg={estadoBadge.color as 'secondary' | 'info' | 'success' | 'dark'}
        >
          {estadoBadge.texto}
        </Badge>
      </Card.Header>
      <Card.Body>
        <small className="text-muted d-block mb-2">
          {new Date(pedido.dateCreated).toLocaleString('es-AR')}
        </small>

        <div className="mb-2">
          {pedido.isDelivery ? (
            <Badge bg="warning" text="dark">
              Delivery
            </Badge>
          ) : (
            <Badge bg="info">Retiro en local</Badge>
          )}
        </div>

        <div className="mb-2">
          <strong>Items:</strong>
          <ul className="mb-0 ps-3" style={{ fontSize: '0.9rem' }}>
            {pedido.items.slice(0, 3).map((item, idx) => (
              <li key={idx}>
                {item.quantity}x {item.itemName || item.productName}
              </li>
            ))}
            {pedido.items.length > 3 && (
              <li className="text-muted">...y {pedido.items.length - 3} más</li>
            )}
          </ul>
        </div>

        {(pedido.userName || pedido.userPhone) && (
          <div className="mb-2" style={{ fontSize: '0.9rem' }}>
            <strong>Cliente:</strong>
            {pedido.userName && <div>{pedido.userName}</div>}
            {pedido.userPhone && <div>{pedido.userPhone}</div>}
          </div>
        )}

        {pedido.isDelivery && pedido.deliveryAddress && (
          <div className="mb-2" style={{ fontSize: '0.9rem' }}>
            <strong>Dirección:</strong>
            <div>{pedido.deliveryAddress}</div>
          </div>
        )}

        <div className="mb-2">
          {pedido.paidWithMercadoPago && (
            <Badge bg="primary" className="me-1">
              MercadoPago
            </Badge>
          )}
          {pedido.paidWithCash && <Badge bg="secondary">Efectivo</Badge>}
          {pedido.paymentReceiptPath && (
            <a
              href={pedido.paymentReceiptPath}
              target="_blank"
              rel="noopener noreferrer"
              className="ms-2"
            >
              Ver comprobante
            </a>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
          <strong>Total:</strong>
          <span className="h5 mb-0 text-success">
            ${total.toLocaleString()}
          </span>
        </div>
      </Card.Body>

      {!showHistorial && siguienteEstado && (
        <Card.Footer>
          <Button
            variant={
              estadoBadge.color === 'warning'
                ? 'info'
                : estadoBadge.color === 'info'
                  ? 'success'
                  : estadoBadge.color === 'success'
                    ? 'primary'
                    : 'dark'
            }
            className="w-100"
            onClick={() => onCambiarEstado(pedido)}
          >
            {textoBoton}
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
}
