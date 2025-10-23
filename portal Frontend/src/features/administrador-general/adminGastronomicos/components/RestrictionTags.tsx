import { Button, ButtonGroup } from "react-bootstrap";
import { restriccionesDB } from "../mock";

interface RestrictionTagsProps {
  selectedRestrictions: string[];
  onChange: (restrictions: string[]) => void;
}

export const RestrictionTags = ({ selectedRestrictions, onChange }: RestrictionTagsProps) => {
  const toggleRestriction = (restriction: string) => {
    if (selectedRestrictions.includes(restriction)) {
      // si ya está seleccionada, la saco
      onChange(selectedRestrictions.filter((r) => r !== restriction));
    } else {
      // si no está, la agrego
      onChange([...selectedRestrictions, restriction]);
    }
  };

  return (
    <ButtonGroup className="mb-3" style={{ flexWrap: "wrap" }}>
      {restriccionesDB.map((res) => (
        <Button
          key={res}
          variant={selectedRestrictions.includes(res) ? "primary" : "outline-primary"}
          onClick={() => toggleRestriction(res)}
          className="m-1"
        >
          {res}
        </Button>
      ))}
    </ButtonGroup>
  );
};
