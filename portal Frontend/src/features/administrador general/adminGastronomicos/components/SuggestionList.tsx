
import { ListGroup } from "react-bootstrap";

interface SuggestionsListProps {
  suggestions: string[];
  highlightIndex: number;
  onSelect: (suggestion: string) => void;
 
}

export const SuggestionsList = ({ 
  suggestions, 
  highlightIndex, 
  onSelect 
}: SuggestionsListProps) => {
  console.log("SuggestionsList render:", { suggestions, highlightIndex }); // DEBUG
  
  if (suggestions.length === 0) return null;

  return (
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
      {suggestions.map((suggestion, idx) => (
        <ListGroup.Item
          action
          key={suggestion}
          active={idx === highlightIndex}
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};