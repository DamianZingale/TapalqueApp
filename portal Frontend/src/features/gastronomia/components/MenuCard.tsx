import { useMemo, useState, type FC } from "react";
import type { Imenu } from "../types/Imenu";
import { ItemCounter } from "./ItemCounter";
import { CategoryTags } from "./CategoryTags";
import { RestrictionsTags } from "./RestrictionsTags";
import { useFilterByCategory } from "../hooks/useFilterByCategory";
import { useFilterByRestriction } from "../hooks/useFilterByRestriction";
import { useOrder } from "../hooks/useOrder";
import { useGroupByCategory } from "../hooks/useGroupByCategory";
import { OrderSummaryCard } from "./OrderSummaryCard";

interface Props {
  items: Imenu[];
}

export const MenuCard: FC<Props> = ({ items }) => {
  const categories = useMemo(() => Array.from(new Set(items.map(i => i.category))), [items]);
  const tags = useMemo(() => Array.from(new Set(items.flatMap(i => i.restrictions))), [items]);

  // Hooks
  const { filteredItems: byCategory, activeCategory, setActiveCategory } = useFilterByCategory(items);
  const { filteredItems: byTags, selectedTags, toggleTag, clearTags } = useFilterByRestriction(byCategory);
  const { order, handleQuantityChange, pedidoFinal } = useOrder(items);

  // Agrupamiento por categoría
  const groupedItems = useGroupByCategory(byTags);

  // Estado de modo finalización
  const [isFinalizing, setIsFinalizing] = useState(false);

  return (
    <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "8px", paddingBottom: "100px" }}>
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
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {Object.entries(groupedItems).map(([category, items]) => (
            <section key={category}>
              <h3>{category}</h3>
              {items.map(plato => (
                <div
                  key={plato.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px",
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    backgroundColor: "#f9f9f9",
                    gap: "12px"
                  }}
                >
                  <img
                    src={plato.picture}
                    alt={plato.dish_name}
                    style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px" }}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <strong>{plato.dish_name}</strong><br />
                    <small>{plato.ingredients.join(", ")}</small><br />
                    <small>{plato.restrictions.length ? plato.restrictions.join(", ") : "-"}</small><br />
                    <strong>${plato.price.toFixed(2)}</strong>
                  </div>
                  <ItemCounter
                    quantity={order[plato.id] || 0}
                    onChange={(q) => handleQuantityChange(plato.id, q)}
                  />
                </div>
              ))}
            </section>
          ))}

          {pedidoFinal.length > 0 && (
            <div className="mt-3 text-end">
              <button className="btn btn-primary" onClick={() => setIsFinalizing(true)}>
                Finalizar Pedido
              </button>
            </div>
          )}
        </div>
      ) : (
        <OrderSummaryCard
          initialPedido={pedidoFinal}
          onCancel={() => setIsFinalizing(false)}
          onConfirm={(data) => {
            console.log("Pedido confirmado:", data);
            setIsFinalizing(false);
          }}
        />
      )}
    </div>
  );
};
