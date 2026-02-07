import { useEffect } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function PagoExitoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transaccionId = searchParams.get('transaccion');

  useEffect(() => {
    // Redirigir al dashboard después de 5 segundos
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Container className="py-5">
      <Card className="text-center mx-auto" style={{ maxWidth: '500px' }}>
        <Card.Body className="py-5">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            ✅
          </div>
          <Card.Title as="h2" className="text-success mb-3">
            Pago Exitoso
          </Card.Title>
          <Card.Text className="text-muted mb-4">
            Tu pago ha sido procesado correctamente.
            {transaccionId && (
              <><br />Transaccion: #{transaccionId}</>
            )}
          </Card.Text>
          <Card.Text className="text-muted small mb-4">
            Seras redirigido automaticamente en unos segundos...
          </Card.Text>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Ir a Mis Reservas
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}
