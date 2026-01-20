import { useState, useEffect } from 'react';
import { RobustImageLoader } from '../utils/imageLoader';

interface RobustImageProps {
  src?: string;
  alt: string;
  category?: 'comercio' | 'gastronomia' | 'hospedaje' | 'servicios' | 'eventos' | 'espacios' | 'termas';
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

export function RobustImage({
  src,
  alt,
  category = 'servicios',
  className = '',
  style = {},
  onLoad,
  onError
}: RobustImageProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      setError(null);

      try {
        const finalUrl = await RobustImageLoader.getFirstAvailableImage(
          src ? [src] : [],
          category
        );
        setImageUrl(finalUrl);
        onLoad?.();
      } catch (err) {
        console.warn('Error en RobustImage:', err);
        setError('No se pudo cargar la imagen');
        onError?.('Error cargando imagen');
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [src, category]);

  if (loading) {
    return (
      <div 
        className={`${className} bg-light d-flex align-items-center justify-content-center`}
        style={{
          ...style,
          minHeight: '200px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'loading 1.5s infinite'
        }}
      >
        <div className="spinner-border spinner-border-sm text-muted" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`${className} bg-light d-flex align-items-center justify-content-center border`}
        style={{ ...style, minHeight: '200px' }}
      >
        <div className="text-center text-muted">
          <div className="mb-2">📷</div>
          <small>No disponible</small>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
    />
  );
}