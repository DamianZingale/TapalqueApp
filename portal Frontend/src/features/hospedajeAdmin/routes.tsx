import { Routes, Route } from "react-router-dom";
import { HospedajeEdit } from "./pages/HospedajeEdit";
import  {HospedajeReservas}  from "./pages/HospedajeReservas";
import { MenuAdmin } from "./pages/MenuAdmin";

export default function HospedajeAdmin() {
    return (
        <Routes>
        <Route path="/" element={<MenuAdmin />} />
        <Route path="edit/:id" element={<HospedajeEdit />} />
        <Route path="reservas/:id" element={<HospedajeReservas />} />
        </Routes>
    );
}