
import { Button, Col } from "react-bootstrap";

interface AddButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const AddButton = ({ onClick, disabled }: AddButtonProps) => {
  return (
    <Col xs={3}>
      <Button
        variant="primary"
        className=""
        onClick={onClick}
        disabled={disabled}
      >
        Agregar
      </Button>
    </Col>
  );
};