import { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { authService } from '../../../services/authService';
import { obtenerUrlOAuthMercadoPago } from '../../../services/fetchMercadoPago';
import { fetchHospedajeById, actualizarConfiguracionFacturacion } from '../../../services/fetchHospedajes';
import { fetchPoliticaGlobal, actualizarPoliticaGlobal } from '../../../services/fetchReservas';
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

  // Facturación
  const [permiteFacturacion, setPermiteFacturacion] = useState(false);
  const [tipoIva, setTipoIva] = useState<'INCLUIDO' | 'ADICIONAL' | 'NO_APLICA'>('NO_APLICA');
  const [loadingFacturacion, setLoadingFacturacion] = useState(false);
  const [successFacturacion, setSuccessFacturacion] = useState(false);

  // Estadía mínima
  const [estadiaMinima, setEstadiaMinima] = useState(1);
  const [loadingEstadia, setLoadingEstadia] = useState(false);
  const [successEstadia, setSuccessEstadia] = useState(false);

  // Email de notificación
  const [emailNotificacion, setEmailNotificacion] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [successEmail, setSuccessEmail] = useState(false);


  useEffect(() => {
    fetchHospedajeById(businessId).then((h) => {
      if (h?.fechaLimiteReservas) {
        setFechaLimiteActual(h.fechaLimiteReservas);
        setFechaLimite(h.fechaLimiteReservas);
      }
      if (h?.permiteFacturacion !== undefined) {
        setPermiteFacturacion(h.permiteFacturacion);
      }
      if (h?.tipoIva) {
        setTipoIva(h.tipoIva);
      }
      if (h?.emailNotificacion) {
        setEmailNotificacion(h.emailNotificacion);
      }

    });

    fetchPoliticaGlobal(businessId).then((p) => {
      if (p?.estadiaMinima) {
        setEstadiaMinima(p.estadiaMinima);
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

  const handleGuardarFacturacion = async () => {
    setLoadingFacturacion(true);
    setSuccessFacturacion(false);
    try {
      const success = await actualizarConfiguracionFacturacion(businessId, permiteFacturacion, tipoIva);
      if (success) {
        setSuccessFacturacion(true);
        setTimeout(() => setSuccessFacturacion(false), 3000);
      } else {
        setError('No se pudo guardar la configuración de facturación');
      }
    } catch {
      setError('Error al guardar la configuración de facturación');
    } finally {
      setLoadingFacturacion(false);
    }
  };

  const handleGuardarEstadia = async () => {
    setLoadingEstadia(true);
    setSuccessEstadia(false);
    try {
      const authUser = authService.getUser();
      const result = await actualizarPoliticaGlobal(businessId, {
        estadiaMinima: estadiaMinima,
        actualizadoPor: authUser?.email || 'admin'
      });
      if (result) {
        setSuccessEstadia(true);
        setTimeout(() => setSuccessEstadia(false), 3000);
      } else {
        setError('No se pudo guardar la estadía mínima');
      }
    } catch {
      setError('Error al guardar la estadía mínima');
    } finally {
      setLoadingEstadia(false);
    }
  };

  const handleGuardarEmail = async () => {
    setLoadingEmail(true);
    setSuccessEmail(false);
    try {
      await api.patch(`/hospedajes/${businessId}`, { emailNotificacion: emailNotificacion || null });
      setSuccessEmail(true);
      setTimeout(() => setSuccessEmail(false), 3000);
    } catch {
      setError('No se pudo guardar el email de notificación');
    } finally {
      setLoadingEmail(false);
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

      {/* Configuración de Facturación */}
      <Card className="mb-4">
        <Card.Header>Configuración de Facturación</Card.Header>
        <Card.Body>
          <Card.Text>
            Configurá si permitís que los huéspedes soliciten factura y cómo se maneja el IVA.
          </Card.Text>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Permite emitir facturas a los huéspedes"
              checked={permiteFacturacion}
              onChange={(e) => setPermiteFacturacion(e.target.checked)}
            />
          </Form.Group>

          {permiteFacturacion && (
            <Form.Group className="mb-3">
              <Form.Label>Tipo de IVA</Form.Label>
              <Form.Select
                value={tipoIva}
                onChange={(e) => setTipoIva(e.target.value as 'INCLUIDO' | 'ADICIONAL' | 'NO_APLICA')}
              >
                <option value="NO_APLICA">No aplica IVA</option>
                <option value="INCLUIDO">IVA incluido en el precio (se muestra desglose)</option>
                <option value="ADICIONAL">IVA adicional (+21% sobre el total)</option>
              </Form.Select>
              {tipoIva === 'INCLUIDO' && (
                <Form.Text className="text-muted">
                  El precio mostrado ya incluye IVA. Se mostrará el desglose al solicitar factura.
                </Form.Text>
              )}
              {tipoIva === 'ADICIONAL' && (
                <Form.Text className="text-muted">
                  Se agregará un 21% adicional al precio cuando se solicite factura.
                </Form.Text>
              )}
            </Form.Group>
          )}

          <Button
            variant="primary"
            onClick={handleGuardarFacturacion}
            disabled={loadingFacturacion}
          >
            {loadingFacturacion ? <Spinner animation="border" size="sm" /> : 'Guardar configuración'}
          </Button>

          {successFacturacion && (
            <p className="text-success small mt-2 mb-0">Configuración guardada correctamente.</p>
          )}
        </Card.Body>
      </Card>

      {/* Email de notificación */}
      <Card className="mb-4">
        <Card.Header>Email de notificaciones</Card.Header>
        <Card.Body>
          <Card.Text>
            Cuando un huésped complete una reserva online, se enviará un email con los datos a esta dirección.
          </Card.Text>
          <Form.Group className="mb-3">
            <Form.Label>Email del administrador</Form.Label>
            <Form.Control
              type="email"
              placeholder="admin@ejemplo.com"
              value={emailNotificacion}
              onChange={(e) => setEmailNotificacion(e.target.value)}
              style={{ maxWidth: 320 }}
            />
          </Form.Group>
          <Button
            variant="primary"
            onClick={handleGuardarEmail}
            disabled={loadingEmail}
          >
            {loadingEmail ? <Spinner animation="border" size="sm" /> : 'Guardar'}
          </Button>
          {successEmail && (
            <p className="text-success small mt-2 mb-0">Email guardado correctamente.</p>
          )}
        </Card.Body>
      </Card>

      {/* Estadía Mínima */}
      <Card className="mb-4">
        <Card.Header>Estadía Mínima</Card.Header>
        <Card.Body>
          <Card.Text>
            Definí la cantidad mínima de noches requeridas para realizar una reserva.
          </Card.Text>

          <Form.Group className="mb-3">
            <Form.Label>Noches mínimas requeridas</Form.Label>
            <Form.Control
              type="number"
              min={1}
              max={30}
              value={estadiaMinima}
              onChange={(e) => setEstadiaMinima(parseInt(e.target.value) || 1)}
              style={{ maxWidth: 150 }}
            />
            <Form.Text className="text-muted">
              Las reservas deberán ser de al menos {estadiaMinima} noche{estadiaMinima > 1 ? 's' : ''}.
            </Form.Text>
          </Form.Group>

          <Button
            variant="primary"
            onClick={handleGuardarEstadia}
            disabled={loadingEstadia}
          >
            {loadingEstadia ? <Spinner animation="border" size="sm" /> : 'Guardar'}
          </Button>

          {successEstadia && (
            <p className="text-success small mt-2 mb-0">Estadía mínima guardada correctamente.</p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
