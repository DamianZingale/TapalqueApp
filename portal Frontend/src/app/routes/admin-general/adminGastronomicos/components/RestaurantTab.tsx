import { useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import { DatosBase } from "./DatosBaseTab";
import { PlatosTab } from "./PlatosTab";
import { DeliveryCard } from "./DeliveryCard";
import { Accordion } from "react-bootstrap";
import type { Delivery} from "../types/interfaces";
import { MenuAdmin } from "./MenuAdmin";

export function RestaurantTabs() {

  const [key, setKey] = useState("Pedidos");
  const [enviados, setEnviados] = useState<(Delivery & { horario: string })[]>([]); 
  
  const [deliveries, setDeliveries] = useState<Delivery[]>([
    {
      id: 1,
      items: [
        { id: 1, dish_name: "Pizza Margarita", price: 500, cantidad: 2 },
        { id: 2, dish_name: "Ensalada César", price: 300, cantidad: 1 },
      ],
      total: 1300,
      delivery: true,
      address: "Calle Falsa 123",
      status: "En preparación",
    },
    {
      id: 2,
      items: [
        { id: 3, dish_name: "Hamburguesa Doble", price: 700, cantidad: 1 },
        { id: 4, dish_name: "Papas Fritas", price: 250, cantidad: 2 },
      ],
      total: 1200,
      delivery: false,
      address: "",
      status: "Listo",
    },
  ]);

 const handleEnviar = (id: number) => {
  if (enviados.some((p) => p.id === id)) return;
  const pedido = deliveries.find((d) => d.id === id);
  if (!pedido) return;

  const horario = new Date().toLocaleTimeString();
  
  // Guardamos todo el pedido
  setEnviados((prev) => [...prev, { ...pedido, horario }]);

  // Sacamos del listado principal
  setDeliveries((prev) => prev.filter((d) => d.id !== id));
};

  return (
    <Tabs
      activeKey={key}
      onSelect={(k) => setKey(k || "Pedidos")}
      id="restaurant-tabs"
      className="mb-3"
    >
      <Tab eventKey="Datos Base" title="Datos Base">
        <DatosBase />
      </Tab>
      <Tab eventKey="Platos" title="Platos">
        <PlatosTab />
      </Tab>
      <Tab eventKey="Pedidos" title="Pedidos">
        <Row>
          {deliveries.map((delivery) => (
            <Col key={delivery.id} xs={12} md={6} lg={4} className="mb-3">
              <DeliveryCard delivery={delivery} onEnviar={handleEnviar} />
            </Col>
          ))}
        </Row>

        {/*Listado global de pedidos enviados */}
        {enviados.length > 0 && (
  <>
    <h4 className="mt-4">Pedidos enviados</h4>
    <Accordion>
      {enviados.map((pedido) => (
        <Accordion.Item eventKey={pedido.id.toString()} key={pedido.id}>
          <Accordion.Header>
            Pedido #{pedido.id} – {pedido.address || "Retiro en local"} – {pedido.horario}
          </Accordion.Header>
          <Accordion.Body>
  <ListGroup>
    {pedido.items.map((item) => (
      <ListGroup.Item key={item.id}>
        {item.dish_name} x {item.cantidad} = ${item.price * item.cantidad}
      </ListGroup.Item>
    ))}
  </ListGroup>
  <div>Total: ${pedido.total}</div>
</Accordion.Body>
        </Accordion.Item>
      ))}
    <button className="btn btn-secondary mt-3" onClick={() => setEnviados([])}>Limpiar Pedidos</button>      
    </Accordion>
  </>
        )}
      </Tab>
      <Tab eventKey="Menu" title="Menu">
        <MenuAdmin/>
      </Tab>
    </Tabs>
  );
}
