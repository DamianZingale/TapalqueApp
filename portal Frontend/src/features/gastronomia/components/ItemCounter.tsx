
import type { FC } from 'react';
import { Button } from 'react-bootstrap';

interface ItemCounterProps {
  quantity: number;
  onChange: (newQuantity: number) => void;
}

export const ItemCounter: FC<ItemCounterProps> = ({ quantity, onChange }) => {

  const handleAdd = () => onChange(quantity + 1);

  const handleSubtract = () => {
    if (quantity === 0) return;
    onChange(quantity - 1);
  };

  return (
    <section className="item-row d-flex align-items-center gap-2">
      <Button variant="outline-secondary" onClick={handleSubtract}>-1</Button>
      <span style={{ color: quantity === 0 ? 'gray' : 'black' }}>{quantity}</span>
      <Button variant="outline-secondary" onClick={handleAdd}>+1</Button>
    </section>
  );
};
