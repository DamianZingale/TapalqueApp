import { AdministradorGeneralPage } from "./pages/AdministradorGeneralPage";
import { AdminGralComerciosPage } from "./pages/AdminGralComerciosPage";
import { AdminGralGastronomicosPage } from "./pages/AdminGralGastronomicosPage";
import { AdminGralHospedajesPage } from "./pages/AdminGralHospedajesPage";
import { AdminGralServiciosPage } from "./pages/AdminGralServiciosPage";
import { AdminGralUsuariosPage } from "./pages/AdminGralUsuariosPage";
import { NuevoComercioPage } from "./pages/NuevoComercioPage";
import { EditarComercioPage } from "./pages/EditarComercioPage";
import { NuevoGastronomicoPage } from "./pages/NuevoGastronomicoPage";
import { EditarGastronomicoPage } from "./pages/EditarGastronomicoPage";
import { NuevoHospedajePage } from "./pages/NuevoHospedajePage";
import { EditarHospedajePage } from "./pages/EditarHospedajePage";
import { NuevoServicioPage } from "./pages/NuevoServicioPage";
import { EditarServicioPage } from "./pages/EditarServicioPage";
import { NuevoUsuarioPage } from "./pages/NuevoUsuarioPage";
import { EditarUsuarioPage } from "./pages/EditarUsuarioPage";



const AdministradorGeneralRoutes = [
  {
    path: "",
    element: <AdministradorGeneralPage />,
  },
  {
    path: "gastronomicos",
    element: <AdminGralGastronomicosPage />,
  },
  {
    path: "gastronomicos/nuevo",
    element: <NuevoGastronomicoPage />,
  },
  {
    path: "gastronomicos/editar/:id",
    element: <EditarGastronomicoPage />,
  },
  {
    path: "hospedajes",
    element: <AdminGralHospedajesPage />,
  },
  {
    path: "hospedajes/nuevo",
    element: <NuevoHospedajePage />,
  },
  {
    path: "hospedajes/editar/:id",
    element: <EditarHospedajePage />,
  },
  {
    path: "comercios",
    element: <AdminGralComerciosPage />,
  },
  {
    path: "comercios/nuevo",
    element: <NuevoComercioPage />,
  },
  {
    path: "comercios/editar/:id",
    element: <EditarComercioPage />,
  },
  {
    path: "servicios",
    element: <AdminGralServiciosPage />,
  },
  {
    path: "servicios/nuevo",
    element: <NuevoServicioPage />,
  },
  {
    path: "servicios/editar/:id",
    element: <EditarServicioPage />,
  },
  {
    path: "usuarios",
    element: <AdminGralUsuariosPage />,
  },
  {
    path: "usuarios/nuevo",
    element: <NuevoUsuarioPage />,
  },
  {
    path: "usuarios/editar/:id",
    element: <EditarUsuarioPage />,
  },
  
];

export default AdministradorGeneralRoutes;
