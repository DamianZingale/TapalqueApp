import { createBrowserRouter, Navigate } from "react-router-dom";

// Importá las páginas que quieras usar en cada ruta
import MainLayout from "../../shared/layouts/MainLayouts";
import HomeRoutes from "../../features/home/routes";
import ComercioRoutes from "../../features/comercio/routes";
import GastronomiaRoutes from "../../features/gastronomia/routes";
import HospedajeRoutes from "../../features/hospedaje/routes";
import EsPublicosRoutes from "../../features/espacios publicos/routes";
import ServiciosRoutes from "../../features/servicios/routes";
import TermasRoutes from "../../features/termas/routes";
import LoginPage from "../../features/LoginRegister/pages/LoginPage";
import RegisterPage from "../../features/LoginRegister/pages/RegisterPage";
import PerfilRoutes from "../../features/perfil/routes";
import HospedajeAdmin from "../../features/hospedajeAdmin/routes"

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
            { path: "/servicios/*", element: < ServiciosRoutes/> },
            { path: "/espublicos/*", element: <EsPublicosRoutes /> },
            { path: "/perfil/*", element: <PerfilRoutes /> },
            
            // Ruta comodín: si no existe redirige al inicio
            { path: "*", element: <Navigate to="/" /> },
        ],
    },
    // Rutas fuera del layout principal
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
    { path: "/admin/*", element: <HospedajeAdmin/> },
]);