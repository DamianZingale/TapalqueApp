// src/components/admin/gastronomia/GastronomiaPedidos.tsx
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
}

interface Mensaje {
  tipo: 'success' | 'danger';
  texto: string;
}

export function GastronomiaPedidos({ businessId }: GastronomiaPedidosProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [precioDeliveryEdit, setPrecioDeliveryEdit] = useState<number>(0);

  const { isConnected } = useWebSocket(businessId, 'GASTRONOMIA');

  // Cargo el restaurante
  useEffect(() => {
    const cargarRestaurant = async () => {
      try {
        const data = await fetchRestaurantById(businessId);
        if (data) {
          setRestaurant(data);
          setPrecioDeliveryEdit(data.deliveryPrice ?? 0);
        }
      } catch {
        setMensaje({ tipo: 'danger', texto: 'Error al cargar restaurante' });
      }
    };

    cargarRestaurant();
  }, [businessId]);

  // Cargo los pedidos
  useEffect(() => {
    cargarPedidos();
  }, [businessId]);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const data = await fetchPedidosByRestaurant(businessId);
      setPedidos(data);
    } catch {
      setMensaje({ tipo: 'danger', texto: 'Error al cargar pedidos' });
    } finally {
      setLoading(false);
    }
  };

  // Actualiza el estado de un pedido
  const handleCambiarEstado = async (pedido: Pedido) => {
    const siguiente = getSiguienteEstadoPedido(pedido.status, pedido.delivery);
    if (!siguiente) return;

    await updateEstadoPedido(pedido.id, siguiente);

    setPedidos((prev) =>
      prev.map((p) => (p.id === pedido.id ? { ...p, status: siguiente } : p))
    );
  };

  // Debounce: actualizar backend solo después de 500ms de inactividad
  useEffect(() => {
    if (!restaurant) return;
    const handler = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/gastronomia/restaurants/${restaurant.idRestaurant}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deliveryPrice: precioDeliveryEdit }),
          }
        );

        if (!response.ok) throw new Error(`Error ${response.status}`);
        const updated = await response.json();
        setRestaurant(updated);
      } catch {
        setMensaje({
          tipo: 'danger',
          texto: 'No se pudo actualizar el precio de delivery',
        });
      }
    }, 500);

    return () => clearTimeout(handler); // limpio el timeout si el valor cambia antes de 500ms
  }, [precioDeliveryEdit, restaurant]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!restaurant) {
    return <Alert variant="danger">No se encontró el restaurante</Alert>;
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

      {restaurant.delivery && (
        <Card className="mb-3 border-warning">
          <Card.Body>
            <Row className="align-items-end">
              <Col md={4}>
                <Form.Label>Precio Delivery</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={precioDeliveryEdit}
                  onChange={(e) =>
                    setPrecioDeliveryEdit(Number(e.target.value))
                  }
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
  const total = pedido.delivery ? baseTotal + deliveryPrice : baseTotal;

  const siguienteEstado = getSiguienteEstadoPedido(
    pedido.status,
    pedido.delivery
  );
  const textoBoton = getTextoBotonSiguienteEstado(
    pedido.status,
    pedido.delivery
  );

  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between">
        <small>#{pedido.id.slice(-6)}</small>
        <Badge bg={estadoBadge.color}>{estadoBadge.texto}</Badge>
      </Card.Header>

      <Card.Body>
        <div className="mb-2">
          {pedido.delivery ? (
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
