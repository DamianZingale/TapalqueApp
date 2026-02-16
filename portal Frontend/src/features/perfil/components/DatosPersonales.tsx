import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../../services/authService";
import { api } from "../../../config/api";
import { PhoneInput } from "../../../shared/components/PhoneInput";

interface UserProfile {
    id: number;
    nombre: string;
    apellido?: string;
    email: string;
    telefono?: string;
    dni?: string;
    direccion?: string;
}

export const DatosPersonales = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const returnTo = (location.state as { returnTo?: string })?.returnTo;

    // Debug: ver el state que llega
    console.log('DatosPersonales - location.state:', location.state);
    console.log('DatosPersonales - returnTo:', returnTo);

    // Cargar datos iniciales de localStorage para mostrar algo mientras se obtiene del backend
    const cachedUser = authService.getUser();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [nombre, setNombre] = useState(cachedUser?.nombre?.toString() || "");
    const [apellido, setApellido] = useState(cachedUser?.apellido?.toString() || "");
    const [email, setEmail] = useState(cachedUser?.email?.toString() || "");
    const [telefono, setTelefono] = useState(cachedUser?.telefono?.toString() || "");
    const [dni, setDni] = useState(cachedUser?.dni?.toString() || "");
    const [direccion, setDireccion] = useState(cachedUser?.direccion?.toString() || "");
    const [userId, setUserId] = useState<number | null>(cachedUser?.id ? Number(cachedUser.id) : null);

    useEffect(() => {
        const loadUserData = async () => {
            const user = authService.getUser();
            if (!user?.id || !user?.email) {
                setError("No se pudo obtener información del usuario");
                setLoading(false);
                return;
            }

            try {
                // Usar endpoint /profile/me que permite a cualquier usuario autenticado obtener sus datos
                const userData = await api.get<UserProfile>(`/user/profile/me?email=${encodeURIComponent(user.email)}`);
                if (userData) {
                    setUserId(userData.id);
                    setNombre(userData.nombre || "");
                    setApellido(userData.apellido || "");
                    setEmail(userData.email || "");
                    setTelefono(userData.telefono || "");
                    setDni(userData.dni || "");
                    setDireccion(userData.direccion || "");

                    // Sincronizar localStorage con datos actualizados del backend
                    // Esto asegura que hasCompleteProfileForReservations() tenga datos correctos
                    authService.setUser({
                        ...user,
                        nombre: userData.nombre,
                        apellido: userData.apellido,
                        email: userData.email,
                        telefono: userData.telefono,
                        dni: userData.dni,
                        direccion: userData.direccion,
                    });
                }
            } catch (err) {
                console.error("Error al cargar datos del usuario:", err);
                setError("Error al cargar los datos del perfil");
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!userId) return;

        setError(null);
        setSuccess(null);
        setSaving(true);

        try {
            const updatedUser = await api.put<UserProfile>(`/user/${userId}/profile`, {
                nombre,
                apellido,
                direccion,
                telefono,
                dni,
            });

            if (updatedUser) {
                // Actualizar datos en localStorage
                const currentUser = authService.getUser();
                if (currentUser) {
                    authService.setUser({
                        ...currentUser,
                        nombre: updatedUser.nombre,
                        apellido: updatedUser.apellido,
                        telefono: updatedUser.telefono,
                        dni: updatedUser.dni,
                        direccion: updatedUser.direccion,
                    });
                }

                // Si hay URL de retorno, navegar de vuelta
                console.log('DatosPersonales - Guardado exitoso. returnTo:', returnTo);
                if (returnTo) {
                    console.log('DatosPersonales - Navegando de vuelta a:', returnTo);
                    navigate(returnTo);
                } else {
                    console.log('DatosPersonales - No hay returnTo, mostrando mensaje de éxito');
                    setSuccess("Datos actualizados correctamente");
                }
            }
        } catch (err) {
            console.error("Error al actualizar perfil:", err);
            setError("Error al guardar los cambios");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center p-4">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded bg-light">
            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

            <Form.Group className="mb-3">
                <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                <Form.Control
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Apellido</Form.Label>
                <Form.Control
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>DNI <span className="text-danger">*</span></Form.Label>
                <Form.Control
                    type="text"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder="Ej: 12345678"
                />
                <Form.Text className="text-muted">
                    Requerido para realizar reservas
                </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Teléfono <span className="text-danger">*</span></Form.Label>
                <PhoneInput
                    value={telefono}
                    onChange={setTelefono}
                    required
                    helpText="Requerido para realizar reservas. Sin 0 ni 15."
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    value={email}
                    readOnly
                    plaintext
                    className="text-muted"
                />
                <Form.Text className="text-muted">
                    El email no puede ser modificado
                </Form.Text>
            </Form.Group>

            <Button variant="primary" type="submit" disabled={saving}>
                {saving ? (
                    <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Guardando...
                    </>
                ) : (
                    "Guardar cambios"
                )}
            </Button>
        </form>
    );
};
