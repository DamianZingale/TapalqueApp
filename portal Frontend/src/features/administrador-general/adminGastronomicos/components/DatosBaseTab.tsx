import { Row, Col, Form, Button } from "react-bootstrap";

export const DatosBase = () => {
  return (
    <div className="">
      {/* Fila de Categorías */}
      <Row className="">
        <Col xs={12} md={3}>
          <Form.Control type="text" placeholder="Agregar Categoría" />
        </Col>
        <Col xs={12} md="auto">
          <Button variant="primary" className="">
            Agregar
          </Button>
        </Col>
        <Col xs={12} md>
          <span className="">Pizza, Empanadas, Bebidas, Combo</span>
        </Col>
      </Row>

      {/* Fila de Restricciones */}
      <Row className="">
        <Col xs={12} md={3}>
          <Form.Control type="text" placeholder="Agregar Restricción" />
        </Col>
        <Col xs={12} md="auto">
          <Button variant="secondary" className="">
            Agregar
          </Button>
        </Col>
        <Col xs={12} md>
          <span className="">Vegano, Celíaco, Sin lactosa</span>
        </Col>
      </Row>

      {/* Fila de Ingredientes */}
      <Row className="">
        <Col xs={12} md={3}>
          <Form.Control type="text" placeholder="Agregar Ingrediente" />
        </Col>
        <Col xs={12} md="auto">
          <Button variant="success" className="">
            Agregar
          </Button>
        </Col>
        <Col xs={12} md>
          <span className="text-muted">Queso, Tomate, Jamón, Aceitunas</span>
        </Col>
      </Row>

      {/* Fila de Precio Delivery (debajo de todo) */}
      <Row className="">
        <Col xs={12} md={3}>
          <Form.Control type="text" placeholder="Precio Delivery" /> {/*deberia traer el precio que esta en base de datos y si se modifica, actualizar en base de datos*/}
        </Col>
        <Col xs={12} md="auto">
          <Button variant="primary" className="">
            Agregar
          </Button>
        </Col>
      </Row>
    </div>
  );
};
