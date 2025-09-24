
import type { FC } from "react";
import { Button } from "react-bootstrap";

interface Props {
  tags: string[];
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  clearTags: () => void;
}

export const RestrictionsTags: FC<Props> = ({ tags, selectedTags, toggleTag, clearTags }) => (
  <div className="mb-3 d-flex flex-wrap gap-2">
    {tags.map((tag) => (
      <Button
        key={tag}
        variant={selectedTags.includes(tag) ? "primary" : "outline-primary"}
        onClick={() => toggleTag(tag)}
      >
        {tag}
      </Button>
    ))}
    {selectedTags.length > 0 && (
      <Button variant="secondary" onClick={clearTags}>
        Limpiar tags
      </Button>
    )}
  </div>
);
