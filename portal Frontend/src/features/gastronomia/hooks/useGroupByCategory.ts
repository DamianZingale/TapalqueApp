import { useMemo } from "react";
import type { Imenu } from "../types/Imenu";

export const useGroupByCategory = (items: Imenu[]) => {
  const grouped = useMemo(() => {
    const result: Record<string, Imenu[]> = {};
    items.forEach(item => {
      if (!result[item.category]) result[item.category] = [];
      result[item.category].push(item);
    });
    return result;
  }, [items]);

  return grouped;
};
