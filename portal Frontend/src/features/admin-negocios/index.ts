// Exportaciones del módulo administradores

// Rutas
export { AdministradoresRoutes } from './routes';

// Páginas
export { AdminSelector } from './pages/AdminSelector';

// Dashboards
export { GastronomiaDashboard } from './gastronomia/GastronomiaDashboard';
export { HosteleriaDashboard } from './hosteleria/HosteleriaDashboard';

// Componentes compartidos
export { BusinessCard } from './components/BusinessCard';

// Hooks
export { useWebSocket } from './hooks/useWebSocket';

// Servicios
export { fetchUserBusinesses, fetchBusinessById, isBusinessOwner } from './services/businessService';

// Tipos
export type {
  Business,
  BusinessType,
  Pedido,
  Reserva,
  MenuItem,
  Habitacion
} from './types';
