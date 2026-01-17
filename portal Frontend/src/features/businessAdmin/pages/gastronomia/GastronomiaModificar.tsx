import { useState, useEffect } from 'react';
import {
  Card, Row, Col, Button, Table, Badge, Form, Modal, Alert, Spinner
} from 'react-bootstrap';
import {
  fetchMenuByRestaurant,
  crearMenuItem,
  actualizarMenuItem,
  eliminarMenuItem,
  cambiarDisponibilidadItem
} from '../../../../services/fetchMenu';
import type { MenuItem, NuevoMenuItem } from '../../types';
import { CATEGORIAS_MENU, RESTRICCIONES_MENU } from '../../types';

interface GastronomiaModificarProps {
  businessId: string;
  businessName: string;
}

interface NuevoPlatoForm {
  dish_name: string;
  description: string;
  price: number;
  category: string;
  ingredients: string;
  restrictions: string[];
  picture: string;
}

const initialFormState: NuevoPlatoForm = {
  dish_name: '',
  description: '',
  price: 0,
  category: '',
  ingredients: '',
  restrictions: [],
  picture: ''
};

export function GastronomiaModificar({ businessId, businessName }: GastronomiaModificarProps) {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState<'TODOS' | 'DISPONIBLE' | 'NO_DISPONIBLE'>('TODOS');
  const [busqueda, setBusqueda] = useState('');

  // Modal agregar
  const [modalAgregar, setModalAgregar] = useState(false);
  const [nuevoPlato, setNuevoPlato] = useState<NuevoPlatoForm>(initialFormState);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // Modal editar precio
  const [modalEditar, setModalEditar] = useState(false);
  const [platoSeleccionado, setPlatoSeleccionado] = useState<MenuItem | null>(null);
  const [nuevoPrecio, setNuevoPrecio] = useState<number>(0);

  // Mensajes
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'danger'; texto: string } | null>(null);

  useEffect(() => {
    cargarMenu();
  }, [businessId]);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

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

  // Filtrar menú
  const menuFiltrado = menu.filter(item => {
    if (filtroCategoria !== 'TODAS' && item.category !== filtroCategoria) return false;
    if (filtroDisponibilidad === 'DISPONIBLE' && !item.available) return false;
    if (filtroDisponibilidad === 'NO_DISPONIBLE' && item.available) return false;
    if (busqueda && !item.dish_name.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  // Agregar plato
  const handleAgregarPlato = async () => {
    setErrorForm(null);

    if (!nuevoPlato.dish_name.trim()) {
      setErrorForm('El nombre del plato es obligatorio');
      return;
    }
    if (nuevoPlato.price <= 0) {
      setErrorForm('El precio debe ser mayor a 0');
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
        price: nuevoPlato.price,
        category: nuevoPlato.category,
        ingredients: nuevoPlato.ingredients.split(',').map(i => i.trim()).filter(Boolean),
        restrictions: nuevoPlato.restrictions,
        picture: nuevoPlato.picture,
        available: true
      };

      const creado = await crearMenuItem(businessId, nuevoItem);

      if (creado) {
        setMenu([...menu, creado]);
        setModalAgregar(false);
        setNuevoPlato(initialFormState);
        setMensaje({ tipo: 'success', texto: 'Plato agregado correctamente' });
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

  // Editar precio
  const handleEditarPrecio = async () => {
    if (!platoSeleccionado || nuevoPrecio <= 0) return;

    try {
      setGuardando(true);
      const actualizado = await actualizarMenuItem(platoSeleccionado.id, { price: nuevoPrecio });

      if (actualizado) {
        setMenu(menu.map(item =>
          item.id === platoSeleccionado.id ? { ...item, price: nuevoPrecio } : item
        ));
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

  // Cambiar disponibilidad
  const handleCambiarDisponibilidad = async (item: MenuItem) => {
    try {
      const result = await cambiarDisponibilidadItem(item.id, !item.available);

      if (result) {
        setMenu(menu.map(m =>
          m.id === item.id ? { ...m, available: !m.available } : m
        ));
      }
    } catch (error) {
      console.error('Error cambiando disponibilidad:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cambiar disponibilidad' });
    }
  };

  // Eliminar plato
  const handleEliminarPlato = async (item: MenuItem) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${item.dish_name}"?`)) return;

    try {
      const result = await eliminarMenuItem(item.id);

      if (result) {
        setMenu(menu.filter(m => m.id !== item.id));
        setMensaje({ tipo: 'success', texto: 'Plato eliminado' });
      }
    } catch (error) {
      console.error('Error eliminando plato:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al eliminar el plato' });
    }
  };

  // Agrupar por categoría para preview
  const menuPorCategoria = menuFiltrado.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

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
        <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje(null)}>
          {mensaje.texto}
        </Alert>
      )}

      <Row>
        {/* Panel de edición */}
        <Col lg={7}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Gestión del Menú</h5>
              <Button variant="success" size="sm" onClick={() => setModalAgregar(true)}>
                + Agregar Plato
              </Button>
            </Card.Header>
            <Card.Body>
              {/* Filtros */}
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
                    {CATEGORIAS_MENU.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={filtroDisponibilidad}
                    onChange={(e) => setFiltroDisponibilidad(e.target.value as typeof filtroDisponibilidad)}
                  >
                    <option value="TODOS">Todos</option>
                    <option value="DISPONIBLE">Disponibles</option>
                    <option value="NO_DISPONIBLE">No disponibles</option>
                  </Form.Select>
                </Col>
              </Row>

              {/* Tabla de items */}
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
                      <tr key={item.id}>
                        <td>{idx + 1}</td>
                        <td>
                          <strong>{item.dish_name}</strong>
                          {item.restrictions.length > 0 && (
                            <div>
                              {item.restrictions.map(r => (
                                <Badge key={r} bg="info" className="me-1" style={{ fontSize: '0.7rem' }}>
                                  {r}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </td>
                        <td>${item.price.toLocaleString()}</td>
                        <td><Badge bg="secondary">{item.category}</Badge></td>
                        <td>
                          <Form.Check
                            type="switch"
                            checked={item.available}
                            onChange={() => handleCambiarDisponibilidad(item)}
                            label={item.available ? 'Sí' : 'No'}
                          />
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                            onClick={() => {
                              setPlatoSeleccionado(item);
                              setNuevoPrecio(item.price);
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

        {/* Preview del menú */}
        <Col lg={5}>
          <Card className="sticky-top" style={{ top: '1rem' }}>
            <Card.Header>
              <h5 className="mb-0">Vista Previa del Menú</h5>
              <small className="text-muted">Así lo verán tus clientes</small>
            </Card.Header>
            <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {Object.keys(menuPorCategoria).length === 0 ? (
                <p className="text-center text-muted">
                  No hay platos disponibles
                </p>
              ) : (
                Object.entries(menuPorCategoria).map(([categoria, items]) => (
                  <div key={categoria} className="mb-4">
                    <h6 className="border-bottom pb-2 text-primary">{categoria}</h6>
                    {items.filter(i => i.available).map(item => (
                      <div key={item.id} className="d-flex justify-content-between mb-2">
                        <div>
                          <strong>{item.dish_name}</strong>
                          {item.description && (
                            <p className="text-muted small mb-0">{item.description}</p>
                          )}
                        </div>
                        <span className="text-success fw-bold">
                          ${item.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal Agregar Plato */}
      <Modal show={modalAgregar} onHide={() => setModalAgregar(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nuevo Plato</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorForm && <Alert variant="danger">{errorForm}</Alert>}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre del plato *</Form.Label>
                <Form.Control
                  type="text"
                  value={nuevoPlato.dish_name}
                  onChange={(e) => setNuevoPlato({ ...nuevoPlato, dish_name: e.target.value })}
                  placeholder="Ej: Milanesa napolitana"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Precio *</Form.Label>
                <Form.Control
                  type="number"
                  value={nuevoPlato.price}
                  onChange={(e) => setNuevoPlato({ ...nuevoPlato, price: Number(e.target.value) })}
                  min={0}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={nuevoPlato.description}
              onChange={(e) => setNuevoPlato({ ...nuevoPlato, description: e.target.value })}
              placeholder="Descripción breve del plato"
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Categoría *</Form.Label>
                <Form.Select
                  value={nuevoPlato.category}
                  onChange={(e) => setNuevoPlato({ ...nuevoPlato, category: e.target.value })}
                >
                  <option value="">Seleccionar categoría</option>
                  {CATEGORIAS_MENU.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Ingredientes</Form.Label>
                <Form.Control
                  type="text"
                  value={nuevoPlato.ingredients}
                  onChange={(e) => setNuevoPlato({ ...nuevoPlato, ingredients: e.target.value })}
                  placeholder="Separados por coma"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Restricciones alimentarias</Form.Label>
            <div>
              {RESTRICCIONES_MENU.map(restriccion => (
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
                        restrictions: [...nuevoPlato.restrictions, restriccion]
                      });
                    } else {
                      setNuevoPlato({
                        ...nuevoPlato,
                        restrictions: nuevoPlato.restrictions.filter(r => r !== restriccion)
                      });
                    }
                  }}
                />
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>URL de imagen</Form.Label>
            <Form.Control
              type="text"
              value={nuevoPlato.picture}
              onChange={(e) => setNuevoPlato({ ...nuevoPlato, picture: e.target.value })}
              placeholder="https://..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalAgregar(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleAgregarPlato} disabled={guardando}>
            {guardando ? <Spinner size="sm" /> : 'Agregar Plato'}
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
              <p><strong>{platoSeleccionado.dish_name}</strong></p>
              <p className="text-muted">Precio actual: ${platoSeleccionado.price.toLocaleString()}</p>

              <Form.Group>
                <Form.Label>Nuevo precio</Form.Label>
                <Form.Control
                  type="number"
                  value={nuevoPrecio}
                  onChange={(e) => setNuevoPrecio(Number(e.target.value))}
                  min={0}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalEditar(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleEditarPrecio} disabled={guardando}>
            {guardando ? <Spinner size="sm" /> : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
