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
  crearPedido,
  type CrearPedidoDTO,
} from '../../../services/fetchPedidos';
import { fetchMenuByRestaurant } from '../../../services/fetchMenu';
import type { Imenu } from '../../gastronomia/types/Imenu';
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

interface NuevoPedidoItem {
  menuItem: Imenu;
  quantity: number;
  notas: string;
}

interface NuevoPedidoForm {
  userName: string;
  userPhone: string;
  isDelivery: boolean;
  deliveryAddress: string;
  paidWithCash: boolean;
  items: NuevoPedidoItem[];
}

const EMPTY_FORM: NuevoPedidoForm = {
  userName: '',
  userPhone: '',
  isDelivery: false,
  deliveryAddress: '',
  paidWithCash: true,
  items: [],
};

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
  const [tiempoEntrega, setTiempoEntrega] = useState<number>(0);
  const [updatingWaitTime, setUpdatingWaitTime] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  // Crear pedido manual
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [menuItems, setMenuItems] = useState<Imenu[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [creandoPedido, setCreandoPedido] = useState(false);
  const [nuevoPedido, setNuevoPedido] = useState<NuevoPedidoForm>(EMPTY_FORM);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<number | ''>('');

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
        const espera = data.estimatedWaitTime ?? 0;
        setTiempoEntrega(espera);
        setTiempoEsperaInput(String(espera));
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
      const nuevoTiempo = updated.estimatedWaitTime ?? parsed;
      setTiempoEntrega(nuevoTiempo);
      setTiempoEsperaInput(String(nuevoTiempo));
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

  const handleAbrirCrearModal = async () => {
    setNuevoPedido(EMPTY_FORM);
    setSelectedMenuItemId('');
    setShowCrearModal(true);
    setLoadingMenu(true);
    try {
      const items = await fetchMenuByRestaurant(externalBusinessId);
      setMenuItems(items.filter((i) => i.available !== false));
    } catch {
      setMenuItems([]);
    } finally {
      setLoadingMenu(false);
    }
  };

  const handleAgregarItem = () => {
    if (selectedMenuItemId === '') return;
    const menuItem = menuItems.find((i) => i.id === selectedMenuItemId);
    if (!menuItem) return;
    const exists = nuevoPedido.items.find((i) => i.menuItem.id === selectedMenuItemId);
    if (exists) {
      setNuevoPedido((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.menuItem.id === selectedMenuItemId ? { ...i, quantity: i.quantity + 1 } : i
        ),
      }));
    } else {
      setNuevoPedido((prev) => ({
        ...prev,
        items: [...prev.items, { menuItem, quantity: 1, notas: '' }],
      }));
    }
    setSelectedMenuItemId('');
  };

  const handleQuitarItem = (menuItemId: number) => {
    setNuevoPedido((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.menuItem.id !== menuItemId),
    }));
  };

  const handleCambiarCantidad = (menuItemId: number, quantity: number) => {
    if (quantity < 1) return;
    setNuevoPedido((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.menuItem.id === menuItemId ? { ...i, quantity } : i
      ),
    }));
  };

  const handleCambiarNotas = (menuItemId: number, notas: string) => {
    setNuevoPedido((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.menuItem.id === menuItemId ? { ...i, notas } : i
      ),
    }));
  };

  const handleCrearPedidoManual = async () => {
    if (nuevoPedido.items.length === 0) {
      setMensaje({ tipo: 'danger', texto: 'Agregá al menos un producto al pedido.' });
      return;
    }
    if (nuevoPedido.isDelivery && !nuevoPedido.deliveryAddress.trim()) {
      setMensaje({ tipo: 'danger', texto: 'Ingresá la dirección de entrega.' });
      return;
    }

    setCreandoPedido(true);
    try {
      const totalItems = nuevoPedido.items.reduce(
        (sum, i) => sum + i.menuItem.price * i.quantity,
        0
      );
      const totalConDelivery = totalItems + (nuevoPedido.isDelivery ? precioDelivery : 0);

      const dto: CrearPedidoDTO = {
        userId: 'ADMIN_MANUAL',
        userName: nuevoPedido.userName.trim() || 'Cliente presencial',
        userPhone: nuevoPedido.userPhone.trim(),
        totalPrice: totalConDelivery,
        items: nuevoPedido.items.map((i) => ({
          productId: String(i.menuItem.id),
          itemName: i.menuItem.dish_name,
          itemPrice: i.menuItem.price,
          itemQuantity: i.quantity,
          quantity: i.quantity,
          notas: i.notas || undefined,
        })),
        restaurant: {
          restaurantId: externalBusinessId,
          restaurantName: businessName,
        },
        isDelivery: nuevoPedido.isDelivery,
        deliveryAddress: nuevoPedido.isDelivery ? nuevoPedido.deliveryAddress.trim() : undefined,
        paidWithMercadoPago: false,
        paidWithCash: nuevoPedido.paidWithCash,
      };

      const created = await crearPedido(dto);
      if (created) {
        setPedidos((prev) => [created, ...prev]);
        setShowCrearModal(false);
        setMensaje({ tipo: 'success', texto: 'Pedido creado correctamente.' });
      } else {
        setMensaje({ tipo: 'danger', texto: 'Error al crear el pedido. Intentá de nuevo.' });
      }
    } catch {
      setMensaje({ tipo: 'danger', texto: 'Error al crear el pedido.' });
    } finally {
      setCreandoPedido(false);
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

      <div className="d-flex justify-content-end mb-3">
        <Button variant="success" onClick={handleAbrirCrearModal}>
          <i className="bi bi-plus-circle me-1"></i>
          Nuevo Pedido
        </Button>
      </div>

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
                estimatedWaitTime={tiempoEntrega}
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

      {/* Modal crear pedido manual */}
      <Modal
        show={showCrearModal}
        onHide={() => setShowCrearModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Pedido</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Datos del cliente */}
          <h6 className="text-muted mb-2">Cliente</h6>
          <Row className="mb-3 g-2">
            <Col sm={6}>
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nombre del cliente"
                value={nuevoPedido.userName}
                onChange={(e) => setNuevoPedido((p) => ({ ...p, userName: e.target.value }))}
              />
            </Col>
            <Col sm={6}>
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Teléfono"
                value={nuevoPedido.userPhone}
                onChange={(e) => setNuevoPedido((p) => ({ ...p, userPhone: e.target.value }))}
              />
            </Col>
          </Row>

          {/* Tipo de entrega */}
          <h6 className="text-muted mb-2">Entrega</h6>
          <div className="mb-3">
            {delivery && (
              <Form.Check
                type="checkbox"
                label="Delivery"
                checked={nuevoPedido.isDelivery}
                onChange={(e) => setNuevoPedido((p) => ({ ...p, isDelivery: e.target.checked, deliveryAddress: '' }))}
                className="mb-2"
              />
            )}
            {nuevoPedido.isDelivery && (
              <Form.Control
                type="text"
                placeholder="Dirección de entrega"
                value={nuevoPedido.deliveryAddress}
                onChange={(e) => setNuevoPedido((p) => ({ ...p, deliveryAddress: e.target.value }))}
              />
            )}
            {!delivery && (
              <Badge bg="info">Retiro en local</Badge>
            )}
          </div>

          {/* Productos */}
          <h6 className="text-muted mb-2">Productos</h6>
          {loadingMenu ? (
            <div className="text-center py-2"><Spinner animation="border" size="sm" /></div>
          ) : (
            <>
              <Row className="mb-2 g-2">
                <Col>
                  <Form.Select
                    value={selectedMenuItemId}
                    onChange={(e) => setSelectedMenuItemId(e.target.value === '' ? '' : Number(e.target.value))}
                  >
                    <option value="">— Seleccionar producto —</option>
                    {menuItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.dish_name} — ${item.price.toLocaleString('es-AR')}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs="auto">
                  <Button variant="outline-success" onClick={handleAgregarItem} disabled={selectedMenuItemId === ''}>
                    Agregar
                  </Button>
                </Col>
              </Row>

              {nuevoPedido.items.length > 0 && (
                <Table size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th style={{ width: 90 }}>Cant.</th>
                      <th>Notas</th>
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {nuevoPedido.items.map((item) => (
                      <tr key={item.menuItem.id}>
                        <td>
                          <div>{item.menuItem.dish_name}</div>
                          <small className="text-muted">${(item.menuItem.price * item.quantity).toLocaleString('es-AR')}</small>
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            min={1}
                            value={item.quantity}
                            size="sm"
                            onChange={(e) => handleCambiarCantidad(item.menuItem.id, Number(e.target.value))}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="text"
                            size="sm"
                            placeholder="Sabores, aclaraciones..."
                            value={item.notas}
                            onChange={(e) => handleCambiarNotas(item.menuItem.id, e.target.value)}
                          />
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleQuitarItem(item.menuItem.id)}
                          >
                            ✕
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
          )}

          {/* Total */}
          {nuevoPedido.items.length > 0 && (
            <div className="text-end mt-3 fw-bold">
              Total: ${(
                nuevoPedido.items.reduce((s, i) => s + i.menuItem.price * i.quantity, 0) +
                (nuevoPedido.isDelivery ? precioDelivery : 0)
              ).toLocaleString('es-AR')}
              {nuevoPedido.isDelivery && precioDelivery > 0 && (
                <small className="text-muted fw-normal ms-2">(incl. delivery ${precioDelivery.toLocaleString('es-AR')})</small>
              )}
            </div>
          )}

          {/* Método de pago */}
          <h6 className="text-muted mt-3 mb-2">Pago</h6>
          <div>
            <Form.Check
              type="radio"
              id="pago-destino"
              name="metodoPago"
              label={nuevoPedido.isDelivery ? 'Paga en destino (efectivo)' : 'Paga al retirar (efectivo)'}
              checked={nuevoPedido.paidWithCash}
              onChange={() => setNuevoPedido((p) => ({ ...p, paidWithCash: true }))}
            />
            <Form.Check
              type="radio"
              id="pago-mp"
              name="metodoPago"
              label="Ya pagó (efectivo en mostrador)"
              checked={!nuevoPedido.paidWithCash}
              onChange={() => setNuevoPedido((p) => ({ ...p, paidWithCash: false }))}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCrearModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={handleCrearPedidoManual}
            disabled={creandoPedido || nuevoPedido.items.length === 0}
          >
            {creandoPedido ? <Spinner animation="border" size="sm" /> : 'Crear Pedido'}
          </Button>
        </Modal.Footer>
      </Modal>

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
  estimatedWaitTime?: number;
  esHeladeria?: boolean;
}

// Parsea fechas del backend como UTC (el backend no incluye 'Z' en LocalDateTime)
function parseUTC(dateStr: string): Date {
  if (!dateStr) return new Date(NaN);
  const hasTimezone = dateStr.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateStr);
  return new Date(hasTimezone ? dateStr : dateStr + 'Z');
}

// Inyectar CSS de animación una sola vez por módulo
let _alarmStyleInjected = false;
function injectAlarmStyle() {
  if (_alarmStyleInjected) return;
  _alarmStyleInjected = true;
  const el = document.createElement('style');
  el.textContent = `
    @keyframes pedidoFlash {
      0%, 49% { box-shadow: 0 0 0 3px #dc3545, 0 0 12px rgba(220,53,69,0.5); border-color: #dc3545 !important; }
      50%, 100% { box-shadow: none; border-color: rgba(0,0,0,.125) !important; }
    }
    .pedido-alarma { animation: pedidoFlash 1.2s ease-in-out infinite; border: 2px solid #dc3545 !important; }
  `;
  document.head.appendChild(el);
}

function PedidoCard({
  pedido,
  onCambiarEstado,
  deliveryPrice,
  estimatedWaitTime = 0,
  esHeladeria = false,
}: PedidoCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [alarmaDismissed, setAlarmaDismissed] = useState(false);
  const [excedido, setExcedido] = useState(false);

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

  const horaPedido = pedido.dateCreated
    ? parseUTC(pedido.dateCreated).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const fechaPedido = pedido.dateCreated
    ? parseUTC(pedido.dateCreated).toLocaleString('es-AR', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : null;

  // Timer de alarma para delivery
  useEffect(() => {
    if (!pedido.isDelivery || estimatedWaitTime <= 0) return;
    injectAlarmStyle();
    const check = () => {
      const transcurridos = (Date.now() - parseUTC(pedido.dateCreated).getTime()) / 60000;
      setExcedido(transcurridos >= estimatedWaitTime);
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, [pedido.dateCreated, pedido.isDelivery, estimatedWaitTime]);

  const mostrarAlarma = excedido && !alarmaDismissed;

  return (
    <>
      <Card
        className={`h-100${mostrarAlarma ? ' pedido-alarma' : ''}`}
        style={{ cursor: 'pointer' }}
        onClick={() => setShowModal(true)}
      >
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <small className="fw-bold">#{pedido.id.slice(-6)}</small>
            {horaPedido && (
              <small className="text-muted ms-2" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-clock me-1"></i>{horaPedido}
              </small>
            )}
          </div>
          <div className="d-flex align-items-center gap-1">
            {mostrarAlarma && (
              <Badge
                bg="danger"
                style={{ fontSize: '0.65rem', cursor: 'pointer' }}
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); setAlarmaDismissed(true); }}
                title="Apagar alarma"
              >
                ⏰ Tiempo excedido — apagar
              </Badge>
            )}
            <Badge bg={estadoBadge.color}>{estadoBadge.texto}</Badge>
          </div>
        </Card.Header>

        <Card.Body>
          {/* Cliente */}
          {pedido.userName && (
            <div className="mb-2">
              <strong>{pedido.userName}</strong>
            </div>
          )}
          {pedido.userPhone && (
            <div className="mb-2 d-flex align-items-center gap-2">
              <small className="text-muted">{pedido.userPhone}</small>
              <a
                href={`https://wa.me/${pedido.userPhone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Enviar mensaje por WhatsApp"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                style={{ lineHeight: 1 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
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
              <Badge bg="warning" text="dark" className="me-1">
                {pedido.isDelivery ? 'Paga en destino' : 'Paga al retirar'}
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
            <p className="mb-1 small d-flex align-items-center gap-2">
              <a href={`tel:${pedido.userPhone}`}>{pedido.userPhone}</a>
              <a
                href={`https://wa.me/${pedido.userPhone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Enviar mensaje por WhatsApp"
                style={{ lineHeight: 1 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
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
              <Badge bg="warning" text="dark" className="me-1">
                {pedido.isDelivery ? 'Paga en destino' : 'Paga al retirar'}
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
