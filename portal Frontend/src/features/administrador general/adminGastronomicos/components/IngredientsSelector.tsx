import { useEffect, useState } from "react";
import { Badge, Button, Form, ListGroup, Row, Col } from "react-bootstrap";

// mock de ingredientes
const ingredientesDB = [
  "Tomate", "Lechuga", "Cebolla", "Queso", "Pollo",
  "Carne", "Pescado", "Arroz", "Frijoles", "Aceitunas",
  "Champiñones", "Pimiento", "Ajo", "Cilantro", "Albahaca",
];

export const IngredientesSelector = ({ onAgregar }: { onAgregar: (ingredientes: string[]) => void }) => {
  const [input, setInput] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);

  // debounce de medio segundo
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(input), 500);
    return () => clearTimeout(timer);
  }, [input]);

  // buscar coincidencias
  useEffect(() => {
    if (debouncedValue) {
      const results = ingredientesDB.filter((i) =>
        i.toLowerCase().includes(debouncedValue.toLowerCase())
      );
      setSuggestions(results);
      setHighlightIndex(results.length > 0 ? 0 : -1);
    } else {
      setSuggestions([]);
      setHighlightIndex(-1);
    }
  }, [debouncedValue]);

  const agregarIngrediente = (ingrediente?: string) => {
    const toAdd = ingrediente || input;
    if (toAdd && !selected.includes(toAdd)) {
      setSelected([...selected, toAdd]);
      setInput("");
      setSuggestions([]);
      setHighlightIndex(-1);
    }
  };

  const eliminarIngrediente = (ingrediente: string) => {
    setSelected(selected.filter((i) => i !== ingrediente));
  };

  const agregarTodos = () => {
    if (selected.length > 0) {
      onAgregar(selected);
      setSelected([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        agregarIngrediente(suggestions[highlightIndex]);
      } else {
        agregarIngrediente();
      }
    }
  };

  return (
    <>
      {/* 🔹 Input + botón "Agregar" en la misma fila */}
      <Row className="align-items-center mb-3">
        <Col xs={9} style={{ position: "relative" }}>
          <Form.Control
            type="text"
            placeholder="Buscar ingrediente"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {/* Dropdown de sugerencias */}
          {suggestions.length > 0 && (
            <ListGroup
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 1000,
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {suggestions.map((s, idx) => (
                <ListGroup.Item
                  action
                  key={s}
                  active={idx === highlightIndex}
                  onClick={() => agregarIngrediente(s)}
                >
                  {s}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col xs={3}>
          <Button
            variant="primary"
            className="w-100"
            onClick={() => agregarIngrediente()}
            disabled={!debouncedValue}
          >
            Agregar
          </Button>
        </Col>
      </Row>

      {/* 🔹 Tags seleccionados grandes */}
      <div className="mt-3 d-flex flex-wrap gap-2">
        {selected.map((i) => (
          <Badge
            pill
            bg="secondary"
            key={i}
            style={{
              cursor: "pointer",
              fontSize: "1rem",
              padding: "0.6em 0.9em",
            }}
            onClick={() => eliminarIngrediente(i)}
          >
            {i} ×
          </Badge>
        ))}
      </div>

      {/* 🔹 Botón agregar todos */}
      <div className="mt-3">
        <Button
          variant="success"
          size="sm"
          onClick={agregarTodos}
          disabled={selected.length === 0}
        >
          Agregar todos
        </Button>
      </div>
    </>
  );
};
