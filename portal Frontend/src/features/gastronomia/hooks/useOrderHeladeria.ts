import { useState } from "react";
import type { Imenu } from "../types/Imenu";

interface OrderEntry {
  cantidad: number;
  notas: string;
}

export const useOrderHeladeria = (items: Imenu[]) => {
  const [order, setOrder] = useState<{ [id: number]: OrderEntry }>({});

  const handleQuantityChange = (itemId: number, quantity: number) => {
    setOrder((prev) => ({
      ...prev,
      [itemId]: { cantidad: quantity, notas: prev[itemId]?.notas || '' },
    }));
  };

  const handleNotasChange = (itemId: number, notas: string) => {
    setOrder((prev) => ({
      ...prev,
      [itemId]: { cantidad: prev[itemId]?.cantidad || 0, notas },
    }));
  };

  const pedidoFinal = items
    .filter((i) => (order[i.id]?.cantidad || 0) > 0)
    .map((i) => ({ ...i, cantidad: order[i.id].cantidad, notas: order[i.id]?.notas || '' }));

  return { order, handleQuantityChange, handleNotasChange, pedidoFinal };
};
