import { Button } from "react-bootstrap";
import { categoriasDB } from "../mock";

interface CategoryTagsProps {
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export const CategoryTags = ({ selectedCategory, onSelect }: CategoryTagsProps) => {
  return (
    <div className="d-flex flex-wrap gap-2 mb-3">
      {categoriasDB.map((cat) => (
        <Button
          key={cat}
          variant={selectedCategory === cat ? "primary" : "outline-primary"}
          onClick={() => onSelect(cat)}
          className="flex-grow-0"
        >
          {cat}
        </Button>
      ))}
    </div>
  );
};
