import { getStatusText } from '../utils/scheduleUtils';
import type { CardProps } from '../types/ICardProps';

export const CardResto: React.FC<CardProps> = ({
  id,
  titulo,
  direccion_local,
  imagenUrl,
  tipo,
  schedule,
  onClick,
}) => {
  // Obtener estado de apertura si hay schedule
  const status = schedule ? getStatusText(schedule) : null;

  return (
    <div className="card my-2" style={{ width: '18rem', maxWidth: '100%' }}>
      <img
        src={imagenUrl}
        className="card-img-top p-1"
        alt={titulo}
        style={{ height: '180px', objectFit: 'cover' }}
      />
      <div className="card-body">
        <h5 className="card-title text-center">{titulo}</h5>

        {/* Badge de estado - compacto */}
        {status && (
          <div className="text-center mb-2">
            <span
              className={`badge ${
                status.isOpen ? 'bg-success' : 'bg-secondary'
              }`}
              style={{ fontSize: '0.75rem' }}
            >
              {status.isOpen ? '🟢' : '🔴'} {status.text}
            </span>
          </div>
        )}

        {direccion_local && (
          <p className="text-center text-muted small mb-2">{direccion_local}</p>
        )}

        <div className="d-grid gap-2 col-6 mx-auto">
          <button 
            onClick={onClick} 
            className="btn btn-secondary p-1"
          >
            Ver más
          </button>
        </div>
      </div>
    </div>
  );
};
