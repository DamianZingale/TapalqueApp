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
import EventosRoutes from "../../features/eventos/routes";
import PerfilRoutes from "../../features/perfil/routes";
import UserDashboardRoutes from "../../features/userDashboard/routes";

// Login/Register
import LoginPage from "../../features/LoginRegister/pages/LoginPage";
import RegisterPage from "../../features/LoginRegister/pages/RegisterPage";
import { VerifyEmail } from "../../features/LoginRegister/components/VerifyEmail";

// Administración
import { SelectBusinessPage } from "../../features/admin/pages/SelectBusinessPage";
import HospedajeAdmin from "../../features/hospedajeAdmin/routes";
import AdministradorGeneralRoutes from "../../features/administrador general/routes";
import ModeradorDashboard from "../../features/moderador/ModeradorDashboard";

// Business Admin (nuevo módulo unificado)
import { BusinessAdminRoutes } from "../../features/businessAdmin";

// Protección de rutas por rol
import { UserOnlyRoute, AdminOnlyRoute, ModeradorOnlyRoute } from "../../shared/components/ProtectedRoute";

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
        { path: "/eventos/*", element: <EventosRoutes /> },
        { path: "/espublicos/*", element: <EsPublicosRoutes /> },
        { path: "/perfil/*", element: <PerfilRoutes /> },
        { path: "/dashboard/*", element: <UserOnlyRoute><UserDashboardRoutes /></UserOnlyRoute> },
        { path: "*", element: <Navigate to="/" /> }, // Ruta comodín
        ],
    },

  // Rutas fuera del layout principal
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
    { path: "/verify-email", element: <VerifyEmail /> },

  // Rutas de administración (solo admin)
    { path: "/admin/select-business", element: <AdminOnlyRoute><SelectBusinessPage /></AdminOnlyRoute> },
    { path: "/admin/hospedaje/*", element: <AdminOnlyRoute><HospedajeAdmin /></AdminOnlyRoute> },
    { path: "/admin/general/*", element: <AdminOnlyRoute><AdministradorGeneralRoutes /></AdminOnlyRoute> },

  // Business Admin - Panel unificado para administradores de negocios
    { path: "/business-admin/*", element: <AdminOnlyRoute><BusinessAdminRoutes /></AdminOnlyRoute> },

  // Ruta de moderador (gestión de contenido público)
    { path: "/moderador", element: <ModeradorOnlyRoute><ModeradorDashboard /></ModeradorOnlyRoute> },
]);