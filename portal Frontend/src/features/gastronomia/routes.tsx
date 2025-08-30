import { Routes, Route } from "react-router-dom";
import GastronomiaListPage from "./pages/GastronomiaListPages";
import GastronomiaDetailPage from "./pages/GastronomiaDetailPages";

export default function GastronomiaRoutes() {
    return (
        <Routes>
            <Route path="/" element={<GastronomiaListPage />} />
            <Route path=":id" element={<GastronomiaDetailPage />} />
        </Routes>
    );
}