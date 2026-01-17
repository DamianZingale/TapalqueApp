import { useState } from "react";
import { Container, Form, Button, Row, Col, Alert, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Title } from "../../../shared/components/Title";
import { crearUsuario, ROLES } from "../../../services/fetchUsuarios";

export const NuevoUsuarioPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        password: "",
        confirmPassword: "",
        telefono: "",
        direccion: "",
        rol: ROLES.USUARIO
    });

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validaciones
        if (!formData.nombre.trim()) {
            setError("El nombre es obligatorio");
            return;
        }
        if (!formData.email.trim()) {
            setError("El email es obligatorio");
            return;
        }
        if (!formData.password) {
            setError("La contraseña es obligatoria");
            return;
        }
        if (formData.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        setLoading(true);
        try {
            const nuevoUsuario = await crearUsuario({
                nombre: formData.nombre,
                email: formData.email,
                password: formData.password,
                telefono: formData.telefono || undefined,
                direccion: formData.direccion || undefined,
                rol: formData.rol
            });

            if (nuevoUsuario) {
                alert("Usuario creado exitosamente");
                navigate("/admin/general/usuarios");
            } else {
                setError("Error al crear el usuario. El email puede estar en uso.");
            }
        } catch (err) {
            console.error(err);
            setError("Error al crear el usuario. Intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4">
            <Title text="Nuevo Usuario" />

            <Card className="shadow-sm">
                <Card.Body>
                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre completo *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => handleChange("nombre", e.target.value)}
                                        placeholder="Nombre y apellido"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email *</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        placeholder="usuario@email.com"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Contraseña *</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => handleChange("password", e.target.value)}
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Confirmar contraseña *</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                        placeholder="Repetir contraseña"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Teléfono</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        value={formData.telefono}
                                        onChange={(e) => handleChange("telefono", e.target.value)}
                                        placeholder="+54 9 11 1234-5678"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Rol *</Form.Label>
                                    <Form.Select
                                        value={formData.rol}
                                        onChange={(e) => handleChange("rol", Number(e.target.value))}
                                    >
                                        <option value={ROLES.USUARIO}>Usuario</option>
                                        <option value={ROLES.MODERADOR}>Moderador</option>
                                        <option value={ROLES.ADMINISTRADOR}>Administrador</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Dirección</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.direccion}
                                        onChange={(e) => handleChange("direccion", e.target.value)}
                                        placeholder="Calle, número, ciudad"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex gap-2 justify-content-end mt-4">
                            <Button
                                variant="secondary"
                                onClick={() => navigate("/admin/general/usuarios")}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Creando...
                                    </>
                                ) : (
                                    "Crear Usuario"
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};
