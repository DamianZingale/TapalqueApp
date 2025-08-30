import { Routes, Route } from "react-router-dom";
import HospedajeListPage from "./pages/HospedajeListPage";
import HospedajeDetailPage from "./pages/HospedajeDetailPage";

export default function HospedajeRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HospedajeListPage />} />
            <Route path=":id" element={<HospedajeDetailPage />} />
        </Routes>
    );
}