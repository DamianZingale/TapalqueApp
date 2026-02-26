import { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { authService } from '../../../services/authService';
import { obtenerUrlOAuthMercadoPago } from '../../../services/fetchMercadoPago';
import { fetchRestaurantByIdAuth, actualizarWhatsappRestaurante } from '../../../services/fetchGastronomia';

interface Props {
  businessId: string;
  businessName: string;
}

export function GastronomiaConfiguracion({ businessId, businessName }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // WhatsApp
  const [whatsappNotificacion, setWhatsappNotificacion] = useState('');
  const [whatsappActivo, setWhatsappActivo] = useState(false);
  const [loadingWhatsapp, setLoadingWhatsapp] = useState(false);
  const [successWhatsapp, setSuccessWhatsapp] = useState(false);

  useEffect(() => {
    fetchRestaurantByIdAuth(businessId).then((r) => {
      if (r?.whatsappNotificacion) {
        setWhatsappNotificacion(r.whatsappNotificacion);
      }
      if (r?.whatsappActivo !== undefined) {
        setWhatsappActivo(r.whatsappActivo ?? false);
      }
    });
  }, [businessId]);

  const handleGuardarWhatsapp = async () => {
    setLoadingWhatsapp(true);
    setSuccessWhatsapp(false);
    try {
      const ok = await actualizarWhatsappRestaurante(businessId, whatsappNotificacion, whatsappActivo);
      if (ok) {
        setSuccessWhatsapp(true);
        setTimeout(() => setSuccessWhatsapp(false), 3000);
      } else {
        setError('No se pudo guardar la configuración de WhatsApp');
      }
    } catch {
      setError('Error al guardar la configuración de WhatsApp');
    } finally {
      setLoadingWhatsapp(false);
    }
  };

  const handleConectarMercadoPago = async () => {
    const user = authService.getUser();
    if (!user?.email) {
      setError('No se pudo obtener el email del usuario');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = await obtenerUrlOAuthMercadoPago(user.email, businessId, 'GASTRONOMICO');

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
            Conecta tu cuenta de Mercado Pago para recibir pagos de pedidos directamente en tu cuenta.
          </Card.Text>
          <Card.Text className="text-muted small">
            Al conectar tu cuenta, los clientes podrán pagar sus pedidos online con Mercado Pago,
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

      {/* WhatsApp */}
      <Card className="mb-4">
        <Card.Header>Notificaciones por WhatsApp</Card.Header>
        <Card.Body>
          <Card.Text>
            Cuando un cliente realice un pedido, se enviará un mensaje de WhatsApp resumido a este número.
            Solo se envía cuando está activado.
          </Card.Text>
          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="whatsapp-activo-gastronomia"
              label="Activar notificaciones por WhatsApp"
              checked={whatsappActivo}
              onChange={(e) => setWhatsappActivo(e.target.checked)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Número de WhatsApp</Form.Label>
            <Form.Control
              type="tel"
              placeholder="+54 9 2983 000000"
              value={whatsappNotificacion}
              onChange={(e) => setWhatsappNotificacion(e.target.value)}
              style={{ maxWidth: 280 }}
            />
            <Form.Text className="text-muted">
              Ingresá el número con código de país, ej: +54 9 2983 123456
            </Form.Text>
          </Form.Group>
          <Button
            variant="primary"
            onClick={handleGuardarWhatsapp}
            disabled={loadingWhatsapp}
          >
            {loadingWhatsapp ? <Spinner animation="border" size="sm" /> : 'Guardar'}
          </Button>
          {successWhatsapp && (
            <p className="text-success small mt-2 mb-0">Configuración guardada correctamente.</p>
          )}
        </Card.Body>
      </Card>

      {/* Info adicional */}
      <Card>
        <Card.Header>Información del negocio</Card.Header>
        <Card.Body>
          <p><strong>ID del negocio:</strong> {businessId}</p>
          <p className="text-muted small mb-0">
            Este ID se utiliza para identificar tu restaurante en el sistema de pagos.
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}
