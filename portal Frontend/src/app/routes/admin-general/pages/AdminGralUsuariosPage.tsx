import { useState, useEffect } from "react";
import { Container, Table, Button, Badge, Form, Row, Col, Modal, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Title } from "../../../shared/components/Title";
import {
    fetchUsuarios,
    cambiarEstadoUsuario,
    cambiarRolUsuario,
    eliminarUsuario,
    Usuario,
    ROLES,
    getRoleName
} from "../../../services/fetchUsuarios";

export const AdminGralUsuariosPage = () => {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroRol, setFiltroRol] = useState<number | "TODOS">("TODOS");
    const [filtroEstado, setFiltroEstado] = useState<"TODOS" | "ACTIVO" | "INACTIVO">("TODOS");
    const [busqueda, setBusqueda] = useState("");
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
    const [modalCambiarRol, setModalCambiarRol] = useState(false);
    const [nuevoRol, setNuevoRol] = useState<number>(ROLES.USUARIO);
    const [procesando, setProcesando] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: "success" | "danger", texto: string } | null>(null);

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        setLoading(true);
        const data = await fetchUsuarios();
        setUsuarios(data);
        setLoading(false);
    };

    const usuariosFiltrados = usuarios.filter(u => {
        if (filtroRol !== "TODOS" && u.rol !== filtroRol) return false;
        if (filtroEstado === "ACTIVO" && !u.activo) return false;
        if (filtroEstado === "INACTIVO" && u.activo) return false;
        if (busqueda) {
            const searchLower = busqueda.toLowerCase();
            if (!u.nombre.toLowerCase().includes(searchLower) &&
                !u.email.toLowerCase().includes(searchLower)) {
                return false;
            }
        }
        return true;
    });

    const handleToggleEstado = async (usuario: Usuario) => {
        if (!window.confirm(`¿Está seguro de ${usuario.activo ? 'desactivar' : 'activar'} a ${usuario.nombre}?`)) return;

        setProcesando(true);
        const exito = await cambiarEstadoUsuario(usuario.id, !usuario.activo);
        if (exito) {
            setUsuarios(prev => prev.map(u =>
                u.id === usuario.id ? { ...u, activo: !u.activo } : u
            ));
            setMensaje({ tipo: "success", texto: `Usuario ${!usuario.activo ? 'activado' : 'desactivado'} correctamente` });
        } else {
            setMensaje({ tipo: "danger", texto: "Error al cambiar estado del usuario" });
        }
        setProcesando(false);
        setTimeout(() => setMensaje(null), 3000);
    };

    const handleAbrirCambiarRol = (usuario: Usuario) => {
        setUsuarioSeleccionado(usuario);
        setNuevoRol(usuario.rol);
        setModalCambiarRol(true);
    };

    const handleCambiarRol = async () => {
        if (!usuarioSeleccionado) return;

        setProcesando(true);
        const exito = await cambiarRolUsuario(usuarioSeleccionado.id, nuevoRol);
        if (exito) {
            setUsuarios(prev => prev.map(u =>
                u.id === usuarioSeleccionado.id ? { ...u, rol: nuevoRol } : u
            ));
            setMensaje({ tipo: "success", texto: "Rol actualizado correctamente" });
            setModalCambiarRol(false);
        } else {
            setMensaje({ tipo: "danger", texto: "Error al cambiar rol del usuario" });
        }
        setProcesando(false);
        setTimeout(() => setMensaje(null), 3000);
    };

    const handleEliminar = async (usuario: Usuario) => {
        if (!window.confirm(`¿Está seguro de eliminar permanentemente a ${usuario.nombre}? Esta acción no se puede deshacer.`)) return;

        setProcesando(true);
        const exito = await eliminarUsuario(usuario.id);
        if (exito) {
            setUsuarios(prev => prev.filter(u => u.id !== usuario.id));
            setMensaje({ tipo: "success", texto: "Usuario eliminado correctamente" });
        } else {
            setMensaje({ tipo: "danger", texto: "Error al eliminar usuario" });
        }
        setProcesando(false);
        setTimeout(() => setMensaje(null), 3000);
    };

    const getRolBadge = (rol: number) => {
        const badges: Record<number, string> = {
            [ROLES.MODERADOR]: "warning",
            [ROLES.ADMINISTRADOR]: "danger",
            [ROLES.USUARIO]: "info"
        };
        return <Badge bg={badges[rol] || "secondary"}>{getRoleName(rol)}</Badge>;
    };

    if (loading) {
        return (
            <Container className="py-4">
                <Title text="Gestión de Usuarios" />
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <Title text="Gestión de Usuarios" />

            {mensaje && (
                <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje(null)}>
                    {mensaje.texto}
                </Alert>
            )}

            {/* Filtros */}
            <Row className="mb-4">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Buscar</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nombre o email..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Rol</Form.Label>
                        <Form.Select
                            value={filtroRol === "TODOS" ? "TODOS" : filtroRol}
                            onChange={(e) => setFiltroRol(e.target.value === "TODOS" ? "TODOS" : Number(e.target.value))}
                        >
                            <option value="TODOS">Todos los roles</option>
                            <option value={ROLES.MODERADOR}>Moderador</option>
                            <option value={ROLES.ADMINISTRADOR}>Administrador</option>
                            <option value={ROLES.USUARIO}>Usuario</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Estado</Form.Label>
                        <Form.Select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value as "TODOS" | "ACTIVO" | "INACTIVO")}
                        >
                            <option value="TODOS">Todos</option>
                            <option value="ACTIVO">Activos</option>
                            <option value="INACTIVO">Inactivos</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                    <Button
                        variant="success"
                        className="w-100"
                        onClick={() => navigate("nuevo")}
                    >
                        + Nuevo Usuario
                    </Button>
                </Col>
            </Row>

            {/* Contador */}
            <div className="mb-3">
                <Badge bg="primary">
                    Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
                </Badge>
            </div>

            {/* Tabla */}
            <div className="table-responsive">
                <Table striped bordered hover>
                    <thead className="table-dark">
                        <tr>
                            <th>#</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Email Verificado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuariosFiltrados.map((usuario, idx) => (
                            <tr key={usuario.id} className={!usuario.activo ? "table-secondary" : ""}>
                                <td>{idx + 1}</td>
                                <td>
                                    <strong>{usuario.nombre}</strong>
                                    {usuario.telefono && (
                                        <small className="d-block text-muted">{usuario.telefono}</small>
                                    )}
                                </td>
                                <td>{usuario.email}</td>
                                <td>{getRolBadge(usuario.rol)}</td>
                                <td>
                                    <Badge bg={usuario.activo ? "success" : "secondary"}>
                                        {usuario.activo ? "Activo" : "Inactivo"}
                                    </Badge>
                                </td>
                                <td>
                                    {usuario.emailVerified ? (
                                        <Badge bg="success">Verificado</Badge>
                                    ) : (
                                        <Badge bg="warning">Pendiente</Badge>
                                    )}
                                </td>
                                <td>
                                    <div className="d-flex gap-1 flex-wrap">
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={() => navigate(`editar?id=${usuario.id}`)}
                                            disabled={procesando}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline-warning"
                                            onClick={() => handleAbrirCambiarRol(usuario)}
                                            disabled={procesando}
                                        >
                                            Rol
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={usuario.activo ? "outline-secondary" : "outline-success"}
                                            onClick={() => handleToggleEstado(usuario)}
                                            disabled={procesando}
                                        >
                                            {usuario.activo ? "Desactivar" : "Activar"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline-danger"
                                            onClick={() => handleEliminar(usuario)}
                                            disabled={procesando}
                                        >
                                            Eliminar
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {usuariosFiltrados.length === 0 && (
                <Alert variant="info">
                    No se encontraron usuarios con los filtros aplicados.
                </Alert>
            )}

            {/* Modal cambiar rol */}
            <Modal show={modalCambiarRol} onHide={() => setModalCambiarRol(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Cambiar Rol</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Cambiar rol de <strong>{usuarioSeleccionado?.nombre}</strong></p>
                    <Form.Group>
                        <Form.Label>Nuevo Rol</Form.Label>
                        <Form.Select
                            value={nuevoRol}
                            onChange={(e) => setNuevoRol(Number(e.target.value))}
                        >
                            <option value={ROLES.USUARIO}>Usuario</option>
                            <option value={ROLES.MODERADOR}>Moderador</option>
                            <option value={ROLES.ADMINISTRADOR}>Administrador</option>
                        </Form.Select>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModalCambiarRol(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleCambiarRol} disabled={procesando}>
                        {procesando ? "Guardando..." : "Guardar"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};
