import { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Spinner, Alert, Button } from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchBusinessById } from '../services/businessService';
import { authService } from '../../../services/authService';
import type { Business } from '../types';
import { HosteleriaHabitaciones } from './HosteleriaHabitaciones';
import { HosteleriaReservas } from './HosteleriaReservas';
import { HosteleriaConfiguracion } from './HosteleriaConfiguracion';
import { HosteleriaPlanning } from './HosteleriaPlanning';

export function HosteleriaDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getActiveTab = (): 'habitaciones' | 'reservas' | 'configuracion' | 'planning' => {
    if (location.pathname.includes('/reservas')) return 'reservas';
    if (location.pathname.includes('/configuracion')) return 'configuracion';
    if (location.pathname.includes('/planning')) return 'planning';
    return 'habitaciones';
  };

  const [activeTab, setActiveTab] = useState<'habitaciones' | 'reservas' | 'configuracion' | 'planning'>(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  useEffect(() => {
    loadBusiness();
  }, [id]);

  const loadBusiness = async () => {
    if (!id) {
      navigate('/admin');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await fetchBusinessById(id, 'HOSPEDAJE');

      if (!data) {
        setError('No se encontró el negocio');
        return;
      }

      const user = authService.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      setBusiness(data);
    } catch (err) {
      console.error('Error loading business:', err);
      setError('Error al cargar el negocio');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string | null) => {
    if (!tab || !id) return;

    setActiveTab(tab as 'habitaciones' | 'reservas' | 'configuracion' | 'planning');
    navigate(`/admin/hosteleria/${id}/${tab}`);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando negocio...</p>
      </Container>
    );
  }

  if (error || !business) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || 'No se pudo cargar el negocio'}
        </Alert>
        <Button variant="primary" onClick={() => navigate('/admin')}>
          Volver a Mis Negocios
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button
            variant="link"
            className="p-0 mb-2"
            onClick={() => navigate('/admin')}
          >
            ← Volver a Mis Negocios
          </Button>
          <h1 className="h3 mb-1">
            🏨 {business.name}
          </h1>
          {business.address && (
            <p className="text-muted mb-0">📍 {business.address}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={handleTabChange}
        className="mb-4"
      >
        <Tab eventKey="habitaciones" title="🛏️ Habitaciones">
          {activeTab === 'habitaciones' && (
            <HosteleriaHabitaciones businessId={business.id} businessName={business.name} />
          )}
        </Tab>

        <Tab eventKey="reservas" title="📅 Reservas">
          {activeTab === 'reservas' && (
            <HosteleriaReservas businessId={business.id} businessName={business.name} />
          )}
        </Tab>

        <Tab eventKey="configuracion" title="⚙️ Configuración">
          {activeTab === 'configuracion' && (
            <HosteleriaConfiguracion businessId={business.id} businessName={business.name} />
          )}
        </Tab>

        <Tab eventKey="planning" title="📊 Planning">
          {activeTab === 'planning' && (
            <HosteleriaPlanning businessId={business.id} businessName={business.name} />
          )}
        </Tab>
      </Tabs>
    </Container>
  );
}
