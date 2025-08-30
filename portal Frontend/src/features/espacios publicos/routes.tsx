import { Routes, Route } from "react-router-dom";
import EsPublicosListPage from "./pages/EsPublicosListPages";
import EsPublicosDetailPage from "./pages/EsPublicosDetailPages";

export default function EsPublicosRoutes() {
    return (
        <Routes>
            <Route path="/" element={<EsPublicosListPage />} />
            <Route path=":id" element={<EsPublicosDetailPage />} />
        </Routes>
    );
}