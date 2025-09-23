import { Button, Form, Row, Col } from 'react-bootstrap'

export const DatosBase = () => {
  return (
    <div className="p-3">
      {/* Fila de Categorías */}
      <Row className="align-items-center mb-2">
        <Col xs={12} md={3}>
          <Form.Control type="text" placeholder="Agregar Categoría" />
        </Col>
        <Col xs={12} md="auto">
          <Button variant="primary" className="w-100 w-md-auto">Agregar</Button>
        </Col>
        <Col xs={12} md>
          <span style={{ color: 'grey' }}>Pizza, Empanadas, Bebidas, Combo</span>
        </Col>
      </Row>

      {/* Fila de Restricciones */}
      <Row className="align-items-center mb-2">
        <Col xs={12} md={3}>
          <Form.Control type="text" placeholder="Agregar Restricción" />
        </Col>
        <Col xs={12} md="auto">
          <Button variant="secondary" className="w-100 w-md-auto">Agregar</Button>
        </Col>
        <Col xs={12} md>
          <span style={{ color: 'grey' }}>Vegano, Celíaco, Sin lactosa</span>
        </Col>
      </Row>

      {/* Fila de Ingredientes */}
      <Row className="align-items-center mb-2">
        <Col xs={12} md={3}>
          <Form.Control type="text" placeholder="Agregar Ingrediente" />
        </Col>
        <Col xs={12} md="auto">
          <Button variant="success" className="w-100 w-md-auto">Agregar</Button>
        </Col>
        <Col xs={12} md>
          <span style={{ color: 'grey' }}>Queso, Tomate, Jamón, Aceitunas</span>
        </Col>
      </Row>
    </div>
  )
}
