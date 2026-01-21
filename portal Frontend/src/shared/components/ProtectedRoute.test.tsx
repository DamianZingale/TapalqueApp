import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute, UserOnlyRoute, AdminOnlyRoute, ModeradorOnlyRoute } from './ProtectedRoute';

// Mock del authService
vi.mock('../../services/authService', () => ({
  default: {
    isAuthenticated: vi.fn(),
    getRolUsuario: vi.fn(),
    getToken: vi.fn(),
    isSessionValid: vi.fn()
  }
}));

import authService from '../../services/authService';

const mockedAuthService = vi.mocked(authService);

// Componente helper para ver redirecciones
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/protected']}>
    <Routes>
      <Route path="/protected" element={children} />
      <Route path="/login" element={<div>Login Page</div>} />
      <Route path="/" element={<div>Home Page</div>} />
    </Routes>
  </MemoryRouter>
);

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Autenticación básica', () => {
    it('debe renderizar children cuando el usuario está autenticado', () => {
      mockedAuthService.isAuthenticated.mockReturnValue(true);
      mockedAuthService.getRolUsuario.mockReturnValue(3);
      mockedAuthService.getToken.mockReturnValue('valid-token');
      mockedAuthService.isSessionValid.mockReturnValue(true);

      render(
        <TestWrapper>
          <ProtectedRoute>
            <div>Contenido Protegido</div>
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Contenido Protegido')).toBeInTheDocument();
    });

    it('debe redirigir a /login cuando el usuario no está autenticado', () => {
      mockedAuthService.isAuthenticated.mockReturnValue(false);
      mockedAuthService.getRolUsuario.mockReturnValue(null);
      mockedAuthService.getToken.mockReturnValue(null);
      mockedAuthService.isSessionValid.mockReturnValue(false);

      render(
        <TestWrapper>
          <ProtectedRoute>
            <div>Contenido Protegido</div>
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Contenido Protegido')).not.toBeInTheDocument();
    });
  });

  describe('Control de roles', () => {
    it('debe permitir acceso cuando el usuario tiene el rol correcto', () => {
      mockedAuthService.isAuthenticated.mockReturnValue(true);
      mockedAuthService.getRolUsuario.mockReturnValue(2); // ADMINISTRADOR
      mockedAuthService.getToken.mockReturnValue('valid-token');
      mockedAuthService.isSessionValid.mockReturnValue(true);

      render(
        <TestWrapper>
          <ProtectedRoute allowedRoles={[2]}>
            <div>Admin Content</div>
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('debe redirigir cuando el usuario no tiene el rol correcto', () => {
      mockedAuthService.isAuthenticated.mockReturnValue(true);
      mockedAuthService.getRolUsuario.mockReturnValue(3); // USUARIO
      mockedAuthService.getToken.mockReturnValue('valid-token');
      mockedAuthService.isSessionValid.mockReturnValue(true);

      render(
        <TestWrapper>
          <ProtectedRoute allowedRoles={[1]} redirectTo="/">
            <div>Moderador Content</div>
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Home Page')).toBeInTheDocument();
      expect(screen.queryByText('Moderador Content')).not.toBeInTheDocument();
    });

    it('debe permitir acceso si el usuario tiene alguno de los roles permitidos', () => {
      mockedAuthService.isAuthenticated.mockReturnValue(true);
      mockedAuthService.getRolUsuario.mockReturnValue(2); // ADMINISTRADOR
      mockedAuthService.getToken.mockReturnValue('valid-token');
      mockedAuthService.isSessionValid.mockReturnValue(true);

      render(
        <TestWrapper>
          <ProtectedRoute allowedRoles={[1, 2, 3]}>
            <div>Multi-role Content</div>
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Multi-role Content')).toBeInTheDocument();
    });
  });

  describe('Redirección personalizada', () => {
    it('debe usar redirectTo personalizado', () => {
      mockedAuthService.isAuthenticated.mockReturnValue(true);
      mockedAuthService.getRolUsuario.mockReturnValue(3);
      mockedAuthService.getToken.mockReturnValue('valid-token');
      mockedAuthService.isSessionValid.mockReturnValue(true);

      render(
        <TestWrapper>
          <ProtectedRoute allowedRoles={[1]} redirectTo="/">
            <div>Content</div>
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });
});

describe('UserOnlyRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe permitir acceso a usuarios con rol 3', () => {
    mockedAuthService.isAuthenticated.mockReturnValue(true);
    mockedAuthService.getRolUsuario.mockReturnValue(3);
    mockedAuthService.getToken.mockReturnValue('valid-token');
    mockedAuthService.isSessionValid.mockReturnValue(true);

    render(
      <TestWrapper>
        <UserOnlyRoute>
          <div>User Dashboard</div>
        </UserOnlyRoute>
      </TestWrapper>
    );

    expect(screen.getByText('User Dashboard')).toBeInTheDocument();
  });

  it('debe redirigir a admins', () => {
    mockedAuthService.isAuthenticated.mockReturnValue(true);
    mockedAuthService.getRolUsuario.mockReturnValue(2);
    mockedAuthService.getToken.mockReturnValue('valid-token');
    mockedAuthService.isSessionValid.mockReturnValue(true);

    render(
      <TestWrapper>
        <UserOnlyRoute>
          <div>User Dashboard</div>
        </UserOnlyRoute>
      </TestWrapper>
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });
});

describe('AdminOnlyRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe permitir acceso a administradores con rol 2', () => {
    mockedAuthService.isAuthenticated.mockReturnValue(true);
    mockedAuthService.getRolUsuario.mockReturnValue(2);
    mockedAuthService.getToken.mockReturnValue('valid-token');
    mockedAuthService.isSessionValid.mockReturnValue(true);

    render(
      <TestWrapper>
        <AdminOnlyRoute>
          <div>Admin Panel</div>
        </AdminOnlyRoute>
      </TestWrapper>
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('debe redirigir a usuarios normales', () => {
    mockedAuthService.isAuthenticated.mockReturnValue(true);
    mockedAuthService.getRolUsuario.mockReturnValue(3);
    mockedAuthService.getToken.mockReturnValue('valid-token');
    mockedAuthService.isSessionValid.mockReturnValue(true);

    render(
      <TestWrapper>
        <AdminOnlyRoute>
          <div>Admin Panel</div>
        </AdminOnlyRoute>
      </TestWrapper>
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });
});

describe('ModeradorOnlyRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe permitir acceso a moderadores con rol 1', () => {
    mockedAuthService.isAuthenticated.mockReturnValue(true);
    mockedAuthService.getRolUsuario.mockReturnValue(1);
    mockedAuthService.getToken.mockReturnValue('valid-token');
    mockedAuthService.isSessionValid.mockReturnValue(true);

    render(
      <TestWrapper>
        <ModeradorOnlyRoute>
          <div>Moderador Dashboard</div>
        </ModeradorOnlyRoute>
      </TestWrapper>
    );

    expect(screen.getByText('Moderador Dashboard')).toBeInTheDocument();
  });

  it('debe redirigir a no-moderadores', () => {
    mockedAuthService.isAuthenticated.mockReturnValue(true);
    mockedAuthService.getRolUsuario.mockReturnValue(2);
    mockedAuthService.getToken.mockReturnValue('valid-token');
    mockedAuthService.isSessionValid.mockReturnValue(true);

    render(
      <TestWrapper>
        <ModeradorOnlyRoute>
          <div>Moderador Dashboard</div>
        </ModeradorOnlyRoute>
      </TestWrapper>
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });
});
