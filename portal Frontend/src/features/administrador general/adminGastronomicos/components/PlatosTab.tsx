
import { Button, Col, Form, Row } from 'react-bootstrap'
import { IngredientesSelector } from './IngredientsSelector'

export const PlatosTab = () => {
  return (
    <>
    <h1>Insertar al menu</h1>
    <Row className="align-items-center mb-2">
        <Col xs={12} md={3}>
          <Form.Control type="text" placeholder="Agregar Plato" />
        </Col>
        <Col xs={12} md="auto">
          <Button variant="primary" className="w-30 w-md-auto">Agregar</Button>
        </Col>
    </Row>
    <Row>
        <Col xs={12} md={3}>
            <Form.Control type="text" placeholder="Precio" />
        </Col>
        <Col>
            <Button variant="primary" className="w-30 w-md-auto">Agregar</Button>

        </Col>
    </Row>
    <Row>
     <IngredientesSelector
                onAgregar={(ingredientes) => console.log("Seleccionados:", ingredientes)}
             />
    </Row>
    </>
  )
}
