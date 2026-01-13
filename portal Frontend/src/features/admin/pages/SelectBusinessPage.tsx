import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/authService';

interface Business {
  id: number;
  name: string;
  businessType: 'GASTRONOMIA' | 'HOSPEDAJE';
  externalBusinessId: number;
}

export const SelectBusinessPage = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      const user = authService.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const token = authService.getToken();
      const response = await fetch(`/api/business/user/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar negocios');
      }

      const data = await response.json();
      setBusinesses(data);
    } catch (err) {
      console.error('Error al cargar negocios:', err);
      setError('Error al cargar tus negocios. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessSelect = (business: Business) => {
    // Guardar el negocio seleccionado en el sessionStorage
    sessionStorage.setItem('selectedBusiness', JSON.stringify(business));

    // Redirigir al panel de control del negocio según el tipo
    if (business.businessType === 'GASTRONOMIA') {
      navigate(`/admin/gastronomia/${business.externalBusinessId}`);
    } else if (business.businessType === 'HOSPEDAJE') {
      navigate(`/admin/hospedaje/${business.externalBusinessId}`);
    }
  };

  const getBusinessIcon = (type: string) => {
    if (type === 'GASTRONOMIA') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          fill="currentColor"
          className="bi bi-shop"
          viewBox="0 0 16 16"
        >
          <path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.371 2.371 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976l2.61-3.045zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0zM1.5 8.5A.5.5 0 0 1 2 9v6h1v-5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5h6V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5zM4 15h3v-5H4v5zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3zm3 0h-2v3h2v-3z" />
        </svg>
      );
    } else {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          fill="currentColor"
          className="bi bi-building"
          viewBox="0 0 16 16"
        >
          <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1ZM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Z" />
          <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V1Zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3V1Z" />
        </svg>
      );
    }
  };

  const getBusinessTypeLabel = (type: string) => {
    return type === 'GASTRONOMIA' ? 'Gastronomía' : 'Hospedaje';
  };

  if (loading) {
    return (
      <div className="bg-light vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-secondary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando tus negocios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold text-secondary mb-3">
            Mis Negocios
          </h1>
          <p className="text-muted">
            Selecciona un negocio para acceder a su panel de administración
          </p>
        </div>

        {error && (
          <div className="alert alert-danger mx-auto" style={{ maxWidth: '600px' }}>
            {error}
          </div>
        )}

        {businesses.length === 0 ? (
          <div className="text-center py-5">
            <div className="text-muted mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                fill="currentColor"
                className="bi bi-inbox"
                viewBox="0 0 16 16"
              >
                <path d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4H4.98zm9.954 5H10.45a2.5 2.5 0 0 1-4.9 0H1.066l.32 2.562a.5.5 0 0 0 .497.438h12.234a.5.5 0 0 0 .496-.438L14.933 9zM3.809 3.563A1.5 1.5 0 0 1 4.981 3h6.038a1.5 1.5 0 0 1 1.172.563l3.7 4.625a.5.5 0 0 1 .105.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374l3.7-4.625z" />
              </svg>
            </div>
            <h3 className="text-muted">No tienes negocios registrados</h3>
            <p className="text-muted">
              Contacta con el administrador del sistema para agregar negocios a tu cuenta.
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {businesses.map((business) => (
              <div key={business.id} className="col-12 col-md-6 col-lg-4">
                <div
                  className="card h-100 shadow-sm border-0 hover-shadow"
                  style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                  onClick={() => handleBusinessSelect(business)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                >
                  <div className="card-body text-center p-4">
                    <div className="text-secondary mb-3">
                      {getBusinessIcon(business.businessType)}
                    </div>
                    <h5 className="card-title fw-bold mb-2">{business.name}</h5>
                    <p className="card-text text-muted small mb-3">
                      {getBusinessTypeLabel(business.businessType)}
                    </p>
                    <button className="btn btn-secondary btn-sm">
                      Acceder al Panel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-5">
          <button
            className="btn btn-outline-secondary"
            onClick={() => {
              authService.logout();
              navigate('/login');
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};
