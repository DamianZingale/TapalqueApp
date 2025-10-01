import { useState } from "react";
import type { Imenu } from "../types/Imenu";

export const useOrder = (items: Imenu[]) => {
  const [order, setOrder] = useState<{ [id: number]: number }>({});

  const handleQuantityChange = (itemId: number, quantity: number) => {
    setOrder((prev) => ({
      ...prev,
      [itemId]: quantity,
    }));
  };

  const pedidoFinal = items
    .filter((i) => order[i.id] > 0)
    .map((i) => ({ ...i, cantidad: order[i.id] }));

  return { order, handleQuantityChange, pedidoFinal };
};
