import { useMemo, useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Accordion, Alert, Badge, Spinner } from 'react-bootstrap';
import authService from '../../../services/authService';
import { crearPedido } from '../../../services/fetchPedidos';
import { crearPreferenciaPago } from '../../../services/fetchMercadoPago';
import { useFilterByCategory } from '../hooks/useFilterByCategory';
import { useFilterByRestriction } from '../hooks/useFilterByRestriction';
import { useGroupByCategory } from '../hooks/useGroupByCategory';
import { useOrder } from '../hooks/useOrder';
import type { Imenu } from '../types/Imenu';
import { CategoryTags } from './CategoryTags';
import { ItemCounter } from './ItemCounter';
import { OrderSummaryCard, type PaymentMethod } from './OrderSummaryCard';
import { RestrictionsTags } from './RestrictionsTags';

interface Props {
  items: Imenu[];
  restaurantId: string;
  restaurantName: string;
  allowDelivery?: boolean;
  deliveryPrice?: number;
}

export const MenuCard: FC<Props> = ({ items, restaurantId, restaurantName, allowDelivery = false, deliveryPrice = 0 }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);
  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category))),
    [items]
  );
  const tags = useMemo(
    () => Array.from(new Set(items.flatMap((i) => i.restrictions))),
    [items]
  );

  // Hooks
  const {
    filteredItems: byCategory,
    activeCategory,
    setActiveCategory,
  } = useFilterByCategory(items);
  const {
    filteredItems: byTags,
    selectedTags,
    toggleTag,
    clearTags,
  } = useFilterByRestriction(byCategory);
  const { order, handleQuantityChange, pedidoFinal } = useOrder(items);

  // Filtrar solo items disponibles para usuarios públicos
  const availableItems = byTags.filter(item => item.available !== false);

  // Agrupamiento por categoría (solo items disponibles)
  const groupedItems = useGroupByCategory(availableItems);

  // Estado de modo finalización
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Estado para modal de autenticación
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Verificar si está autenticado antes de finalizar
  const handleFinalizarPedido = () => {
    if (!authService.isAuthenticated()) {
      // Si no está autenticado, mostrar modal
      setShowAuthModal(true);
    } else {
      // Si está autenticado, proceder a finalizar
      setIsFinalizing(true);
    }
  };

  // Ir a login
  const handleGoToLogin = () => {
    // Guardar la URL actual para volver después del login
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate('/login');
  };

  // Confirmar pedido y enviarlo al backend
  const handleConfirmOrder = async (data: {
    items: typeof pedidoFinal;
    total: number;
    delivery: boolean;
    address: string;
    paymentMethod: PaymentMethod;
  }) => {
    setIsSubmitting(true);
    setSubmitResult(null);

    const user = authService.getUser();
    if (!user) {
      setSubmitResult({ success: false, message: 'Error: Usuario no autenticado' });
      setIsSubmitting(false);
      return;
    }

    // Preparar datos del pedido
    const pedidoData = {
      userId: String(user.id || ''),
      userName: `${user.nombre || ''} ${user.apellido || ''}`.trim() || String(user.email || ''),
      userPhone: user.telefono || '',
      totalPrice: data.total,
      items: data.items.map((item) => ({
        productId: String(item.id),
        itemName: item.dish_name,
        itemPrice: item.price,
        itemQuantity: item.cantidad,
        quantity: item.cantidad,
      })),
      restaurant: {
        restaurantId: restaurantId,
        restaurantName: restaurantName,
      },
      isDelivery: data.delivery,
      deliveryAddress: data.delivery ? data.address : undefined,
      paidWithMercadoPago: data.paymentMethod === 'mercadopago',
      paidWithCash: data.paymentMethod === 'efectivo',
    };

    // Crear pedido primero (con o sin MercadoPago)
    const result = await crearPedido(pedidoData);

    if (!result) {
      setSubmitResult({ success: false, message: 'Error al crear el pedido. Intenta nuevamente.' });
      setIsSubmitting(false);
      return;
    }

    // Si el pago es con MercadoPago, crear preferencia y redirigir
    if (data.paymentMethod === 'mercadopago') {
      const productoMP = {
        idProducto: 0,
        title: `Pedido #${result.id.slice(-6).toUpperCase()} - ${restaurantName}`,
        quantity: 1,
        unitPrice: data.total,
        idVendedor: parseInt(restaurantId) || 0,
        idComprador: parseInt(String(user.id)) || 0,
        idTransaccion: result.id,
        tipoServicio: 'GASTRONOMICO' as const,
        payerEmail: user.email || undefined,
        payerName: `${user.nombre || ''} ${user.apellido || ''}`.trim() || undefined,
        payerIdentificationNumber: user.dni || undefined,
      };

      const urlPago = await crearPreferenciaPago(productoMP);

      if (urlPago) {
        sessionStorage.setItem('pedidoPendiente', result.id);
        alert(`Pedido creado. Seras redirigido a Mercado Pago para realizar el pago.\n\nTotal: $${data.total.toLocaleString()}\n\nTenes 5 minutos para completar el pago. Pasado ese tiempo, el pedido sera cancelado.`);
        window.location.href = urlPago;
        return;
      } else {
        setSubmitResult({
          success: false,
          message: 'Error al conectar con MercadoPago. El pedido fue creado, puedes pagar en efectivo.'
        });
        setIsSubmitting(false);
        return;
      }
    }

    // Si el pago es en efectivo, el pedido ya está creado
    setSubmitResult({ success: true, message: 'Pedido creado exitosamente. Te avisaremos cuando este listo.' });
    setIsFinalizing(false);
    setTimeout(() => {
      navigate('/mis-pedidos');
    }, 2000);

    setIsSubmitting(false);
  };

  return (
    <>
      <div
        style={{
          maxHeight: '70vh',
          overflowY: 'auto',
          paddingRight: '8px',
          paddingBottom: '100px',
        }}
      >
        {!isFinalizing && (
          <>
            <CategoryTags
              categories={categories}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
            />
            <RestrictionsTags
              tags={tags}
              selectedTags={selectedTags}
              toggleTag={toggleTag}
              clearTags={clearTags}
            />
          </>
        )}

        {!isFinalizing ? (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {Object.entries(groupedItems).map(([category, items]) => (
              <section key={category}>
                <h3 className="mb-3">{category}</h3>
                {items.map((plato, index) => (
                  <Accordion key={plato.id} className="mb-2">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        gap: '12px',
                      }}
                    >
                      {/* Imagen */}
                      <img
                        src={plato.picture || 'https://via.placeholder.com/100x100/e9ecef/6c757d?text=Sin+imagen'}
                        alt={plato.dish_name}
                        style={{
                          width: '100px',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          flexShrink: 0,
                        }}
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/100x100/e9ecef/6c757d?text=Sin+imagen';
                        }}
                      />

                      {/* Info principal */}
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <h5 className="mb-1" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                              {plato.dish_name}
                            </h5>
                            <div className="text-success fw-bold" style={{ fontSize: '1.2rem' }}>
                              ${plato.price.toFixed(2)}
                            </div>
                          </div>

                          {/* Contador */}
                          <div style={{ marginLeft: '12px' }}>
                            <ItemCounter
                              quantity={order[plato.id] || 0}
                              onChange={(q) => handleQuantityChange(plato.id, q)}
                            />
                          </div>
                        </div>

                        {/* Acordeón para detalles */}
                        <Accordion.Item eventKey={`${plato.id}`}>
                          <Accordion.Header>
                            <small className="text-muted">Ver detalles</small>
                          </Accordion.Header>
                          <Accordion.Body className="pt-2">
                            {/* Descripción */}
                            {plato.description && (
                              <div className="mb-2">
                                <strong className="text-muted" style={{ fontSize: '0.85rem' }}>Descripción:</strong>
                                <p className="mb-2" style={{ fontSize: '0.9rem' }}>{plato.description}</p>
                              </div>
                            )}

                            {/* Ingredientes */}
                            {plato.ingredients && plato.ingredients.length > 0 && (
                              <div className="mb-2">
                                <strong className="text-muted" style={{ fontSize: '0.85rem' }}>Ingredientes:</strong>
                                <div className="mt-1">
                                  {plato.ingredients.map((ing, idx) => (
                                    <Badge key={idx} bg="secondary" className="me-1 mb-1" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                                      {ing}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Restricciones */}
                            {plato.restrictions && plato.restrictions.length > 0 && (
                              <div>
                                <strong className="text-muted" style={{ fontSize: '0.85rem' }}>Restricciones:</strong>
                                <div className="mt-1">
                                  {plato.restrictions.map((res, idx) => (
                                    <Badge key={idx} bg="info" className="me-1 mb-1" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                                      {res}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </Accordion.Body>
                        </Accordion.Item>
                      </div>
                    </div>
                  </Accordion>
                ))}
              </section>
            ))}

            {pedidoFinal.length > 0 && (
              <div className="mt-3 text-end">
                <button
                  className="btn btn-primary"
                  onClick={handleFinalizarPedido}
                >
                  Finalizar Pedido
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {isSubmitting && (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Procesando pedido...</p>
              </div>
            )}
            {submitResult && (
              <Alert variant={submitResult.success ? 'success' : 'danger'} className="mb-3">
                {submitResult.message}
              </Alert>
            )}
            {!isSubmitting && (
              <OrderSummaryCard
                initialPedido={pedidoFinal}
                allowDelivery={allowDelivery}
                deliveryPrice={deliveryPrice}
                onCancel={() => setIsFinalizing(false)}
                onConfirm={handleConfirmOrder}
              />
            )}
          </>
        )}
      </div>

      {/* Modal de autenticación requerida */}
      {showAuthModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Autenticación requerida</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAuthModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  <i
                    className="bi bi-lock"
                    style={{ fontSize: '3rem', color: '#6c757d' }}
                  ></i>
                </div>
                <p className="text-center">
                  Debes iniciar sesión o registrarte para finalizar tu pedido.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAuthModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGoToLogin}
                >
                  Iniciar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
