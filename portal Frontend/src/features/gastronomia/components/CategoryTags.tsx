import { type FC } from 'react'
import { Button } from 'react-bootstrap';
import styles from "../styles/ItemCounter.module.css";

interface Props {
  categories: string[];
  activeCategory: string | null;
  onSelect: (category: string | null) => void;
  
}

export const CategoryTags : FC<Props> = ({categories, activeCategory, onSelect}) => {

  return (
    <div className={styles.espacios}>
      <Button
        variant={!activeCategory ? "primary" : "outline-primary"}
        onClick={() => onSelect(null)}
      >
        Todos
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat}
          variant={activeCategory === cat ? "primary" : "outline-primary"}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </Button>
      ))}
        
    </div>
  );
};

