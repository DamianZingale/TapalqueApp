import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function PagoErrorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transaccionId = searchParams.get('transaccion');
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('collection_status') || searchParams.get('status');
  const pedidoId = searchParams.get('pedido');

  const esGastronomico = !!pedidoId;

  return (
    <Container className="py-5">
      <meta name="robots" content="noindex, nofollow" />
      <Card className="text-center mx-auto" style={{ maxWidth: '500px' }}>
        <Card.Body className="py-5">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            &#10060;
          </div>
          <Card.Title as="h2" className="text-danger mb-3">
            Pago Rechazado
          </Card.Title>
          <Card.Text className="text-muted mb-4">
            Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.
            {transaccionId && (
              <>
                <br />
                <span className="small">Transaccion: #{transaccionId}</span>
              </>
            )}
            {paymentId && (
              <>
                <br />
                <span className="small">Pago MP: #{paymentId}</span>
              </>
            )}
            {status && (
              <>
                <br />
                <span className="small">Estado: {status}</span>
              </>
            )}
          </Card.Text>
          <div className="d-flex gap-2 justify-content-center">
            <Button variant="outline-secondary" onClick={() => navigate(-1)}>
              Volver
            </Button>
            <Button variant="primary" onClick={() => navigate(esGastronomico ? '/mis-pedidos' : '/hospedaje')}>
              {esGastronomico ? 'Ver Mis Pedidos' : 'Ver Hospedajes'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
