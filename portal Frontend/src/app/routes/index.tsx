import { createBrowserRouter, Navigate } from "react-router-dom";

// Layout principal
import MainLayout from "../../shared/layouts/MainLayouts";

// Rutas por feature
import HomeRoutes from "../../features/home/routes";
import ComercioRoutes from "../../features/comercio/routes";
import GastronomiaRoutes from "../../features/gastronomia/routes";
import HospedajeRoutes from "../../features/hospedaje/routes";
import EsPublicosRoutes from "../../features/espacios publicos/routes";
import ServiciosRoutes from "../../features/servicios/routes";
import TermasRoutes from "../../features/termas/routes";
import PerfilRoutes from "../../features/perfil/routes";

// Login/Register
import LoginPage from "../../features/LoginRegister/pages/LoginPage";
import RegisterPage from "../../features/LoginRegister/pages/RegisterPage";

// Administración
import HospedajeAdmin from "../../features/hospedajeAdmin/routes";
import AdministradorGeneralRoutes from "../../features/administrador general/routes";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
        { path: "/", element: <HomeRoutes /> },
        { path: "/termas/*", element: <TermasRoutes /> },
        { path: "/comercio/*", element: <ComercioRoutes /> },
        { path: "/gastronomia/*", element: <GastronomiaRoutes /> },
        { path: "/hospedaje/*", element: <HospedajeRoutes /> },
        { path: "/servicios/*", element: <ServiciosRoutes /> },
        { path: "/espublicos/*", element: <EsPublicosRoutes /> },
        { path: "/perfil/*", element: <PerfilRoutes /> },
        { path: "*", element: <Navigate to="/" /> }, // Ruta comodín
        ],
    },

  // Rutas fuera del layout principal
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },

  // Rutas de administración
    { path: "/admin/hospedaje/*", element: <HospedajeAdmin /> },
    { path: "/admin/general/*", element: <AdministradorGeneralRoutes /> },
    
]);