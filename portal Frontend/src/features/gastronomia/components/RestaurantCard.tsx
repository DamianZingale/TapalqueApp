import { ButtonComoLlegar } from '../../../shared/components/ButtonComoLlegar';
import type { IRestaurantInfo } from '../types/IrestaurantInfo';

interface InfoProps extends IRestaurantInfo {
  onVerMenu: () => void;
  showMenu: boolean;
}

export const Info: React.FC<InfoProps> = ({
  name,
  address,
  phone,
  email,
  delivery,
  imageUrl,
  schedule,
  category,
  destination,
  onVerMenu,
  showMenu,
}) => {
  return (
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
              📞 <strong>Tel:</strong> {phone}
            </p>
            <p className="mb-1">
              ✉️ <strong>Email:</strong> {email}
            </p>

            <p className="mb-1">
              🚚 <strong>Servicio:</strong>{' '}
              {delivery ? 'Delivery disponible' : 'Solo en el local'}
            </p>

            {category && (
              <p className="mb-1">
                🍽️ <strong>Categoría:</strong> {category}
              </p>
            )}

            {schedule && (
              <p className="mb-1">
                🕒 <strong>Horario:</strong> {schedule}
              </p>
            )}
          </div>

          {/* Columna central - imagen */}
          <div className="col-md-6 text-center">
            <img
              src={imageUrl}
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
                destination?.lat && destination?.lng
                  ? {
                      lat: String(destination.lat),
                      lng: String(destination.lng),
                    }
                  : { lat: '0', lng: '0' }
              }
            />

            <button className="btn btn-primary mt-3 w-100" onClick={onVerMenu}>
              {showMenu ? 'Ocultar Menú' : 'Ver Menú'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
