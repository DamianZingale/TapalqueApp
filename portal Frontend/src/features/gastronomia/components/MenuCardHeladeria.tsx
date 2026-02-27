import { useMemo, useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Spinner } from 'react-bootstrap';
import authService from '../../../services/authService';
import { crearPedido } from '../../../services/fetchPedidos';
import { crearPreferenciaPago } from '../../../services/fetchMercadoPago';
import { useFilterByCategory } from '../hooks/useFilterByCategory';
import { useFilterByRestriction } from '../hooks/useFilterByRestriction';
import { useOrderHeladeria } from '../hooks/useOrderHeladeria';
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
  estimatedWaitTime?: number;
}

export const MenuCardHeladeria: FC<Props> = ({
  items,
  restaurantId,
  restaurantName,
  allowDelivery = false,
  deliveryPrice = 0,
  estimatedWaitTime = 0,
}) => {
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
  const { order, handleQuantityChange, handleNotasChange, pedidoFinal } = useOrderHeladeria(items);

  const availableItems = byTags.filter((item) => item.available !== false);

  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleFinalizarPedido = () => {
    if (!authService.isAuthenticated()) {
      setShowAuthModal(true);
    } else {
      setIsFinalizing(true);
    }
  };

  const handleGoToLogin = () => {
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate('/login');
  };

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
        notas: item.notas || undefined,
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

    const result = await crearPedido(pedidoData);

    if (!result) {
      setSubmitResult({ success: false, message: 'Error al crear el pedido. Intenta nuevamente.' });
      setIsSubmitting(false);
      return;
    }

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
          message: 'Error al conectar con MercadoPago. El pedido fue creado, puedes pagar en efectivo.',
        });
        setIsSubmitting(false);
        return;
      }
    }

    setSubmitResult({ success: true, message: 'Pedido creado exitosamente. Te avisaremos cuando este listo.' });
    setIsFinalizing(false);
    setTimeout(() => navigate('/mis-pedidos'), 2000);
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {availableItems.map((plato) => {
              const cantidad = order[plato.id]?.cantidad || 0;
              const notas = order[plato.id]?.notas || '';
              return (
                <div
                  key={plato.id}
                  style={{
                    padding: '16px',
                    border: '1px solid #dee2e6',
                    borderRadius: '10px',
                    backgroundColor: '#fff',
                  }}
                >
                  {/* Fila superior: imagen + nombre/precio + contador */}
                  <div className="d-flex align-items-center gap-3">
                    {plato.picture && (
                      <img
                        src={plato.picture}
                        alt={plato.dish_name}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          flexShrink: 0,
                        }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <div style={{ flexGrow: 1 }}>
                      <h5 className="mb-1" style={{ fontWeight: '600' }}>{plato.dish_name}</h5>
                      {plato.price > 0 && (
                        <div className="text-success fw-bold" style={{ fontSize: '1.1rem' }}>
                          ${plato.price.toFixed(2)}
                        </div>
                      )}
                      {plato.description && (
                        <small className="text-muted">{plato.description}</small>
                      )}
                    </div>
                    <div>
                      <ItemCounter
                        quantity={cantidad}
                        onChange={(q) => handleQuantityChange(plato.id, q)}
                      />
                    </div>
                  </div>

                  {/* Sabores disponibles + selector — visible solo cuando se agrega al carrito */}
                  {cantidad > 0 && plato.ingredients.length > 0 && (
                    <div
                      className="mt-3 p-3"
                      style={{ background: '#f0f8ff', borderRadius: '8px', border: '1px solid #bee3f8' }}
                    >
                      <small className="fw-bold text-primary d-block mb-2">
                        Elegí tus sabores (clic para agregar):
                      </small>
                      <div className="mb-2">
                        {plato.ingredients.map((sab, idx) => (
                          <Badge
                            key={idx}
                            className="me-1 mb-1"
                            style={{
                              cursor: 'pointer',
                              background: notas.toLowerCase().includes(sab.toLowerCase())
                                ? '#d1e7dd'
                                : '#f8f9fa',
                              color: notas.toLowerCase().includes(sab.toLowerCase())
                                ? '#0a3622'
                                : '#343a40',
                              border: notas.toLowerCase().includes(sab.toLowerCase())
                                ? '1px solid #a3cfbb'
                                : '1px solid #ced4da',
                              fontWeight: notas.toLowerCase().includes(sab.toLowerCase()) ? '600' : 'normal',
                              fontSize: '0.85rem',
                              padding: '5px 10px',
                            }}
                            onClick={() => {
                              const nuevo = notas ? `${notas}, ${sab}` : sab;
                              handleNotasChange(plato.id, nuevo);
                            }}
                          >
                            {notas.toLowerCase().includes(sab.toLowerCase()) ? '✓ ' : ''}{sab}
                          </Badge>
                        ))}
                      </div>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="O escribí los sabores que querés..."
                        value={notas}
                        onChange={(e) => handleNotasChange(plato.id, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {pedidoFinal.length > 0 && (
              <div className="mt-3 text-end">
                <button className="btn btn-primary" onClick={handleFinalizarPedido}>
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
                estimatedWaitTime={estimatedWaitTime}
                onCancel={() => setIsFinalizing(false)}
                onConfirm={handleConfirmOrder}
              />
            )}
          </>
        )}
      </div>

      {/* Modal de autenticación */}
      {showAuthModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowAuthModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Autenticación requerida</h5>
                <button type="button" className="btn-close" onClick={() => setShowAuthModal(false)} />
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  <i className="bi bi-lock" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                </div>
                <p className="text-center">
                  Debes iniciar sesión o registrarte para finalizar tu pedido.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAuthModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleGoToLogin}>
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
