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
    <div className="">
      {ingredients.map((ingredient) => (
        <Badge
          pill
          bg="secondary"
          key={ingredient}
          onClick={() => onRemove(ingredient)}
        >
          {ingredient} ×
        </Badge>
      ))}
    </div>
  );
};