import { Routes, Route } from "react-router-dom";
import ServiciosListPage from "./pages/ServiciosListPages";
import ServiciosDetailPage from "./pages/ServiciosDetailPages";

export default function ServiciosRoutes() {
    return (
        <Routes>
        <Route path="/" element={<ServiciosListPage />} />
        <Route path=":id" element={<ServiciosDetailPage />} />
        </Routes>
    );
}
