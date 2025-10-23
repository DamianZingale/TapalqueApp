import { useEffect, useState } from "react";



export const useIngredientSearch = (searchTerm: string, selected: string[], data: string[]) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);

  useEffect(() => {
    if (searchTerm) {
      const results = data.filter((i) =>
        i.toLowerCase().startsWith(searchTerm.toLowerCase()) && 
        !selected.includes(i)
      );
      setSuggestions(results);
      setHighlightIndex(results.length > 0 ? 0 : -1);
    } else {
      setSuggestions([]);
      setHighlightIndex(-1);
    }
  }, [searchTerm, selected]);

  return { suggestions, highlightIndex, setHighlightIndex };
};
