import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Nav,
  Row,
  Spinner,
  Tab,
} from 'react-bootstrap';
import {
  actualizarHabitacion,
  cambiarDisponibilidadHabitacion,
  crearHabitacion,
  eliminarHabitacion,
  fetchHabitacionesByHospedaje,
} from '../../../services/fetchHabitaciones';
import {
  eliminarImagenHabitacion,
  subirImagenHabitacion,
} from '../../../services/habitacionImagenService';
import type { Habitacion } from '../types';

interface HosteleriaHabitacionesProps {
  businessId: string;
  businessName: string;
}

interface NuevaHabitacionForm {
  numero: number;
  titulo: string;
  descripcion: string;
  maxPersonas: number;
  precio: number;
  precioUnaPersona?: number;
  tipoPrecio: 'por_habitacion' | 'por_persona';
  minimoPersonasAPagar?: number;
  fotos: string[];
  servicios: string;
}

const initialFormState: NuevaHabitacionForm = {
  numero: 0,
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
  const [precioUnaPersonaInput, setPrecioUnaPersonaInput] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const [modalEditar, setModalEditar] = useState(false);
  const [habitacionSeleccionada, setHabitacionSeleccionada] =
    useState<Habitacion | null>(null);
  const [precioEditInput, setPrecioEditInput] = useState('');
  const [precioUnaPersonaEditInput, setPrecioUnaPersonaEditInput] = useState('');

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

    if (!nuevaHabitacion.numero || nuevaHabitacion.numero <= 0) {
      setErrorForm('El número de habitación es obligatorio y debe ser mayor a 0');
      return;
    }
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

      const precioUnaPersonaNumerico = precioUnaPersonaInput !== ''
        ? parseFloat(precioUnaPersonaInput)
        : undefined;

      const nueva = {
        numero: nuevaHabitacion.numero,
        titulo: nuevaHabitacion.titulo.trim(),
        descripcion: nuevaHabitacion.descripcion.trim(),
        maxPersonas: nuevaHabitacion.maxPersonas,
        precio: precioNumerico,
        precioUnaPersona: precioUnaPersonaNumerico && !isNaN(precioUnaPersonaNumerico) ? precioUnaPersonaNumerico : undefined,
        tipoPrecio: nuevaHabitacion.tipoPrecio,
        minimoPersonasAPagar: nuevaHabitacion.minimoPersonasAPagar,
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
        setPrecioUnaPersonaInput('');
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

      const precioUnaPersonaEditNumerico = precioUnaPersonaEditInput !== ''
        ? parseFloat(precioUnaPersonaEditInput)
        : null;

      const habitacionActualizada = {
        ...habitacionSeleccionada,
        precio: precioNumerico,
        precioUnaPersona: precioUnaPersonaEditNumerico !== null && !isNaN(precioUnaPersonaEditNumerico)
          ? precioUnaPersonaEditNumerico
          : null,
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
      const imagenUrl = await subirImagenHabitacion(file);

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

  const handleEliminarFoto = async (index: number, isEditing: boolean) => {
    const fotoUrl = isEditing && habitacionSeleccionada
      ? (habitacionSeleccionada.fotos || [])[index]
      : nuevaHabitacion.fotos[index];

    // Eliminar archivo fisico del servidor
    if (fotoUrl) {
      try {
        await eliminarImagenHabitacion(fotoUrl);
      } catch (error) {
        console.error('Error eliminando imagen del servidor:', error);
      }
    }

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

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Gestión de Habitaciones</h5>
        <Button
          variant="success"
          size="sm"
          onClick={() => setModalAgregar(true)}
        >
          + Agregar Habitación
        </Button>
      </div>

      <Tab.Container defaultActiveKey="gestion">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="gestion">Habitaciones ({habitaciones.length})</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="vista-previa">Vista Previa</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* Pestaña Gestión */}
          <Tab.Pane eventKey="gestion">
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
              <Row xs={1} sm={2} lg={3} className="g-3">
                {habitaciones.map((habitacion) => (
                  <Col key={habitacion.id}>
                    <Card className="h-100">
                      {habitacion.fotos && habitacion.fotos.length > 0 ? (
                        <div className="position-relative">
                          <Card.Img
                            variant="top"
                            src={habitacion.fotos[0]}
                            style={{ height: '120px', objectFit: 'cover' }}
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                              e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120"><rect fill="%23f8f9fa" width="200" height="120"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="40">🛏️</text></svg>';
                            }}
                          />
                          {habitacion.fotos.length > 1 && (
                            <Badge
                              bg="dark"
                              className="position-absolute"
                              style={{ bottom: '6px', right: '6px', fontSize: '0.7rem' }}
                            >
                              +{habitacion.fotos.length - 1}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div
                          className="bg-light d-flex align-items-center justify-content-center"
                          style={{ height: '120px', fontSize: '2.5rem' }}
                        >
                          🛏️
                        </div>
                      )}
                      <Card.Body className="pb-2">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <div>
                            <strong>#{habitacion.numero}</strong>{' '}
                            <span>{habitacion.titulo}</span>
                          </div>
                        </div>
                        <div className="d-flex flex-wrap gap-1 mb-2">
                          <Badge bg="info">
                            {habitacion.maxPersonas}{' '}
                            {habitacion.maxPersonas === 1 ? 'pers.' : 'pers.'}
                          </Badge>
                          <Badge bg={habitacion.disponible ? 'success' : 'secondary'}>
                            {habitacion.disponible ? 'Disponible' : 'No disponible'}
                          </Badge>
                          {habitacion.tipoPrecio === 'por_persona' && habitacion.minimoPersonasAPagar && (
                            <Badge bg="warning" text="dark">
                              Mín. {habitacion.minimoPersonasAPagar} pers.
                            </Badge>
                          )}
                        </div>
                        <div className="mb-2">
                          <strong>${habitacion.precio.toLocaleString()}</strong>
                          <span className="text-muted small ms-1">
                            {habitacion.tipoPrecio === 'por_habitacion'
                              ? '/noche (doble)'
                              : '/pers./noche'}
                          </span>
                          {habitacion.tipoPrecio === 'por_habitacion' && habitacion.precioUnaPersona && (
                            <span className="text-muted small d-block">
                              1 pers.: ${habitacion.precioUnaPersona.toLocaleString()}/noche
                            </span>
                          )}
                        </div>
                        {habitacion.servicios && habitacion.servicios.length > 0 && (
                          <div className="mb-2 text-muted" style={{ fontSize: '0.7rem', lineHeight: 1.4 }}>
                            {habitacion.servicios.slice(0, 3).join(' · ')}
                            {habitacion.servicios.length > 3 && ` +${habitacion.servicios.length - 3}`}
                          </div>
                        )}
                      </Card.Body>
                      <Card.Footer className="d-flex justify-content-between align-items-center bg-white">
                        <Form.Check
                          type="switch"
                          checked={habitacion.disponible}
                          onChange={() => handleCambiarDisponibilidad(habitacion)}
                          label=""
                        />
                        <div>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                            onClick={() => {
                              setHabitacionSeleccionada({ ...habitacion });
                              setPrecioEditInput(habitacion.precio.toString());
                              setPrecioUnaPersonaEditInput(habitacion.precioUnaPersona?.toString() ?? '');
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
                        </div>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Tab.Pane>

          {/* Pestaña Vista Previa */}
          <Tab.Pane eventKey="vista-previa">
            <p className="text-muted small mb-3">Así lo verán tus huéspedes</p>
            {habitaciones.filter((h) => h.disponible).length === 0 ? (
              <p className="text-center text-muted">
                No hay habitaciones disponibles
              </p>
            ) : (
              <Row xs={1} sm={2} lg={3} className="g-3">
                {habitaciones
                  .filter((h) => h.disponible)
                  .map((habitacion) => (
                    <Col key={habitacion.id}>
                      <Card className="h-100">
                        {habitacion.fotos && habitacion.fotos.length > 0 && (
                          <Card.Img
                            variant="top"
                            src={habitacion.fotos[0]}
                            style={{ height: '140px', objectFit: 'cover' }}
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                              e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="140"><rect fill="%23f8f9fa" width="200" height="140"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="40">🛏️</text></svg>';
                            }}
                          />
                        )}
                        <Card.Body>
                          <Card.Title className="fs-6">
                            #{habitacion.numero} - {habitacion.titulo}
                          </Card.Title>
                          {habitacion.descripcion && (
                            <Card.Text className="text-muted small">
                              {habitacion.descripcion}
                            </Card.Text>
                          )}
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex flex-wrap gap-1">
                              <Badge bg="secondary">
                                Hasta {habitacion.maxPersonas} personas
                              </Badge>
                              {habitacion.tipoPrecio === 'por_persona' && habitacion.minimoPersonasAPagar && (
                                <Badge bg="warning" text="dark">
                                  Mín. {habitacion.minimoPersonasAPagar} pers.
                                </Badge>
                              )}
                            </div>
                            <span className="text-success fw-bold">
                              ${habitacion.precio.toLocaleString()}
                              <small className="text-muted fw-normal">
                                /
                                {habitacion.tipoPrecio === 'por_habitacion'
                                  ? 'noche'
                                  : 'pers.'}
                              </small>
                              {habitacion.tipoPrecio === 'por_habitacion' && habitacion.precioUnaPersona && (
                                <small className="text-muted fw-normal d-block" style={{ fontSize: '0.75rem' }}>
                                  1 pers.: ${habitacion.precioUnaPersona.toLocaleString()}/noche
                                </small>
                              )}
                            </span>
                          </div>
                          {habitacion.servicios &&
                            habitacion.servicios.length > 0 && (
                              <div className="mt-2 text-muted" style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                                {habitacion.servicios.join(' · ')}
                              </div>
                            )}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
              </Row>
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Modal Agregar Habitación */}
      <Modal
        show={modalAgregar}
        onHide={() => setModalAgregar(false)}
        size="lg"
        fullscreen="sm-down"
      >
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nueva Habitación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorForm && <Alert variant="danger">{errorForm}</Alert>}

          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>N° de habitación *</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  value={nuevaHabitacion.numero || ''}
                  onChange={(e) =>
                    setNuevaHabitacion({
                      ...nuevaHabitacion,
                      numero: Number(e.target.value),
                    })
                  }
                  placeholder="Ej: 101"
                />
              </Form.Group>
            </Col>
            <Col md={5}>
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
            <Col md={4}>
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

          {nuevaHabitacion.tipoPrecio === 'por_habitacion' && nuevaHabitacion.maxPersonas > 1 && (
            <Form.Group className="mb-3">
              <Form.Label>Precio para 1 persona (opcional)</Form.Label>
              <Form.Control
                type="text"
                inputMode="decimal"
                value={precioUnaPersonaInput}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setPrecioUnaPersonaInput(value);
                  }
                }}
                placeholder="Ej: 45000"
                isInvalid={
                  precioUnaPersonaInput !== '' &&
                  (isNaN(parseFloat(precioUnaPersonaInput)) || parseFloat(precioUnaPersonaInput) <= 0)
                }
              />
              <Form.Text className="text-muted">
                Si la habitación se alquila a 1 sola persona, se cobra este precio en lugar del precio doble.
              </Form.Text>
            </Form.Group>
          )}

          {nuevaHabitacion.tipoPrecio === 'por_persona' && (
            <Form.Group className="mb-3">
              <Form.Label>Mínimo de personas a pagar (opcional)</Form.Label>
              <Form.Control
                type="number"
                min={1}
                max={nuevaHabitacion.maxPersonas}
                value={nuevaHabitacion.minimoPersonasAPagar || ''}
                onChange={(e) =>
                  setNuevaHabitacion({
                    ...nuevaHabitacion,
                    minimoPersonasAPagar: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="Ej: 2"
              />
              <Form.Text className="text-muted">
                Si viene 1 persona pero configuras mínimo 2, se cobrará por 2 personas. No puede ser mayor que la capacidad máxima.
              </Form.Text>
            </Form.Group>
          )}

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
      <Modal show={modalEditar} onHide={() => setModalEditar(false)} size="lg" fullscreen="sm-down">
        <Modal.Header closeButton>
          <Modal.Title>Editar Habitación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {habitacionSeleccionada && (
            <>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>N° de habitación</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      value={habitacionSeleccionada.numero || ''}
                      onChange={(e) =>
                        setHabitacionSeleccionada({
                          ...habitacionSeleccionada,
                          numero: Number(e.target.value),
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={5}>
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
                <Col md={4}>
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

              {habitacionSeleccionada.tipoPrecio === 'por_habitacion' && habitacionSeleccionada.maxPersonas > 1 && (
                <Form.Group className="mb-3">
                  <Form.Label>Precio para 1 persona (opcional)</Form.Label>
                  <Form.Control
                    type="text"
                    inputMode="decimal"
                    value={precioUnaPersonaEditInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setPrecioUnaPersonaEditInput(value);
                      }
                    }}
                    placeholder="Ej: 45000"
                    isInvalid={
                      precioUnaPersonaEditInput !== '' &&
                      (isNaN(parseFloat(precioUnaPersonaEditInput)) || parseFloat(precioUnaPersonaEditInput) <= 0)
                    }
                  />
                  <Form.Text className="text-muted">
                    Si la habitación se alquila a 1 sola persona, se cobra este precio en lugar del precio doble. Dejá vacío para cobrar siempre el precio completo.
                  </Form.Text>
                </Form.Group>
              )}

              {habitacionSeleccionada.tipoPrecio === 'por_persona' && (
                <Form.Group className="mb-3">
                  <Form.Label>Mínimo de personas a pagar (opcional)</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    max={habitacionSeleccionada.maxPersonas}
                    value={habitacionSeleccionada.minimoPersonasAPagar || ''}
                    onChange={(e) =>
                      setHabitacionSeleccionada({
                        ...habitacionSeleccionada,
                        minimoPersonasAPagar: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="Ej: 2"
                  />
                  <Form.Text className="text-muted">
                    Si viene 1 persona pero configuras mínimo 2, se cobrará por 2 personas. No puede ser mayor que la capacidad máxima.
                  </Form.Text>
                </Form.Group>
              )}

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
