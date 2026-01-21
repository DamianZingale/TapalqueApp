import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layout principal
import MainLayout from '../../shared/layouts/MainLayouts';

// Rutas públicas
import ComercioRoutes from '../../features/comercio/routes';
import EsPublicosRoutes from '../../features/espacios-publicos/routes';
import EventosRoutes from '../../features/eventos/routes';
import GastronomiaRoutes from '../../features/gastronomia/routes';
import HomeRoutes from '../../features/home/routes';
import HospedajeRoutes from '../../features/hospedaje/routes';
import PerfilRoutes from '../../features/perfil/routes';
import ServiciosRoutes from '../../features/servicios/routes';
import TermasRoutes from '../../features/termas/routes';

// Usuario
import UserDashboardRoutes from '../../features/user-dashboard/routes';

// Login / Register
import { VerifyEmail } from '../../features/auth/components/VerifyEmail';
import LoginPage from '../../features/auth/pages/LoginPage';
import RegisterPage from '../../features/auth/pages/RegisterPage';

// Administradores
import { AdministradoresRoutes } from '../../features/admin-negocios';

// Moderador
import { lazy } from 'react';
const ModeradorDashboard = lazy(() => import('../../features/moderador/pages/ModeradorDashboard'));

// Protección
import {
  AdminOnlyRoute,
  ModeradorOnlyRoute,
  UserOnlyRoute,
} from '../../shared/components/ProtectedRoute';
import { Suspense } from 'react';

export const router = createBrowserRouter([
  /**
   * ===============================
   * RUTAS PÚBLICAS (con layout)
   * ===============================
   */
  {
    path: '/*',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomeRoutes /> },

      { path: 'termas/*', element: <TermasRoutes /> },
      { path: 'comercio/*', element: <ComercioRoutes /> },
      { path: 'gastronomia/*', element: <GastronomiaRoutes /> },
      { path: 'hospedaje/*', element: <HospedajeRoutes /> },
      { path: 'servicios/*', element: <ServiciosRoutes /> },
      { path: 'eventos/*', element: <EventosRoutes /> },
      { path: 'espublicos/*', element: <EsPublicosRoutes /> },
      { path: 'perfil/*', element: <PerfilRoutes /> },

      {
        path: 'dashboard/*',
        element: (
          <UserOnlyRoute>
            <UserDashboardRoutes />
          </UserOnlyRoute>
        ),
      },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },

  /**
   * ===============================
   * AUTH
   * ===============================
   */
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/verify-email', element: <VerifyEmail /> },

  /**
   * ===============================
   * ADMINISTRADORES
   * ===============================
   */
  {
    path: '/admin/*',
    element: (
      <AdminOnlyRoute>
        <AdministradoresRoutes />
      </AdminOnlyRoute>
    ),
  },

  /**
   * ===============================
   * MODERADOR
   * ===============================
   */
  {
    path: '/moderador',
    element: (
      <ModeradorOnlyRoute>
        <MainLayout>
          <Suspense fallback={<div>Cargando dashboard...</div>}>
            <ModeradorDashboard />
          </Suspense>
        </MainLayout>
      </ModeradorOnlyRoute>
    ),
  },

  /**
   * ===============================
   * FALLBACK GLOBAL
   * ===============================
   */
  { path: '*', element: <Navigate to="/" replace /> },
]);
