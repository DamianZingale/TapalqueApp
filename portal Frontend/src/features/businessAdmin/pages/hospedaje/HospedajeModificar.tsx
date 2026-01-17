import { useState, useEffect } from 'react';
import {
  Card, Row, Col, Button, Table, Badge, Form, Modal, Alert, Spinner
} from 'react-bootstrap';
import type { Habitacion } from '../../types';

interface HospedajeModificarProps {
  businessId: string;
  businessName: string;
}

interface NuevaHabitacionForm {
  titulo: string;
  descripcion: string;
  maxPersonas: number;
  precio: number;
  tipoPrecio: 'por_habitacion' | 'por_persona';
  foto: string;
  servicios: string;
}

const initialFormState: NuevaHabitacionForm = {
  titulo: '',
  descripcion: '',
  maxPersonas: 2,
  precio: 0,
  tipoPrecio: 'por_habitacion',
  foto: '',
  servicios: ''
};

// Mock data temporal - en producción vendría del backend
const mockHabitaciones: Habitacion[] = [
  {
    id: '1',
    titulo: 'Habitación Simple',
    descripcion: 'Habitación con cama simple, ideal para viajeros solos',
    maxPersonas: 1,
    precio: 15000,
    tipoPrecio: 'por_habitacion',
    foto: '',
    servicios: ['WiFi', 'TV', 'Aire acondicionado'],
    disponible: true
  },
  {
    id: '2',
    titulo: 'Habitación Doble',
    descripcion: 'Habitación con cama matrimonial',
    maxPersonas: 2,
    precio: 25000,
    tipoPrecio: 'por_habitacion',
    foto: '',
    servicios: ['WiFi', 'TV', 'Aire acondicionado', 'Minibar'],
    disponible: true
  }
];

