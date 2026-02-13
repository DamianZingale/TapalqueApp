// portal Frontend/src/modules/auth/components/Register.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserData } from '../../../services/authService';
import { authAPI } from '../api/authApi';

interface RegisterResponse {
  token?: string;
  user?: UserData;
  message?: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };

  message?: string;
}

interface PasswordStrength {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Validar fortaleza de contraseña en tiempo real
    if (name === 'password') {
      validatePasswordStrength(value);
    }
  };

  const validatePasswordStrength = (password: string) => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const isPasswordStrong = (): boolean => {
    return Object.values(passwordStrength).every((value) => value === true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar fortaleza de contraseña
    if (!isPasswordStrong()) {
      setError('La contraseña no cumple con todos los requisitos de seguridad');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        nombre: formData.nombre,
        correo: formData.email,
        contrasenia: formData.password,
      });
      
      const data: RegisterResponse = response.data;

      // Mostrar mensaje de verificación de email
      alert(
        '¡Registro exitoso! Se ha enviado un correo de verificación a tu email. Por favor, verifica tu cuenta antes de iniciar sesión.'
      );
      navigate('/login');
    } catch (err) {
      console.error('Error en registro:', err);

      const apiError = err as ApiError;
      setError(
        apiError.response?.data?.message ||
          apiError.message ||
          'Error al registrar. Por favor, intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light vh-100 d-flex flex-column">
      <div className="flex-grow-1 d-flex justify-content-center align-items-center">
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-4 shadow-sm bg-white"
          style={{ width: '100%', maxWidth: '450px' }}
        >
          <div className="text-center mb-4">
            <h2 className="fw-semibold text-secondary">Registrarse</h2>
          </div>

          <div className="mb-3">
            <label htmlFor="nombre" className="form-label">
              Nombre completo
            </label>
            <input
              type="text"
              className="form-control rounded-3"
              id="nombre"
              name="nombre"
              placeholder="Ingrese su nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control rounded-3"
              id="email"
              name="email"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              type="password"
              className="form-control rounded-3"
              id="password"
              name="password"
              placeholder="Crea una contraseña segura"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />

            {/* Indicadores de fortaleza */}
            {formData.password && (
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
            <input
              type="password"
              className="form-control rounded-3"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Repita la contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
            {formData.confirmPassword &&
              formData.password !== formData.confirmPassword && (
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
              disabled={loading || !isPasswordStrong()}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Creando cuenta...
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-muted mb-0">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="text-secondary fw-semibold text-decoration-none"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
