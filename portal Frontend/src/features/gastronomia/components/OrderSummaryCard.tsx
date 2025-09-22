import { useState, type FC } from "react";
import { Button, Form } from "react-bootstrap";

import { ItemCounter } from "./ItemCounter";
import type { PedidoItem } from "../types/Imenu";

interface Props {
  initialPedido: PedidoItem[];
  onConfirm: (data: { items: PedidoItem[]; total: number; delivery: boolean; address: string }) => void;
  onCancel: () => void;
}

export const OrderSummaryCard: FC<Props> = ({ initialPedido, onConfirm, onCancel }) => {
  const [pedido, setPedido] = useState(initialPedido);
  const [delivery, setDelivery] = useState(false);
  const [address, setAddress] = useState("");

  const handleQuantityChange = (id: number, cantidad: number) =>
    setPedido((prev) => prev.map((i) => (i.id === id ? { ...i, cantidad } : i)));

  const subtotal = pedido.reduce((acc, i) => acc + i.price * i.cantidad, 0);
  const total = subtotal + (delivery ? 500 : 0);

  return (
    <div className="p-3 border rounded bg-light">
      <h5>Pedido final:</h5>
      {pedido.map((i) => (
        <div key={i.id} className="d-flex justify-content-between align-items-center mb-2">
          <div>{i.dish_name} (${i.price.toFixed(2)})</div>
          <ItemCounter quantity={i.cantidad} onChange={(q) => handleQuantityChange(i.id, q)} />
        </div>
      ))}

      <Form.Check
        type="checkbox"
        label="Delivery ($500)"
        checked={delivery}
        onChange={(e) => setDelivery(e.target.checked)}
        className="my-3"
      />
      {delivery && (
        <div>
          <input
            type="text"
            className="form-control"
            placeholder="Dirección de entrega"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      )}

      <div className="mb-3"><strong>Total: ${total.toFixed(2)}</strong></div>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button
          variant="primary"
          onClick={() =>
            onConfirm({ items: pedido, total, delivery, address })
          }
          disabled={delivery && !address.trim()} // evita confirmar sin dirección
        >
          Aceptar
        </Button>
      </div>
    </div>
  );
};