export function HospedajeModificar({ businessId, businessName }: HospedajeModificarProps) {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal agregar
  const [modalAgregar, setModalAgregar] = useState(false);
  const [nuevaHabitacion, setNuevaHabitacion] = useState<NuevaHabitacionForm>(initialFormState);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // Modal editar
  const [modalEditar, setModalEditar] = useState(false);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState<Habitacion | null>(null);

  // Mensajes
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'danger'; texto: string } | null>(null);

  useEffect(() => {
    cargarHabitaciones();
  }, [businessId]);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const cargarHabitaciones = async () => {
    try {
      setLoading(true);
      // TODO: Reemplazar con llamada real al backend
      // const data = await fetchHabitacionesByHotel(businessId);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular carga
      setHabitaciones(mockHabitaciones);
    } catch (error) {
      console.error('Error cargando habitaciones:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar las habitaciones' });
    } finally {
      setLoading(false);
    }
  };

  // Agregar habitación
  const handleAgregarHabitacion = async () => {
    setErrorForm(null);

    if (!nuevaHabitacion.titulo.trim()) {
      setErrorForm('El título es obligatorio');
      return;
    }
    if (nuevaHabitacion.precio <= 0) {
      setErrorForm('El precio debe ser mayor a 0');
      return;
    }
    if (nuevaHabitacion.maxPersonas <= 0) {
      setErrorForm('La capacidad debe ser mayor a 0');
      return;
    }

    try {
      setGuardando(true);

      const nueva: Habitacion = {
        id: Date.now().toString(),
        titulo: nuevaHabitacion.titulo.trim(),
        descripcion: nuevaHabitacion.descripcion.trim(),
        maxPersonas: nuevaHabitacion.maxPersonas,
        precio: nuevaHabitacion.precio,
        tipoPrecio: nuevaHabitacion.tipoPrecio,
        foto: nuevaHabitacion.foto,
        servicios: nuevaHabitacion.servicios.split(',').map(s => s.trim()).filter(Boolean),
        disponible: true
      };

      // TODO: Llamar al backend
      // const creada = await crearHabitacion(businessId, nueva);

      setHabitaciones([...habitaciones, nueva]);
      setModalAgregar(false);
      setNuevaHabitacion(initialFormState);
      setMensaje({ tipo: 'success', texto: 'Habitación agregada correctamente' });
    } catch (error) {
      console.error('Error creando habitación:', error);
      setErrorForm('Error al crear la habitación');
    } finally {
      setGuardando(false);
    }
  };

  // Editar habitación
  const handleEditarHabitacion = async () => {
    if (!habitacionSeleccionada) return;

    try {
      setGuardando(true);

      // TODO: Llamar al backend
      // await actualizarHabitacion(habitacionSeleccionada.id, habitacionSeleccionada);

      setHabitaciones(habitaciones.map(h =>
        h.id === habitacionSeleccionada.id ? habitacionSeleccionada : h
      ));
      setModalEditar(false);
      setHabitacionSeleccionada(null);
      setMensaje({ tipo: 'success', texto: 'Habitación actualizada' });
    } catch (error) {
      console.error('Error actualizando habitación:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al actualizar' });
    } finally {
      setGuardando(false);
    }
  };

  // Cambiar disponibilidad
  const handleCambiarDisponibilidad = async (habitacion: Habitacion) => {
    try {
      // TODO: Llamar al backend
      setHabitaciones(habitaciones.map(h =>
        h.id === habitacion.id ? { ...h, disponible: !h.disponible } : h
      ));
    } catch (error) {
      console.error('Error cambiando disponibilidad:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cambiar disponibilidad' });
    }
  };

  // Eliminar habitación
  const handleEliminarHabitacion = async (habitacion: Habitacion) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${habitacion.titulo}"?`)) return;

    try {
      // TODO: Llamar al backend
      // await eliminarHabitacion(habitacion.id);

      setHabitaciones(habitaciones.filter(h => h.id !== habitacion.id));
      setMensaje({ tipo: 'success', texto: 'Habitación eliminada' });
    } catch (error) {
      console.error('Error eliminando habitación:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al eliminar' });
    }
  };

  // Manejar carga de foto
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (isEditing && habitacionSeleccionada) {
        setHabitacionSeleccionada({ ...habitacionSeleccionada, foto: base64 });
      } else {
        setNuevaHabitacion({ ...nuevaHabitacion, foto: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando habitaciones...</p>
      </div>
    );
  }

  return (
    <div>
      {mensaje && (
        <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje(null)}>
          {mensaje.texto}
        </Alert>
      )}

      <Row>
        {/* Panel de edición */}
        <Col lg={7}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Gestión de Habitaciones / Opciones</h5>
              <Button variant="success" size="sm" onClick={() => setModalAgregar(true)}>
                + Agregar Habitación
              </Button>
            </Card.Header>
            <Card.Body>
              {habitaciones.length === 0 ? (
                <div className="text-center py-4">
                  <div style={{ fontSize: '3rem' }}>🛏️</div>
                  <p className="text-muted">No hay habitaciones configuradas</p>
                  <Button variant="primary" onClick={() => setModalAgregar(true)}>
                    Agregar primera habitación
                  </Button>
                </div>
              ) : (
                <Table hover>
                  <thead>
                    <tr>
                      <th>Habitación</th>
                      <th>Capacidad</th>
                      <th>Precio</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {habitaciones.map(habitacion => (
                      <tr key={habitacion.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {habitacion.foto ? (
                              <img
                                src={habitacion.foto}
                                alt={habitacion.titulo}
                                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                              />
                            ) : (
                              <div
                                className="bg-light d-flex align-items-center justify-content-center"
                                style={{ width: '50px', height: '50px', borderRadius: '4px' }}
                              >
                                🛏️
                              </div>
                            )}
                            <div>
                              <strong>{habitacion.titulo}</strong>
                              {habitacion.servicios && habitacion.servicios.length > 0 && (
                                <div>
                                  {habitacion.servicios.slice(0, 2).map(s => (
                                    <Badge key={s} bg="light" text="dark" className="me-1" style={{ fontSize: '0.7rem' }}>
                                      {s}
                                    </Badge>
                                  ))}
                                  {habitacion.servicios.length > 2 && (
                                    <Badge bg="light" text="dark" style={{ fontSize: '0.7rem' }}>
                                      +{habitacion.servicios.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg="info">
                            👤 {habitacion.maxPersonas} {habitacion.maxPersonas === 1 ? 'persona' : 'personas'}
                          </Badge>
                        </td>
                        <td>
                          <strong>${habitacion.precio.toLocaleString()}</strong>
                          <div className="text-muted small">
                            {habitacion.tipoPrecio === 'por_habitacion' ? 'por noche' : 'por persona/noche'}
                          </div>
                        </td>
                        <td>
                          <Form.Check
                            type="switch"
                            checked={habitacion.disponible}
                            onChange={() => handleCambiarDisponibilidad(habitacion)}
                            label={habitacion.disponible ? 'Disponible' : 'No disponible'}
                          />
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                            onClick={() => {
                              setHabitacionSeleccionada({ ...habitacion });
                              setModalEditar(true);
                            }}
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleEliminarHabitacion(habitacion)}
                          >
                            🗑️
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Preview */}
        <Col lg={5}>
          <Card className="sticky-top" style={{ top: '1rem' }}>
            <Card.Header>
              <h5 className="mb-0">Vista Previa</h5>
              <small className="text-muted">Así lo verán tus huéspedes</small>
            </Card.Header>
            <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {habitaciones.filter(h => h.disponible).length === 0 ? (
                <p className="text-center text-muted">
                  No hay habitaciones disponibles
                </p>
              ) : (
                habitaciones.filter(h => h.disponible).map(habitacion => (
                  <Card key={habitacion.id} className="mb-3">
                    {habitacion.foto && (
                      <Card.Img
                        variant="top"
                        src={habitacion.foto}
                        style={{ height: '120px', objectFit: 'cover' }}
                      />
                    )}
                    <Card.Body>
                      <Card.Title>{habitacion.titulo}</Card.Title>
                      {habitacion.descripcion && (
                        <Card.Text className="text-muted small">
                          {habitacion.descripcion}
                        </Card.Text>
                      )}
                      <div className="d-flex justify-content-between align-items-center">
                        <Badge bg="secondary">
                          👤 Hasta {habitacion.maxPersonas} personas
                        </Badge>
                        <span className="text-success fw-bold">
                          ${habitacion.precio.toLocaleString()}
                          <small className="text-muted fw-normal">
                            /{habitacion.tipoPrecio === 'por_habitacion' ? 'noche' : 'pers.'}
                          </small>
                        </span>
                      </div>
                      {habitacion.servicios && habitacion.servicios.length > 0 && (
                        <div className="mt-2">
                          {habitacion.servicios.map(s => (
                            <Badge key={s} bg="light" text="dark" className="me-1">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal Agregar Habitación */}
      <Modal show={modalAgregar} onHide={() => setModalAgregar(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nueva Habitación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorForm && <Alert variant="danger">{errorForm}</Alert>}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Título *</Form.Label>
                <Form.Control
                  type="text"
                  value={nuevaHabitacion.titulo}
                  onChange={(e) => setNuevaHabitacion({ ...nuevaHabitacion, titulo: e.target.value })}
                  placeholder="Ej: Habitación Doble Superior"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Capacidad máxima *</Form.Label>
                <Form.Select
                  value={nuevaHabitacion.maxPersonas}
                  onChange={(e) => setNuevaHabitacion({ ...nuevaHabitacion, maxPersonas: Number(e.target.value) })}
                >
                  <option value={1}>1 persona (Individual)</option>
                  <option value={2}>2 personas (Doble)</option>
                  <option value={3}>3 personas (Triple)</option>
                  <option value={4}>4 personas (Cuádruple)</option>
                  <option value={5}>5 personas (Quíntuple)</option>
                  <option value={6}>6+ personas (Familiar)</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={nuevaHabitacion.descripcion}
              onChange={(e) => setNuevaHabitacion({ ...nuevaHabitacion, descripcion: e.target.value })}
              placeholder="Descripción de la habitación y sus comodidades"
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Precio *</Form.Label>
                <Form.Control
                  type="number"
                  value={nuevaHabitacion.precio}
                  onChange={(e) => setNuevaHabitacion({ ...nuevaHabitacion, precio: Number(e.target.value) })}
                  min={0}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo de precio</Form.Label>
                <Form.Select
                  value={nuevaHabitacion.tipoPrecio}
                  onChange={(e) => setNuevaHabitacion({ ...nuevaHabitacion, tipoPrecio: e.target.value as 'por_habitacion' | 'por_persona' })}
                >
                  <option value="por_habitacion">Por habitación/noche</option>
                  <option value="por_persona">Por persona/noche</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Servicios incluidos</Form.Label>
            <Form.Control
              type="text"
              value={nuevaHabitacion.servicios}
              onChange={(e) => setNuevaHabitacion({ ...nuevaHabitacion, servicios: e.target.value })}
              placeholder="WiFi, TV, Aire acondicionado, Minibar (separados por coma)"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Foto</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => handleFotoChange(e as React.ChangeEvent<HTMLInputElement>, false)}
            />
            {nuevaHabitacion.foto && (
              <img
                src={nuevaHabitacion.foto}
                alt="Preview"
                className="mt-2"
                style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
              />
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalAgregar(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleAgregarHabitacion} disabled={guardando}>
            {guardando ? <Spinner size="sm" /> : 'Agregar Habitación'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Editar Habitación */}
      <Modal show={modalEditar} onHide={() => setModalEditar(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar Habitación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {habitacionSeleccionada && (
            <>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Título</Form.Label>
                    <Form.Control
                      type="text"
                      value={habitacionSeleccionada.titulo}
                      onChange={(e) => setHabitacionSeleccionada({ ...habitacionSeleccionada, titulo: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Capacidad máxima</Form.Label>
                    <Form.Select
                      value={habitacionSeleccionada.maxPersonas}
                      onChange={(e) => setHabitacionSeleccionada({ ...habitacionSeleccionada, maxPersonas: Number(e.target.value) })}
                    >
                      <option value={1}>1 persona</option>
                      <option value={2}>2 personas</option>
                      <option value={3}>3 personas</option>
                      <option value={4}>4 personas</option>
                      <option value={5}>5 personas</option>
                      <option value={6}>6+ personas</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={habitacionSeleccionada.descripcion || ''}
                  onChange={(e) => setHabitacionSeleccionada({ ...habitacionSeleccionada, descripcion: e.target.value })}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Precio</Form.Label>
                    <Form.Control
                      type="number"
                      value={habitacionSeleccionada.precio}
                      onChange={(e) => setHabitacionSeleccionada({ ...habitacionSeleccionada, precio: Number(e.target.value) })}
                      min={0}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo de precio</Form.Label>
                    <Form.Select
                      value={habitacionSeleccionada.tipoPrecio}
                      onChange={(e) => setHabitacionSeleccionada({ ...habitacionSeleccionada, tipoPrecio: e.target.value as 'por_habitacion' | 'por_persona' })}
                    >
                      <option value="por_habitacion">Por habitación/noche</option>
                      <option value="por_persona">Por persona/noche</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Foto</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFotoChange(e as React.ChangeEvent<HTMLInputElement>, true)}
                />
                {habitacionSeleccionada.foto && (
                  <img
                    src={habitacionSeleccionada.foto}
                    alt="Preview"
                    className="mt-2"
                    style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
                  />
                )}
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalEditar(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleEditarHabitacion} disabled={guardando}>
            {guardando ? <Spinner size="sm" /> : 'Guardar Cambios'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
