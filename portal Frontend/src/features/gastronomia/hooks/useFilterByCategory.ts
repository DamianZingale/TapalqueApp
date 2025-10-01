import {useState} from 'react'
import type { Imenu } from '../types/Imenu';


export const useFilterByCategory = (items: Imenu[]) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredItems = activeCategory
    ? items.filter((i) => i.category === activeCategory)
    : items;

  return { filteredItems, activeCategory, setActiveCategory };
};
