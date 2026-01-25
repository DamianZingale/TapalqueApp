import { useState, type FC, type ChangeEvent } from "react";
import { Table } from "react-bootstrap";

import { useFilterByCategory } from "../../../gastronomia/hooks/useFilterByCategory";
import type { Imenu } from "../../../gastronomia/types/Imenu";
import { menuTest } from "../../../gastronomia/mock/MenuMock";

export const MenuAdmin: FC = () => {
  const [menu, setMenu] = useState<Imenu[]>(menuTest);
  const { filteredItems, activeCategory, setActiveCategory } =
    useFilterByCategory(menu);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Imenu>>({});

  // ---- Handlers ----
  const handleEdit = (item: Imenu) => {
    setEditingId(item.id);
    setEditData(item);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!editingId) return;

    // Transformar ingredientes y restricciones en arrays para backend si querés
    const updatedData = {
      ...editData,
      ingredients: (editData.ingredients || "").toString().split(",").map(s => s.trim()),
      restrictions: (editData.restrictions || "").toString().split(",").map(s => s.trim()),
    };

    setMenu((prev) =>
      prev.map((m) =>
        m.id === editingId ? { ...m, ...updatedData } as Imenu : m
      )
    );
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Seguro que querés eliminar este plato?")) {
      setMenu((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const categories = [...new Set(menu.map((m) => m.category))];

  return (
    <div className="p-3">
      <h2>Administrar Menú</h2>

      {/* Selector de categoría */}
      <div className="mb-3">
        <label className="me-2">Filtrar por categoría:</label>
        <select
          className="form-select form-select-sm d-inline-block w-auto"
          value={activeCategory ?? ""}
          onChange={(e) => setActiveCategory(e.target.value || null)}
        >
          <option value="">Todas</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla responsive */}
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Plato</th>
              <th>Precio</th>
              <th>Categoría</th>
              <th>Ingredientes</th>
              <th>Restricciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>

                {/* ---- Inline edit ---- */}
                <td>
                  {editingId === item.id ? (
                    <input
                      className="form-control form-control-sm"
                      name="dish_name"
                      value={editData.dish_name || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    item.dish_name
                  )}
                </td>

                <td>
                  {editingId === item.id ? (
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      name="price"
                      value={editData.price || 0}
                      onChange={handleChange}
                    />
                  ) : (
                    `$${item.price}`
                  )}
                </td>

                <td>
                  {editingId === item.id ? (
                    <select
                      className="form-select form-select-sm"
                      name="category"
                      value={editData.category || ""}
                      onChange={handleChange}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  ) : (
                    item.category
                  )}
                </td>

                <td>
                  {editingId === item.id ? (
                    <input
                      className="form-control form-control-sm"
                      name="ingredients"
                      value={(editData.ingredients || []).toString()}
                      onChange={handleChange}
                    />
                  ) : (
                    item.ingredients.join(", ")
                  )}
                </td>

                <td>
                  {editingId === item.id ? (
                    <input
                      className="form-control form-control-sm"
                      name="restrictions"
                      value={(editData.restrictions || []).toString()}
                      onChange={handleChange}
                    />
                  ) : (
                    item.restrictions.join(", ") || "-"
                  )}
                </td>

                <td>
                  {editingId === item.id ? (
                    <>
                      <button
                        className="btn btn-sm btn-success me-2 mb-1"
                        onClick={handleSave}
                      >
                        💾 Guardar
                      </button>
                      <button
                        className="btn btn-sm btn-secondary mb-1"
                        onClick={handleCancel}
                      >
                        ❌ Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-sm btn-warning me-2 mb-1"
                        onClick={() => handleEdit(item)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="btn btn-sm btn-danger mb-1"
                        onClick={() => handleDelete(item.id)}
                      >
                        🗑️ Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};
