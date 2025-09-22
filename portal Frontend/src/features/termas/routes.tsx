import { Routes, Route } from "react-router-dom";
import TermasDetailPage from "./pages/TermasDetailsPages";

export default function TermasRoutes() {
    return (
        <Routes>
            <Route path="/" element={<TermasDetailPage idDefault="termas-1" />} />
            <Route path=":id" element={<TermasDetailPage />} />
        </Routes>

    );
}