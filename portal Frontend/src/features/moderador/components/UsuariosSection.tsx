import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Col,
  Form,
  ListGroup,
  Modal,
  Row,
  Spinner,
} from 'react-bootstrap';
import { BsEye, BsEyeSlash } from 'react-icons/bs';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  emailVerified: boolean;
  direccion?: string;
  activo: boolean;
}

interface NuevoUsuario {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

const emptyUser: NuevoUsuario = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'USER',
};

const ROLES = [
  { value: '', label: 'Todos' },
  { value: 'USER', label: 'Usuario' },
  { value: 'ADMINISTRADOR', label: 'Administrador' },
  { value: 'MODERADOR', label: 'Moderador' },
];

export function UsuariosSection() {
  const [items, setItems] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Usuario | null>(null);
  const [filtroRol, setFiltroRol] = useState('');
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'danger';
    texto: string;
  } | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [newUser, setNewUser] = useState<NuevoUsuario>(emptyUser);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const filteredItems = useMemo(() => {
    if (!filtroRol) return items;
    return items.filter((u) => u.rol === filtroRol);
  }, [items, filtroRol]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setItems(data);
      } else {
        console.warn('API respondió con error:', res.status);
        setItems([]);
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: Usuario) => {
    setSelected(item);
  };

  const handleChangeRole = async () => {
    if (!selected || !newRole) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/user/${selected.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setMensaje({ tipo: 'success', texto: 'Rol actualizado' });
        cargarDatos();
        setShowRoleModal(false);
        setSelected(null);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setMensaje({
          tipo: 'danger',
          texto: errorData.error || errorData.detalle || 'Error al cambiar rol',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'danger', texto: 'Error de conexión' });
    } finally {
      setSaving(false);
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.firstName || !newUser.email || !newUser.password) {
      setMensaje({ tipo: 'danger', texto: 'Nombre, email y contraseña son requeridos' });
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        correo: newUser.email,
        nombre: newUser.firstName,
        contrasenia: newUser.password,
        role: newUser.role,
      };
      const res = await fetch('/api/user/moderador/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMensaje({ tipo: 'success', texto: 'Usuario creado correctamente' });
        setShowCreateModal(false);
        setNewUser(emptyUser);
        cargarDatos();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setMensaje({
          tipo: 'danger',
          texto: errorData.error || errorData.detalle || 'Error al crear usuario',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'danger', texto: 'Error de conexión' });
    } finally {
      setSaving(false);
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const getRoleBadge = (rol: string) => {
    switch (rol) {
      case 'MODERADOR':
        return <Badge bg="danger">Moderador</Badge>;
      case 'ADMINISTRADOR':
        return <Badge bg="warning" text="dark">Administrador</Badge>;
      case 'USER':
        return <Badge bg="secondary">Usuario</Badge>;
      default:
        return <Badge bg="light" text="dark">{rol}</Badge>;
    }
  };

  if (loading)
    return (
      <div className="text-center py-4">
        <Spinner size="sm" /> Cargando...
      </div>
    );

  return (
    <Row>
      <Col md={4}>
        <div className="d-flex align-items-center justify-content-between mb-2">
          <small className="text-muted">
            {filteredItems.length} de {items.length} usuario(s)
          </small>
          <Button
            variant="success"
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            + Nuevo
          </Button>
        </div>

        {/* Filtro por rol */}
        <Form.Select
          size="sm"
          className="mb-2"
          value={filtroRol}
          onChange={(e) => {
            setFiltroRol(e.target.value);
            setSelected(null);
          }}
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </Form.Select>

        <ListGroup style={{ maxHeight: 400, overflowY: 'auto' }}>
          {filteredItems.map((item) => (
            <ListGroup.Item
              key={item.id}
              action
              active={selected?.id === item.id}
              onClick={() => handleSelect(item)}
              className="py-2"
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="fw-bold small">
                    {item.nombre} {item.apellido}
                  </div>
                  <small className="text-muted">{item.email}</small>
                </div>
                {getRoleBadge(item.rol)}
              </div>
            </ListGroup.Item>
          ))}
          {filteredItems.length === 0 && (
            <ListGroup.Item className="text-muted">
              {filtroRol ? 'Sin usuarios con ese rol' : 'Sin usuarios registrados'}
            </ListGroup.Item>
          )}
        </ListGroup>
      </Col>
      <Col md={8}>
        {mensaje && (
          <Alert variant={mensaje.tipo} className="py-1 small">
            {mensaje.texto}
          </Alert>
        )}
        {selected ? (
          <div>
            <h6>Detalles del Usuario</h6>
            <table className="table table-sm">
              <tbody>
                <tr>
                  <th className="text-muted" style={{ width: '30%' }}>Nombre</th>
                  <td>{selected.nombre} {selected.apellido}</td>
                </tr>
                <tr>
                  <th className="text-muted">Email</th>
                  <td>
                    {selected.email}
                    {selected.emailVerified ? (
                      <Badge bg="success" className="ms-2">Verificado</Badge>
                    ) : (
                      <Badge bg="warning" text="dark" className="ms-2">No verificado</Badge>
                    )}
                  </td>
                </tr>
                <tr>
                  <th className="text-muted">Rol</th>
                  <td>{getRoleBadge(selected.rol)}</td>
                </tr>
                <tr>
                  <th className="text-muted">Estado</th>
                  <td>
                    {selected.activo ? (
                      <Badge bg="success">Activo</Badge>
                    ) : (
                      <Badge bg="danger">Inactivo</Badge>
                    )}
                  </td>
                </tr>
                {selected.direccion && (
                  <tr>
                    <th className="text-muted">Direccion</th>
                    <td>{selected.direccion}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => {
                setNewRole(selected.rol);
                setShowRoleModal(true);
              }}
            >
              Cambiar Rol
            </Button>
          </div>
        ) : (
          <p className="text-muted">Selecciona un usuario para ver detalles</p>
        )}
      </Col>

      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar Rol</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Cambiar rol de <strong>{selected?.nombre} {selected?.apellido}</strong>
          </p>
          <Form.Select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          >
            <option value="USER">Usuario</option>
            <option value="ADMINISTRADOR">Administrador</option>
            <option value="MODERADOR">Moderador</option>
          </Form.Select>
          <small className="text-muted mt-2 d-block">
            <strong>Usuario:</strong> Acceso basico.<br/>
            <strong>Administrador:</strong> Gestiona comercios/negocios asignados.<br/>
            <strong>Moderador:</strong> Acceso total al panel de moderacion.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleChangeRole} disabled={saving}>
            {saving ? <Spinner size="sm" /> : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="small mb-0">Nombre *</Form.Label>
                  <Form.Control
                    size="sm"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="small mb-0">Apellido</Form.Label>
                  <Form.Control
                    size="sm"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-2">
              <Form.Label className="small mb-0">Email *</Form.Label>
              <Form.Control
                size="sm"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="small mb-0">Contraseña *</Form.Label>
              <div className="position-relative">
                <Form.Control
                  size="sm"
                  type={showPassword ? 'text' : 'password'}
                  className="pe-5"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted px-3 border-0 py-0"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  style={{ zIndex: 10 }}
                >
                  {showPassword ? <BsEyeSlash size={16} /> : <BsEye size={16} />}
                </button>
              </div>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="small mb-0">Rol</Form.Label>
              <Form.Select
                size="sm"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="USER">Usuario</option>
                <option value="ADMINISTRADOR">Administrador</option>
                <option value="MODERADOR">Moderador</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateUser} disabled={saving}>
            {saving ? <Spinner size="sm" /> : 'Crear'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
}
