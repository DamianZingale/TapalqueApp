import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function PagoPendientePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transaccionId = searchParams.get('transaccion');

  return (
    <Container className="py-5">
      <Card className="text-center mx-auto" style={{ maxWidth: '500px' }}>
        <Card.Body className="py-5">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            ⏳
          </div>
          <Card.Title as="h2" className="text-warning mb-3">
            Pago Pendiente
          </Card.Title>
          <Card.Text className="text-muted mb-4">
            Tu pago esta siendo procesado. Te notificaremos cuando se confirme.
            {transaccionId && (
              <><br />Transaccion: #{transaccionId}</>
            )}
          </Card.Text>
          <Card.Text className="text-muted small mb-4">
            Esto puede tomar unos minutos dependiendo del metodo de pago.
          </Card.Text>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Ir a Mis Reservas
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}
