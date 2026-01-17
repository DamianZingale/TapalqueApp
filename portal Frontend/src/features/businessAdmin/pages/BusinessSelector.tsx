import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BusinessCard } from '../components/BusinessCard';
import { fetchUserBusinesses } from '../services/businessService';
import { authService } from '../../../services/authService';
import type { Business } from '../types';

export function BusinessSelector() {
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
        <h1 className="h2 mb-2">Mis Negocios</h1>
        <p className="text-muted">
          Selecciona un negocio para modificar su contenido o administrar operaciones
        </p>
      </div>

      {error && (
        <Alert variant="warning" className="mb-4">
          {error}
        </Alert>
      )}

      {businesses.length > 0 && (
        <Row xs={1} md={2} lg={3} className="g-4">
          {businesses.map((business) => (
            <Col key={`${business.type}-${business.id}`}>
              <BusinessCard business={business} />
            </Col>
          ))}
        </Row>
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
