import React from "react";
import type { Imenu } from "../types/Imenu";

interface OrderSummaryProps {
  pedido: (Imenu & { cantidad: number })[];
  setPedido: React.Dispatch<React.SetStateAction<(Imenu & { cantidad: number })[]>>;
  localDelivery: boolean;
}

export const OrderSummaryCard: React.FC<OrderSummaryProps> = ({ pedido, setPedido, localDelivery }) => {

  const aumentar = (id: number) => {
    setPedido(prev =>
      prev.map(item => (item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item))
    );
  };

  const disminuir = (id: number) => {
    setPedido(prev =>
      prev.map(item =>
        item.id === id ? { ...item, cantidad: Math.max(item.cantidad - 1, 0) } : item
      )
    );
  };

  if (!pedido.length) return null;

  return (
    <div
      style={{
        border: "1px solid #dee2e6",
        borderRadius: "6px",
        padding: "16px",
        marginTop: "16px",
        backgroundColor: "#f8f9fa",
      }}
    >
      <h4>Resumen de Pedido</h4>
      {pedido.map(item => (
        <div
          key={item.id}
          style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}
        >
          {/* Imagen */}
          <img
            src={item.picture}
            alt={item.dish_name}
            style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
          />

          {/* Info */}
          <div style={{ flexGrow: 1, marginLeft: "12px" }}>
            <strong>{item.dish_name}</strong> <br />
            <small>${item.price.toFixed(2)} | {item.restrictions.join(", ") || "-"}</small>
          </div>

          {/* Botones de cantidad */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              style={{
                border: "1px solid #6c757d",
                backgroundColor: "white",
                color: "#6c757d",
                padding: "2px 8px",
                cursor: "pointer",
              }}
              onClick={() => disminuir(item.id)}
            >
              -
            </button>
            <span style={{ margin: "0 8px" }}>{item.cantidad}</span>
            <button
              style={{
                border: "1px solid #6c757d",
                backgroundColor: "white",
                color: "#6c757d",
                padding: "2px 8px",
                cursor: "pointer",
              }}
              onClick={() => aumentar(item.id)}
            >
              +
            </button>
          </div>

          {/* Delivery */}
          {localDelivery && (
            <input type="checkbox" checked readOnly style={{ marginLeft: "8px" }} title="Delivery" />
          )}
        </div>
      ))}
    </div>
  );
};
