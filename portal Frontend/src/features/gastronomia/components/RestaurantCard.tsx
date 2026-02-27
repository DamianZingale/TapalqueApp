import { useState } from 'react';
import { ButtonComoLlegar } from '../../../shared/components/ButtonComoLlegar';
import { fetchSaboresHabilitados, type SaborHeladeria } from '../../../services/fetchMenu';
import { formatScheduleDisplay } from '../../../shared/utils/scheduleUtils';
import type { IRestaurantInfo } from '../types/IrestaurantInfo';

interface InfoProps extends IRestaurantInfo {
  onVerMenu: () => void;
  showMenu: boolean;
}

export const Info: React.FC<InfoProps> = ({
  id,
  name,
  address,
  phones,
  email,
  delivery,
  imageUrl,
  schedule,
  categories,
  latitude,
  longitude,
  esHeladeria,
  onVerMenu,
  showMenu,
}) => {
  const [showSabores, setShowSabores] = useState(false);
  const [sabores, setSabores] = useState<SaborHeladeria[]>([]);
  const [loadingSabores, setLoadingSabores] = useState(false);

  const handleVerSabores = async () => {
    setShowSabores(true);
    if (sabores.length === 0) {
      setLoadingSabores(true);
      try {
        const data = await fetchSaboresHabilitados(String(id));
        setSabores(data);
      } catch (error) {
        console.error('Error cargando sabores:', error);
      } finally {
        setLoadingSabores(false);
      }
    }
  };

  return (
    <>
      <div className="container my-4">
        <div className="card p-3 shadow-sm">
          <div className="row align-items-center">
            {/* Columna izquierda - datos */}
            <div className="col-md-4">
              <h2 className="mb-2">{name}</h2>

              <p className="mb-1">
                📍 <strong>Dirección:</strong> {address}
              </p>
              <p className="mb-1">
                📞 <strong>Tel:</strong> {phones}
              </p>
              <p className="mb-1">
                ✉️ <strong>Email:</strong> {email}
              </p>

              <p className="mb-1">
                🚚 <strong>Servicio:</strong>{' '}
                {delivery ? 'Delivery disponible' : 'Solo en el local'}
              </p>

              {categories && (
                <p className="mb-1">
                  🍽️ <strong>Categoría:</strong> {categories}
                </p>
              )}

              {schedule && (
                <p className="mb-1">
                  🕒 <strong>Horario:</strong> {formatScheduleDisplay(schedule)}
                </p>
              )}
            </div>

            {/* Columna central - imagen */}
            <div className="col-md-6 text-center">
              <img
                src={imageUrl || 'https://via.placeholder.com/400x300/e9ecef/6c757d?text=Sin+imagen'}
                alt={name}
                className="img-fluid rounded"
                style={{
                  maxHeight: '250px',
                  objectFit: 'cover',
                  width: '100%',
                }}
              />
            </div>

            {/* Columna derecha - acciones */}
            <div className="col-md-2 text-center">
              <ButtonComoLlegar
                destination={
                  latitude && longitude
                    ? { lat: String(latitude), lng: String(longitude) }
                    : { lat: '0', lng: '0' }
                }
              />

              <button className="btn btn-primary mt-3 w-100" onClick={onVerMenu}>
                {showMenu ? 'Ocultar Menú' : 'Ver Menú'}
              </button>

              {esHeladeria && (
                <button
                  className="btn btn-outline-info mt-2 w-100"
                  onClick={handleVerSabores}
                >
                  🍦 Ver Sabores
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de sabores */}
      {showSabores && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowSabores(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">🍦 Sabores disponibles</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSabores(false)}
                />
              </div>
              <div className="modal-body">
                {loadingSabores ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="mt-2 text-muted">Cargando sabores...</p>
                  </div>
                ) : sabores.length === 0 ? (
                  <p className="text-center text-muted py-3">
                    No hay sabores disponibles por el momento.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '4px 0' }}>
                    {sabores.map((sabor) => (
                      <span
                        key={sabor.id}
                        style={{
                          display: 'inline-block',
                          padding: '5px 14px',
                          borderRadius: '16px',
                          fontSize: '0.88rem',
                          background: '#ffffff',
                          color: '#212529',
                          border: '1px solid #212529',
                        }}
                      >
                        {sabor.nombre}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSabores(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
