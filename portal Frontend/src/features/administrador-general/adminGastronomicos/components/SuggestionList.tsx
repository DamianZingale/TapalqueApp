
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
  console.log("SuggestionsList render:", { suggestions, highlightIndex }); 
  
  if (suggestions.length === 0) return null;

  return (
    <ListGroup

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