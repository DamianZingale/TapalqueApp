import { useEffect, useState } from 'react';
import { Alert, Button, Container, Spinner, Tab, Tabs } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { authService } from '../../../services/authService';
import { fetchBusinessById } from '../services/businessService';
import type { Business } from '../types';
import { GastronomiaConfiguracion } from './GastronomiaConfiguracion';
import { GastronomiaMenu } from './GastronomiaMenu';
import { GastronomiaPedidos } from './GastronomiaPedidos';

export function GastronomiaDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getActiveTab = (): 'menu' | 'pedidos' | 'configuracion' => {
    if (location.pathname.includes('/pedidos')) return 'pedidos';
    if (location.pathname.includes('/configuracion')) return 'configuracion';
    return 'menu';
  };

  const [activeTab, setActiveTab] = useState<
    'menu' | 'pedidos' | 'configuracion'
  >(getActiveTab());

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
    } catch (err) {
      console.error('Error loading business:', err);
      setError('Error al cargar el negocio');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string | null) => {
    if (!tab || !id) return;

    setActiveTab(tab as 'menu' | 'pedidos' | 'configuracion');
    navigate(`/admin/gastronomia/${id}/${tab}`);
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
          <h1 className="h3 mb-1">🍽️ {business.name}</h1>
          {business.address && (
            <p className="text-muted mb-0">📍 {business.address}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onSelect={handleTabChange} className="mb-4">
        <Tab eventKey="menu" title="📋 Menú">
          {activeTab === 'menu' && (
            <GastronomiaMenu
              businessId={business.id}
              businessName={business.name}
            />
          )}
        </Tab>

        <Tab eventKey="pedidos" title="📦 Pedidos">
          {activeTab === 'pedidos' && (
            <GastronomiaPedidos
              businessId={business.id}
              businessName={business.name}
              allowDelivery={business.allowDelivery ?? false}
              deliveryPrice={business.deliveryPrice ?? 0}
            />
          )}
        </Tab>

        <Tab eventKey="configuracion" title="⚙️ Configuración">
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
