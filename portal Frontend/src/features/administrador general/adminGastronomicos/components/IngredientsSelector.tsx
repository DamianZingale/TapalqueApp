import { useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { useIngredientSearch } from "../hooks/useIngredientesSearch";
import { SearchInput } from "./SearchInput";
import { SuggestionsList } from "./SuggestionList";
import { AddButton } from "./AddButton";
import { SelectedIngredients } from "./SelectedIngredients";
import { Col, Row } from "react-bootstrap";


interface IngredientesSelectorProps {
  selected: string[];
  onChange: (items: string[]) => void;
  data: string[];
  placeholder?: string;
}

export const IngredientesSelector = ({ selected, onChange, data, placeholder }: IngredientesSelectorProps) => {
  const [input, setInput] = useState("");
  const debouncedValue = useDebounce(input, 500);

  const { suggestions, highlightIndex, setHighlightIndex } = useIngredientSearch(
    debouncedValue,
    selected,
    data
  );

  const agregarIngrediente = (item?: string) => {
    const toAdd = item || input;
    if (toAdd && !selected.includes(toAdd)) {
      onChange([...selected, toAdd]);   
      setInput("");
    }
  };

  const eliminarIngrediente = (item: string) => {
    onChange(selected.filter((i) => i !== item));
  };
  
  //MANEJADOR DE FLECHAS Y ENTER PARA SELECCIONAR INGREDIENTES
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
            placeholder={placeholder}
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
    </>
  );
};
