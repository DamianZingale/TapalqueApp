import { Routes, Route } from "react-router-dom";
import { PerfilPage } from "./pages/PerfilPage";

export default function PerfilRoutes() {
    return (
        <Routes>
            <Route path="/" element={<PerfilPage />} />
        </Routes>
    );
}