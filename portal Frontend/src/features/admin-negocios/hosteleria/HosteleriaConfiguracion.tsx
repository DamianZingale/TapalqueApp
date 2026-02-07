import { useState } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import { authService } from '../../../services/authService';
import { obtenerUrlOAuthMercadoPago } from '../../../services/fetchMercadoPago';

interface Props {
  businessId: string;
  businessName: string;
}

export function HosteleriaConfiguracion({ businessId, businessName }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConectarMercadoPago = async () => {
    const user = authService.getUser();
    if (!user?.email) {
      setError('No se pudo obtener el email del usuario');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = await obtenerUrlOAuthMercadoPago(user.email);

      if (url) {
        // Redirigir a Mercado Pago para autorizar
        window.location.href = url;
      } else {
        setError('No se pudo obtener la URL de autorización de Mercado Pago');
      }
    } catch (err) {
      console.error('Error al conectar Mercado Pago:', err);
      setError('Error al conectar con Mercado Pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="mb-4">Configuración de {businessName}</h4>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Mercado Pago */}
      <Card className="mb-4">
        <Card.Header>
          <img
            src="https://img.icons8.com/?size=256&id=nTLVtpxsNPaz&format=png"
            alt="Mercado Pago"
            style={{ height: '24px', marginRight: '8px' }}
          />
          Mercado Pago
        </Card.Header>
        <Card.Body>
          <Card.Text>
            Conectá tu cuenta de Mercado Pago para recibir pagos de reservas directamente en tu cuenta.
          </Card.Text>
          <Card.Text className="text-muted small">
            Al conectar tu cuenta, los clientes podrán pagar la seña (50%) de sus reservas con Mercado Pago,
            y el dinero se depositará automáticamente en tu cuenta.
          </Card.Text>

          <Button
            variant="primary"
            onClick={handleConectarMercadoPago}
            disabled={loading}
            style={{ backgroundColor: '#009EE3', borderColor: '#009EE3' }}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Conectando...
              </>
            ) : (
              <>
                <img
                  src="https://img.icons8.com/?size=256&id=nTLVtpxsNPaz&format=png"
                  alt=""
                  style={{ height: '20px', marginRight: '8px' }}
                />
                Conectar cuenta de Mercado Pago
              </>
            )}
          </Button>
        </Card.Body>
      </Card>

      {/* Info adicional */}
      <Card>
        <Card.Header>Información del negocio</Card.Header>
        <Card.Body>
          <p><strong>ID del negocio:</strong> {businessId}</p>
          <p className="text-muted small mb-0">
            Este ID se utiliza para identificar tu negocio en el sistema de pagos.
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}
