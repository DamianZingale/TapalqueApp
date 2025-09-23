import { useEffect, useState } from "react";

//mock DB
const ingredientesDB = [
  "Tomate",
  "Lechuga",
  "Cebolla",
  "Queso",
  "Pollo",
  "Carne",
  "Pescado",
  "Arroz",
  "Frijoles",
  "Aceitunas",
  "Champiñones",
  "Pimiento",
  "Ajo",
  "Cilantro",
  "Albahaca",
];

export const useIngredientesSearch = (query: string) => {
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setResult(null);
      return;
    }

    const encontrado = ingredientesDB.find(
      (i) => i.toLowerCase() === query.toLowerCase()
    );
    setResult(encontrado || null);
  }, [query]);

  return result;
};