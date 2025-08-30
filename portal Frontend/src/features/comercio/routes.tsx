import { Routes, Route } from "react-router-dom";
import ComercioListPage from "./pages/ComercioListPages";
import ComercioDetailPage from "./pages/ComercioDetailsPages";

export default function ComercioRoutes() {
    return (
        <Routes>
            <Route path="/" element={<ComercioListPage />} />
            <Route path=":id" element={<ComercioDetailPage />} />
        </Routes>
    );
}