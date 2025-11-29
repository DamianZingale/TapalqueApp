import { Button } from "react-bootstrap";
import { categoriasDB } from "../mock";

interface CategoryTagsProps {
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export const CategoryTags = ({ selectedCategory, onSelect }: CategoryTagsProps) => {
  return (
    <div className="">
      {categoriasDB.map((cat) => (
        <Button
          key={cat}
          variant={selectedCategory === cat ? "primary" : "outline-primary"}
          onClick={() => onSelect(cat)}
          className=""
        >
          {cat}
        </Button>
      ))}
    </div>
  );
};
