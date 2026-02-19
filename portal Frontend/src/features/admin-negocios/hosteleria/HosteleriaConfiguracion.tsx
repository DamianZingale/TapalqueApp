import { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import { authService } from '../../../services/authService';
import { obtenerUrlOAuthMercadoPago } from '../../../services/fetchMercadoPago';
import { fetchHospedajeById } from '../../../services/fetchHospedajes';
import { api } from '../../../config/api';

interface Props {
  businessId: string;
  businessName: string;
}

export function HosteleriaConfiguracion({ businessId, businessName }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fechaLimite, setFechaLimite] = useState<string>('');
  const [fechaLimiteActual, setFechaLimiteActual] = useState<string | null>(null);
  const [loadingFecha, setLoadingFecha] = useState(false);
  const [successFecha, setSuccessFecha] = useState(false);

  useEffect(() => {
    fetchHospedajeById(businessId).then((h) => {
      if (h?.fechaLimiteReservas) {
        setFechaLimiteActual(h.fechaLimiteReservas);
        setFechaLimite(h.fechaLimiteReservas);
      }
    });
  }, [businessId]);

  const handleGuardarFecha = async (valor?: string) => {
    const fecha = valor !== undefined ? valor : fechaLimite;
    setLoadingFecha(true);
    setSuccessFecha(false);
    try {
      await api.patch(`/hospedajes/${businessId}`, { fechaLimiteReservas: fecha || null });
      setFechaLimiteActual(fecha || null);
      setSuccessFecha(true);
      setTimeout(() => setSuccessFecha(false), 3000);
    } catch {
      setError('No se pudo guardar la fecha límite');
    } finally {
      setLoadingFecha(false);
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
      const url = await obtenerUrlOAuthMercadoPago(user.email, businessId, 'HOSPEDAJE');

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

      {/* Fecha límite de reservas */}
      <Card className="mb-4">
        <Card.Header>Fecha límite de reservas</Card.Header>
        <Card.Body>
          <Card.Text>
            Definí hasta qué fecha los huéspedes pueden realizar reservas. Si no configurás ninguna fecha, las reservas están habilitadas sin límite.
          </Card.Text>
          {fechaLimiteActual && (
            <p className="text-muted small">
              Fecha actual: <strong>{new Date(fechaLimiteActual + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            </p>
          )}
          {!fechaLimiteActual && (
            <p className="text-muted small">Sin límite configurado.</p>
          )}
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <input
              type="date"
              className="form-control"
              style={{ maxWidth: 200 }}
              value={fechaLimite}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFechaLimite(e.target.value)}
            />
            <Button
              variant="primary"
              onClick={() => handleGuardarFecha()}
              disabled={loadingFecha}
            >
              {loadingFecha ? <Spinner animation="border" size="sm" /> : 'Guardar'}
            </Button>
            {(fechaLimite || fechaLimiteActual) && (
              <Button
                variant="outline-secondary"
                onClick={() => { setFechaLimite(''); handleGuardarFecha(''); }}
                disabled={loadingFecha}
              >
                Quitar límite
              </Button>
            )}
          </div>
          {successFecha && (
            <p className="text-success small mt-2 mb-0">Fecha guardada correctamente.</p>
          )}
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
