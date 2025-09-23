import { useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { DatosBase } from './DatosBaseTab';
import { PlatosTab } from './PlatosTab';

export function RestaurantTabs() {
    const [key, setKey] = useState('Pedidos');
  return (
    <Tabs
      activeKey={key}
      onSelect={(k) => setKey(k || 'Datos Pedidos')}
      id="restaurant-tabs"
      className="mb-3"
    >
      <Tab eventKey="Datos Base" title="Datos Base">
        <DatosBase/>
      </Tab>
      <Tab eventKey="Platos" title="Platos">
        <PlatosTab/>
      </Tab>
      <Tab eventKey="Pedidos" title="Pedidos" >
        Tab content for Contact
      </Tab>
      <Tab eventKey="Reservas" title="Reservas" >
        Tab content for Contact
      </Tab>
       <Tab eventKey="Menu" title="Menu">
        Tab content for Contact
      </Tab>
    </Tabs>
  );
}

