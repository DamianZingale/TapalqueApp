import { useEffect, useState, type FC } from 'react';
import { Button, Form } from 'react-bootstrap';

import type { PedidoItem } from '../types/Imenu';
import { ItemCounter } from './ItemCounter';

export type PaymentMethod = 'mercadopago' | 'efectivo';

interface Props {
  initialPedido: PedidoItem[];
  allowDelivery?: boolean;
  deliveryPrice: number;
  estimatedWaitTime?: number;
  onConfirm: (data: {
    items: PedidoItem[];
    total: number;
    delivery: boolean;
    address: string;
    paymentMethod: PaymentMethod;
  }) => void;
  onCancel: () => void;
}

export const OrderSummaryCard: FC<Props> = ({
  initialPedido,
  allowDelivery,
  deliveryPrice,
  estimatedWaitTime = 0,
  onConfirm,
  onCancel,
}) => {
  const [pedido, setPedido] = useState(initialPedido);
  const [delivery, setDelivery] = useState(false);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  useEffect(() => {
    if (!allowDelivery) {
      setDelivery(false);
      setAddress('');
    }
  }, [allowDelivery]);

  const handleQuantityChange = (id: number, cantidad: number) =>
    setPedido((prev) =>
      prev.map((i) => (i.id === id ? { ...i, cantidad } : i))
    );

  const subtotal = pedido.reduce((acc, i) => acc + i.price * i.cantidad, 0);
  const total = subtotal + (delivery && allowDelivery ? deliveryPrice : 0);
  return (
    <div className="p-3 border rounded" style={{ backgroundColor: '#d4d2cf' }}>
      <h5>Pedido final:</h5>
      {pedido.map((i) => (
        <div
          key={i.id}
          className="d-flex justify-content-between align-items-center mb-2"
        >
          <div>
            {i.dish_name} (${i.price.toFixed(2)})
          </div>
          <ItemCounter
            quantity={i.cantidad}
            onChange={(q) => handleQuantityChange(i.id, q)}
          />
        </div>
      ))}

      {allowDelivery && (
        <>
          <Form.Check
            type="checkbox"
            label={`Delivery ($${deliveryPrice.toFixed(2)})`}
            checked={delivery}
            onChange={(e) => setDelivery(e.target.checked)}
            className="my-3"
          />

          {delivery && (
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Dirección de entrega"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          )}
        </>
      )}

      <div className="mb-3">
        <label className="form-label fw-bold">Método de pago:</label>
        <Form.Check
          type="radio"
          id="pago-efectivo"
          name="metodoPago"
          label="Pago en efectivo al recibir"
          checked={paymentMethod === 'efectivo'}
          onChange={() => setPaymentMethod('efectivo')}
        />
        <Form.Check
          type="radio"
          id="pago-mercadopago"
          name="metodoPago"
          label="Pagar con MercadoPago"
          checked={paymentMethod === 'mercadopago'}
          onChange={() => setPaymentMethod('mercadopago')}
        />
      </div>

      {estimatedWaitTime > 0 && (
        <div className="mb-3 text-muted">
          <i className="bi bi-clock me-1"></i>
          Tiempo de espera aproximado: <strong>{estimatedWaitTime} min</strong>
        </div>
      )}

      <div className="mb-3">
        <strong>Total: ${total.toFixed(2)}</strong>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={() =>
            onConfirm({
              items: pedido,
              total,
              delivery,
              address,
              paymentMethod,
            })
          }
          disabled={delivery && !address.trim()}
        >
          {paymentMethod === 'mercadopago'
            ? 'Pagar con MercadoPago'
            : 'Confirmar Pedido'}
        </Button>
      </div>
    </div>
  );
};
