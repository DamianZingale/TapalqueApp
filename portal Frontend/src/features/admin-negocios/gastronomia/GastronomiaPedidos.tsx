import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
} from 'react-bootstrap';
import {
  fetchRestaurantById,
  type Restaurant,
} from '../../../services/fetchGastronomia';
import {
  fetchPedidosByRestaurant,
  updateEstadoPedido,
} from '../../../services/fetchPedidos';
import { useWebSocket } from '../hooks/useWebSocket';
import {
  getEstadoPedidoBadge,
  getSiguienteEstadoPedido,
  getTextoBotonSiguienteEstado,
  type Pedido,
} from '../types';

interface GastronomiaPedidosProps {
  businessId: string;
  businessName: string;
  delivery?: boolean;
  deliveryPrice?: number;
}

interface Mensaje {
  tipo: 'success' | 'danger';
  texto: string;
}

export function GastronomiaPedidos({
  businessId,
  delivery = false,
}: GastronomiaPedidosProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const [precioDeliveryEdit, setPrecioDeliveryEdit] = useState<number>(0);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const userChanged = useRef(false);

  const { isConnected } = useWebSocket(businessId, 'GASTRONOMIA');

  // Funciones memoizadas
  const cargarPedidos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchPedidosByRestaurant(businessId);
      setPedidos(data);
    } catch {
      setMensaje({ tipo: 'danger', texto: 'Error al cargar pedidos' });
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  const cargarRestaurant = useCallback(async () => {
    try {
      const data = await fetchRestaurantById(businessId);
      if (data) {
        setRestaurant(data);
        setPrecioDeliveryEdit(data.deliveryPrice ?? 0);
      }
    } catch {
      setMensaje({ tipo: 'danger', texto: 'Error al cargar restaurant' });
    }
  }, [businessId]);

  // Ejecutar al cambiar businessId
  useEffect(() => {
    cargarPedidos();
    cargarRestaurant();
  }, [cargarPedidos, cargarRestaurant]);

  // Debounce para actualizar el precio de delivery solo cuando el usuario modifica
  useEffect(() => {
    if (!userChanged.current || !restaurant) return;

    const handler = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/gastronomia/restaurants/${businessId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deliveryPrice: precioDeliveryEdit }),
          }
        );

        if (!response.ok) throw new Error(`Error ${response.status}`);
        const updated = await response.json();
        setRestaurant(updated);
        userChanged.current = false;
        setMensaje({
          tipo: 'success',
          texto: 'Precio de delivery actualizado',
        });
      } catch {
        setMensaje({
          tipo: 'danger',
          texto: 'No se pudo actualizar el precio de delivery',
        });
      }
    }, 800);

    return () => clearTimeout(handler);
  }, [precioDeliveryEdit, restaurant, businessId]);

  const handleCambiarEstado = async (pedido: Pedido) => {
    const siguiente = getSiguienteEstadoPedido(pedido.status, pedido.isDelivery);
    if (!siguiente) return;

    await updateEstadoPedido(pedido.id, siguiente);

    setPedidos((prev) =>
      prev.map((p) => (p.id === pedido.id ? { ...p, status: siguiente } : p))
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <small>{isConnected ? 'Conectado' : 'Desconectado'}</small>
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

      {delivery && (
        <Card className="mb-3 border-warning">
          <Card.Body>
            <Row className="align-items-end">
              <Col md={4}>
                <Form.Label>Precio Delivery</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={precioDeliveryEdit}
                  onChange={(e) => {
                    userChanged.current = true;
                    setPrecioDeliveryEdit(Number(e.target.value));
                  }}
                />
              </Col>
              <Col md="auto">
                <Badge bg="warning" text="dark">
                  Delivery Activo
                </Badge>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      <Row xs={1} md={2} lg={3} className="g-3">
        {pedidos.map((pedido) => (
          <Col key={pedido.id}>
            <PedidoCard
              pedido={pedido}
              onCambiarEstado={handleCambiarEstado}
              deliveryPrice={precioDeliveryEdit}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
}

interface PedidoCardProps {
  pedido: Pedido;
  onCambiarEstado: (pedido: Pedido) => void;
  deliveryPrice: number;
}

function PedidoCard({
  pedido,
  onCambiarEstado,
  deliveryPrice,
}: PedidoCardProps) {
  const estadoBadge = getEstadoPedidoBadge(pedido.status);

  const baseTotal = pedido.totalPrice || pedido.totalAmount || 0;
  const total = pedido.isDelivery ? baseTotal + deliveryPrice : baseTotal;

  const siguienteEstado = getSiguienteEstadoPedido(
    pedido.status,
    pedido.isDelivery
  );

  const textoBoton = getTextoBotonSiguienteEstado(
    pedido.status,
    pedido.isDelivery
  );

  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between">
        <small>#{pedido.id.slice(-6)}</small>
        <Badge bg={estadoBadge.color}>{estadoBadge.texto}</Badge>
      </Card.Header>

      <Card.Body>
        <div className="mb-2">
          {pedido.isDelivery ? (
            <Badge bg="warning" text="dark">
              Delivery (+${deliveryPrice})
            </Badge>
          ) : (
            <Badge bg="info">Retiro en local</Badge>
          )}
        </div>

        <div className="d-flex justify-content-between border-top pt-2 mt-2">
          <strong>Total:</strong>
          <span className="text-success">${total.toLocaleString()}</span>
        </div>
      </Card.Body>

      {siguienteEstado && (
        <Card.Footer>
          <Button className="w-100" onClick={() => onCambiarEstado(pedido)}>
            {textoBoton}
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
}
