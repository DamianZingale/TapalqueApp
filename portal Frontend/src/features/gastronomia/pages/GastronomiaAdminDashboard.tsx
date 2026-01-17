import { useState } from 'react';
import { Tabs, Tab, Container } from 'react-bootstrap';
import { GestionMenuTab } from '../components/admin/GestionMenuTab';
import { GestionPedidosTab } from '../components/admin/GestionPedidosTab';
import { EstadisticasTab } from '../components/admin/EstadisticasTab';

export const GastronomiaAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<string>('pedidos');

    return (
        <Container fluid className="py-4">
            <h1 className="mb-4">Dashboard Gastronómico</h1>

            <Tabs
                id="gastronomia-admin-tabs"
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k || 'pedidos')}
                className="mb-3"
            >
                <Tab eventKey="pedidos" title="📋 Pedidos">
                    <GestionPedidosTab />
                </Tab>

                <Tab eventKey="menu" title="🍽️ Menú">
                    <GestionMenuTab />
                </Tab>

                <Tab eventKey="estadisticas" title="📊 Estadísticas">
                    <EstadisticasTab />
                </Tab>
            </Tabs>
        </Container>
    );
};
