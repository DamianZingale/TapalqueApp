// portal Frontend/src/components/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService, { UserData } from '../../../services/authService';
import { authAPI } from '../api/authApi';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserData;
}

interface ApiErrorResponse {
  message?: string;
  detalle?: string;
  error?: string;
}

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      const data: LoginResponse = response.data;

      authService.setToken(data.accessToken);
      authService.setUser(data.user);
      authService.setRefreshToken(data.refreshToken);

      const userRole = String(data.user.rol);
      console.log('ROL:', data.user.rol);
      if (userRole === 'ADMINISTRADOR' || userRole === '2') {
        navigate('/admin');
      } else if (userRole === 'MODERADOR' || userRole === '1') {
        navigate('/moderador');
      } else {
        // USER o rol 3
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin');

        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectUrl);
        } else {
          navigate('/HomePage');
        }
      }
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);

      setError(
        err.response?.data?.detalle || 
        err.response?.data?.message ||
        err.message ||
        'Error al iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light vh-100 d-flex flex-column">
      <div className="flex-grow-1 d-flex justify-content-center align-items-center">
        <form
          onSubmit={handleLogin}
          className="p-4 rounded-4 shadow-sm bg-white"
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <div className="text-center mb-4">
            <h2 className="fw-semibold text-secondary">Ingresar</h2>
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control rounded-3"
              id="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              type="password"
              className="form-control rounded-3"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="alert alert-danger py-2" role="alert">
              {error}
            </div>
          )}

          <div className="d-grid mb-3">
            <button
              type="submit"
              className="btn btn-secondary p-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-muted mb-0">
              ¿No tienes cuenta?{' '}
              <Link
                to="/register"
                className="text-secondary fw-semibold text-decoration-none"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
