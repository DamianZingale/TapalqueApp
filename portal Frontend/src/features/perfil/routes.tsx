import { Routes, Route } from "react-router-dom";
import { PerfilPage } from "./pages/PerfilPage";
import { DatosPersonalesPage } from "./pages/DatosPersonalesPage";
import { NotificacionesPages } from "./pages/NotificacionesPages";
import { MisPedidosPage } from "./pages/MisPedidosPage";
import { MisReservasPage } from "./pages/MisReservasPage";

export default function PerfilRoutes() {
    return (
        <Routes>
            <Route path="/" element={<PerfilPage />} />
            <Route path="/datosPersonales" element={<DatosPersonalesPage />} />
            <Route path="/notificaciones" element={<NotificacionesPages />} />
            <Route path="/misPedidos" element={<MisPedidosPage />} />
            <Route path="/misReservas" element={<MisReservasPage />} />
        </Routes>
    );
}