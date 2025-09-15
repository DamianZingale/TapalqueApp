import React from 'react'

interface QuantityMenuButtonsProps {
  platoId: number;
  cantidades: { [key: number]: number };
  aumentar: (id: number) => void;
  disminuir: (id: number) => void;
}

export const QuantityMenuButtons: React.FC<QuantityMenuButtonsProps> = ({
  platoId,
  cantidades,
  aumentar,
  disminuir,
}) => {
  return (
    <div className="d-flex align-items-center mb-3">
      <button className="btn btn-outline-secondary" onClick={() => disminuir(platoId)}>-</button>
      <span className="mx-3">{cantidades[platoId] || 0}</span>
      <button className="btn btn-outline-secondary" onClick={() => aumentar(platoId)}>+</button>
    </div>
  )
}
