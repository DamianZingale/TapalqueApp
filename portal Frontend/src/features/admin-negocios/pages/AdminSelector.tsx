import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BusinessCard } from '../components/BusinessCard';
import { fetchUserBusinesses } from '../services/businessService';
import { authService } from '../../../services/authService';
import type { Business, BusinessType } from '../types';

export function AdminSelector() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = authService.getUser();
      if (!user?.id) {
        setError('No se pudo obtener la información del usuario');
        navigate('/login');
        return;
      }

      const data = await fetchUserBusinesses(String(user.id));
      setBusinesses(data);

      if (data.length === 0) {
        setError('No tienes negocios registrados. Contacta al administrador para asociar un negocio a tu cuenta.');
      }
    } catch (err) {
      console.error('Error loading businesses:', err);
      setError('Error al cargar los negocios. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Separar negocios por tipo
  const gastronomiaBusiness = businesses.filter(b => b.type === 'GASTRONOMIA');
  const hosteleriaBusiness = businesses.filter(b => b.type === 'HOSPEDAJE');

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando tus negocios...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h1 className="h2 mb-2">Panel de Administrador</h1>
        <p className="text-muted">
          Selecciona un negocio para administrar
        </p>
      </div>

      {error && (
        <Alert variant="warning" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Sección Gastronomía */}
      {gastronomiaBusiness.length > 0 && (
        <div className="mb-5">
          <h3 className="h4 mb-3 border-bottom pb-2">
            🍽️ Gastronomía ({gastronomiaBusiness.length})
          </h3>
          <Row xs={1} md={2} lg={3} className="g-4">
            {gastronomiaBusiness.map((business) => (
              <Col key={`gastronomia-${business.id}`}>
                <BusinessCard business={business} />
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Sección Hostelería */}
      {hosteleriaBusiness.length > 0 && (
        <div className="mb-5">
          <h3 className="h4 mb-3 border-bottom pb-2">
            🏨 Hostelería ({hosteleriaBusiness.length})
          </h3>
          <Row xs={1} md={2} lg={3} className="g-4">
            {hosteleriaBusiness.map((business) => (
              <Col key={`hosteleria-${business.id}`}>
                <BusinessCard business={business} />
              </Col>
            ))}
          </Row>
        </div>
      )}

      {businesses.length === 0 && !error && (
        <div className="text-center py-5">
          <div style={{ fontSize: '4rem' }}>🏪</div>
          <h3 className="mt-3">No hay negocios</h3>
          <p className="text-muted">
            Aún no tienes negocios asociados a tu cuenta
          </p>
        </div>
      )}
    </Container>
  );
}
