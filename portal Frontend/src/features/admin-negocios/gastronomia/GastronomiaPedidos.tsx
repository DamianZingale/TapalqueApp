import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useCallback, useEffect, useState } from 'react';
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
  businessId: string;
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
  businessId,
  businessName,
  delivery = false,
}: GastronomiaPedidosProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const [precioDeliveryInput, setPrecioDeliveryInput] = useState<string>('0');
  const [precioDelivery, setPrecioDelivery] = useState<number>(0);
  const [updatingPrice, setUpdatingPrice] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  // Cierre del día
  const [showCierreModal, setShowCierreModal] = useState(false);
  const [resumenCierre, setResumenCierre] = useState<ResumenCierre | null>(null);
  const [loadingCierre, setLoadingCierre] = useState(false);

  const { isConnected, lastMessage } = useWebSocket(businessId, 'GASTRONOMIA');
  const { addNotification } = useNotifications();

  // Manejar mensajes WebSocket (nuevos pedidos / actualizaciones)
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'pedido:nuevo') {
        const nuevoPedido = lastMessage.payload as Pedido;
        setPedidos((prev) => [nuevoPedido, ...prev]);
        addNotification({
          type: 'pedido',
          title: 'Nuevo pedido',
          message: `${nuevoPedido.userName || 'Cliente'} - $${(nuevoPedido.totalPrice || nuevoPedido.totalAmount || 0).toLocaleString('es-AR')}`,
          businessId,
          businessName,
        });
        try {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => {});
        } catch { /* ignore */ }
      } else if (lastMessage.type === 'pedido:actualizado') {
        const pedidoActualizado = lastMessage.payload as Pedido;
        setPedidos((prev) =>
          prev.map((p) => (p.id === pedidoActualizado.id ? pedidoActualizado : p))
        );
      }
    }
  }, [lastMessage, addNotification, businessId, businessName]);

  const cargarPedidos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchPedidosByRestaurant(businessId);
      setPedidos(data);
    } catch {
      setMensaje({ tipo: 'danger', texto: 'Error al cargar pedidos' });
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  const cargarRestaurant = useCallback(async () => {
    try {
      const data = await fetchRestaurantById(businessId);
      if (data) {
        setRestaurant(data);
        const precio = data.deliveryPrice ?? 0;
        setPrecioDelivery(precio);
        setPrecioDeliveryInput(String(precio));
      }
    } catch {
      setMensaje({ tipo: 'danger', texto: 'Error al cargar restaurant' });
    }
  }, [businessId]);

  useEffect(() => {
    cargarPedidos();
    cargarRestaurant();
  }, [cargarPedidos, cargarRestaurant]);

  // --- Handlers ---

  const handleActualizarPrecioDelivery = async () => {
    const parsed = parseFloat(precioDeliveryInput);
    if (isNaN(parsed) || parsed < 0) {
      setMensaje({ tipo: 'danger', texto: 'Ingrese un precio válido (número mayor o igual a 0)' });
      return;
    }

    setUpdatingPrice(true);
    try {
      const updated = await api.patch<Restaurant>(
        `/gastronomia/restaurants/${businessId}`,
        { deliveryPrice: parsed }
      );
      setRestaurant(updated);
      setPrecioDelivery(updated.deliveryPrice ?? parsed);
      setPrecioDeliveryInput(String(updated.deliveryPrice ?? parsed));
      setMensaje({ tipo: 'success', texto: 'Precio de delivery actualizado' });
    } catch {
      setMensaje({ tipo: 'danger', texto: 'No se pudo actualizar el precio de delivery' });
    } finally {
      setUpdatingPrice(false);
    }
  };

  const handleCambiarEstado = async (pedido: Pedido) => {
    const siguiente = getSiguienteEstadoPedido(pedido.status, pedido.isDelivery);
    if (!siguiente) return;

    await updateEstadoPedido(pedido.id, siguiente);

    setPedidos((prev) =>
      prev.map((p) => (p.id === pedido.id ? { ...p, status: siguiente } : p))
    );
  };

  const handleCerrarDia = async () => {
    setLoadingCierre(true);
    try {
      const desde = restaurant?.lastCloseDate || new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
      const hasta = new Date().toISOString();

      const data = await fetchPedidosByRestaurantAndDateRange(businessId, desde, hasta);
      const entregados = data.filter((p) => p.status === EstadoPedido.ENTREGADO);

      const resumen: ResumenCierre = {
        pedidos: entregados,
        totalPedidos: entregados.length,
        pedidosDelivery: entregados.filter((p) => p.isDelivery).length,
        pedidosRetiro: entregados.filter((p) => !p.isDelivery).length,
        totalFacturado: entregados.reduce((sum, p) => sum + (p.totalPrice || p.totalAmount || 0), 0),
        totalEfectivo: entregados.filter((p) => p.paidWithCash).reduce((sum, p) => sum + (p.totalPrice || p.totalAmount || 0), 0),
        totalMercadoPago: entregados.filter((p) => p.paidWithMercadoPago).reduce((sum, p) => sum + (p.totalPrice || p.totalAmount || 0), 0),
        desde,
        hasta,
      };

      setResumenCierre(resumen);
      setShowCierreModal(true);
    } catch {
      setMensaje({ tipo: 'danger', texto: 'Error al generar el cierre del día' });
    } finally {
      setLoadingCierre(false);
    }
  };

  const handleConfirmarCierre = async () => {
    try {
      const now = new Date().toISOString();
      const updated = await api.patch<Restaurant>(
        `/gastronomia/restaurants/${businessId}`,
        { lastCloseDate: now }
      );
      setRestaurant(updated);
      setShowCierreModal(false);
      setResumenCierre(null);
      setMensaje({ tipo: 'success', texto: 'Cierre de día registrado' });
    } catch {
      setMensaje({ tipo: 'danger', texto: 'Error al registrar el cierre. Descargue el PDF primero.' });
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
        p.paidWithCash ? 'Efectivo' : p.paidWithMercadoPago ? 'MercadoPago' : '-',
        (p.items || [])
          .map((i) => `${i.itemName || i.productName || '?'} x${i.itemQuantity || i.quantity}`)
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

  // Filtrado: solo pedidos activos (no entregados) y con pago confirmado o en efectivo
  const pedidosActivos = pedidos.filter(
    (p) =>
      p.status !== EstadoPedido.ENTREGADO &&
      (p.paidWithCash || (p.paidWithMercadoPago && p.payment?.paymentId))
  );

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
        <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje(null)}>
          {mensaje.texto}
        </Alert>
      )}

      {delivery && (
        <Card className="mb-3 border-warning">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={4}>
                <Form.Label>Precio Delivery</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="decimal"
                  value={precioDeliveryInput}
                  onChange={(e) => setPrecioDeliveryInput(e.target.value)}
                />
              </Col>
              <Col md="auto">
                <Button
                  variant="warning"
                  onClick={handleActualizarPrecioDelivery}
                  disabled={updatingPrice}
                >
                  {updatingPrice ? <Spinner animation="border" size="sm" /> : 'Actualizar precio'}
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
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Botón Cerrar el día */}
      <div className="text-center mt-4 mb-3">
        <Button variant="outline-dark" size="lg" onClick={handleCerrarDia} disabled={loadingCierre}>
          {loadingCierre ? <Spinner animation="border" size="sm" /> : 'Cerrar el día'}
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
                Descargue el PDF antes de confirmar el cierre. Este resumen no se almacena.
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
                      <h4>${resumenCierre.totalFacturado.toLocaleString('es-AR')}</h4>
                      <small className="text-muted">Total facturado</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm={4}>
                  <Card className="text-center">
                    <Card.Body>
                      <div>
                        <strong>{resumenCierre.pedidosDelivery}</strong> delivery
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
                    Efectivo: <strong>${resumenCierre.totalEfectivo.toLocaleString('es-AR')}</strong>
                  </small>
                </Col>
                <Col sm={6}>
                  <small className="text-muted">
                    Mercado Pago:{' '}
                    <strong>${resumenCierre.totalMercadoPago.toLocaleString('es-AR')}</strong>
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
                              {i.itemName || i.productName || '?'} x{i.itemQuantity || i.quantity}
                            </div>
                          ))}
                        </td>
                        <td>${(p.totalPrice || p.totalAmount || 0).toLocaleString('es-AR')}</td>
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
// PedidoCard — con detalle de items
// ============================================================
interface PedidoCardProps {
  pedido: Pedido;
  onCambiarEstado: (pedido: Pedido) => void;
  deliveryPrice: number;
}

