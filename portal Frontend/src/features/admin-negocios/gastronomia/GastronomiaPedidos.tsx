import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useCallback, useEffect, useState } from 'react';
import { printPedido, printCocina } from '../../gastronomia/utils/printPedido';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import { api } from '../../../config/api';
import {
  fetchRestaurantById,
  type Restaurant,
} from '../../../services/fetchGastronomia';
import {
  EstadoPedido,
  fetchPedidosByRestaurant,
  fetchPedidosByRestaurantAndDateRange,
  updateEstadoPedido,
} from '../../../services/fetchPedidos';
import { useNotifications } from '../../../shared/context/NotificationContext';
import { useWebSocket } from '../hooks/useWebSocket';
import {
  getEstadoPedidoBadge,
  getSiguienteEstadoPedido,
  getTextoBotonSiguienteEstado,
  type Pedido,
} from '../types';

interface GastronomiaPedidosProps {
  externalBusinessId: string;
  businessName: string;
  delivery?: boolean;
  deliveryPrice?: number;
}

interface Mensaje {
  tipo: 'success' | 'danger';
  texto: string;
}

interface ResumenCierre {
  pedidos: Pedido[];
  totalPedidos: number;
  pedidosDelivery: number;
  pedidosRetiro: number;
  totalFacturado: number;
  totalEfectivo: number;
  totalMercadoPago: number;
  desde: string;
  hasta: string;
}

