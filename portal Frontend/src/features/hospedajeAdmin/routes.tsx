import { Routes, Route } from "react-router-dom";
import {HospedajeEdit} from "./pages/HospedajeEdit";

export default function HospedajeAdmin() {
    return (
        <Routes>
        {/* Listado principal de hospedajes (pendiente de crear) */}
        {/* <Route path="/" element={<HospedajeList />} /> */}

        {/* Editar un hospedaje */}
        <Route path="edit/:id" element={<HospedajeEdit />} />

        {/* Crear nuevo hospedaje (opcional) */}
        {/* <Route path="create" element={<HospedajeCreate />} /> */}
        </Routes>
    );
}
