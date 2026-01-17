import { Routes, Route, Navigate } from 'react-router-dom';
import { BusinessSelector } from './pages/BusinessSelector';
import { BusinessAdminDashboard } from './pages/BusinessAdminDashboard';

export function BusinessAdminRoutes() {
  return (
    <Routes>
      {/* Selector de negocios */}
      <Route index element={<BusinessSelector />} />

      {/* Rutas de Gastronomía */}
      <Route path="gastronomia/:id" element={<BusinessAdminDashboard />} />
      <Route path="gastronomia/:id/modificar" element={<BusinessAdminDashboard />} />
      <Route path="gastronomia/:id/administrar" element={<BusinessAdminDashboard />} />

      {/* Rutas de Hospedaje */}
      <Route path="hospedaje/:id" element={<BusinessAdminDashboard />} />
      <Route path="hospedaje/:id/modificar" element={<BusinessAdminDashboard />} />
      <Route path="hospedaje/:id/administrar" element={<BusinessAdminDashboard />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/business-admin" replace />} />
    </Routes>
  );
}
