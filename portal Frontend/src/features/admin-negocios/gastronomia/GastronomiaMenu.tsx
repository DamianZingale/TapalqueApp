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
import { api } from '../../../config/api';
import {
  actualizarMenuItem,
  cambiarDisponibilidadItem,
  crearMenuItem,
  eliminarMenuItem,
  fetchDishCategories,
  fetchDishRestrictions,
  fetchMenuByRestaurant,
  searchIngredients,
} from '../../../services/fetchMenu';
import { subirImagenMenu } from '../../../services/menuImagenService';
import { SABORES_HELADERIA } from '../../gastronomia/constants/saboresHeladeria';
import type { MenuItem, NuevoMenuItem } from '../types';

interface GastronomiaMenuProps {
  businessId: string;
  businessName: string;
}

interface NuevoPlatoForm {
  dish_name: string;
  description: string;
  price: number;
  category: string;
  ingredients: string[];
  restrictions: string[];
  picture: string;
}

const initialFormState: NuevoPlatoForm = {
  dish_name: '',
  description: '',
  price: 0,
  category: '',
  ingredients: [],
  restrictions: [],
  picture: '',
};

export function GastronomiaMenu({ businessId }: GastronomiaMenuProps) {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [esHeladeria, setEsHeladeria] = useState(false);
  const [saborPersonalizado, setSaborPersonalizado] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState<
    'TODOS' | 'DISPONIBLE' | 'NO_DISPONIBLE'
  >('TODOS');
  const [busqueda, setBusqueda] = useState('');

  const [modalAgregar, setModalAgregar] = useState(false);
  const [nuevoPlato, setNuevoPlato] =
    useState<NuevoPlatoForm>(initialFormState);
  const [precioInput, setPrecioInput] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const [modalEditar, setModalEditar] = useState(false);
  const [platoSeleccionado, setPlatoSeleccionado] = useState<MenuItem | null>(
    null
  );
  const [nuevoPrecioInput, setNuevoPrecioInput] = useState('0');

  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'danger';
    texto: string;
  } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [modalDetalle, setModalDetalle] = useState(false);
  const [platoDetalle, setPlatoDetalle] = useState<MenuItem | null>(null);

  // Estados para datos del backend
  const [categorias, setCategorias] = useState<string[]>([]);
  const [restricciones, setRestricciones] = useState<string[]>([]);

  // Estados para ingredientes con autocomplete
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState<
    string[]
  >([]);
  const [busquedaIngrediente, setBusquedaIngrediente] = useState('');
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [buscandoIngredientes, setBuscandoIngredientes] = useState(false);

  // Estados para categorías con autocomplete y navegación por teclado
  const [busquedaCategoria, setBusquedaCategoria] = useState('');
  const [mostrarSugerenciasCat, setMostrarSugerenciasCat] = useState(false);
  const [indiceSeleccionadoCat, setIndiceSeleccionadoCat] = useState(-1);
  const [categoriasFiltradas, setCategoriasFiltradas] = useState<string[]>([]);

  useEffect(() => {
    cargarMenu();
    cargarCategorias();
    cargarRestricciones();
    cargarTipoRestaurante();
  }, [businessId]);

  const cargarTipoRestaurante = async () => {
    try {
      const data = await api.get<{ esHeladeria?: boolean }>(`/gastronomia/restaurants/${businessId}`);
      setEsHeladeria(data.esHeladeria === true);
    } catch {
      // Si falla, queda como restaurante normal
    }
  };

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  // Debounce para búsqueda de ingredientes
  useEffect(() => {
    if (busquedaIngrediente.length < 2) {
      setIngredientesDisponibles([]);
      return;
    }

    const timer = setTimeout(async () => {
      setBuscandoIngredientes(true);
      try {
        const resultados = await searchIngredients(busquedaIngrediente);
        setIngredientesDisponibles(resultados);
      } catch (error) {
        console.error('Error buscando ingredientes:', error);
      } finally {
        setBuscandoIngredientes(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [busquedaIngrediente]);

  // Filtrar categorías en tiempo real
  useEffect(() => {
    if (busquedaCategoria.length === 0) {
      setCategoriasFiltradas(categorias);
      setIndiceSeleccionadoCat(-1);
    } else {
      const filtradas = categorias.filter((cat) =>
        cat.toLowerCase().includes(busquedaCategoria.toLowerCase())
      );
      setCategoriasFiltradas(filtradas);
      setIndiceSeleccionadoCat(-1);
    }
  }, [busquedaCategoria, categorias]);

  const cargarMenu = async () => {
    try {
      setLoading(true);
      const data = await fetchMenuByRestaurant(businessId);
      setMenu(data);
    } catch (error) {
      console.error('Error cargando menú:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar el menú' });
    } finally {
      setLoading(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const data = await fetchDishCategories();
      setCategorias(data.map((cat) => cat.name));
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const cargarRestricciones = async () => {
    try {
      const data = await fetchDishRestrictions();
      setRestricciones(data.map((rest) => rest.name));
    } catch (error) {
      console.error('Error cargando restricciones:', error);
    }
  };

  const menuFiltrado = menu.filter((item) => {
    if (filtroCategoria !== 'TODAS' && item.category !== filtroCategoria)
      return false;
    if (filtroDisponibilidad === 'DISPONIBLE' && !item.available) return false;
    if (filtroDisponibilidad === 'NO_DISPONIBLE' && item.available)
      return false;
    if (
      busqueda &&
      !item.dish_name.toLowerCase().includes(busqueda.toLowerCase())
    )
      return false;
    return true;
  });

  const handleAgregarPlato = async () => {
    setErrorForm(null);

    if (!nuevoPlato.dish_name.trim()) {
      setErrorForm('El nombre del plato es obligatorio');
      return;
    }
    const precioNumerico = parseFloat(precioInput);
    if (isNaN(precioNumerico) || precioNumerico <= 0) {
      setErrorForm('El precio debe ser un numero valido mayor a 0');
      return;
    }
    if (!nuevoPlato.category) {
      setErrorForm('Debe seleccionar una categoría');
      return;
    }

    try {
      setGuardando(true);

      const nuevoItem: NuevoMenuItem = {
        dish_name: nuevoPlato.dish_name.trim(),
        description: nuevoPlato.description.trim(),
        price: precioNumerico,
        category: nuevoPlato.category,
        ingredients: nuevoPlato.ingredients,
        restrictions: nuevoPlato.restrictions,
        picture: nuevoPlato.picture,
        available: true,
      };

      const creado = await crearMenuItem(businessId, nuevoItem);

      if (creado) {
        setMenu([...menu, creado]);
        setModalAgregar(false);
        setNuevoPlato(initialFormState);
        setPrecioInput('0');
        setBusquedaIngrediente('');
        setIngredientesDisponibles([]);
        setSaborPersonalizado('');
        setBusquedaCategoria('');
        setMostrarSugerenciasCat(false);
        setIndiceSeleccionadoCat(-1);
        setMensaje({ tipo: 'success', texto: esHeladeria ? 'Ítem agregado correctamente' : 'Plato agregado correctamente' });
      } else {
        setErrorForm('No se pudo crear el plato');
      }
    } catch (error) {
      console.error('Error creando plato:', error);
      setErrorForm('Error al crear el plato');
    } finally {
      setGuardando(false);
    }
  };

  const agregarIngrediente = (ingrediente: string) => {
    if (ingrediente && !nuevoPlato.ingredients.includes(ingrediente)) {
      setNuevoPlato({
        ...nuevoPlato,
        ingredients: [...nuevoPlato.ingredients, ingrediente],
      });
    }
    setBusquedaIngrediente('');
    setMostrarSugerencias(false);
  };

  const eliminarIngrediente = (ingrediente: string) => {
    setNuevoPlato({
      ...nuevoPlato,
      ingredients: nuevoPlato.ingredients.filter((i) => i !== ingrediente),
    });
  };

  const toggleSabor = (sabor: string) => {
    if (nuevoPlato.ingredients.includes(sabor)) {
      setNuevoPlato({
        ...nuevoPlato,
        ingredients: nuevoPlato.ingredients.filter((s) => s !== sabor),
      });
    } else {
      setNuevoPlato({
        ...nuevoPlato,
        ingredients: [...nuevoPlato.ingredients, sabor],
      });
    }
  };

  const seleccionarCategoria = (categoria: string) => {
    setNuevoPlato({ ...nuevoPlato, category: categoria });
    setBusquedaCategoria(categoria);
    setMostrarSugerenciasCat(false);
    setIndiceSeleccionadoCat(-1);
  };

  const handleKeyDownCategoria = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!mostrarSugerenciasCat || categoriasFiltradas.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIndiceSeleccionadoCat((prev) =>
          prev < categoriasFiltradas.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setIndiceSeleccionadoCat((prev) =>
          prev > 0 ? prev - 1 : categoriasFiltradas.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (indiceSeleccionadoCat >= 0) {
          seleccionarCategoria(categoriasFiltradas[indiceSeleccionadoCat]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setMostrarSugerenciasCat(false);
        setIndiceSeleccionadoCat(-1);
        break;
    }
  };

  const handleEditarPrecio = async () => {
    const precioNumerico = parseFloat(nuevoPrecioInput);
    if (!platoSeleccionado || isNaN(precioNumerico) || precioNumerico <= 0)
      return;

    try {
      setGuardando(true);
      const actualizado = await actualizarMenuItem(platoSeleccionado.id, {
        price: precioNumerico,
      });

      if (actualizado) {
        setMenu(
          menu.map((item) =>
            item.id === platoSeleccionado.id
              ? { ...item, price: precioNumerico }
              : item
          )
        );
        setModalEditar(false);
        setPlatoSeleccionado(null);
        setMensaje({ tipo: 'success', texto: 'Precio actualizado' });
      }
    } catch (error) {
      console.error('Error actualizando precio:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al actualizar el precio' });
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarDisponibilidad = async (item: MenuItem) => {
    try {
      const result = await cambiarDisponibilidadItem(item.id, !item.available);

      if (result) {
        setMenu(
          menu.map((m) =>
            m.id === item.id ? { ...m, available: !m.available } : m
          )
        );
      }
    } catch (error) {
      console.error('Error cambiando disponibilidad:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cambiar disponibilidad' });
    }
  };

  const handleEliminarPlato = async (item: MenuItem) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${item.dish_name}"?`))
      return;

    try {
      const result = await eliminarMenuItem(item.id);

      if (result) {
        // Actualizar el estado local inmediatamente
        const nuevaLista = menu.filter((m) => m.id !== item.id);
        setMenu(nuevaLista);
        setMensaje({ tipo: 'success', texto: 'Plato eliminado correctamente' });

        // Opcional: recargar el menú desde el servidor para asegurar sincronización
        setTimeout(() => cargarMenu(), 500);
      } else {
        setMensaje({ tipo: 'danger', texto: 'No se pudo eliminar el plato' });
      }
    } catch (error) {
      console.error('Error eliminando plato:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al eliminar el plato' });
      // Recargar el menú en caso de error para sincronizar
      cargarMenu();
    }
  };

  const handleImagenChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar archivo
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      setErrorForm('Solo se permiten archivos JPG, JPEG o PNG. No se admiten .webp, .gif ni otros formatos.');
      return;
    }
    if (!file.type.match(/^image\/(jpeg|png)$/)) {
      setErrorForm('Solo se permiten archivos JPG, JPEG o PNG. No se admiten .webp, .gif ni otros formatos.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      setErrorForm('El archivo no puede superar los 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const imagenUrl = await subirImagenMenu(businessId, file);
      setNuevoPlato({ ...nuevoPlato, picture: imagenUrl });
    } catch (error) {
      setErrorForm('Error al subir la imagen');
      console.error('Error subiendo imagen:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando menú...</p>
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
        <Col>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Gestión del Menú</h5>
              <Button
                variant="success"
                size="sm"
                onClick={() => setModalAgregar(true)}
              >
                + {esHeladeria ? 'Agregar Ítem' : 'Agregar Plato'}
              </Button>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3 g-2">
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Buscar plato..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                  >
                    <option value="TODAS">Todas las categorías</option>
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={filtroDisponibilidad}
                    onChange={(e) =>
                      setFiltroDisponibilidad(
                        e.target.value as typeof filtroDisponibilidad
                      )
                    }
                  >
                    <option value="TODOS">Todos</option>
                    <option value="DISPONIBLE">Disponibles</option>
                    <option value="NO_DISPONIBLE">No disponibles</option>
                  </Form.Select>
                </Col>
              </Row>

              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table hover size="sm">
                  <thead className="sticky-top bg-white">
                    <tr>
                      <th>#</th>
                      <th>Plato</th>
                      <th>Precio</th>
                      <th>Categoría</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuFiltrado.map((item, idx) => (
                      <tr
                        key={item.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setPlatoDetalle(item);
                          setModalDetalle(true);
                        }}
                      >
                        <td>{idx + 1}</td>
                        <td>
                          <strong>{item.dish_name}</strong>
                          {item.restrictions.length > 0 && (
                            <div>
                              {item.restrictions.map((r) => (
                                <Badge
                                  key={r}
                                  bg="info"
                                  className="me-1"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  {r}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </td>
                        <td>${item.price.toLocaleString()}</td>
                        <td>
                          <Badge bg="secondary">{item.category}</Badge>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <Form.Check
                            type="switch"
                            checked={item.available}
                            onChange={() => handleCambiarDisponibilidad(item)}
                            label={item.available ? 'Sí' : 'No'}
                          />
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                            onClick={() => {
                              setPlatoSeleccionado(item);
                              setNuevoPrecioInput(item.price.toString());
                              setModalEditar(true);
                            }}
                          >
                            $
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleEliminarPlato(item)}
                          >
                            🗑️
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {menuFiltrado.length === 0 && (
                  <p className="text-center text-muted py-4">
                    No hay platos que coincidan con los filtros
                  </p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal Detalle Plato */}
      <Modal show={modalDetalle} onHide={() => setModalDetalle(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{platoDetalle?.dish_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {platoDetalle && (
            <>
              {platoDetalle.picture && (
                <img
                  src={platoDetalle.picture}
                  alt={platoDetalle.dish_name}
                  className="img-fluid rounded mb-3"
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Badge bg="secondary">{platoDetalle.category}</Badge>
                <strong className="text-success fs-5">
                  ${platoDetalle.price.toLocaleString()}
                </strong>
              </div>
              <Badge bg={platoDetalle.available ? 'success' : 'danger'} className="mb-3">
                {platoDetalle.available ? 'Disponible' : 'No disponible'}
              </Badge>
              {platoDetalle.description && (
                <p className="text-muted mb-3">{platoDetalle.description}</p>
              )}
              {platoDetalle.ingredients.length > 0 && (
                <div className="mb-2">
                  <small className="fw-bold text-muted d-block mb-1">{esHeladeria ? 'Sabores disponibles:' : 'Ingredientes:'}</small>
                  <div>
                    {platoDetalle.ingredients.map((ing, idx) => (
                      <Badge key={idx} bg="light" text="dark" className="me-1 mb-1 border">
                        {ing}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {platoDetalle.restrictions.length > 0 && (
                <div>
                  <small className="fw-bold text-muted d-block mb-1">Restricciones:</small>
                  <div>
                    {platoDetalle.restrictions.map((r, idx) => (
                      <Badge key={idx} bg="info" className="me-1 mb-1">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => {
              if (platoDetalle) {
                setPlatoSeleccionado(platoDetalle);
                setNuevoPrecioInput(platoDetalle.price.toString());
                setModalDetalle(false);
                setModalEditar(true);
              }
            }}
          >
            Editar precio
          </Button>
          <Button variant="secondary" onClick={() => setModalDetalle(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Agregar Plato */}
      <Modal
        show={modalAgregar}
        onHide={() => {
          setModalAgregar(false);
          setNuevoPlato(initialFormState);
          setPrecioInput('0');
          setBusquedaIngrediente('');
          setIngredientesDisponibles([]);
          setMostrarSugerencias(false);
          setSaborPersonalizado('');
          setBusquedaCategoria('');
          setMostrarSugerenciasCat(false);
          setIndiceSeleccionadoCat(-1);
          setErrorForm(null);
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{esHeladeria ? 'Agregar Ítem de Heladería' : 'Agregar Nuevo Plato'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorForm && <Alert variant="danger">{errorForm}</Alert>}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{esHeladeria ? 'Nombre del ítem *' : 'Nombre del plato *'}</Form.Label>
                <Form.Control
                  type="text"
                  value={nuevoPlato.dish_name}
                  onChange={(e) =>
                    setNuevoPlato({ ...nuevoPlato, dish_name: e.target.value })
                  }
                  placeholder={esHeladeria ? 'Ej: Cuarto kilo, Medio kilo, Kilo' : 'Ej: Milanesa napolitana'}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Precio *</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="decimal"
                  value={precioInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Solo permitir numeros y un punto decimal
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setPrecioInput(value);
                    }
                  }}
                  placeholder="Ej: 1500.50"
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
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={nuevoPlato.description}
              onChange={(e) =>
                setNuevoPlato({ ...nuevoPlato, description: e.target.value })
              }
              placeholder="Descripción breve del plato"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Categoría *</Form.Label>
            <div className="position-relative">
              <Form.Control
                type="text"
                value={busquedaCategoria}
                onChange={(e) => {
                  setBusquedaCategoria(e.target.value);
                  setMostrarSugerenciasCat(true);
                }}
                onKeyDown={handleKeyDownCategoria}
                onFocus={() => {
                  setMostrarSugerenciasCat(true);
                  setCategoriasFiltradas(categorias);
                }}
                onBlur={() => {
                  // Retrasar el cierre para permitir clics
                  setTimeout(() => setMostrarSugerenciasCat(false), 200);
                }}
                placeholder="Buscar categoría... (Ej: pollo)"
              />
              {mostrarSugerenciasCat && categoriasFiltradas.length > 0 && (
                <div
                  className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
                  style={{
                    maxHeight: '250px',
                    overflowY: 'auto',
                    zIndex: 1000,
                  }}
                >
                  {categoriasFiltradas.map((cat, idx) => (
                    <div
                      key={cat}
                      className={`px-3 py-2 ${idx === indiceSeleccionadoCat ? 'bg-primary text-white' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => seleccionarCategoria(cat)}
                      onMouseEnter={(e) => {
                        if (idx !== indiceSeleccionadoCat) {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (idx !== indiceSeleccionadoCat) {
                          e.currentTarget.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {nuevoPlato.category && (
              <small className="text-success d-block mt-1">
                ✓ Seleccionado: <strong>{nuevoPlato.category}</strong>
              </small>
            )}
            <Form.Text className="text-muted">
              Escribe para buscar o usa ↑↓ para navegar y Enter para seleccionar
            </Form.Text>
          </Form.Group>

          {esHeladeria ? (
            <Form.Group className="mb-3">
              <Form.Label>Sabores disponibles <small className="text-muted fw-normal">(opcional — para ítems de tamaño como Kilo, Medio kilo, puede quedar vacío)</small></Form.Label>
              <div
                className="border rounded p-2"
                style={{ maxHeight: '220px', overflowY: 'auto', background: '#fafafa' }}
              >
                <Row className="g-1">
                  {SABORES_HELADERIA.map((sabor) => (
                    <Col xs={6} sm={4} key={sabor}>
                      <Form.Check
                        type="checkbox"
                        label={sabor}
                        checked={nuevoPlato.ingredients.includes(sabor)}
                        onChange={() => toggleSabor(sabor)}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </Col>
                  ))}
                </Row>
              </div>
              <div className="mt-2 d-flex gap-2">
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder="Sabor personalizado (ej: Menta limón)"
                  value={saborPersonalizado}
                  onChange={(e) => setSaborPersonalizado(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const s = saborPersonalizado.trim();
                      if (s && !nuevoPlato.ingredients.includes(s)) {
                        setNuevoPlato({ ...nuevoPlato, ingredients: [...nuevoPlato.ingredients, s] });
                      }
                      setSaborPersonalizado('');
                    }
                  }}
                />
                <Button
                  variant="outline-secondary"
                  size="sm"
                  style={{ whiteSpace: 'nowrap' }}
                  onClick={() => {
                    const s = saborPersonalizado.trim();
                    if (s && !nuevoPlato.ingredients.includes(s)) {
                      setNuevoPlato({ ...nuevoPlato, ingredients: [...nuevoPlato.ingredients, s] });
                    }
                    setSaborPersonalizado('');
                  }}
                >
                  + Agregar
                </Button>
              </div>
              {nuevoPlato.ingredients.length > 0 && (
                <div className="mt-2">
                  <small className="text-muted">Seleccionados: </small>
                  {nuevoPlato.ingredients.map((s, idx) => (
                    <Badge
                      key={idx}
                      bg="primary"
                      className="me-1 mb-1"
                      style={{ cursor: 'pointer', fontSize: '0.8rem' }}
                      onClick={() => toggleSabor(s)}
                    >
                      {s} ×
                    </Badge>
                  ))}
                </div>
              )}
            </Form.Group>
          ) : (
            <Form.Group className="mb-3">
              <Form.Label>Ingredientes</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type="text"
                  value={busquedaIngrediente}
                  onChange={(e) => {
                    setBusquedaIngrediente(e.target.value);
                    setMostrarSugerencias(true);
                  }}
                  onFocus={() => setMostrarSugerencias(true)}
                  placeholder="Buscar ingrediente..."
                />
                {buscandoIngredientes && (
                  <div className="position-absolute end-0 top-0 mt-2 me-2">
                    <Spinner size="sm" animation="border" />
                  </div>
                )}
                {mostrarSugerencias && ingredientesDisponibles.length > 0 && (
                  <div
                    className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
                    style={{
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                    }}
                  >
                    {ingredientesDisponibles.map((ing, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 hover-bg-light cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={() => agregarIngrediente(ing)}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = '#f8f9fa')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = 'white')
                        }
                      >
                        {ing}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {busquedaIngrediente && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1"
                  onClick={() => {
                    if (busquedaIngrediente.trim()) {
                      agregarIngrediente(busquedaIngrediente.trim());
                    }
                  }}
                >
                  + Agregar "{busquedaIngrediente}" como nuevo ingrediente
                </Button>
              )}
              <div className="mt-2">
                {nuevoPlato.ingredients.map((ing, idx) => (
                  <Badge
                    key={idx}
                    bg="secondary"
                    className="me-1 mb-1"
                    style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    {ing}
                    <span
                      className="ms-2"
                      onClick={() => eliminarIngrediente(ing)}
                    >
                      ×
                    </span>
                  </Badge>
                ))}
              </div>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Restricciones alimentarias</Form.Label>
            <div>
              {restricciones.map((restriccion) => (
                <Form.Check
                  key={restriccion}
                  inline
                  type="checkbox"
                  label={restriccion}
                  checked={nuevoPlato.restrictions.includes(restriccion)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setNuevoPlato({
                        ...nuevoPlato,
                        restrictions: [...nuevoPlato.restrictions, restriccion],
                      });
                    } else {
                      setNuevoPlato({
                        ...nuevoPlato,
                        restrictions: nuevoPlato.restrictions.filter(
                          (r) => r !== restriccion
                        ),
                      });
                    }
                  }}
                />
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Imagen del Plato</Form.Label>
            <Row className="g-2">
              <Col md={8}>
                <Form.Control
                  type="text"
                  value={nuevoPlato.picture}
                  onChange={(e) =>
                    setNuevoPlato({ ...nuevoPlato, picture: e.target.value })
                  }
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </Col>
              <Col md={4}>
                <Form.Control
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleImagenChange}
                  disabled={uploadingImage}
                />
              </Col>
            </Row>
            <Form.Text className="text-muted">
              Pega una URL o sube un archivo (JPEG, JPG, PNG - máx. 5MB)
            </Form.Text>
            {nuevoPlato.picture && (
              <div className="mt-2">
                <img
                  src={nuevoPlato.picture}
                  alt="Preview"
                  className="img-thumbnail"
                  style={{
                    maxWidth: '150px',
                    maxHeight: '100px',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://via.placeholder.com/150x100/cccccc/666666?text=Error';
                  }}
                />
                <div className="mt-1">
                  <small className="text-success">✓ Imagen cargada</small>
                </div>
              </div>
            )}
            {uploadingImage && (
              <div className="mt-2">
                <Spinner animation="border" size="sm" /> Subiendo imagen...
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
            onClick={handleAgregarPlato}
            disabled={guardando}
          >
            {guardando ? <Spinner size="sm" /> : (esHeladeria ? 'Agregar Ítem' : 'Agregar Plato')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Editar Precio */}
      <Modal show={modalEditar} onHide={() => setModalEditar(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Precio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {platoSeleccionado && (
            <>
              <p>
                <strong>{platoSeleccionado.dish_name}</strong>
              </p>
              <p className="text-muted">
                Precio actual: ${platoSeleccionado.price.toLocaleString()}
              </p>

              <Form.Group>
                <Form.Label>Nuevo precio</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="decimal"
                  value={nuevoPrecioInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Solo permitir numeros y un punto decimal
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setNuevoPrecioInput(value);
                    }
                  }}
                  placeholder="Ej: 1500.50"
                  isInvalid={
                    nuevoPrecioInput !== '' &&
                    (isNaN(parseFloat(nuevoPrecioInput)) ||
                      parseFloat(nuevoPrecioInput) < 0)
                  }
                />
                <Form.Text className="text-muted">
                  Usa punto (.) como separador decimal
                </Form.Text>
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
            onClick={handleEditarPrecio}
            disabled={guardando}
          >
            {guardando ? <Spinner size="sm" /> : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
