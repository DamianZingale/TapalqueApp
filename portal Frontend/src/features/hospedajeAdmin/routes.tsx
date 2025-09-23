import { Routes, Route } from "react-router-dom";
import { HospedajeEdit } from "./pages/HospedajeEdit";

export default function HospedajeRoutes() {
    return (
        <Routes>
        <Route path="edit" element={<HospedajeEdit />} />
        </Routes>
    );
}