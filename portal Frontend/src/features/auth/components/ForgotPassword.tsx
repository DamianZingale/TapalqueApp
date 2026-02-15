import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api/authApi';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Error al solicitar reset:', err);
      let errorMsg =
        err.response?.data?.detalle ||
        err.response?.data?.message ||
        'Error al procesar la solicitud. Intenta de nuevo.';

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
                  <path d="M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-.966-.741l5.64-3.471L8 9.583l7-4.2V8.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2H2Zm3.708 6.208L1 11.105V5.383l4.708 2.825ZM1 4.217V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2-7-4.2Z" />
                  <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-1.993-1.679a.5.5 0 0 0-.686.172l-1.17 1.95-.547-.547a.5.5 0 0 0-.708.708l.774.773a.75.75 0 0 0 1.174-.144l1.335-2.226a.5.5 0 0 0-.172-.686Z" />
                </svg>
              </div>
            </div>

            <h2 className="fw-semibold text-secondary mb-3">
              Revisa tu correo
            </h2>

            <p className="text-muted mb-4">
              Si el email <strong>{email}</strong> está registrado en nuestro
              sistema, recibirás un correo con instrucciones para restablecer tu
              contraseña.
            </p>

            <p className="text-muted small mb-4">
              El enlace expirará en 1 hora. Si no recibes el correo, revisa tu
              carpeta de spam.
            </p>

            <Link to="/login" className="btn btn-secondary w-100">
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light vh-100 d-flex flex-column">
      <div className="flex-grow-1 d-flex justify-content-center align-items-center">
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-4 shadow-sm bg-white"
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <div className="text-center mb-4">
            <h2 className="fw-semibold text-secondary">
              ¿Olvidaste tu contraseña?
            </h2>
            <p className="text-muted small">
              Ingresa tu email y te enviaremos un enlace para restablecer tu
              contraseña.
            </p>
          </div>

          <div className="mb-4">
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

          {error && (
            <div className="alert alert-danger py-2" role="alert">
              {error}
            </div>
          )}

          <div className="d-grid mb-3">
            <button
              type="submit"
              className="btn btn-secondary p-2"
              disabled={loading || !email}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Enviando...
                </>
              ) : (
                'Enviar enlace de recuperación'
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
