import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../../shared/layouts/MainLayouts';
import { AdminSelector } from './pages/AdminSelector';
import { GastronomiaDashboard } from './gastronomia/GastronomiaDashboard';
import { HosteleriaDashboard } from './hosteleria/HosteleriaDashboard';

export function AdministradoresRoutes() {
  return (
    <MainLayout>
      <Routes>
        {/* Selector de negocios - Dashboard general */}
        <Route index element={<AdminSelector />} />

        {/* Rutas de Gastronomía */}
        <Route path="gastronomia/:id" element={<GastronomiaDashboard />} />
        <Route path="gastronomia/:id/menu" element={<GastronomiaDashboard />} />
        <Route path="gastronomia/:id/pedidos" element={<GastronomiaDashboard />} />
        <Route path="gastronomia/:id/configuracion" element={<GastronomiaDashboard />} />

        {/* Rutas de Hostelería */}
        <Route path="hosteleria/:id" element={<HosteleriaDashboard />} />
        <Route path="hosteleria/:id/habitaciones" element={<HosteleriaDashboard />} />
        <Route path="hosteleria/:id/reservas" element={<HosteleriaDashboard />} />
        <Route path="hosteleria/:id/configuracion" element={<HosteleriaDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default AdministradoresRoutes;
