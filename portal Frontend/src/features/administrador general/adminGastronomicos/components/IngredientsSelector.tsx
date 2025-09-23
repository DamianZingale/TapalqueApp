import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useDebounce } from "../hooks/useDebounce";
import { useIngredientSearch } from "../hooks/useIngredientesSearch";

import { SuggestionsList } from "./SuggestionList";
import { AddButton } from "./AddButton";
import { SelectedIngredients } from "./SelectedIngredients";
import { AddAllButton } from "./AddAllButton";
import { SearchInput } from "./SearchInput";


interface IngredientesSelectorProps {
  onAgregar: (ingredientes: string[]) => void;
}

export const IngredientesSelector = ({ onAgregar }: IngredientesSelectorProps) => {
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  
  const debouncedValue = useDebounce(input, 500);
  const { suggestions, highlightIndex, setHighlightIndex } = useIngredientSearch(
    debouncedValue, 
    selected
  );

  const agregarIngrediente = (ingrediente?: string) => {
    const toAdd = ingrediente || input;
    if (toAdd && !selected.includes(toAdd)) {
      setSelected([...selected, toAdd]);
      setInput("");
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
      <Row className="align-items-center mb-3">
  <Col xs={9} style={{ position: "relative" }}>
    <SearchInput
      value={input}
      onChange={setInput}
      onKeyDown={handleKeyDown}
    />
    <SuggestionsList
      suggestions={suggestions}
      highlightIndex={highlightIndex}
      onSelect={agregarIngrediente}
    />
  </Col>
  <AddButton
    onClick={() => agregarIngrediente()}
    disabled={!debouncedValue}
  />
</Row>

      <SelectedIngredients
        ingredients={selected}
        onRemove={eliminarIngrediente}
      />

      <AddAllButton
        onClick={agregarTodos}
        disabled={selected.length === 0}
      />
    </>
  );
};