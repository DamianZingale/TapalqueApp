import { useEffect, useState } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchReservaById, type Reserva } from '../../../services/fetchReservas';
import { fetchPedidoById, type Pedido } from '../../../services/fetchPedidos';

export function PagoPendientePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transaccionId = searchParams.get('transaccion');
  const reservaId = searchParams.get('reserva');
  const pedidoId = searchParams.get('pedido');

  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [pedido, setPedido] = useState<Pedido | null>(null);

  const esGastronomico = !!pedidoId;

  useEffect(() => {
    if (reservaId) {
      fetchReservaById(reservaId).then(setReserva);
    }
    if (pedidoId) {
      fetchPedidoById(pedidoId).then(setPedido);
    }
  }, [reservaId, pedidoId]);

  const formatFecha = (fecha: string) => {
    try {
      return new Date(fecha).toLocaleDateString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      });
    } catch { return fecha; }
  };

  return (
    <Container className="py-5">
      <Card className="text-center mx-auto" style={{ maxWidth: '550px' }}>
        <Card.Body className="py-5">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            &#9203;
          </div>
          <Card.Title as="h2" className="text-warning mb-3">
            Pago Pendiente
          </Card.Title>
          <Card.Text className="text-muted mb-3">
            Tu pago esta siendo procesado. Te notificaremos cuando se confirme.
          </Card.Text>

          {reserva && (
            <Card className="text-start mb-4 border-warning">
              <Card.Body>
                <h6 className="fw-bold mb-2">{reserva.hotel?.hotelName}</h6>
                <p className="mb-1 small">
                  <strong>Check-in:</strong> {formatFecha(reserva.stayPeriod?.checkInDate)}
                </p>
                <p className="mb-1 small">
                  <strong>Check-out:</strong> {formatFecha(reserva.stayPeriod?.checkOutDate)}
                </p>
                {reserva.payment && (
                  <p className="mb-0 small">
                    <strong>Monto:</strong> ${reserva.payment.totalAmount?.toLocaleString()}
                  </p>
                )}
              </Card.Body>
            </Card>
          )}

          {pedido && (
            <Card className="text-start mb-4 border-warning">
              <Card.Body>
                <h6 className="fw-bold mb-2">
                  Pedido #{pedido.id.slice(0, 8)} - {pedido.restaurantName || pedido.restaurant?.restaurantName}
                </h6>
                <ul className="list-unstyled small mb-2">
                  {pedido.items.map((item, idx) => (
                    <li key={idx}>
                      {item.itemQuantity ?? item.quantity}x {item.itemName ?? item.productName}
                    </li>
                  ))}
                </ul>
                <hr className="my-2" />
                <p className="mb-0 small">
                  <strong>Total:</strong> ${(pedido.totalPrice ?? pedido.totalAmount ?? 0).toLocaleString()}
                </p>
              </Card.Body>
            </Card>
          )}

          {!reserva && !pedido && transaccionId && (
            <Card.Text className="text-muted small mb-3">
              Transaccion: #{transaccionId}
            </Card.Text>
          )}

          <Card.Text className="text-muted small mb-4">
            Esto puede tomar unos minutos dependiendo del metodo de pago.
          </Card.Text>
          <Button variant="primary" onClick={() => navigate(esGastronomico ? '/mis-pedidos' : '/dashboard')}>
            {esGastronomico ? 'Ver Mis Pedidos' : 'Ir a Mis Reservas'}
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}
