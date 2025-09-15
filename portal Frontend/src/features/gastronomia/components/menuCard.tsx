import React from 'react'
import type { Imenu } from '../types/Imenu'
import { Button, Card } from 'react-bootstrap';
import { quantityMenuButtons} from './quantityMenuButtons';


export const menuCard = (
     {id,
     dish_name, 
     price, 
     ingredients, 
     restrictions,
     picture} :Imenu) => {
 
    const [menu, setmenu] = React.useState<Imenu[]>([])

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

                <div >
                    <quantityMenuButtons />
                </div>

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
}
