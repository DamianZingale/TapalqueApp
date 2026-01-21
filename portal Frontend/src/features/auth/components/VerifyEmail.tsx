import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Token de verificación no encontrado');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(
        `/api/user/public/verify-email?token=${token}`,
        {
          method: 'GET',
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('¡Email verificado correctamente! Ya puedes iniciar sesión.');
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(
          data.detalle || 'Token inválido o expirado. Por favor, solicita uno nuevo.'
        );
      }
    } catch (error) {
      console.error('Error al verificar email:', error);
      setStatus('error');
      setMessage('Error al verificar el email. Inténtalo de nuevo más tarde.');
    }
  };

  return (
    <div className="bg-light vh-100 d-flex flex-column">
      <div className="flex-grow-1 d-flex justify-content-center align-items-center">
        <div
          className="p-5 rounded-4 shadow-sm bg-white text-center"
          style={{ width: '100%', maxWidth: '500px' }}
        >
          {status === 'loading' && (
            <>
              <div className="spinner-border text-secondary mb-4" role="status">
                <span className="visually-hidden">Verificando...</span>
              </div>
              <h3 className="text-secondary">Verificando tu email...</h3>
              <p className="text-muted">Por favor espera un momento.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-success mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="80"
                  height="80"
                  fill="currentColor"
                  className="bi bi-check-circle"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                  <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
                </svg>
              </div>
              <h3 className="text-success mb-3">¡Email Verificado!</h3>
              <p className="text-muted mb-4">{message}</p>
              <p className="text-muted small">
                Serás redirigido automáticamente al inicio de sesión...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-danger mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="80"
                  height="80"
                  fill="currentColor"
                  className="bi bi-x-circle"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
              </div>
              <h3 className="text-danger mb-3">Error en la Verificación</h3>
              <p className="text-muted mb-4">{message}</p>
              <Link
                to="/login"
                className="btn btn-secondary"
              >
                Ir al inicio de sesión
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
