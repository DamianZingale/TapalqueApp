// portal Frontend/src/components/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
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
  const [showPassword, setShowPassword] = useState(false);
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
      authService.setRefreshToken(data.refreshToken);

      // Guardar datos básicos primero
      authService.setUser(data.user);

      // Obtener perfil completo del usuario (incluyendo telefono, dni, etc.)
      // Esto evita tener que hacer peticiones adicionales después
      try {
        const profileResponse = await fetch(`/api/user/profile/me?email=${encodeURIComponent(email)}`, {
          headers: {
            'Authorization': `Bearer ${data.accessToken}`,
          },
        });
        if (profileResponse.ok) {
          const fullProfile = await profileResponse.json();
          // Actualizar localStorage con perfil completo
          authService.setUser({
            ...data.user,
            nombre: fullProfile.nombre,
            apellido: fullProfile.apellido,
            telefono: fullProfile.telefono,
            dni: fullProfile.dni,
            direccion: fullProfile.direccion,
          });
        }
      } catch (profileErr) {
        console.warn('No se pudo obtener perfil completo:', profileErr);
        // Continúa con los datos básicos del login
      }

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

      let errorMsg =
        err.response?.data?.detalle ||
        err.response?.data?.message ||
        err.message ||
        'Error al iniciar sesión. Verifica tus credenciales.';

      // Convertir segundos a minutos para mejor legibilidad
      errorMsg = errorMsg.replace(/(\d+)\s*segundo[s]?/gi, (_: string, secs: string) => {
        const totalSecs = parseInt(secs, 10);
        if (totalSecs >= 60) {
          const mins = Math.ceil(totalSecs / 60);
          return `${mins} minuto${mins !== 1 ? 's' : ''}`;
        }
        return `${totalSecs} segundo${totalSecs !== 1 ? 's' : ''}`;
      });

      setError(errorMsg);
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

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <div className="position-relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control rounded-3 pe-5"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted px-3 border-0"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                style={{ zIndex: 10 }}
              >
                {showPassword ? <BsEyeSlash size={18} /> : <BsEye size={18} />}
              </button>
            </div>
          </div>

          <div className="mb-4 text-end">
            <Link
              to="/forgot-password"
              className="text-muted text-decoration-none small"
            >
              ¿Olvidaste tu contraseña?
            </Link>
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
