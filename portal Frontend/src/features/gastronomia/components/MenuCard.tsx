import React, { useState } from "react";
import type { Imenu } from "../types/Imenu";

interface MenuCardProps {
  menu: Imenu[];
}

interface QuantityMenuButtonsProps {
  platoId: number;
  cantidades: { [key: number]: number };
  aumentar: (id: number) => void;
  disminuir: (id: number) => void;
}

const QuantityMenuButtons: React.FC<QuantityMenuButtonsProps> = ({
  platoId,
  cantidades,
  aumentar,
  disminuir,
}) => (
  <div style={{ display: "flex", alignItems: "center" }}>
    <button
      style={{
        border: "1px solid #6c757d",
        backgroundColor: "white",
        color: "#6c757d",
        padding: "2px 8px",
        cursor: "pointer",
      }}
      onClick={() => disminuir(platoId)}
    >
      -
    </button>
    <span style={{ margin: "0 8px" }}>{cantidades[platoId] || 0}</span>
    <button
      style={{
        border: "1px solid #6c757d",
        backgroundColor: "white",
        color: "#6c757d",
        padding: "2px 8px",
        cursor: "pointer",
      }}
      onClick={() => aumentar(platoId)}
    >
      +
    </button>
  </div>
);

export const MenuCard: React.FC<MenuCardProps> = ({ menu }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [cantidades, setCantidades] = useState<{ [key: number]: number }>({});

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => setSelectedTags([]);

  const aumentar = (id: number) =>
    setCantidades(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

  const disminuir = (id: number) =>
    setCantidades(prev => ({ ...prev, [id]: Math.max((prev[id] || 0) - 1, 0) }));

  const categories = Array.from(new Set(menu.map(m => m.category)));

  const filteredMenu = menu.filter(item =>
    selectedTags.length === 0 ||
    selectedTags.every(tag => item.restrictions.includes(tag))
  );

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAgregarAlCarrito = () => {
    const pedido = menu
      .filter(item => cantidades[item.id] > 0)
      .map(item => ({ ...item, cantidad: cantidades[item.id] }));
    console.log("Agregado al carrito:", pedido);
    alert("Items agregados al carrito!");
  };

  const handleRealizarPedido = () => {
    const pedido = menu
      .filter(item => cantidades[item.id] > 0)
      .map(item => ({ ...item, cantidad: cantidades[item.id] }));
    console.log("Pedido realizado:", pedido);
    alert("Pedido realizado!");
  };

  return (
    <div
      style={{
        maxHeight: "70vh",
        overflowY: "auto",
        paddingRight: "8px",
        paddingBottom: "100px", // espacio para los botones finales
      }}
    >
      {/* Índice de categorías */}
      <div style={{ marginBottom: "16px" }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => handleScroll(cat)}
            style={{
              marginRight: "8px",
              marginBottom: "8px",
              padding: "6px 12px",
              border: "1px solid #6c757d",
              backgroundColor: "white",
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ marginBottom: "16px", display: "flex", flexWrap: "wrap" }}>
        {["Vegano", "Vegetariano", "Celiaco", "Sin Alcohol"].map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            style={{
              marginRight: "8px",
              marginBottom: "8px",
              padding: "6px 12px",
              border: "1px solid #6c757d",
              backgroundColor: selectedTags.includes(tag) ? "#0d6efd" : "white",
              color: selectedTags.includes(tag) ? "white" : "#6c757d",
              cursor: "pointer",
            }}
          >
            {tag}
          </button>
        ))}
        <button
          onClick={clearFilters}
          style={{
            marginRight: "8px",
            marginBottom: "8px",
            padding: "6px 12px",
            border: "1px solid #dc3545",
            backgroundColor: "#dc3545",
            color: "white",
            cursor: "pointer",
          }}
        >
          Quitar filtros
        </button>
      </div>

      {/* Items */}
      {categories.map(cat => {
        const items = filteredMenu.filter(i => i.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat} id={cat} style={{ marginBottom: "24px" }}>
            <h3>{cat}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
                      ${plato.price.toFixed(2)} | {plato.restrictions.join(", ") || "-"}
                    </small>
                  </div>
                  <QuantityMenuButtons
                    platoId={plato.id}
                    cantidades={cantidades}
                    aumentar={aumentar}
                    disminuir={disminuir}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Botones finales */}
      <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
        <button
          style={{
            flex: 1,
            padding: "10px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: "#0d6efd",
            color: "white",
            cursor: "pointer",
          }}
          onClick={handleAgregarAlCarrito}
        >
          Agregar al carrito
        </button>

        <button
          style={{
            flex: 1,
            padding: "10px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: "#198754",
            color: "white",
            cursor: "pointer",
          }}
          onClick={handleRealizarPedido}
        >
          Realizar pedido
        </button>
      </div>
    </div>
  );
};
