import { Routes, Route } from "react-router-dom";
import GastronomiaListPage from "./pages/GastronomiaListPages";
import GastronomiaDetailPage from "./pages/GastronomiaDetailPages";
import { GastronomiaAdminPage } from "./pages/GastronomiaAdminPage";

export default function GastronomiaRoutes() {
    return (
        <Routes>
            <Route path="/" element={<GastronomiaListPage />} />
            <Route path=":id" element={<GastronomiaDetailPage />} />
            <Route path="admin" element={<GastronomiaAdminPage />} />
        </Routes>
    );
}