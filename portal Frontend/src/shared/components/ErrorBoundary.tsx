import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const CHUNK_ERROR_RELOAD_KEY = 'chunk_error_reloaded';

function isChunkLoadError(error: Error): boolean {
  return (
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Loading chunk') ||
    error.message.includes('Importing a module script failed')
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Si es un error de chunk (deploy nuevo), recarga automáticamente una sola vez
    if (isChunkLoadError(error)) {
      const alreadyReloaded = sessionStorage.getItem(CHUNK_ERROR_RELOAD_KEY);
      if (!alreadyReloaded) {
        sessionStorage.setItem(CHUNK_ERROR_RELOAD_KEY, '1');
        window.location.reload();
        return;
      }
    }
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="alert alert-warning m-3">
          <h5 className="alert-heading">⚠️ Error inesperado</h5>
          <p className="mb-0">
            Ocurrió un error al cargar este componente. Por favor, recarga la página.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary>Detalles técnicos</summary>
              <pre className="mt-2 p-2 bg-light small">
                {this.state.error?.stack}
              </pre>
            </details>
          )}
          <button
            className="btn btn-sm btn-outline-primary mt-2"
            onClick={() => window.location.reload()}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Componente de loading mejorado con skeleton animado
 */
export const LoadingSkeleton = ({ 
  count = 1, 
  height = '200px', 
  showText = true,
  variant = 'card' as 'card' | 'list' | 'detail'
}: { 
  count?: number; 
  height?: string; 
  showText?: boolean;
  variant?: 'card' | 'list' | 'detail';
}) => {
  const getSkeletonContent = (index: number) => {
    switch (variant) {
      case 'card':
        return (
          <div className="card mb-3">
            <div 
              className="skeleton-image"
              style={{ height: height || '200px' }}
            />
            <div className="card-body">
              <div className="skeleton-title mb-2"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div className="d-flex mb-3 p-3 border rounded">
            <div 
              className="skeleton-thumbnail me-3"
              style={{ width: '80px', height: '80px', flexShrink: 0 }}
            />
            <div className="flex-grow-1">
              <div className="skeleton-title mb-2"></div>
              <div className="skeleton-text mb-1"></div>
              <div className="skeleton-text short"></div>
            </div>
          </div>
        );
      
      case 'detail':
        return (
          <div>
            <div 
              className="skeleton-image mb-4"
              style={{ height: height || '300px' }}
            />
            <div className="skeleton-title-large mb-3"></div>
            <div className="skeleton-text mb-2"></div>
            <div className="skeleton-text mb-2"></div>
            <div className="skeleton-text short mb-4"></div>
            <div className="row">
              <div className="col-md-6">
                <div className="skeleton-field mb-2"></div>
              </div>
              <div className="col-md-6">
                <div className="skeleton-field mb-2"></div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="mb-3">
            <div 
              className="placeholder w-100" 
              style={{ height }}
            />
            {showText && (
              <div className="mt-2">
                <div className="placeholder col-4"></div>
                <div className="placeholder col-6 ms-2"></div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {getSkeletonContent(index)}
        </div>
      ))}
    </>
  );
};

/**
 * Skeleton para grids de tarjetas
 */
export const GridSkeleton = ({ 
  cols = 3, 
  rows = 2 
}: { 
  cols?: number; 
  rows?: number;
}) => (
  <div className="row">
    {Array.from({ length: rows * cols }).map((_, index) => (
      <div key={index} className="col-md-6 col-lg-4 mb-4">
        <LoadingSkeleton variant="card" height="200px" />
      </div>
    ))}
  </div>
);

/**
 * Componente para mostrar errores de API de forma consistente
 */
export const ApiErrorDisplay = ({ 
  error, 
  onRetry 
}: { 
  error: string | Error; 
  onRetry?: () => void;
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <div className="alert alert-danger d-flex align-items-center">
      <div className="me-3">⚠️</div>
      <div className="flex-grow-1">
        <strong>Error de conexión</strong>
        <div className="small">{errorMessage}</div>
      </div>
      {onRetry && (
        <button 
          className="btn btn-sm btn-outline-danger"
          onClick={onRetry}
        >
          Reintentar
        </button>
      )}
    </div>
  );
};