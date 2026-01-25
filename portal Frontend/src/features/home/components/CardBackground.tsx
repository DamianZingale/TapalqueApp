import { useEffect, useState } from 'react';
import { RobustImageLoader } from '../../../shared/utils/imageLoader';

interface CardBackgroundProps {
  titulo: string;
  imagenUrl?: string;
  onClick?: () => void;
  overlayOpacity?: number;
  fontSize?: string;
  letterSpacing?: string;
  extraClasses?: string;
  categoria?:
    | 'comercio'
    | 'gastronomia'
    | 'hospedaje'
    | 'servicios'
    | 'eventos'
    | 'espacios'
    | 'termas';
}

export const CardBackground: React.FC<CardBackgroundProps> = ({
  titulo,
  imagenUrl,
  onClick,
  overlayOpacity = 0.4,
  fontSize = '1.2rem',
  letterSpacing = '0.1em',
  extraClasses = '',
  categoria = 'servicios',
}) => {
  const [finalImageUrl, setFinalImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const url = await RobustImageLoader.getFirstAvailableImage(
          imagenUrl ? [imagenUrl] : [],
          categoria
        );
        setFinalImageUrl(url);
      } catch (error) {
        console.warn('Error cargando imagen de fondo:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [imagenUrl, categoria]);

  if (loading) {
    return (
      <div
        className={`card mb-4 ${extraClasses}`}
        style={{
          height: '170px',
          cursor: 'pointer',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          background:
            'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'loading 1.5s infinite',
        }}
        onClick={onClick}
      >
        <div className="d-flex justify-content-center align-items-center h-100">
          <div
            className="spinner-border spinner-border-sm text-muted"
            role="status"
          >
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`card text-white mb-4 ${extraClasses}`}
      style={{
        backgroundImage: `url(${finalImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '170px',
        cursor: 'pointer',
        borderRadius: '0.5rem',
        overflow: 'hidden',
      }}
      onClick={onClick}
    >
      <div
        className="card-img-overlay d-flex justify-content-center align-items-center g-0"
        style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
      >
        <h2 className="fw-bold text-center" style={{ fontSize, letterSpacing }}>
          {titulo}
        </h2>
      </div>
    </div>
  );
};
