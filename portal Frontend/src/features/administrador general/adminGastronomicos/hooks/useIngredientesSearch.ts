import { useEffect, useState } from "react";

//mock
const ingredientesDB = [
  "Tomate", "Lechuga", "Cebolla", "Queso", "Pollo",
  "Carne", "Pescado", "Arroz", "Frijoles", "Aceitunas",
  "Champiñones", "Pimiento", "Ajo", "Cilantro", "Albahaca",
];

export const useIngredientSearch = (searchTerm: string, selected: string[]) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);

  useEffect(() => {
    if (searchTerm) {
      const results = ingredientesDB.filter((i) =>
        i.toLowerCase().startsWith(searchTerm.toLowerCase()) && 
        !selected.includes(i)
      );
      setSuggestions(results);
      setHighlightIndex(results.length > 0 ? 0 : -1);
    } else {
      setSuggestions([]);
      setHighlightIndex(-1);
    }
  }, [searchTerm, selected]);

  return { suggestions, highlightIndex, setHighlightIndex };
};
