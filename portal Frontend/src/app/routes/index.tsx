import { createBrowserRouter, Navigate } from "react-router-dom";

// Importá las páginas que quieras usar en cada ruta
import MainLayout from "../../shared/layouts/MainLayouts";
import HomeRoutes from "../../features/home/routes";
import ComercioRoutes from "../../features/comercio/routes";
import GastronomiaRoutes from "../../features/gastronomia/routes";
import HospedajeRoutes from "../../features/hospedaje/routes";
import TermasRoutes from "../../features/termas/routes";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { path: "/", element: <HomeRoutes /> },
            { path: "/comercio/*", element: <ComercioRoutes /> },
            { path: "/gastronomia/*", element: <GastronomiaRoutes /> },
            { path: "/hospedaje/*", element: <HospedajeRoutes /> },
            { path: "/termas/*", element: <TermasRoutes /> },
            // Ruta comodín: si no existe redirige al inicio
            { path: "*", element: <Navigate to="/" /> },
        ],
    },
]);