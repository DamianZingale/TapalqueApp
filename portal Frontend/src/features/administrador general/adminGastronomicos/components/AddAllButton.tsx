import { Button } from "react-bootstrap";

interface AddAllButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const AddAllButton = ({ onClick, disabled }: AddAllButtonProps) => {
  return (
    <div className="mt-3">
      <Button
        variant="success"
        size="sm"
        onClick={onClick}
        disabled={disabled}
      >
        Agregar todos
      </Button>
    </div>
  );
};