function PedidoCard({ pedido, onCambiarEstado, deliveryPrice }: PedidoCardProps) {
  const estadoBadge = getEstadoPedidoBadge(pedido.status);
  const baseTotal = pedido.totalPrice || pedido.totalAmount || 0;
  const total = pedido.isDelivery ? baseTotal + deliveryPrice : baseTotal;

  const siguienteEstado = getSiguienteEstadoPedido(pedido.status, pedido.isDelivery);
  const textoBoton = getTextoBotonSiguienteEstado(pedido.status, pedido.isDelivery);

  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between">
        <small>#{pedido.id.slice(-6)}</small>
        <Badge bg={estadoBadge.color}>{estadoBadge.texto}</Badge>
      </Card.Header>

      <Card.Body>
        {/* Cliente */}
        {pedido.userName && (
          <div className="mb-2">
            <strong>{pedido.userName}</strong>
            {pedido.userPhone && <small className="text-muted ms-2">{pedido.userPhone}</small>}
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
                <small className="d-block text-muted mt-1">{pedido.deliveryAddress}</small>
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
          {pedido.paidWithMercadoPago && <Badge bg="primary">MercadoPago</Badge>}
        </div>

        {/* Items */}
        {pedido.items && pedido.items.length > 0 && (
          <div className="border-top pt-2 mt-2">
            {pedido.items.map((item, idx) => {
              const nombre = item.itemName || item.productName || 'Item';
              const cantidad = item.itemQuantity || item.quantity;
              const precio = item.itemPrice || item.unitPrice || 0;
              return (
                <div key={idx} className="d-flex justify-content-between small">
                  <span>
                    {nombre} x{cantidad}
                  </span>
                  <span className="text-muted">
                    ${(precio * cantidad).toLocaleString('es-AR')}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Total */}
        <div className="d-flex justify-content-between border-top pt-2 mt-2">
          <strong>Total:</strong>
          <span className="text-success fw-bold">${total.toLocaleString('es-AR')}</span>
        </div>
      </Card.Body>

      {siguienteEstado && (
        <Card.Footer>
          <Button className="w-100" onClick={() => onCambiarEstado(pedido)}>
            {textoBoton}
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
}