// ============================================================
// Componente principal
// ============================================================
export function GastronomiaPedidos({
  externalBusinessId,
  businessName,
  delivery = false,
}: GastronomiaPedidosProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const [precioDeliveryInput, setPrecioDeliveryInput] = useState<string>('0');
  const [precioDelivery, setPrecioDelivery] = useState<number>(0);
  const [updatingPrice, setUpdatingPrice] = useState(false);
  const [tiempoEsperaInput, setTiempoEsperaInput] = useState<string>('0');
  const [updatingWaitTime, setUpdatingWaitTime] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  // Cierre del día
  const [showCierreModal, setShowCierreModal] = useState(false);
  const [resumenCierre, setResumenCierre] = useState<ResumenCierre | null>(
    null
  );
  const [loadingCierre, setLoadingCierre] = useState(false);

  const { isConnected, lastMessage } = useWebSocket(
    externalBusinessId,
    'GASTRONOMIA'
  );
  const { registerAdminTopic } = useNotifications();

  // Manejar mensajes WebSocket (actualización de panel local)
  // La notificación global (campana) la gestiona registerAdminTopic en el contexto,
  // lo que garantiza que se reciba aunque el admin esté en otra sección.
  useEffect(() => {
    if (!lastMessage) return;
    const pedido = lastMessage.payload as Pedido;

    if (lastMessage.type === 'pedido:nuevo') {
      setPedidos((prev) => {
        const existe = prev.some((p) => p.id === pedido.id);
        if (existe) return prev.map((p) => (p.id === pedido.id ? pedido : p));
        return [pedido, ...prev];
      });
      try {
        new Audio('/notification.mp3').play().catch(() => {});
      } catch {
        /* ignore */
      }
    } else if (lastMessage.type === 'pedido:actualizado') {
      setPedidos((prev) => prev.map((p) => (p.id === pedido.id ? pedido : p)));
    }
  }, [lastMessage]);

  const cargarPedidos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchPedidosByRestaurant(externalBusinessId);
      setPedidos(data);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar pedidos. Verifica tu conexión e intenta nuevamente.' });
    } finally {
      setLoading(false);
    }
  }, [externalBusinessId]);

  const cargarRestaurant = useCallback(async () => {
    try {
      const data = await fetchRestaurantById(externalBusinessId);
      if (data) {
        setRestaurant(data);
        const precio = data.deliveryPrice ?? 0;
        setPrecioDelivery(precio);
        setPrecioDeliveryInput(String(precio));
        setTiempoEsperaInput(String(data.estimatedWaitTime ?? 0));
      }
    } catch {
      setMensaje({ tipo: 'danger', texto: 'Error al cargar restaurant' });
    }
  }, [externalBusinessId]);

  useEffect(() => {
    cargarPedidos();
    cargarRestaurant();
    // Registra el tópico en el contexto global para mantener la conexión
    // activa aunque el admin navegue a otra sección
    registerAdminTopic(externalBusinessId, 'GASTRONOMIA');
  }, [cargarPedidos, cargarRestaurant, externalBusinessId, registerAdminTopic]);

  // --- Handlers ---

  const handleActualizarPrecioDelivery = async () => {
    const parsed = parseFloat(precioDeliveryInput);
    if (isNaN(parsed) || parsed < 0) {
      setMensaje({
        tipo: 'danger',
        texto: 'Ingrese un precio válido (número mayor o igual a 0)',
      });
      return;
    }

    setUpdatingPrice(true);
    try {
      const updated = await api.patch<Restaurant>(
        `/gastronomia/restaurants/${externalBusinessId}`,
        { deliveryPrice: parsed }
      );
      setRestaurant(updated);
      setPrecioDelivery(updated.deliveryPrice ?? parsed);
      setPrecioDeliveryInput(String(updated.deliveryPrice ?? parsed));
      setMensaje({ tipo: 'success', texto: 'Precio de delivery actualizado' });
    } catch {
      setMensaje({
        tipo: 'danger',
        texto: 'No se pudo actualizar el precio de delivery',
      });
    } finally {
      setUpdatingPrice(false);
    }
  };

  const handleActualizarTiempoEspera = async () => {
    const parsed = parseInt(tiempoEsperaInput, 10);
    if (isNaN(parsed) || parsed < 0) {
      setMensaje({
        tipo: 'danger',
        texto: 'Ingrese un tiempo válido (número entero mayor o igual a 0)',
      });
      return;
    }

    setUpdatingWaitTime(true);
    try {
      const updated = await api.patch<Restaurant>(
        `/gastronomia/restaurants/${externalBusinessId}`,
        { estimatedWaitTime: parsed }
      );
      setRestaurant(updated);
      setTiempoEsperaInput(String(updated.estimatedWaitTime ?? parsed));
      setMensaje({ tipo: 'success', texto: 'Tiempo de espera actualizado' });
    } catch {
      setMensaje({
        tipo: 'danger',
        texto: 'No se pudo actualizar el tiempo de espera',
      });
    } finally {
      setUpdatingWaitTime(false);
    }
  };

  const handleCambiarEstado = async (pedido: Pedido) => {
    const siguiente = getSiguienteEstadoPedido(
      pedido.status,
      pedido.isDelivery
    );
    if (!siguiente) return;

    await updateEstadoPedido(pedido.id, siguiente);

    setPedidos((prev) =>
      prev.map((p) => (p.id === pedido.id ? { ...p, status: siguiente } : p))
    );
  };

  const handleCerrarDia = async () => {
    setLoadingCierre(true);
    try {
      const desdeRaw =
        restaurant?.lastCloseDate ||
        new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
      const hastaRaw = new Date().toISOString();

      // Backend espera LocalDate yyyy-MM-dd
      const desde = desdeRaw.slice(0, 10);
      const hasta = hastaRaw.slice(0, 10);

      const data = await fetchPedidosByRestaurantAndDateRange(
        externalBusinessId,
        desde,
        hasta
      );
      const entregados = data.filter(
        (p) => p.status === EstadoPedido.ENTREGADO
      );

      const resumen: ResumenCierre = {
        pedidos: entregados,
        totalPedidos: entregados.length,
        pedidosDelivery: entregados.filter((p) => p.isDelivery).length,
        pedidosRetiro: entregados.filter((p) => !p.isDelivery).length,
        totalFacturado: entregados.reduce(
          (sum, p) => sum + (p.totalPrice || p.totalAmount || 0),
          0
        ),
        totalEfectivo: entregados
          .filter((p) => p.paidWithCash)
          .reduce((sum, p) => sum + (p.totalPrice || p.totalAmount || 0), 0),
        totalMercadoPago: entregados
          .filter((p) => p.paidWithMercadoPago)
          .reduce((sum, p) => sum + (p.totalPrice || p.totalAmount || 0), 0),
        desde,
        hasta,
      };

      setResumenCierre(resumen);
      setShowCierreModal(true);
    } catch {
      setMensaje({
        tipo: 'danger',
        texto: 'Error al generar el cierre del día',
      });
    } finally {
      setLoadingCierre(false);
    }
  };

  const handleConfirmarCierre = async () => {
    try {
      const now = new Date().toISOString();
      const updated = await api.patch<Restaurant>(
        `/gastronomia/restaurants/${externalBusinessId}`,
        { lastCloseDate: now }
      );
      setRestaurant(updated);
      setShowCierreModal(false);
      setResumenCierre(null);
      setMensaje({ tipo: 'success', texto: 'Cierre de día registrado' });
    } catch {
      setMensaje({
        tipo: 'danger',
        texto: 'Error al registrar el cierre. Descargue el PDF primero.',
      });
    }
  };

  const handleDescargarPDF = () => {
    if (!resumenCierre) return;

    const doc = new jsPDF();
    const desde = new Date(resumenCierre.desde);
    const hasta = new Date(resumenCierre.hasta);
    const formatDate = (d: Date) =>
      d.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });

    doc.setFontSize(18);
    doc.text(`Cierre del día - ${businessName}`, 14, 20);
    doc.setFontSize(11);
    doc.text(`Desde: ${formatDate(desde)}`, 14, 30);
    doc.text(`Hasta: ${formatDate(hasta)}`, 14, 37);

    doc.setFontSize(14);
    doc.text('Resumen', 14, 50);
    doc.setFontSize(11);
    doc.text(`Total de pedidos: ${resumenCierre.totalPedidos}`, 14, 58);
    doc.text(
      `Delivery: ${resumenCierre.pedidosDelivery}  |  Retiro en local: ${resumenCierre.pedidosRetiro}`,
      14,
      65
    );
    doc.text(
      `Total facturado: $${resumenCierre.totalFacturado.toLocaleString('es-AR')}`,
      14,
      72
    );
    doc.text(
      `Efectivo: $${resumenCierre.totalEfectivo.toLocaleString('es-AR')}  |  Mercado Pago: $${resumenCierre.totalMercadoPago.toLocaleString('es-AR')}`,
      14,
      79
    );

    if (resumenCierre.pedidos.length > 0) {
      const tableData = resumenCierre.pedidos.map((p) => [
        `#${p.id.slice(-6)}`,
        p.userName || '-',
        p.isDelivery ? 'Delivery' : 'Retiro',
        p.paidWithCash
          ? 'Efectivo'
          : p.paidWithMercadoPago
            ? 'MercadoPago'
            : '-',
        (p.items || [])
          .map(
            (i) =>
              `${i.itemName || i.productName || '?'} x${i.itemQuantity || i.quantity}`
          )
          .join(', '),
        `$${(p.totalPrice || p.totalAmount || 0).toLocaleString('es-AR')}`,
      ]);

      autoTable(doc, {
        startY: 88,
        head: [['Pedido', 'Cliente', 'Tipo', 'Pago', 'Items', 'Total']],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [52, 58, 64] },
        columnStyles: { 4: { cellWidth: 50 } },
      });
    }

    const fileName = `cierre_${businessName.replace(/\s+/g, '_')}_${hasta.toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  };

  // Filtrado: excluir pedidos finalizados/cancelados y MP sin confirmación
  const pedidosActivos = pedidos.filter((p) => {
    if (p.status === EstadoPedido.ENTREGADO || (p.status as string) === 'FAILED') return false;

    // MercadoPago sin confirmación de pago: ocultar hasta que el webhook llegue
    if (p.paidWithMercadoPago && !(p.transaccionId || p.mercadoPagoId || p.fechaPago)) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
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

      {delivery && (
        <Card className="mb-3 border-warning">
          <Card.Body>
            <Row className="align-items-center g-2">
              <Col md={3}>
                <Form.Label>Precio Delivery</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="decimal"
                  value={precioDeliveryInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrecioDeliveryInput(e.target.value)}
                />
              </Col>
              <Col md="auto">
                <Button
                  variant="warning"
                  onClick={handleActualizarPrecioDelivery}
                  disabled={updatingPrice}
                >
                  {updatingPrice ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    'Actualizar precio'
                  )}
                </Button>
              </Col>
              <Col md={3}>
                <Form.Label>Tiempo espera (min)</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="numeric"
                  value={tiempoEsperaInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTiempoEsperaInput(e.target.value)}
                />
              </Col>
              <Col md="auto">
                <Button
                  variant="warning"
                  onClick={handleActualizarTiempoEspera}
                  disabled={updatingWaitTime}
                >
                  {updatingWaitTime ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    'Actualizar tiempo'
                  )}
                </Button>
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

      {pedidosActivos.length === 0 ? (
        <p className="text-muted text-center py-4">No hay pedidos activos</p>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-3">
          {pedidosActivos.map((pedido) => (
            <Col key={pedido.id}>
              <PedidoCard
                pedido={pedido}
                onCambiarEstado={handleCambiarEstado}
                deliveryPrice={precioDelivery}
                esHeladeria={restaurant?.esHeladeria}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Botón Cerrar el día */}
      <div className="text-center mt-4 mb-3">
        <Button
          variant="outline-dark"
          size="lg"
          onClick={handleCerrarDia}
          disabled={loadingCierre}
        >
          {loadingCierre ? (
            <Spinner animation="border" size="sm" />
          ) : (
            'Cerrar el día'
          )}
        </Button>
      </div>

      {/* Modal de cierre */}
      <Modal
        show={showCierreModal}
        onHide={() => setShowCierreModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Cierre del día - {businessName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {resumenCierre && (
            <>
              <Alert variant="info">
                Descargue el PDF antes de confirmar el cierre. Este resumen no
                se almacena.
              </Alert>

              <Row className="mb-3">
                <Col sm={4}>
                  <Card className="text-center">
                    <Card.Body>
                      <h4>{resumenCierre.totalPedidos}</h4>
                      <small className="text-muted">Pedidos entregados</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm={4}>
                  <Card className="text-center">
                    <Card.Body>
                      <h4>
                        ${resumenCierre.totalFacturado.toLocaleString('es-AR')}
                      </h4>
                      <small className="text-muted">Total facturado</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm={4}>
                  <Card className="text-center">
                    <Card.Body>
                      <div>
                        <strong>{resumenCierre.pedidosDelivery}</strong>{' '}
                        delivery
                      </div>
                      <div>
                        <strong>{resumenCierre.pedidosRetiro}</strong> retiro
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col sm={6}>
                  <small className="text-muted">
                    Efectivo:{' '}
                    <strong>
                      ${resumenCierre.totalEfectivo.toLocaleString('es-AR')}
                    </strong>
                  </small>
                </Col>
                <Col sm={6}>
                  <small className="text-muted">
                    Mercado Pago:{' '}
                    <strong>
                      ${resumenCierre.totalMercadoPago.toLocaleString('es-AR')}
                    </strong>
                  </small>
                </Col>
              </Row>

              {resumenCierre.pedidos.length > 0 && (
                <Table size="sm" striped responsive>
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Cliente</th>
                      <th>Tipo</th>
                      <th>Items</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumenCierre.pedidos.map((p) => (
                      <tr key={p.id}>
                        <td>#{p.id.slice(-6)}</td>
                        <td>{p.userName || '-'}</td>
                        <td>{p.isDelivery ? 'Delivery' : 'Retiro'}</td>
                        <td>
                          {(p.items || []).map((i, idx) => (
                            <div key={idx}>
                              {i.itemName || i.productName || '?'} x
                              {i.itemQuantity || i.quantity}
                            </div>
                          ))}
                        </td>
                        <td>
                          $
                          {(p.totalPrice || p.totalAmount || 0).toLocaleString(
                            'es-AR'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleDescargarPDF}>
            Descargar PDF
          </Button>
          <Button variant="success" onClick={handleConfirmarCierre}>
            Confirmar cierre
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// ============================================================
// PedidoCard — con detalle de items y modal
// ============================================================
interface PedidoCardProps {
  pedido: Pedido;
  onCambiarEstado: (pedido: Pedido) => void;
  deliveryPrice: number;
  esHeladeria?: boolean;
}

function PedidoCard({
  pedido,
  onCambiarEstado,
  deliveryPrice,
  esHeladeria = false,
}: PedidoCardProps) {
  const [showModal, setShowModal] = useState(false);

  const estadoBadge = getEstadoPedidoBadge(pedido.status);
  const baseTotal = pedido.totalPrice || pedido.totalAmount || 0;
  const total = baseTotal;

  const siguienteEstado = getSiguienteEstadoPedido(
    pedido.status,
    pedido.isDelivery
  );
  const textoBoton = getTextoBotonSiguienteEstado(
    pedido.status,
    pedido.isDelivery
  );

  const fechaPedido = pedido.dateCreated
    ? new Date(pedido.dateCreated).toLocaleString('es-AR', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : null;

  return (
    <>
      <Card
        className="h-100"
        style={{ cursor: 'pointer' }}
        onClick={() => setShowModal(true)}
      >
        <Card.Header className="d-flex justify-content-between">
          <small>#{pedido.id.slice(-6)}</small>
          <Badge bg={estadoBadge.color}>{estadoBadge.texto}</Badge>
        </Card.Header>

        <Card.Body>
          {/* Cliente */}
          {pedido.userName && (
            <div className="mb-2">
              <strong>{pedido.userName}</strong>
              {pedido.userPhone && (
                <small className="text-muted ms-2">{pedido.userPhone}</small>
              )}
            </div>
          )}

          {/* Tipo de entrega */}
          <div className="mb-2">
            {pedido.isDelivery ? (
              <>
                <Badge bg="warning" text="dark">
                  Delivery (+${deliveryPrice})
                </Badge>
                {pedido.deliveryAddress && (
                  <small className="d-block text-muted mt-1">
                    {pedido.deliveryAddress}
                  </small>
                )}
              </>
            ) : (
              <Badge bg="info">Retiro en local</Badge>
            )}
          </div>

          {/* Método de pago */}
          <div className="mb-2">
            {pedido.paidWithCash && (
              <Badge bg="success" className="me-1">
                Efectivo
              </Badge>
            )}
            {pedido.paidWithMercadoPago && (
              <Badge bg="primary">MercadoPago</Badge>
            )}
          </div>

          {/* Items resumidos */}
          {pedido.items && pedido.items.length > 0 && (
            <div className="border-top pt-2 mt-2">
              {pedido.items.map((item, idx) => {
                const nombre = item.itemName || item.productName || 'Item';
                const cantidad = item.itemQuantity || item.quantity;
                const precio = item.itemPrice || item.unitPrice || 0;
                return (
                  <div key={idx} className="mb-1">
                    <div className="d-flex justify-content-between small">
                      <span>{nombre} x{cantidad}</span>
                      <span className="text-muted">
                        ${(precio * cantidad).toLocaleString('es-AR')}
                      </span>
                    </div>
                    {item.notas && (
                      <div style={{ fontSize: '0.75rem', color: '#555', paddingLeft: '8px' }}>
                        ↳ {item.notas}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Total */}
          <div className="d-flex justify-content-between border-top pt-2 mt-2">
            <strong>Total:</strong>
            <span className="text-success fw-bold">
              ${total.toLocaleString('es-AR')}
            </span>
          </div>
        </Card.Body>

        <Card.Footer className="d-flex flex-column gap-2" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          {siguienteEstado && (
            <Button
              className="w-100"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onCambiarEstado(pedido);
              }}
            >
              {textoBoton}
            </Button>
          )}
          <div className="d-flex gap-1">
            <Button
              variant="outline-secondary"
              size="sm"
              className="flex-fill"
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); printPedido(pedido); }}
            >
              <i className="bi bi-printer me-1"></i>
              Cocina
            </Button>
            <Button
              variant="outline-dark"
              size="sm"
              className="flex-fill"
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); printCocina(pedido); }}
            >
              <i className="bi bi-receipt me-1"></i>
              Caja
            </Button>
          </div>
        </Card.Footer>
      </Card>

      {/* Modal de detalle */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Pedido #{pedido.id.slice(-6)}{' '}
            <Badge bg={estadoBadge.color} className="ms-2">
              {estadoBadge.texto}
            </Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Datos del cliente */}
          <h6 className="text-muted mb-2">Cliente</h6>
          <p className="mb-1">
            <strong>{pedido.userName || 'Sin nombre'}</strong>
          </p>
          {pedido.userPhone && (
            <p className="mb-1 small">
              Teléfono:{' '}
              <a href={`tel:${pedido.userPhone}`}>{pedido.userPhone}</a>
              <a
                href={`https://wa.me/${pedido.userPhone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-success ms-2 py-0 px-2"
                title="Contactar por WhatsApp"
              >
                <i className="bi bi-whatsapp" /> WhatsApp
              </a>
            </p>
          )}
          {fechaPedido && (
            <p className="mb-3 small text-muted">Fecha: {fechaPedido}</p>
          )}

          {/* Tipo de entrega */}
          <h6 className="text-muted mb-2">Entrega</h6>
          {pedido.isDelivery ? (
            <>
              <Badge bg="warning" text="dark" className="mb-1">
                Delivery (+${deliveryPrice})
              </Badge>
              {pedido.deliveryAddress && (
                <p className="small mb-3">{pedido.deliveryAddress}</p>
              )}
            </>
          ) : (
            <p className="mb-3">
              <Badge bg="info">Retiro en local</Badge>
            </p>
          )}

          {/* Método de pago */}
          <h6 className="text-muted mb-2">Pago</h6>
          <div className="mb-3">
            {pedido.paidWithCash && (
              <Badge bg="success" className="me-1">
                Efectivo
              </Badge>
            )}
            {pedido.paidWithMercadoPago && (
              <Badge bg="primary">MercadoPago</Badge>
            )}
          </div>

          {/* Items detallados */}
          {pedido.items && pedido.items.length > 0 && (
            <>
              <h6 className="text-muted mb-2">Items</h6>
              <Table size="sm" bordered>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th className="text-center">Cant.</th>
                    <th className="text-end">Precio</th>
                    <th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.items.map((item, idx) => {
                    const nombre = item.itemName || item.productName || 'Item';
                    const cantidad = item.itemQuantity || item.quantity || 1;
                    const precio = item.itemPrice || item.unitPrice || 0;
                    return (
                      <>
                        <tr key={idx}>
                          <td>{nombre}</td>
                          <td className="text-center">{cantidad}</td>
                          <td className="text-end">
                            ${precio.toLocaleString('es-AR')}
                          </td>
                          <td className="text-end">
                            ${(precio * cantidad).toLocaleString('es-AR')}
                          </td>
                        </tr>
                        {item.notas && (
                          <tr key={`${idx}-notas`}>
                            <td
                              colSpan={4}
                              style={{ fontSize: '0.8rem', color: '#555', paddingTop: 0, paddingLeft: '16px', borderTop: 'none' }}
                            >
                              ↳ <em>{item.notas}</em>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </Table>
            </>
          )}

          {/* Total */}
          <div className="d-flex justify-content-between fw-bold border-top pt-2">
            <span>Total</span>
            <span className="text-success">
              ${total.toLocaleString('es-AR')}
            </span>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
          {siguienteEstado && (
            <Button
              variant="primary"
              onClick={() => {
                onCambiarEstado(pedido);
                setShowModal(false);
              }}
            >
              {textoBoton}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}
