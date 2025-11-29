import { Button } from "react-bootstrap";

interface AddAllButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const AddAllButton = ({ onClick, disabled }: AddAllButtonProps) => {
  return (
    <div className="">
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