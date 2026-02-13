import { Route, Routes } from 'react-router-dom';
import { PagoExitoPage } from './pages/PagoExitoPage';
import { PagoErrorPage } from './pages/PagoErrorPage';
import { PagoPendientePage } from './pages/PagoPendientePage';

export function PagoRoutes() {
  return (
    <Routes>
      <Route path="exito" element={<PagoExitoPage />} />
      <Route path="error" element={<PagoErrorPage />} />
      <Route path="pendiente" element={<PagoPendientePage />} />
    </Routes>
  );
}
