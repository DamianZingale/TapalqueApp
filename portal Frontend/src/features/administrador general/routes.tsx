import { Route, Routes } from "react-router-dom";
import { AdministradorGeneralPage } from "./pages/AdministradorGeneralPage";
import { AdminGralComerciosPage } from "./pages/AdminGralComerciosPage";
import { AdminGralGastronomicosPage } from "./pages/AdminGralGastronomicosPage";
import { AdminGralHospedajesPage } from "./pages/AdminGralHospedajesPage";
import { AdminGralServiciosPage } from "./pages/AdminGralServiciosPage";
import { AdminGralUsuariosPage } from "./pages/AdminGralUsuariosPage";

export default function AdministradorGeneralRoutes(){
    return(
        <Routes>
            <Route path="/" element={<AdministradorGeneralPage />} />
            <Route path="gastronomicos" element={<AdminGralGastronomicosPage />} />
            <Route path="hospedajes" element={<AdminGralHospedajesPage />} />
            <Route path="comercios" element={<AdminGralComerciosPage />} />
            <Route path="servicios" element={<AdminGralServiciosPage />} />
            <Route path="usuarios" element={<AdminGralUsuariosPage />} />
        </Routes>
    )
}