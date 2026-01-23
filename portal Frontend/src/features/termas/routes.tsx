import { Routes, Route } from "react-router-dom";
import TermasDetailPage from "./pages/TermasDetailsPages";

export default function TermasRoutes() {
    return (
        <Routes>
            {/* Termas es una sola - muestra la primera terma por defecto */}
            <Route path="/" element={<TermasDetailPage idDefault="1" />} />
            <Route path=":id" element={<TermasDetailPage />} />
        </Routes>
    );
}