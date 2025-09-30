import { useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import type { Delivery } from "../types/interfaces";

const horario = new Date().toLocaleTimeString();

export function DeliveryCard({
  delivery,
  onEnviar,
}: {
  delivery: Delivery;
  onEnviar: (id: number, address: string, total: number) => void;
}) {

  const [estado, setEstado] = useState<Delivery["status"] | "A confirmar estado">("A confirmar estado");
  
  return (
    <Card
      style={{
        width: "22rem",
        marginBottom: "1rem",
        border:
          estado === "En preparación"
            ? "6px solid orange"
            : estado === "Listo"
            ? "6px solid green"
            : "1px solid #ddd"
      }}
    >
      <Card.Body>
        <Card.Title>Delivery #{delivery.id}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          {delivery.delivery ? "Con delivery" : "Para retirar"} –{" "}
          {delivery.address} {horario}
        </Card.Subtitle>

        <ListGroup className="mb-3">
          {delivery.items.map((item) => (
            <ListGroup.Item key={item.id}>
              {item.dish_name} x {item.cantidad} = ${item.price * item.cantidad}
            </ListGroup.Item>
          ))}
        </ListGroup>

        <div>Total: ${delivery.total}</div>
        <div className="mb-2">Estado: {estado}</div>

        <Button
          variant="warning"
          className="me-2"
          onClick={() => setEstado("En preparación")}
        >
          En preparación
        </Button>
        <Button variant="success" onClick={() => setEstado("Listo")}>
          Listo
        </Button>

        {estado === "Listo" && (
          <Button
            variant="primary"
            className="ms-2"
            onClick={() => onEnviar(delivery.id, delivery.address, delivery.total)}
          >
            Enviar
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}
