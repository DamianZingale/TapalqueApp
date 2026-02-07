import { useState, useEffect } from "react";
import { Card, Row, Col, Form, Button, Alert, Badge } from "react-bootstrap";
import authService from "../../../services/authService";
import { api } from "../../../config/api";

interface UserProfile {
    id: number;
    nombre: string;
    apellido?: string;
    email: string;
    telefono?: string;
    dni?: string;
    direccion?: string;
    emailVerified: boolean;
    rol: string | number;
    createdAt?: string;
}

export const PerfilTab = () => {
    const [perfil, setPerfil] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editando, setEditando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: "success" | "danger", texto: string } | null>(null);

    // Formulario
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [telefono, setTelefono] = useState("");
    const [dni, setDni] = useState("");
    const [direccion, setDireccion] = useState("");

    useEffect(() => {
        cargarPerfilDesdeStorage();
    }, []);

    const cargarPerfilDesdeStorage = () => {
        const user = authService.getUser();
        if (!user?.email) {
            setMensaje({ tipo: "danger", texto: "No se pudo obtener información del usuario" });
            setLoading(false);
            return;
        }

        // Cargar datos desde localStorage inmediatamente
        setPerfil({
            id: Number(user.id) || 0,
            nombre: user.nombre || "",
            apellido: user.apellido || "",
            email: user.email || "",
            telefono: user.telefono || "",
            dni: user.dni || "",
            direccion: user.direccion || "",
            emailVerified: true,
            rol: user.rol || "USER",
        });
        setNombre(user.nombre || "");
        setApellido(user.apellido || "");
        setTelefono(user.telefono || "");
        setDni(user.dni || "");
        setDireccion(user.direccion || "");
        setLoading(false);
    };

    const handleGuardar = async () => {
        try {
            setGuardando(true);
            setMensaje(null);

            const updatedPerfil = await api.put<UserProfile>(`/user/${perfil?.id}/profile`, {
                nombre,
                apellido,
                telefono,
                dni,
                direccion
            });

            setPerfil(updatedPerfil);
            // Actualizar localStorage con los datos del perfil
            const currentUser = authService.getUser();
            authService.setUser({
                ...currentUser,
                id: updatedPerfil.id,
                nombre: updatedPerfil.nombre,
                apellido: updatedPerfil.apellido,
                email: updatedPerfil.email,
                telefono: updatedPerfil.telefono,
                dni: updatedPerfil.dni,
                direccion: updatedPerfil.direccion,
            });
            setEditando(false);
            setMensaje({ tipo: "success", texto: "Perfil actualizado correctamente" });
        } catch (error) {
            console.error("Error guardando perfil:", error);
            setMensaje({ tipo: "danger", texto: "Error al guardar el perfil" });
        } finally {
            setGuardando(false);
        }
    };

    const handleCancelar = () => {
        setNombre(perfil?.nombre || "");
        setApellido(perfil?.apellido || "");
        setTelefono(perfil?.telefono || "");
        setDni(perfil?.dni || "");
        setDireccion(perfil?.direccion || "");
        setEditando(false);
        setMensaje(null);
    };

    const getRoleName = (rol: string | number): string => {
        // El backend puede enviar string ("USER", "MODERADOR", "ADMINISTRADOR") o número
        if (typeof rol === "string") {
            switch (rol.toUpperCase()) {
                case "MODERADOR": return "Moderador";
                case "ADMINISTRADOR": return "Administrador";
                case "USER": return "Usuario";
                default: return "Desconocido";
            }
        }
        switch (rol) {
            case 1: return "Moderador";
            case 2: return "Administrador";
            case 3: return "Usuario";
            default: return "Desconocido";
        }
    };

    if (loading) {
        return (
            <Card className="shadow-sm border-0">
                <Card.Body className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </Card.Body>
            </Card>
        );
    }

    if (!perfil) {
        return (
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Alert variant="warning">No se pudo cargar la información del perfil</Alert>
                </Card.Body>
            </Card>
        );
    }

    return (
        <>
            {/* Información de cuenta */}
            <Card className="shadow-sm border-0 mb-4">
                <Card.Header className="bg-white border-0 pt-4">
                    <h5 className="mb-0">Información de Cuenta</h5>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6} className="mb-3">
                            <div className="d-flex align-items-center gap-3">
                                <div
                                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                                    style={{ width: "60px", height: "60px", fontSize: "1.5rem" }}
                                >
                                    {perfil.nombre?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h6 className="mb-1">{perfil.nombre}</h6>
                                    <small className="text-muted">{perfil.email}</small>
                                </div>
                            </div>
                        </Col>
                        <Col md={6} className="mb-3">
                            <div className="d-flex flex-column gap-2">
                                <div>
                                    <strong>Rol:</strong>{" "}
                                    <Badge bg="info">{getRoleName(perfil.rol)}</Badge>
                                </div>
                                <div>
                                    <strong>Estado de Email:</strong>{" "}
                                    {perfil.emailVerified ? (
                                        <Badge bg="success">✓ Verificado</Badge>
                                    ) : (
                                        <Badge bg="warning">⚠ Sin verificar</Badge>
                                    )}
                                </div>
                                {perfil.createdAt && (
                                    <div>
                                        <strong>Miembro desde:</strong>{" "}
                                        <span className="text-muted">
                                            {new Date(perfil.createdAt).toLocaleDateString("es-AR")}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Información personal */}
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center pt-4">
                    <h5 className="mb-0">Información Personal</h5>
                    {!editando && (
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setEditando(true)}
                        >
                            <i className="bi bi-pencil me-2"></i>
                            Editar
                        </Button>
                    )}
                </Card.Header>
                <Card.Body>
                    {mensaje && (
                        <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje(null)}>
                            {mensaje.texto}
                        </Alert>
                    )}

                    <Form>
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Nombre</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        disabled={!editando}
                                        placeholder="Ingresa tu nombre"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Apellido</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={apellido}
                                        onChange={(e) => setApellido(e.target.value)}
                                        disabled={!editando}
                                        placeholder="Ingresa tu apellido"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={perfil.email}
                                        disabled
                                    />
                                    <Form.Text className="text-muted">
                                        El email no se puede modificar
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>DNI</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={dni}
                                        onChange={(e) => setDni(e.target.value)}
                                        disabled={!editando}
                                        placeholder="Ej: 12345678"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Teléfono</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                        disabled={!editando}
                                        placeholder="Ej: +54 9 11 1234-5678"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Dirección</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={direccion}
                                        onChange={(e) => setDireccion(e.target.value)}
                                        disabled={!editando}
                                        placeholder="Ej: Calle 123, Ciudad"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {editando && (
                            <div className="d-flex gap-2 justify-content-end mt-4">
                                <Button
                                    variant="secondary"
                                    onClick={handleCancelar}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleGuardar}
                                    disabled={guardando}
                                >
                                    {guardando ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-lg me-2"></i>
                                            Guardar cambios
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </Form>
                </Card.Body>
            </Card>
        </>
    );
};
