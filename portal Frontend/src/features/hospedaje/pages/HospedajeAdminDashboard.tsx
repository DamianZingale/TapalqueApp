import { useState } from 'react';
import { Tabs, Tab, Container } from 'react-bootstrap';
import { GestionReservasTab } from '../components/admin/GestionReservasTab';
import { CalendarioDisponibilidadTab } from '../components/admin/CalendarioDisponibilidadTab';
import { GestionHabitacionesTab } from '../components/admin/GestionHabitacionesTab';

export const HospedajeAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<string>('reservas');

    return (
        <Container fluid className="py-4">
            <h1 className="mb-4">Dashboard de Hostelería</h1>

            <Tabs
                id="hospedaje-admin-tabs"
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k || 'reservas')}
                className="mb-3"
            >
                <Tab eventKey="reservas" title="📅 Reservas">
                    <GestionReservasTab />
                </Tab>

                <Tab eventKey="calendario" title="📆 Calendario">
                    <CalendarioDisponibilidadTab />
                </Tab>

                <Tab eventKey="habitaciones" title="🛏️ Habitaciones">
                    <GestionHabitacionesTab />
                </Tab>
            </Tabs>
        </Container>
    );
};
