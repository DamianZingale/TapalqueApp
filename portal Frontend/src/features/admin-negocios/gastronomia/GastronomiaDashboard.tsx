import { useEffect, useState } from 'react';
import { Alert, Button, Container, Spinner, Tab, Tabs } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { authService } from '../../../services/authService';
import { fetchBusinessById } from '../services/businessService';
import type { Business } from '../types';
import { GastronomiaConfiguracion } from './GastronomiaConfiguracion';
import { GastronomiaMenu } from './GastronomiaMenu';
import { GastronomiaPedidos } from './GastronomiaPedidos';

type TabKey = 'menu' | 'pedidos' | 'configuracion';

export function GastronomiaDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getActiveTab = (): TabKey => {
    if (location.pathname.includes('/pedidos')) return 'pedidos';
    if (location.pathname.includes('/configuracion')) return 'configuracion';
    return 'menu';
  };

  const [activeTab, setActiveTab] = useState<TabKey>(getActiveTab());

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

      const data = await fetchBusinessById(id, 'GASTRONOMIA');

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
    } catch {
      setError('Error al cargar el negocio');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string | null) => {
    if (!tab || !id) return;

    const newTab = tab as TabKey;
    setActiveTab(newTab);
    navigate(`/admin/gastronomia/${id}/${newTab}`);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Cargando negocio...</p>
      </Container>
    );
  }

  if (error || !business) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error ?? 'No se pudo cargar el negocio'}
        </Alert>
        <Button onClick={() => navigate('/admin')}>Volver</Button>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <Button variant="link" onClick={() => navigate('/admin')}>
          ← Volver
        </Button>
        <h1 className="h3">{business.name}</h1>
      </div>

      <Tabs activeKey={activeTab} onSelect={handleTabChange}>
        <Tab eventKey="menu" title="Menú">
          {activeTab === 'menu' && (
            <GastronomiaMenu
              businessId={business.id}
              businessName={business.name}
            />
          )}
        </Tab>

        <Tab eventKey="pedidos" title="Pedidos">
          {activeTab === 'pedidos' && (
            <GastronomiaPedidos
              businessId={business.id}
              businessName={business.name}
            />
          )}
        </Tab>

        <Tab eventKey="configuracion" title="Configuración">
          {activeTab === 'configuracion' && (
            <GastronomiaConfiguracion
              businessId={business.id}
              businessName={business.name}
            />
          )}
        </Tab>
      </Tabs>
    </Container>
  );
}
