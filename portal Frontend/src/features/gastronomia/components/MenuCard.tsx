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
import styles from "../styles/menuCard.module.css"

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
    <div className={styles.layout}>
      
      {!isFinalizing && (
        <div className={styles.filtersContainer}>
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
        </div>
      )}

      {!isFinalizing ? (
        <div >
          {Object.entries(groupedItems).map(([category, items]) => (
            
            <section key={category} className={styles.layoutCard}>
              <div className={styles.divition}>
            </div>
              <h3 className={styles.dishTittle}>{category}</h3>
              {items.map(plato => (
                <div
                  key={plato.id}
                
                >
                  <img className={styles.dishImg}
                    src={plato.picture}
                    alt={plato.dish_name}
                  
                  />
                  <div className={styles.layoutPlatos}>
                    <p className={styles.titleDish}>{plato.dish_name}</p>
                    <div className={styles.dishIngredients}>
                    <p className={styles.ingredients}>{plato.ingredients.join(", ")}</p>
                    <p className={styles.restriction}>{plato.restrictions.length ? plato.restrictions.join(", ") : "-"}</p>
                    </div>
                    <p className={styles.priceDish}>${plato.price.toFixed(2)}</p>
                  
                  <div className={styles.counterSpace}>
                  <ItemCounter
                    quantity={order[plato.id] || 0}
                    onChange={(q) => handleQuantityChange(plato.id, q)}                    
                  />
                  </div>
                  </div>
                </div>
              ))}
            </section>
          ))}

          {pedidoFinal.length > 0 && (
            <div >
              <button>
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
