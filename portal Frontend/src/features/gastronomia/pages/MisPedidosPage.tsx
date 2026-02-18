import { useState, useEffect } from 'react';
import { Container, Card, Badge, Alert, Row, Col, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { fetchPedidosByUser, Pedido, EstadoPedido } from '../../../services/fetchPedidos';
import { authService } from '../../../services/authService';
import { useNotifications } from '../../../shared/context/NotificationContext';

const ESTADOS_FLUJO = [
  EstadoPedido.RECIBIDO,
  EstadoPedido.EN_PREPARACION,
  EstadoPedido.LISTO,
  EstadoPedido.EN_DELIVERY,
  EstadoPedido.ENTREGADO,
];

const ESTADOS_SIN_DELIVERY = [
  EstadoPedido.RECIBIDO,
  EstadoPedido.EN_PREPARACION,
  EstadoPedido.LISTO,
  EstadoPedido.ENTREGADO,
];

const estadoLabel: Record<string, string> = {
  [EstadoPedido.RECIBIDO]: 'Recibido',
  [EstadoPedido.EN_PREPARACION]: 'En preparacion',
  [EstadoPedido.LISTO]: 'Listo',
  [EstadoPedido.EN_DELIVERY]: 'En camino',
  [EstadoPedido.ENTREGADO]: 'Entregado',
};

const estadoBadge: Record<string, string> = {
  [EstadoPedido.RECIBIDO]: 'warning',
  [EstadoPedido.EN_PREPARACION]: 'info',
  [EstadoPedido.LISTO]: 'success',
  [EstadoPedido.EN_DELIVERY]: 'primary',
  [EstadoPedido.ENTREGADO]: 'secondary',
};

function getProgreso(pedido: Pedido): number {
  const flujo = pedido.isDelivery ? ESTADOS_FLUJO : ESTADOS_SIN_DELIVERY;
  const idx = flujo.indexOf(pedido.status);
  if (idx === -1) return 0;
  return Math.round(((idx + 1) / flujo.length) * 100);
}

function getProgresoVariant(pedido: Pedido): string {
  if (pedido.status === EstadoPedido.ENTREGADO) return 'success';
  if (pedido.status === EstadoPedido.EN_DELIVERY) return 'primary';
  if (pedido.status === EstadoPedido.LISTO) return 'info';
  return 'warning';
}

export default function MisPedidosPage() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const { notifications } = useNotifications();

  const user = authService.getUser();

  // Re-fetch when a pedido:estado notification arrives
  const lastEstadoNotif = notifications.find((n) => n.type === 'pedido:estado');

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }

    const cargar = async () => {
      const data = await fetchPedidosByUser(String(user.id));
      data.sort((a, b) => {
        const aActivo = a.status !== EstadoPedido.ENTREGADO ? 1 : 0;
        const bActivo = b.status !== EstadoPedido.ENTREGADO ? 1 : 0;
        if (aActivo !== bActivo) return bActivo - aActivo;
        return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
      });
      setPedidos(data);
      setLoading(false);
    };

    cargar();
    const interval = setInterval(cargar, 15000);
    return () => clearInterval(interval);
  }, [lastEstadoNotif?.id]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">Cargando tus pedidos...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Mis Pedidos</h2>

      {pedidos.length === 0 ? (
        <Alert variant="info">
          No tenes pedidos todavia. Podes hacer uno desde la seccion de gastronomia.
        </Alert>
      ) : (
        <Row>
          {pedidos.map(pedido => {
            const flujo = pedido.isDelivery ? ESTADOS_FLUJO : ESTADOS_SIN_DELIVERY;
            const idxActual = flujo.indexOf(pedido.status);

            return (
              <Col xs={12} md={6} key={pedido.id} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">
                      Pedido #{pedido.id.slice(0, 8)}
                    </span>
                    <div>
                      {pedido.isDelivery && <Badge bg="dark" className="me-1">Delivery</Badge>}
                      <Badge bg={estadoBadge[pedido.status] ?? 'dark'}>
                        {estadoLabel[pedido.status] ?? pedido.status}
                      </Badge>
                    </div>
                  </Card.Header>

                  <Card.Body>
                    {/* Barra de progreso */}
                    <div className="mb-3">
                      <ProgressBar
                        now={getProgreso(pedido)}
                        variant={getProgresoVariant(pedido)}
                        animated={pedido.status !== EstadoPedido.ENTREGADO}
                        style={{ height: '8px' }}
                      />
                      <div className="d-flex justify-content-between mt-1">
                        {flujo.map((estado, idx) => (
                          <small
                            key={estado}
                            className={idx <= idxActual ? 'fw-bold' : 'text-muted'}
                            style={{ fontSize: '0.65rem' }}
                          >
                            {estadoLabel[estado]}
                          </small>
                        ))}
                      </div>
                    </div>

                    {/* Restaurante */}
                    {(pedido.restaurantName || pedido.restaurant?.restaurantName) && (
                      <div className="mb-2">
                        <strong>{pedido.restaurantName || pedido.restaurant?.restaurantName}</strong>
                      </div>
                    )}

                    {/* Fecha */}
                    <div className="mb-2">
                      <small className="text-muted">
                        {new Date(pedido.dateCreated).toLocaleString('es-AR')}
                      </small>
                    </div>

                    {/* Items */}
                    <ul className="list-unstyled small mb-2">
                      {pedido.items.map((item, idx) => (
                        <li key={idx}>
                          <Badge bg="light" text="dark" className="me-1">
                            {item.itemQuantity ?? item.quantity}x
                          </Badge>
                          {item.itemName ?? item.productName}
                        </li>
                      ))}
                    </ul>

                    {/* Direccion delivery */}
                    {pedido.isDelivery && pedido.deliveryAddress && (
                      <div className="mb-2 p-2 bg-light rounded">
                        <small><strong>Direccion de entrega:</strong> {pedido.deliveryAddress}</small>
                      </div>
                    )}

                    {/* Total y pago */}
                    <div className="border-top pt-2 mt-2 d-flex justify-content-between align-items-center">
                      <strong>Total: ${(pedido.totalPrice ?? pedido.totalAmount ?? 0).toFixed(2)}</strong>
                      <div>
                        {pedido.paidWithMercadoPago && <Badge bg="success">Mercado Pago</Badge>}
                        {pedido.paidWithCash && <Badge bg="outline-secondary" text="dark" className="border">Efectivo</Badge>}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
}
