import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import {
  actualizarHabitacion,
  cambiarDisponibilidadHabitacion,
  crearHabitacion,
  eliminarHabitacion,
  fetchHabitacionesByHospedaje,
} from '../../../services/fetchHabitaciones';
import { subirImagenHabitacion } from '../../../services/habitacionImagenService';
import type { Habitacion } from '../types';

interface HosteleriaHabitacionesProps {
  businessId: string;
  businessName: string;
}

interface NuevaHabitacionForm {
  titulo: string;
  descripcion: string;
  maxPersonas: number;
  precio: number;
  tipoPrecio: 'por_habitacion' | 'por_persona';
  fotos: string[];
  servicios: string;
}

const initialFormState: NuevaHabitacionForm = {
  titulo: '',
  descripcion: '',
  maxPersonas: 2,
  precio: 0,
  tipoPrecio: 'por_habitacion',
  fotos: [],
  servicios: '',
};

const MAX_FOTOS = 3;

export function HosteleriaHabitaciones({
  businessId,
}: HosteleriaHabitacionesProps) {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalAgregar, setModalAgregar] = useState(false);
  const [nuevaHabitacion, setNuevaHabitacion] =
    useState<NuevaHabitacionForm>(initialFormState);
  const [precioInput, setPrecioInput] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const [modalEditar, setModalEditar] = useState(false);
  const [habitacionSeleccionada, setHabitacionSeleccionada] =
    useState<Habitacion | null>(null);
  const [precioEditInput, setPrecioEditInput] = useState('');

  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'danger';
    texto: string;
  } | null>(null);

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
      const data = await fetchHabitacionesByHospedaje(businessId);
      setHabitaciones(data);
    } catch (error) {
      console.error('Error cargando habitaciones:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar las habitaciones' });
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarHabitacion = async () => {
    setErrorForm(null);

    if (!nuevaHabitacion.titulo.trim()) {
      setErrorForm('El título es obligatorio');
      return;
    }
    const precioNumerico = parseFloat(precioInput);
    if (isNaN(precioNumerico) || precioNumerico <= 0) {
      setErrorForm('El precio debe ser un número válido mayor a 0');
      return;
    }
    if (nuevaHabitacion.maxPersonas <= 0) {
      setErrorForm('La capacidad debe ser mayor a 0');
      return;
    }

    try {
      setGuardando(true);

      const nueva = {
        titulo: nuevaHabitacion.titulo.trim(),
        descripcion: nuevaHabitacion.descripcion.trim(),
        maxPersonas: nuevaHabitacion.maxPersonas,
        precio: precioNumerico,
        tipoPrecio: nuevaHabitacion.tipoPrecio,
        fotos: nuevaHabitacion.fotos.slice(0, MAX_FOTOS),
        servicios: nuevaHabitacion.servicios
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        disponible: true,
      };

      const creada = await crearHabitacion(businessId, nueva);

      if (creada) {
        setHabitaciones([...habitaciones, creada]);
        setModalAgregar(false);
        setNuevaHabitacion(initialFormState);
        setPrecioInput('');
        setMensaje({
          tipo: 'success',
          texto: 'Habitación agregada correctamente',
        });
      } else {
        setErrorForm('No se pudo crear la habitación');
      }
    } catch (error) {
      console.error('Error creando habitación:', error);
      setErrorForm('Error al crear la habitación');
    } finally {
      setGuardando(false);
    }
  };

  const handleEditarHabitacion = async () => {
    if (!habitacionSeleccionada) return;

    const precioNumerico = parseFloat(precioEditInput);
    if (isNaN(precioNumerico) || precioNumerico <= 0) {
      setErrorForm('El precio debe ser un número válido mayor a 0');
      return;
    }

    try {
      setGuardando(true);

      const habitacionActualizada = {
        ...habitacionSeleccionada,
        precio: precioNumerico,
      };

      const actualizada = await actualizarHabitacion(
        habitacionSeleccionada.id,
        habitacionActualizada
      );

      if (actualizada) {
        setHabitaciones(
          habitaciones.map((h) =>
            h.id === habitacionSeleccionada.id ? habitacionActualizada : h
          )
        );
        setModalEditar(false);
        setHabitacionSeleccionada(null);
        setPrecioEditInput('');
        setMensaje({ tipo: 'success', texto: 'Habitación actualizada' });
      }
    } catch (error) {
      console.error('Error actualizando habitación:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al actualizar' });
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarDisponibilidad = async (habitacion: Habitacion) => {
    try {
      const result = await cambiarDisponibilidadHabitacion(
        habitacion.id,
        !habitacion.disponible
      );
      if (result) {
        setHabitaciones(
          habitaciones.map((h) =>
            h.id === habitacion.id ? { ...h, disponible: !h.disponible } : h
          )
        );
      }
    } catch (error) {
      console.error('Error cambiando disponibilidad:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cambiar disponibilidad' });
    }
  };

  const handleEliminarHabitacion = async (habitacion: Habitacion) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${habitacion.titulo}"?`))
      return;

    try {
      const result = await eliminarHabitacion(habitacion.id);

      if (result) {
        setHabitaciones(habitaciones.filter((h) => h.id !== habitacion.id));
        setMensaje({ tipo: 'success', texto: 'Habitación eliminada' });
      }
    } catch (error) {
      console.error('Error eliminando habitación:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al eliminar' });
    }
  };

  const handleFotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isEditing: boolean
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar archivo
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      setErrorForm('Solo se permiten archivos JPEG, JPG o PNG');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      setErrorForm('El archivo no puede superar los 5MB');
      return;
    }

    // Verificar límite de fotos
    const fotosActuales =
      isEditing && habitacionSeleccionada
        ? habitacionSeleccionada.fotos || []
        : nuevaHabitacion.fotos;

    if (fotosActuales.length >= MAX_FOTOS) {
      setErrorForm(`Máximo ${MAX_FOTOS} fotos por habitación`);
      return;
    }

    try {
      setGuardando(true);
      const imagenUrl = await subirImagenHabitacion(businessId, file);

      if (isEditing && habitacionSeleccionada) {
        const nuevasFotos = [
          ...(habitacionSeleccionada.fotos || []),
          imagenUrl,
        ].slice(0, MAX_FOTOS);
        setHabitacionSeleccionada({
          ...habitacionSeleccionada,
          fotos: nuevasFotos,
        });
      } else {
        const nuevasFotos = [...nuevaHabitacion.fotos, imagenUrl].slice(
          0,
          MAX_FOTOS
        );
        setNuevaHabitacion({ ...nuevaHabitacion, fotos: nuevasFotos });
      }
    } catch (error) {
      setErrorForm('Error al subir la imagen');
      console.error('Error subiendo imagen:', error);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarFoto = (index: number, isEditing: boolean) => {
    if (isEditing && habitacionSeleccionada) {
      const nuevasFotos = (habitacionSeleccionada.fotos || []).filter(
        (_, i) => i !== index
      );
      setHabitacionSeleccionada({
        ...habitacionSeleccionada,
        fotos: nuevasFotos,
      });
    } else {
      const nuevasFotos = nuevaHabitacion.fotos.filter((_, i) => i !== index);
      setNuevaHabitacion({ ...nuevaHabitacion, fotos: nuevasFotos });
    }
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
        <Alert
          variant={mensaje.tipo}
          dismissible
          onClose={() => setMensaje(null)}
        >
          {mensaje.texto}
        </Alert>
      )}

      <Row>
        <Col lg={7}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Gestión de Habitaciones</h5>
              <Button
                variant="success"
                size="sm"
                onClick={() => setModalAgregar(true)}
              >
                + Agregar Habitación
              </Button>
            </Card.Header>
            <Card.Body>
              {habitaciones.length === 0 ? (
                <div className="text-center py-4">
                  <div style={{ fontSize: '3rem' }}>🛏️</div>
                  <p className="text-muted">No hay habitaciones configuradas</p>
                  <Button
                    variant="primary"
                    onClick={() => setModalAgregar(true)}
                  >
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
                    {habitaciones.map((habitacion) => (
                      <tr key={habitacion.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {habitacion.fotos && habitacion.fotos.length > 0 ? (
                              <div className="position-relative">
                                <img
                                  src={habitacion.fotos[0]}
                                  alt={habitacion.titulo}
                                  style={{
                                    width: '50px',
                                    height: '50px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                  }}
                                  onError={(e) => {
                                    console.error('Error cargando imagen:', habitacion.fotos?.[0]);
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement?.classList.add('bg-light', 'd-flex', 'align-items-center', 'justify-content-center');
                                    e.currentTarget.parentElement!.innerHTML = '<span style="font-size: 1.5rem">🛏️</span>';
                                  }}
                                />
                                {habitacion.fotos.length > 1 && (
                                  <Badge
                                    bg="dark"
                                    className="position-absolute"
                                    style={{
                                      bottom: '2px',
                                      right: '2px',
                                      fontSize: '0.6rem',
                                    }}
                                  >
                                    +{habitacion.fotos.length - 1}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <div
                                className="bg-light d-flex align-items-center justify-content-center"
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  borderRadius: '4px',
                                }}
                              >
                                🛏️
                              </div>
                            )}
                            <div>
                              <strong>{habitacion.titulo}</strong>
                              {habitacion.servicios &&
                                habitacion.servicios.length > 0 && (
                                  <div>
                                    {habitacion.servicios
                                      .slice(0, 2)
                                      .map((s) => (
                                        <Badge
                                          key={s}
                                          bg="light"
                                          text="dark"
                                          className="me-1"
                                          style={{ fontSize: '0.7rem' }}
                                        >
                                          {s}
                                        </Badge>
                                      ))}
                                    {habitacion.servicios.length > 2 && (
                                      <Badge
                                        bg="light"
                                        text="dark"
                                        style={{ fontSize: '0.7rem' }}
                                      >
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
                            {habitacion.maxPersonas}{' '}
                            {habitacion.maxPersonas === 1
                              ? 'persona'
                              : 'personas'}
                          </Badge>
                        </td>
                        <td>
                          <strong>${habitacion.precio.toLocaleString()}</strong>
                          <div className="text-muted small">
                            {habitacion.tipoPrecio === 'por_habitacion'
                              ? 'por noche'
                              : 'por persona/noche'}
                          </div>
                        </td>
                        <td>
                          <Form.Check
                            type="switch"
                            checked={habitacion.disponible}
                            onChange={() =>
                              handleCambiarDisponibilidad(habitacion)
                            }
                            label={
                              habitacion.disponible
                                ? 'Disponible'
                                : 'No disponible'
                            }
                          />
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                            onClick={() => {
                              setHabitacionSeleccionada({ ...habitacion });
                              setPrecioEditInput(habitacion.precio.toString());
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

        <Col lg={5}>
          <Card className="sticky-top" style={{ top: '1rem' }}>
            <Card.Header>
              <h5 className="mb-0">Vista Previa</h5>
              <small className="text-muted">Así lo verán tus huéspedes</small>
            </Card.Header>
            <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {habitaciones.filter((h) => h.disponible).length === 0 ? (
                <p className="text-center text-muted">
                  No hay habitaciones disponibles
                </p>
              ) : (
                habitaciones
                  .filter((h) => h.disponible)
                  .map((habitacion) => (
                    <Card key={habitacion.id} className="mb-3">
                      {habitacion.fotos && habitacion.fotos.length > 0 && (
                        <Card.Img
                          variant="top"
                          src={habitacion.fotos[0]}
                          style={{ height: '120px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120"><rect fill="%23f8f9fa" width="200" height="120"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="40">🛏️</text></svg>';
                          }}
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
                            Hasta {habitacion.maxPersonas} personas
                          </Badge>
                          <span className="text-success fw-bold">
                            ${habitacion.precio.toLocaleString()}
                            <small className="text-muted fw-normal">
                              /
                              {habitacion.tipoPrecio === 'por_habitacion'
                                ? 'noche'
                                : 'pers.'}
                            </small>
                          </span>
                        </div>
                        {habitacion.servicios &&
                          habitacion.servicios.length > 0 && (
                            <div className="mt-2">
                              {habitacion.servicios.map((s) => (
                                <Badge
                                  key={s}
                                  bg="light"
                                  text="dark"
                                  className="me-1"
                                >
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
      <Modal
        show={modalAgregar}
        onHide={() => setModalAgregar(false)}
        size="lg"
      >
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
                  onChange={(e) =>
                    setNuevaHabitacion({
                      ...nuevaHabitacion,
                      titulo: e.target.value,
                    })
                  }
                  placeholder="Ej: Habitación Doble Superior"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Capacidad máxima *</Form.Label>
                <Form.Select
                  value={nuevaHabitacion.maxPersonas}
                  onChange={(e) =>
                    setNuevaHabitacion({
                      ...nuevaHabitacion,
                      maxPersonas: Number(e.target.value),
                    })
                  }
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
              onChange={(e) =>
                setNuevaHabitacion({
                  ...nuevaHabitacion,
                  descripcion: e.target.value,
                })
              }
              placeholder="Descripción de la habitación y sus comodidades"
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Precio *</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="decimal"
                  value={precioInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setPrecioInput(value);
                    }
                  }}
                  placeholder="Ej: 15000.50"
                  isInvalid={
                    precioInput !== '' &&
                    (isNaN(parseFloat(precioInput)) ||
                      parseFloat(precioInput) < 0)
                  }
                />
                <Form.Text className="text-muted">
                  Usa punto (.) como separador decimal
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo de precio</Form.Label>
                <Form.Select
                  value={nuevaHabitacion.tipoPrecio}
                  onChange={(e) =>
                    setNuevaHabitacion({
                      ...nuevaHabitacion,
                      tipoPrecio: e.target.value as
                        | 'por_habitacion'
                        | 'por_persona',
                    })
                  }
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
              onChange={(e) =>
                setNuevaHabitacion({
                  ...nuevaHabitacion,
                  servicios: e.target.value,
                })
              }
              placeholder="WiFi, TV, Aire acondicionado, Minibar (separados por coma)"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fotos de la Habitación (máx. {MAX_FOTOS})</Form.Label>
            <Form.Control
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) =>
                handleFotoChange(
                  e as React.ChangeEvent<HTMLInputElement>,
                  false
                )
              }
              disabled={guardando || nuevaHabitacion.fotos.length >= MAX_FOTOS}
            />
            <Form.Text className="text-muted">
              JPEG, JPG, PNG (máx. 5MB por imagen) -{' '}
              {nuevaHabitacion.fotos.length}/{MAX_FOTOS} fotos
            </Form.Text>
            {nuevaHabitacion.fotos.length > 0 && (
              <div className="mt-2 d-flex gap-2 flex-wrap">
                {nuevaHabitacion.fotos.map((foto, index) => (
                  <div key={index} className="position-relative">
                    <img
                      src={foto}
                      alt={`Preview ${index + 1}`}
                      className="img-thumbnail"
                      style={{
                        width: '100px',
                        height: '80px',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        console.error('Error cargando preview:', foto);
                        e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="80"><rect fill="%23f8d7da" width="100" height="80"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23721c24" font-size="10">Error</text></svg>';
                      }}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute"
                      style={{
                        top: '-8px',
                        right: '-8px',
                        padding: '0 5px',
                        fontSize: '0.7rem',
                      }}
                      onClick={() => handleEliminarFoto(index, false)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalAgregar(false)}>
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={handleAgregarHabitacion}
            disabled={guardando}
          >
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
                      onChange={(e) =>
                        setHabitacionSeleccionada({
                          ...habitacionSeleccionada,
                          titulo: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Capacidad máxima</Form.Label>
                    <Form.Select
                      value={habitacionSeleccionada.maxPersonas}
                      onChange={(e) =>
                        setHabitacionSeleccionada({
                          ...habitacionSeleccionada,
                          maxPersonas: Number(e.target.value),
                        })
                      }
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
                  onChange={(e) =>
                    setHabitacionSeleccionada({
                      ...habitacionSeleccionada,
                      descripcion: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Precio</Form.Label>
                    <Form.Control
                      type="text"
                      inputMode="decimal"
                      value={precioEditInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          setPrecioEditInput(value);
                        }
                      }}
                      placeholder="Ej: 15000.50"
                      isInvalid={
                        precioEditInput !== '' &&
                        (isNaN(parseFloat(precioEditInput)) ||
                          parseFloat(precioEditInput) < 0)
                      }
                    />
                    <Form.Text className="text-muted">
                      Usa punto (.) como separador decimal
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo de precio</Form.Label>
                    <Form.Select
                      value={habitacionSeleccionada.tipoPrecio}
                      onChange={(e) =>
                        setHabitacionSeleccionada({
                          ...habitacionSeleccionada,
                          tipoPrecio: e.target.value as
                            | 'por_habitacion'
                            | 'por_persona',
                        })
                      }
                    >
                      <option value="por_habitacion">
                        Por habitación/noche
                      </option>
                      <option value="por_persona">Por persona/noche</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Fotos de la Habitación (máx. {MAX_FOTOS})</Form.Label>
                <Form.Control
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) =>
                    handleFotoChange(
                      e as React.ChangeEvent<HTMLInputElement>,
                      true
                    )
                  }
                  disabled={guardando || (habitacionSeleccionada.fotos?.length || 0) >= MAX_FOTOS}
                />
                <Form.Text className="text-muted">
                  JPEG, JPG, PNG (máx. 5MB por imagen) - {habitacionSeleccionada.fotos?.length || 0}/{MAX_FOTOS} fotos
                </Form.Text>
                {habitacionSeleccionada.fotos && habitacionSeleccionada.fotos.length > 0 && (
                  <div className="mt-2 d-flex gap-2 flex-wrap">
                    {habitacionSeleccionada.fotos.map((foto, index) => (
                      <div key={index} className="position-relative">
                        <img
                          src={foto}
                          alt={`Foto ${index + 1}`}
                          className="img-thumbnail"
                          style={{
                            width: '100px',
                            height: '80px',
                            objectFit: 'cover',
                          }}
                          onError={(e) => {
                            console.error('Error cargando imagen:', foto);
                            e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="80"><rect fill="%23f8d7da" width="100" height="80"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23721c24" font-size="10">Error</text></svg>';
                          }}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          className="position-absolute"
                          style={{
                            top: '-8px',
                            right: '-8px',
                            padding: '0 5px',
                            fontSize: '0.7rem',
                          }}
                          onClick={() => handleEliminarFoto(index, true)}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalEditar(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleEditarHabitacion}
            disabled={guardando}
          >
            {guardando ? <Spinner size="sm" /> : 'Guardar Cambios'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
