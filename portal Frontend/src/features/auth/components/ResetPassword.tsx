import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import { authAPI } from '../api/authApi';

interface PasswordStrength {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Validar token al cargar
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setValidating(false);
        return;
      }

      try {
        const response = await authAPI.validateResetToken(token);
        setTokenValid(response.data.valid);
      } catch (err) {
        console.error('Error validando token:', err);
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const validatePasswordStrength = (pwd: string) => {
    setPasswordStrength({
      hasMinLength: pwd.length >= 8,
      hasUpperCase: /[A-Z]/.test(pwd),
      hasLowerCase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validatePasswordStrength(value);
  };

  const isPasswordStrong = (): boolean => {
    return Object.values(passwordStrength).every((value) => value === true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!isPasswordStrong()) {
      setError('La contraseña no cumple con todos los requisitos de seguridad');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(token!, password);
      setSuccess(true);
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Error al restablecer:', err);
      setError(
        err.response?.data?.detalle ||
          err.response?.data?.message ||
          'Error al restablecer la contraseña. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Cargando validación
  if (validating) {
    return (
      <div className="bg-light vh-100 d-flex flex-column">
        <div className="flex-grow-1 d-flex justify-content-center align-items-center">
          <div className="text-center">
            <div className="spinner-border text-secondary mb-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted">Validando enlace...</p>
          </div>
        </div>
      </div>
    );
  }

  // Token inválido o expirado
  if (!tokenValid) {
    return (
      <div className="bg-light vh-100 d-flex flex-column">
        <div className="flex-grow-1 d-flex justify-content-center align-items-center">
          <div
            className="p-4 rounded-4 shadow-sm bg-white text-center"
            style={{ width: '100%', maxWidth: '400px' }}
          >
            <div className="mb-4">
              <div
                className="d-inline-flex justify-content-center align-items-center rounded-circle bg-danger bg-opacity-10"
                style={{ width: '64px', height: '64px' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  fill="currentColor"
                  className="text-danger"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                  <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
                </svg>
              </div>
            </div>

            <h2 className="fw-semibold text-secondary mb-3">
              Enlace inválido o expirado
            </h2>

            <p className="text-muted mb-4">
              El enlace para restablecer tu contraseña ha expirado o no es
              válido. Por favor, solicita uno nuevo.
            </p>

            <div className="d-grid gap-2">
              <Link to="/forgot-password" className="btn btn-secondary">
                Solicitar nuevo enlace
              </Link>
              <Link to="/login" className="btn btn-outline-secondary">
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Éxito
  if (success) {
    return (
      <div className="bg-light vh-100 d-flex flex-column">
        <div className="flex-grow-1 d-flex justify-content-center align-items-center">
          <div
            className="p-4 rounded-4 shadow-sm bg-white text-center"
            style={{ width: '100%', maxWidth: '400px' }}
          >
            <div className="mb-4">
              <div
                className="d-inline-flex justify-content-center align-items-center rounded-circle bg-success bg-opacity-10"
                style={{ width: '64px', height: '64px' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  fill="currentColor"
                  className="text-success"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                </svg>
              </div>
            </div>

            <h2 className="fw-semibold text-secondary mb-3">
              Contraseña actualizada
            </h2>

            <p className="text-muted mb-4">
              Tu contraseña ha sido restablecida correctamente. Serás redirigido
              al inicio de sesión en unos segundos...
            </p>

            <Link to="/login" className="btn btn-secondary w-100">
              Ir al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de nueva contraseña
  return (
    <div className="bg-light vh-100 d-flex flex-column">
      <div className="flex-grow-1 d-flex justify-content-center align-items-center">
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-4 shadow-sm bg-white"
          style={{ width: '100%', maxWidth: '450px' }}
        >
          <div className="text-center mb-4">
            <h2 className="fw-semibold text-secondary">Nueva contraseña</h2>
            <p className="text-muted small">
              Ingresa tu nueva contraseña para tu cuenta.
            </p>
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Nueva contraseña
            </label>
            <div className="position-relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control rounded-3 pe-5"
                id="password"
                placeholder="Crea una contraseña segura"
                value={password}
                onChange={handlePasswordChange}
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

            {/* Indicadores de fortaleza */}
            {password && (
              <div className="mt-2">
                <small className="d-block mb-1 fw-semibold">
                  Requisitos de contraseña:
                </small>
                <div style={{ fontSize: '0.85rem' }}>
                  <div
                    className={
                      passwordStrength.hasMinLength
                        ? 'text-success'
                        : 'text-muted'
                    }
                  >
                    {passwordStrength.hasMinLength ? '✓' : '○'} Mínimo 8
                    caracteres
                  </div>
                  <div
                    className={
                      passwordStrength.hasUpperCase
                        ? 'text-success'
                        : 'text-muted'
                    }
                  >
                    {passwordStrength.hasUpperCase ? '✓' : '○'} Una mayúscula
                    (A-Z)
                  </div>
                  <div
                    className={
                      passwordStrength.hasLowerCase
                        ? 'text-success'
                        : 'text-muted'
                    }
                  >
                    {passwordStrength.hasLowerCase ? '✓' : '○'} Una minúscula
                    (a-z)
                  </div>
                  <div
                    className={
                      passwordStrength.hasNumber ? 'text-success' : 'text-muted'
                    }
                  >
                    {passwordStrength.hasNumber ? '✓' : '○'} Un número (0-9)
                  </div>
                  <div
                    className={
                      passwordStrength.hasSpecialChar
                        ? 'text-success'
                        : 'text-muted'
                    }
                  >
                    {passwordStrength.hasSpecialChar ? '✓' : '○'} Un carácter
                    especial (!@#$%^&*)
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar contraseña
            </label>
            <div className="position-relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-control rounded-3 pe-5"
                id="confirmPassword"
                placeholder="Repite la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted px-3 border-0"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                style={{ zIndex: 10 }}
              >
                {showConfirmPassword ? <BsEyeSlash size={18} /> : <BsEye size={18} />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <small className="text-danger d-block mt-1">
                Las contraseñas no coinciden
              </small>
            )}
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
              disabled={loading || !isPasswordStrong() || password !== confirmPassword || !confirmPassword}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Guardando...
                </>
              ) : (
                'Restablecer contraseña'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-secondary text-decoration-none small"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
