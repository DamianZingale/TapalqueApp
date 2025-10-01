import { Row, Col, Form, Button } from "react-bootstrap";

export const DatosBase = () => {
  return (
    <div className="p-3">
      {/* Fila de Categorías */}
      <Row className="align-items-center mb-3 g-2">
        <Col xs={12} md={3}>
          <Form.Control type="text" placeholder="Agregar Categoría" />
        </Col>
        <Col xs={12} md="auto">
          <Button variant="primary" className="w-100 w-md-auto">
            Agregar
          </Button>
        </Col>
        <Col xs={12} md>
          <span className="text-muted">Pizza, Empanadas, Bebidas, Combo</span>
        </Col>
      </Row>

      {/* Fila de Restricciones */}
      <Row className="align-items-center mb-3 g-2">
        <Col xs={12} md={3}>
          <Form.Control type="text" placeholder="Agregar Restricción" />
        </Col>
        <Col xs={12} md="auto">
          <Button variant="secondary" className="w-100 w-md-auto">
            Agregar
          </Button>
        </Col>
        <Col xs={12} md>
          <span className="text-muted">Vegano, Celíaco, Sin lactosa</span>
        </Col>
      </Row>

      {/* Fila de Ingredientes */}
      <Row className="align-items-center mb-3 g-2">
        <Col xs={12} md={3}>
          <Form.Control type="text" placeholder="Agregar Ingrediente" />
        </Col>
        <Col xs={12} md="auto">
          <Button variant="success" className="w-100 w-md-auto">
            Agregar
          </Button>
        </Col>
        <Col xs={12} md>
          <span className="text-muted">Queso, Tomate, Jamón, Aceitunas</span>
        </Col>
      </Row>

      {/* Fila de Precio Delivery (debajo de todo) */}
      <Row className="align-items-center mb-3 g-2">
        <Col xs={12} md={3}>
          <Form.Control type="text" placeholder="Precio Delivery" /> {/*deberia traer el precio que esta en base de datos y si se modifica, actualizar en base de datos*/}
        </Col>
        <Col xs={12} md="auto">
          <Button variant="primary" className="w-100 w-md-auto">
            Agregar
          </Button>
        </Col>
      </Row>
    </div>
  );
};
