import { Route, Routes } from 'react-router-dom';
import ModeradorDashboard from '../moderador/pages/ModeradorDashboard';
import { ComerciosSection } from '../moderador/components/ComerciosSection';
import { EspaciosPublicosSection } from '../moderador/components/EspaciosPublicosSection';
import { EventosSection } from '../moderador/components/EventosSection';
import { GastronomiaSection } from '../moderador/components/GastronomiaSection';
import { HospedajesSection } from '../moderador/components/HospedajesSection';
import { ServiciosSection } from '../moderador/components/ServiciosSection';
import { TermasSection } from '../moderador/components/TermasSection';
import { AdminGralUsuariosPage } from './pages/AdminGralUsuariosPage';
import { EditarUsuarioPage } from './pages/EditarUsuarioPage';
import { NuevoUsuarioPage } from './pages/NuevoUsuarioPage';

export default function AdministradorGeneralRoutes() {
  return (
    <Routes>
      {/* /moderador */}
      <Route index element={<ModeradorDashboard />} />

      {/* /moderador/* */}
      <Route path="gastronomicos" element={<GastronomiaSection />} />
      <Route path="hospedajes" element={<HospedajesSection />} />
      <Route path="comercios" element={<ComerciosSection />} />
      <Route path="servicios" element={<ServiciosSection />} />
      <Route path="termas" element={<TermasSection />} />
      <Route path="eventos" element={<EventosSection />} />
      <Route path="espacios" element={<EspaciosPublicosSection />} />

      {/* /moderador/usuarios */}
      <Route path="usuarios" element={<AdminGralUsuariosPage />} />
      <Route path="usuarios/nuevo" element={<NuevoUsuarioPage />} />
      <Route path="usuarios/editar" element={<EditarUsuarioPage />} />
    </Routes>
  );
}
