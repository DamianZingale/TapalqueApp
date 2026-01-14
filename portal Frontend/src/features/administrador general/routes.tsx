import { Route, Routes } from "react-router-dom";
import { AdministradorGeneralPage } from "./pages/AdministradorGeneralPage";
import { AdminGralComerciosPage } from "./pages/AdminGralComerciosPage";
import { AdminGralGastronomicosPage } from "./pages/AdminGralGastronomicosPage";
import { AdminGralHospedajesPage } from "./pages/AdminGralHospedajesPage";
import { AdminGralServiciosPage } from "./pages/AdminGralServiciosPage";
import { AdminGralTermasPage } from "./pages/AdminGralTermasPage";
import { AdminGralEventosPage } from "./pages/AdminGralEventosPage";
import { AdminGralUsuariosPage } from "./pages/AdminGralUsuariosPage";
import { NuevoComercioPage } from "./pages/NuevoComercioPage";
import { EditarComercioPage } from "./pages/EditarComercioPage";
import { NuevoGastronomicoPage } from "./pages/NuevoGastronomicoPage";
import { EditarGastronomicoPage } from "./pages/EditarGastronomicoPage";
import { NuevoHospedajePage } from "./pages/NuevoHospedajePage";
import { EditarHospedajePage } from "./pages/EditarHospedajePage";
import { NuevoServicioPage } from "./pages/NuevoServicioPage";
import { EditarServicioPage } from "./pages/EditarServicioPage";
import { NuevoTermaPage } from "./pages/NuevoTermaPage";
import { EditarTermaPage } from "./pages/EditarTermaPage";
import { NuevoEventoPage } from "./pages/NuevoEventoPage";
import { EditarEventoPage } from "./pages/EditarEventoPage";
import { NuevoUsuarioPage } from "./pages/NuevoUsuarioPage";
import { EditarUsuarioPage } from "./pages/EditarUsuarioPage";

export default function AdministradorGeneralRoutes(){
    return(
        <Routes>
            <Route path="/" element={<AdministradorGeneralPage />} />
            <Route path="gastronomicos" element={<AdminGralGastronomicosPage />} />
            <Route path="gastronomicos/nuevo" element={<NuevoGastronomicoPage />} />
            <Route path="gastronomicos/editar" element={<EditarGastronomicoPage />} />
            
            <Route path="hospedajes" element={<AdminGralHospedajesPage />} />
            <Route path="hospedajes/nuevo" element={<NuevoHospedajePage />} />
            <Route path="hospedajes/editar" element={<EditarHospedajePage />} />
            
            <Route path="comercios" element={<AdminGralComerciosPage />}/>
            <Route path="comercios/nuevo" element={<NuevoComercioPage />} />
            <Route path="comercios/editar" element={<EditarComercioPage />} />
            
            <Route path="servicios" element={<AdminGralServiciosPage />} />
            <Route path="servicios/nuevo" element={<NuevoServicioPage />} />
            <Route path="servicios/editar" element={<EditarServicioPage />} />

            <Route path="termas" element={<AdminGralTermasPage />} />
            <Route path="termas/nuevo" element={<NuevoTermaPage />} />
            <Route path="termas/editar" element={<EditarTermaPage />} />

            <Route path="eventos" element={<AdminGralEventosPage />} />
            <Route path="eventos/nuevo" element={<NuevoEventoPage />} />
            <Route path="eventos/editar" element={<EditarEventoPage />} />

            <Route path="usuarios" element={<AdminGralUsuariosPage />} />
            <Route path="usuarios/nuevo" element={<NuevoUsuarioPage />} />
            <Route path="usuarios/editar" element={<EditarUsuarioPage />} />
        </Routes>
    )
}