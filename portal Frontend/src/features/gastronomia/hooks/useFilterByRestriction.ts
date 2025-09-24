import { useMemo, useState } from "react";
import type { Imenu } from "../types/Imenu"




export const useFilterByRestriction = (items: Imenu[]) => {
  
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearTags = () => setSelectedTags([]);

  const filteredItems= useMemo(
    () =>
      items.filter((i) =>
        selectedTags.length === 0 ? true : selectedTags.every((tag) => i.restrictions.includes(tag))
      ),
    [items, selectedTags]
  );

  return { filteredItems, selectedTags, toggleTag, clearTags };
};