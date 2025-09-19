import { useMemo, type FC } from "react";
import type { Imenu } from "../types/Imenu";
import { ItemCounter } from "./ItemCounter";

import { CategoryTags } from "./CategoryTags";  
import { useFilterByCategory} from "../hooks/useFilterByCategory";

interface props {
  items: Imenu[];
}

export const MenuCard: FC<props> = ({ items }) => {
  

  // hook para filtrar por categoría
  const { filteredItems, activeCategory, setActiveCategory } = useFilterByCategory(items);

  // separación única de categorías
  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category))),
    [items]
  );
  
  return (
    <div
    style={{
      maxHeight: "70vh",
      overflowY: "auto",
      paddingRight: "8px",
      paddingBottom: "100px",
    }}
    >
      {/* Tags de categorías */}
      <CategoryTags
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
        
        />

      {/* Render de items filtrados */}
      {filteredItems.map((plato) => (
        <div
        key={plato.id}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            backgroundColor: "#f9f9f9",
            marginBottom: "8px",
          }}
          >
          <img
            src={plato.picture}
            alt={plato.dish_name}
            style={{
              width: "60px",
              height: "60px",
              objectFit: "cover",
              borderRadius: "4px",
            }}
            />
          <div style={{ flexGrow: 1, marginLeft: "12px" }}>
            <strong>{plato.dish_name}</strong> <br />
            <small>{plato.ingredients.join(", ")}</small> <br />
            <small>
              ${plato.price.toFixed(2)} |{" "}
              {plato.restrictions.length > 0
                ? plato.restrictions.join(", ")
                : "-"}
            </small>
          </div>
          <ItemCounter />
        </div>
      ))}
    </div>
  );
 
};
