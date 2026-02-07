import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function PagoErrorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transaccionId = searchParams.get('transaccion');

  return (
    <Container className="py-5">
      <Card className="text-center mx-auto" style={{ maxWidth: '500px' }}>
        <Card.Body className="py-5">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            ❌
          </div>
          <Card.Title as="h2" className="text-danger mb-3">
            Pago Rechazado
          </Card.Title>
          <Card.Text className="text-muted mb-4">
            Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.
            {transaccionId && (
              <><br />Transaccion: #{transaccionId}</>
            )}
          </Card.Text>
          <div className="d-flex gap-2 justify-content-center">
            <Button variant="outline-secondary" onClick={() => navigate(-1)}>
              Volver
            </Button>
            <Button variant="primary" onClick={() => navigate('/hospedajes')}>
              Ver Hospedajes
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
