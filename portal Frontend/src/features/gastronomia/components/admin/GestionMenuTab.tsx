import { useState, useEffect, useMemo } from 'react';
import { Table, Button, Badge, Form, Row, Col, Modal, InputGroup, Alert } from 'react-bootstrap';
import {
    fetchMenuByRestaurant,
    crearMenuItem,
    actualizarMenuItem,
    eliminarMenuItem,
    cambiarDisponibilidadItem,
    fetchDishCategories,
    fetchDishRestrictions,
    MenuItem,
} from '../../../../services/fetchMenu';
import { DishCategoryDTO, DishRestrictionDTO } from '../../types/Imenu';
import { CategoryTags } from '../CategoryTags';
import { RestrictionsTags } from '../RestrictionsTags';
import { useFilterByCategory } from '../../hooks/useFilterByCategory';

interface NuevoPlatoForm {
    dish_name: string;
    description: string;
    price: number;
    category: string;
    ingredients: string;
    restrictions: string[];
    picture: string;
}

const initialNuevoPlato: NuevoPlatoForm = {
    dish_name: '',
    description: '',
    price: 0,
    category: '',
    ingredients: '',
    restrictions: [],
    picture: ''
};

export const GestionMenuTab = () => {
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroDisponibilidad, setFiltroDisponibilidad] = useState<'TODOS' | 'DISPONIBLE' | 'NO_DISPONIBLE'>('TODOS');
    const [busqueda, setBusqueda] = useState<string>('');
    const [modalAgregar, setModalAgregar] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
    const [platoSeleccionado, setPlatoSeleccionado] = useState<MenuItem | null>(null);
    const [nuevoPrecio, setNuevoPrecio] = useState<number>(0);
    const [nuevoPlato, setNuevoPlato] = useState<NuevoPlatoForm>(initialNuevoPlato);
    const [guardando, setGuardando] = useState(false);
    const [errorForm, setErrorForm] = useState<string | null>(null);
    const [mensaje, setMensaje] = useState<{ tipo: "success" | "danger", texto: string } | null>(null);
    const [categoriasMenu, setCategoriasMenu] = useState<DishCategoryDTO[]>([]);
    const [restriccionesMenu, setRestriccionesMenu] = useState<DishRestrictionDTO[]>([]);

    // Hook para filtrar por categoría
    const { filteredItems: menuPorCategoria, activeCategory, setActiveCategory } = useFilterByCategory(menu);

    // TODO: Obtener restaurantId del usuario logueado
    const restaurantId = '1';

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        await Promise.all([
            cargarMenu(),
            cargarCategorias(),
            cargarRestricciones(),
        ]);
        setLoading(false);
    };

    const cargarCategorias = async () => {
        const data = await fetchDishCategories();
        setCategoriasMenu(data);
    };

    const cargarRestricciones = async () => {
        const data = await fetchDishRestrictions();
        setRestriccionesMenu(data);
    };

    const cargarMenu = async () => {
        const data = await fetchMenuByRestaurant(restaurantId);
        // Si no hay datos del backend, usar los items con available = true por defecto
        setMenu(data.map(item => ({ ...item, available: (item as MenuItem).available ?? true })));
    };

    // Categorías únicas del menú
    const categorias = useMemo(() => [...new Set(menu.map(m => m.category))], [menu]);

    // Filtrado adicional (disponibilidad y búsqueda) sobre el resultado del hook
    const menuFiltrado = useMemo(() =>
        (menuPorCategoria as MenuItem[]).filter(item => {
            if (filtroDisponibilidad === 'DISPONIBLE' && !item.available) return false;
            if (filtroDisponibilidad === 'NO_DISPONIBLE' && item.available) return false;
            if (busqueda && !item.dish_name.toLowerCase().includes(busqueda.toLowerCase())) return false;
            return true;
        }), [menuPorCategoria, filtroDisponibilidad, busqueda]);

    const handleCambiarDisponibilidad = async (item: MenuItem) => {
        const nuevoEstado = !item.available;
        setMenu(prev => prev.map(m =>
            m.id === item.id ? { ...m, available: nuevoEstado } : m
        ));

        const exito = await cambiarDisponibilidadItem(item.id, nuevoEstado);
        if (!exito) {
            // Revertir si falla
            setMenu(prev => prev.map(m =>
                m.id === item.id ? { ...m, available: !nuevoEstado } : m
            ));
            setMensaje({ tipo: "danger", texto: "Error al cambiar disponibilidad" });
            setTimeout(() => setMensaje(null), 3000);
        }
    };

    const handleEliminarPlato = async (item: MenuItem) => {
        if (!window.confirm(`¿Está seguro de eliminar "${item.dish_name}"?`)) return;

        const exito = await eliminarMenuItem(item.id);
        if (exito) {
            setMenu(prev => prev.filter(m => m.id !== item.id));
            setMensaje({ tipo: "success", texto: "Plato eliminado correctamente" });
        } else {
            setMensaje({ tipo: "danger", texto: "Error al eliminar el plato" });
        }
        setTimeout(() => setMensaje(null), 3000);
    };

    const abrirModalEditar = (plato: MenuItem) => {
        setPlatoSeleccionado(plato);
        setNuevoPrecio(plato.price);
        setModalEditar(true);
    };

    const guardarCambiosPrecio = async () => {
        if (!platoSeleccionado) return;

        setGuardando(true);
        const actualizado = await actualizarMenuItem(platoSeleccionado.id, { price: nuevoPrecio });
        if (actualizado) {
            setMenu(prev => prev.map(m =>
                m.id === platoSeleccionado.id ? { ...m, price: nuevoPrecio } : m
            ));
            setMensaje({ tipo: "success", texto: "Precio actualizado" });
            setModalEditar(false);
        } else {
            setMensaje({ tipo: "danger", texto: "Error al actualizar precio" });
        }
        setGuardando(false);
        setTimeout(() => setMensaje(null), 3000);
    };

    const handleToggleRestriccion = (restriccion: string) => {
        setNuevoPlato(prev => ({
            ...prev,
            restrictions: prev.restrictions.includes(restriccion)
                ? prev.restrictions.filter(r => r !== restriccion)
                : [...prev.restrictions, restriccion]
        }));
    };

    const handleAgregarPlato = async () => {
        setErrorForm(null);

        // Validaciones
        if (!nuevoPlato.dish_name.trim()) {
            setErrorForm("El nombre del plato es obligatorio");
            return;
        }
        if (!nuevoPlato.category) {
            setErrorForm("Seleccione una categoría");
            return;
        }
        if (nuevoPlato.price <= 0) {
            setErrorForm("El precio debe ser mayor a 0");
            return;
        }

        setGuardando(true);
        try {
            const ingredientesArray = nuevoPlato.ingredients
                .split(',')
                .map(i => i.trim())
                .filter(i => i.length > 0);

            const nuevoItem = await crearMenuItem(restaurantId, {
                dish_name: nuevoPlato.dish_name,
                description: nuevoPlato.description || undefined,
                price: nuevoPlato.price,
                category: nuevoPlato.category,
                ingredients: ingredientesArray,
                restrictions: nuevoPlato.restrictions,
                picture: nuevoPlato.picture || undefined,
                available: true
            });

            if (nuevoItem) {
                setMenu(prev => [...prev, nuevoItem]);
                setModalAgregar(false);
                setNuevoPlato(initialNuevoPlato);
                setMensaje({ tipo: "success", texto: "Plato agregado correctamente" });
            } else {
                setErrorForm("Error al crear el plato. Intente nuevamente.");
            }
        } catch (error) {
            console.error(error);
            setErrorForm("Error al crear el plato. Intente nuevamente.");
        } finally {
            setGuardando(false);
            setTimeout(() => setMensaje(null), 3000);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            {mensaje && (
                <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje(null)} className="mb-3">
                    {mensaje.texto}
                </Alert>
            )}

            {/* Barra de filtros y búsqueda */}
            <Row className="mb-4">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Categoría</Form.Label>
                        <CategoryTags
                            categories={categorias}
                            activeCategory={activeCategory}
                            onSelect={setActiveCategory}
                        />
                    </Form.Group>
                </Col>

                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Disponibilidad</Form.Label>
                        <Form.Select value={filtroDisponibilidad} onChange={(e) => setFiltroDisponibilidad(e.target.value as 'TODOS' | 'DISPONIBLE' | 'NO_DISPONIBLE')}>
                            <option value="TODOS">Todos</option>
                            <option value="DISPONIBLE">Disponible</option>
                            <option value="NO_DISPONIBLE">No disponible</option>
                        </Form.Select>
                    </Form.Group>
                </Col>

                <Col md={4}>
                    <Form.Group>
                        <Form.Label>Buscar plato</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>🔍</InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Nombre del plato..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </InputGroup>
                    </Form.Group>
                </Col>

                <Col md={2} className="d-flex align-items-end">
                    <Button variant="success" className="w-100" onClick={() => setModalAgregar(true)}>
                        + Agregar Plato
                    </Button>
                </Col>
            </Row>

            {/* Contador de resultados */}
            <div className="mb-3">
                <Badge bg="primary">
                    Mostrando {menuFiltrado.length} de {menu.length} platos
                </Badge>
            </div>

            {/* Tabla de menú */}
            <div className="table-responsive">
                <Table striped bordered hover>
                    <thead className="table-dark">
                        <tr>
                            <th>#</th>
                            <th>Plato</th>
                            <th>Precio</th>
                            <th>Categoría</th>
                            <th>Ingredientes</th>
                            <th>Restricciones</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {menuFiltrado.map((item, index) => (
                            <tr key={item.id} className={!item.available ? 'table-secondary' : ''}>
                                <td>{index + 1}</td>
                                <td>
                                    <strong>{item.dish_name}</strong>
                                    {item.description && (
                                        <>
                                            <br />
                                            <small className="text-muted">{item.description}</small>
                                        </>
                                    )}
                                </td>
                                <td>
                                    <h5 className="mb-0">${item.price.toLocaleString()}</h5>
                                </td>
                                <td>
                                    <Badge bg="info">{item.category}</Badge>
                                </td>
                                <td>
                                    <small>
                                        {item.ingredients.map((ing, idx) => (
                                            <Badge key={idx} bg="light" text="dark" className="me-1 mb-1">
                                                {ing}
                                            </Badge>
                                        ))}
                                    </small>
                                </td>
                                <td>
                                    <small>
                                        {item.restrictions.length > 0 ? (
                                            item.restrictions.map((rest, idx) => (
                                                <Badge key={idx} bg="warning" text="dark" className="me-1 mb-1">
                                                    {rest}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted">-</span>
                                        )}
                                    </small>
                                </td>
                                <td>
                                    <Button
                                        size="sm"
                                        variant={item.available ? 'success' : 'danger'}
                                        onClick={() => handleCambiarDisponibilidad(item)}
                                    >
                                        {item.available ? 'Disponible' : 'No disponible'}
                                    </Button>
                                </td>
                                <td>
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        className="me-2 mb-1"
                                        onClick={() => abrirModalEditar(item)}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        className="mb-1"
                                        onClick={() => handleEliminarPlato(item)}
                                    >
                                        Eliminar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {menuFiltrado.length === 0 && (
                <div className="text-center py-5 text-muted">
                    <h5>No se encontraron platos con estos filtros</h5>
                </div>
            )}

            {/* Modal de edición rápida de precio */}
            <Modal show={modalEditar} onHide={() => setModalEditar(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Editar: {platoSeleccionado?.dish_name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Precio</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>$</InputGroup.Text>
                            <Form.Control
                                type="number"
                                value={nuevoPrecio}
                                onChange={(e) => setNuevoPrecio(Number(e.target.value))}
                            />
                        </InputGroup>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModalEditar(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={guardarCambiosPrecio} disabled={guardando}>
                        {guardando ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de agregar plato */}
            <Modal show={modalAgregar} onHide={() => { setModalAgregar(false); setNuevoPlato(initialNuevoPlato); setErrorForm(null); }} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Agregar Nuevo Plato</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorForm && <Alert variant="danger">{errorForm}</Alert>}

                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nombre del plato *</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={nuevoPlato.dish_name}
                                    onChange={(e) => setNuevoPlato(prev => ({ ...prev, dish_name: e.target.value }))}
                                    placeholder="Ej: Pizza Margarita"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Precio *</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>$</InputGroup.Text>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        value={nuevoPlato.price}
                                        onChange={(e) => setNuevoPlato(prev => ({ ...prev, price: Number(e.target.value) }))}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={nuevoPlato.description}
                            onChange={(e) => setNuevoPlato(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Descripción breve del plato"
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Categoría *</Form.Label>
                                <CategoryTags
                                    categories={categoriasMenu.map(cat => cat.name)}
                                    activeCategory={nuevoPlato.category || null}
                                    onSelect={(cat) => setNuevoPlato(prev => ({ ...prev, category: cat || '' }))}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>URL de imagen</Form.Label>
                                <Form.Control
                                    type="url"
                                    value={nuevoPlato.picture}
                                    onChange={(e) => setNuevoPlato(prev => ({ ...prev, picture: e.target.value }))}
                                    placeholder="https://..."
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Ingredientes</Form.Label>
                        <Form.Control
                            type="text"
                            value={nuevoPlato.ingredients}
                            onChange={(e) => setNuevoPlato(prev => ({ ...prev, ingredients: e.target.value }))}
                            placeholder="Separados por comas: Queso, Tomate, Albahaca"
                        />
                        <Form.Text className="text-muted">Separe los ingredientes con comas</Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Restricciones alimentarias</Form.Label>
                        <RestrictionsTags
                            tags={restriccionesMenu.map(rest => rest.name)}
                            selectedTags={nuevoPlato.restrictions}
                            toggleTag={handleToggleRestriccion}
                            clearTags={() => setNuevoPlato(prev => ({ ...prev, restrictions: [] }))}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { setModalAgregar(false); setNuevoPlato(initialNuevoPlato); }}>
                        Cancelar
                    </Button>
                    <Button variant="success" onClick={handleAgregarPlato} disabled={guardando}>
                        {guardando ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Agregando...
                            </>
                        ) : (
                            "Agregar Plato"
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
