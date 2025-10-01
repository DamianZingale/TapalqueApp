import { Routes, Route } from "react-router-dom";
import HospedajeListPage from "./pages/HospedajeListPage";
import HospedajeDetailPage from "./pages/HospedajeDetailPage";
import { HospedajeListsOptions } from "./pages/HospedajeListsOptions";
import { ConfirmacionPage } from "./pages/ConfirmacionPage";
import { HospedajeAdminPage } from "./pages/HospedajeAdminPage";

export default function HospedajeRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HospedajeListPage />} />
            <Route path=":id" element={<HospedajeDetailPage />} />
            <Route path="opciones" element={<HospedajeListsOptions />} />
            <Route path="confirmar" element={<ConfirmacionPage />} />
            <Route path="admin" element={<HospedajeAdminPage />} />
        </Routes>
    );
}