import React from 'react'
import type { Imenu } from '../types/Imenu'
import { Button, Card } from 'react-bootstrap';
import { QuantityMenuButtons } from '../components/QuantityMenuButtons';

export const MenuCard: React.FC<{ menu: Imenu[] }> = ({ menu }) => {

  const agregarPedido = (plato: Imenu) => {
    console.log("Agregado:", plato);
  };

  const [cantidades, setCantidades] = React.useState<{ [key: number]: number }>({});

  const aumentar = (id: number) => {
    setCantidades((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const disminuir = (id: number) => {
    setCantidades((prev) => ({ ...prev, [id]: Math.max((prev[id] || 0) - 1, 0) }));
  };

  return (
    <div className="container my-4">
      <h2 className="mb-4">Menú</h2>
      <div className="row">
        {menu.map((plato) => (
          <div className="col-md-4 mb-3" key={plato.id}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>{plato.dish_name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  ${plato.price}
                </Card.Subtitle>
                <Card.Text>
                  <strong>Ingredientes:</strong> {plato.ingredients} <br />
                  <strong>Restricción:</strong> {plato.restrictions}
                </Card.Text>

                <QuantityMenuButtons
                  platoId={plato.id}
                  cantidades={cantidades}
                  aumentar={aumentar}
                  disminuir={disminuir}
                />

                <Button variant="primary" onClick={() => agregarPedido(plato)}>
                  Agregar al pedido
                </Button>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};
