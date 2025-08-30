import { Routes, Route } from "react-router-dom";
import TermasDetailPage from "./pages/TermasDetailsPages";

export default function TermasRoutes() {
    return (
        <Routes>
            <Route path="/" element={<TermasDetailPage />} />
        </Routes>
    );
}