import { Routes, Route } from "react-router-dom";
import HospedajeListPage from "./pages/HospedajeListPage";
import HospedajeDetailPage from "./pages/HospedajeDetailPage";
import { ReservaDetailPage } from "./pages/ReservaDetailPage";

export default function HospedajeRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HospedajeListPage />} />
            <Route path=":id" element={<HospedajeDetailPage />} />
            <Route path=":id/reserva/:fecha" element={<ReservaDetailPage />} />
        </Routes>
    );
}