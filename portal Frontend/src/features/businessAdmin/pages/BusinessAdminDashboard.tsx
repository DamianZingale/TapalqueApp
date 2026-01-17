import { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Spinner, Alert, Button } from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchBusinessById } from '../services/businessService';
import { authService } from '../../../services/authService';
import type { Business, BusinessType } from '../types';

// Importar páginas de cada tipo
import { GastronomiaModificar } from './gastronomia/GastronomiaModificar';
import { GastronomiaAdministrar } from './gastronomia/GastronomiaAdministrar';
import { HospedajeModificar } from './hospedaje/HospedajeModificar';
import { HospedajeAdministrar } from './hospedaje/HospedajeAdministrar';

export function BusinessAdminDashboard() {
  const { tipo, id } = useParams<{ tipo: string; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determinar tab activo basado en la URL
  const getActiveTab = (): 'modificar' | 'administrar' => {
    if (location.pathname.includes('/administrar')) return 'administrar';
    return 'modificar';
  };

  const [activeTab, setActiveTab] = useState<'modificar' | 'administrar'>(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  useEffect(() => {
    loadBusiness();
  }, [tipo, id]);

  const loadBusiness = async () => {
    if (!tipo || !id) {
      navigate('/business-admin');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const businessType = tipo.toUpperCase() as BusinessType;
      if (businessType !== 'GASTRONOMIA' && businessType !== 'HOSPEDAJE') {
        setError('Tipo de negocio no válido');
        return;
      }

      const data = await fetchBusinessById(id, businessType);

      if (!data) {
        setError('No se encontró el negocio');
        return;
      }

      // Verificar que el usuario es dueño del negocio
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
    if (!tab || !tipo || !id) return;

    setActiveTab(tab as 'modificar' | 'administrar');
    navigate(`/business-admin/${tipo}/${id}/${tab}`);
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
        <Button variant="primary" onClick={() => navigate('/business-admin')}>
          Volver a Mis Negocios
        </Button>
      </Container>
    );
  }

  const isGastronomia = business.type === 'GASTRONOMIA';

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button
            variant="link"
            className="p-0 mb-2"
            onClick={() => navigate('/business-admin')}
          >
            ← Volver a Mis Negocios
          </Button>
          <h1 className="h3 mb-1">
            {isGastronomia ? '🍽️' : '🏨'} {business.name}
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
        <Tab eventKey="modificar" title={isGastronomia ? '📋 Menú' : '🛏️ Habitaciones'}>
          {activeTab === 'modificar' && (
            isGastronomia
              ? <GastronomiaModificar businessId={business.id} businessName={business.name} />
              : <HospedajeModificar businessId={business.id} businessName={business.name} />
          )}
        </Tab>

        <Tab eventKey="administrar" title={isGastronomia ? '📦 Pedidos' : '📅 Reservas'}>
          {activeTab === 'administrar' && (
            isGastronomia
              ? <GastronomiaAdministrar businessId={business.id} businessName={business.name} />
              : <HospedajeAdministrar businessId={business.id} businessName={business.name} />
          )}
        </Tab>
      </Tabs>
    </Container>
  );
}
