import { Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { Business } from '../types';

interface BusinessCardProps {
  business: Business;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const navigate = useNavigate();

  const handleModificar = () => {
    const tipo = business.type.toLowerCase();
    navigate(`/business-admin/${tipo}/${business.id}/modificar`);
  };

  const handleAdministrar = () => {
    const tipo = business.type.toLowerCase();
    navigate(`/business-admin/${tipo}/${business.id}/administrar`);
  };

  const getTypeBadge = () => {
    return business.type === 'GASTRONOMIA'
      ? { variant: 'success', icon: '🍽️', label: 'Gastronomía' }
      : { variant: 'primary', icon: '🏨', label: 'Hospedaje' };
  };

  const typeBadge = getTypeBadge();

  return (
    <Card className="h-100 shadow-sm business-card">
      {business.imageUrl ? (
        <Card.Img
          variant="top"
          src={business.imageUrl}
          alt={business.name}
          style={{ height: '180px', objectFit: 'cover' }}
        />
      ) : (
        <div
          className="d-flex align-items-center justify-content-center bg-light"
          style={{ height: '180px' }}
        >
          <span style={{ fontSize: '4rem' }}>
            {business.type === 'GASTRONOMIA' ? '🍽️' : '🏨'}
          </span>
        </div>
      )}

      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="mb-0 h5">{business.name}</Card.Title>
          <Badge bg={typeBadge.variant as 'success' | 'primary'}>
            {typeBadge.icon} {typeBadge.label}
          </Badge>
        </div>

        {business.address && (
          <Card.Text className="text-muted small mb-2">
            📍 {business.address}
          </Card.Text>
        )}

        {business.phone && (
          <Card.Text className="text-muted small mb-2">
            📞 {business.phone}
          </Card.Text>
        )}

        <div className="mt-auto d-flex gap-2">
          <Button
            variant="outline-primary"
            className="flex-fill"
            onClick={handleModificar}
          >
            ✏️ Modificar
          </Button>
          <Button
            variant="primary"
            className="flex-fill"
            onClick={handleAdministrar}
          >
            ⚙️ Administrar
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
