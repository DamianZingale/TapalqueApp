import { Badge } from "react-bootstrap";

interface SelectedIngredientsProps {
  ingredients: string[];
  onRemove: (ingredient: string) => void;
}

export const SelectedIngredients = ({ 
  ingredients, 
  onRemove 
}: SelectedIngredientsProps) => {
  return (
    <div className="mt-3 d-flex flex-wrap gap-2">
      {ingredients.map((ingredient) => (
        <Badge
          pill
          bg="secondary"
          key={ingredient}
          style={{
            cursor: "pointer",
            fontSize: "1rem",
            padding: "0.6em 0.9em",
          }}
          onClick={() => onRemove(ingredient)}
        >
          {ingredient} ×
        </Badge>
      ))}
    </div>
  );
};