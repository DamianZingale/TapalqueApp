import { useState, useEffect } from "react";
import { Row, Col, Button, Form, Alert, Spinner, ListGroup, Modal } from "react-bootstrap";
import { ImageManager } from "../../../shared/components/ImageManager";

interface Restaurant {
    id: number;
    name: string;
    address?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    categories?: string;
    phones?: string;
    schedule?: string;
    delivery?: boolean;
    imagenes?: { imagenUrl: string }[];
    userId?: number;
}

interface Usuario {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

const emptyItem: Partial<Restaurant> = {
    name: "", address: "", email: "", latitude: undefined, longitude: undefined,
    categories: "", phones: "", schedule: "", delivery: false,
    imagenes: [], userId: undefined
};

export function GastronomiaSection() {
    const [items, setItems] = useState<Restaurant[]>([]);
    const [administradores, setAdministradores] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Restaurant | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [formData, setFormData] = useState<Partial<Restaurant>>(emptyItem);
    const [saving, setSaving] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: "success" | "danger"; texto: string } | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentBusiness, setCurrentBusiness] = useState<any>(null);

    useEffect(() => { cargarDatos(); cargarAdministradores(); }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/gastronomia/restaurants", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setItems(data || []);
            }
        } catch (err) { console.error("Error:", err); }
        finally { setLoading(false); }
    };

    const cargarAdministradores = async () => {
        try {
            const res = await fetch("/api/user/administradores", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setAdministradores(data || []);
            }
        } catch (err) { console.error("Error cargando administradores:", err); }
    };

    const handleSelect = async (item: Restaurant) => { 
        setSelected(item); 
        setIsNew(false); 
        setFormData({ ...item });
        await loadBusinessData(item.id);
    };
    const handleNew = () => { setSelected(null); setIsNew(true); setFormData({ ...emptyItem }); setMensaje(null); setCurrentBusiness(null); };
    const handleChange = (field: keyof Restaurant, value: string | number | boolean) => { setFormData(prev => ({ ...prev, [field]: value })); };

    const loadBusinessData = async (restaurantId: number) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/business/external/${restaurantId}/type/RESTAURANT`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const business = await res.json();
                setCurrentBusiness(business);
                setFormData(prev => ({ ...prev, userId: business.ownerId }));
            } else {
                setCurrentBusiness(null);
            }
        } catch (err) {
            console.error("Error loading business:", err);
            setCurrentBusiness(null);
        }
    };

const handleSave = async () => {
        if (!formData.name) { setMensaje({ tipo: "danger", texto: "Nombre requerido" }); return; }
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            const url = isNew ? "/api/gastronomia" : `/api/gastronomia/${selected?.id}`;

            const cleanedData = {
                ...formData,
                address: formData.address?.trim() || undefined,
                email: formData.email?.trim() || undefined,
                categories: formData.categories?.trim() || undefined,
                phones: formData.phones?.trim() || undefined,
                schedule: formData.schedule?.trim() || undefined,
                latitude: formData.latitude || undefined,
                longitude: formData.longitude || undefined,
                imagenes: (formData.imagenes?.length ?? 0) > 0 ? formData.imagenes : undefined,
            };

            const res = await fetch(url, {
                method: isNew ? "POST" : "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(cleanedData)
            });
            if (res.ok) {
                const createdData = await res.json();

                // Si es nuevo y se seleccionó un administrador, crear el Business
                if (isNew && formData.userId) {
                    const businessPayload = {
                        ownerId: formData.userId,
                        name: formData.name,
                        businessType: "RESTAURANT",
                        externalBusinessId: createdData.id
                    };

                    const businessRes = await fetch("/api/business", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                        body: JSON.stringify(businessPayload)
                    });

                    if (!businessRes.ok) {
                        console.warn("No se pudo asignar el administrador al negocio");
                    }
                }

                // Si es edición y hay un cambio en el administrador, actualizar el Business
                if (!isNew && currentBusiness && formData.userId && formData.userId !== currentBusiness.ownerId) {
                    const updatePayload = { ownerId: formData.userId };
                    
                    const businessRes = await fetch(`/api/business/${currentBusiness.id}/owner`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                        body: JSON.stringify(updatePayload)
                    });

                    if (!businessRes.ok) {
                        console.warn("No se pudo actualizar el administrador del negocio");
                    } else {
                        // Actualizar el business actual con los nuevos datos
                        const updatedBusiness = await businessRes.json();
                        setCurrentBusiness(updatedBusiness);
                    }
                }

                setMensaje({ tipo: "success", texto: isNew ? "Creado" : "Actualizado" });
                cargarDatos();
                if (isNew) { setIsNew(false); setFormData(emptyItem); }
            } else { setMensaje({ tipo: "danger", texto: "Error al guardar" }); }
        } catch { setMensaje({ tipo: "danger", texto: "Error de conexión" }); }
        finally { setSaving(false); setTimeout(() => setMensaje(null), 3000); }
    };

    const handleDelete = async () => {
        if (!selected) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/gastronomia/delete/${selected.id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                setMensaje({ tipo: "success", texto: "Eliminado" });
                setSelected(null);
                setFormData(emptyItem);
                cargarDatos();
            } else { setMensaje({ tipo: "danger", texto: "Error al eliminar" }); }
        } catch { setMensaje({ tipo: "danger", texto: "Error de conexión" }); }
        finally { setShowDeleteModal(false); setTimeout(() => setMensaje(null), 3000); }
    };

    if (loading) return <div className="text-center py-4"><Spinner size="sm" /> Cargando...</div>;

    return (
        <Row>
            <Col md={4}>
                <div className="d-flex align-items-center mb-2">
                    <Button variant="success" size="sm" className="rounded-circle me-2" onClick={handleNew} style={{width: 32, height: 32}}>+</Button>
                    <small className="text-muted">Agregar nuevo</small>
                </div>
                <ListGroup style={{ maxHeight: 400, overflowY: "auto" }}>
                    {items.map(item => (
                        <ListGroup.Item key={item.id} action active={selected?.id === item.id} onClick={() => handleSelect(item)} className="py-2">
                            <div className="fw-bold small">{item.name}</div>
                            <small className="text-muted">{item.address || item.categories}</small>
                        </ListGroup.Item>
                    ))}
                    {items.length === 0 && <ListGroup.Item className="text-muted">Sin registros</ListGroup.Item>}
                </ListGroup>
            </Col>
            <Col md={8}>
                {mensaje && <Alert variant={mensaje.tipo} className="py-1 small">{mensaje.texto}</Alert>}
                {(selected || isNew) ? (
                    <Form>
                        <h6>{isNew ? "Nuevo Local Gastronómico" : `Editando: ${selected?.name}`}</h6>
                        {!isNew && selected && (
                            <Row className="mb-2">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="small mb-0">ID</Form.Label>
                                        <Form.Control size="sm" value={selected.id} disabled />
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}
                        <Row className="mb-2">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small mb-0">Administrador/Dueño</Form.Label>
                                    <Form.Select
                                        size="sm"
                                        value={formData.userId || ""}
                                        onChange={e => handleChange("userId", parseInt(e.target.value) || 0)}
                                    >
                                        <option value="">Seleccionar administrador...</option>
                                        {administradores.map(admin => (
                                            <option key={admin.id} value={admin.id}>
                                                {admin.firstName} {admin.lastName} ({admin.email})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}><Form.Group className="mb-2"><Form.Label className="small mb-0">Nombre *</Form.Label><Form.Control size="sm" value={formData.name || ""} onChange={e => handleChange("name", e.target.value)} /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-2"><Form.Label className="small mb-0">Email</Form.Label><Form.Control size="sm" type="email" value={formData.email || ""} onChange={e => handleChange("email", e.target.value)} /></Form.Group></Col>
                        </Row>
                        <Row>
                            <Col md={6}><Form.Group className="mb-2"><Form.Label className="small mb-0">Dirección</Form.Label><Form.Control size="sm" value={formData.address || ""} onChange={e => handleChange("address", e.target.value)} /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-2"><Form.Label className="small mb-0">Categorías</Form.Label><Form.Control size="sm" value={formData.categories || ""} onChange={e => handleChange("categories", e.target.value)} placeholder="Pizza, Empanadas" /></Form.Group></Col>
                        </Row>
                        <Row>
                            <Col md={6}><Form.Group className="mb-2"><Form.Label className="small mb-0">Teléfonos</Form.Label><Form.Control size="sm" value={formData.phones || ""} onChange={e => handleChange("phones", e.target.value)} placeholder="123456, 789012" /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-2"><Form.Label className="small mb-0">Horarios</Form.Label><Form.Control size="sm" value={formData.schedule || ""} onChange={e => handleChange("schedule", e.target.value)} placeholder="1:09:00-22:00; 2:09:00-22:00" /></Form.Group></Col>
                        </Row>
                        <Row>
                            <Col md={4}><Form.Group className="mb-2"><Form.Label className="small mb-0">Latitud</Form.Label><Form.Control size="sm" type="number" step="any" value={formData.latitude ?? ""} onChange={e => handleChange("latitude", parseFloat(e.target.value) || 0)} /></Form.Group></Col>
                            <Col md={4}><Form.Group className="mb-2"><Form.Label className="small mb-0">Longitud</Form.Label><Form.Control size="sm" type="number" step="any" value={formData.longitude ?? ""} onChange={e => handleChange("longitude", parseFloat(e.target.value) || 0)} /></Form.Group></Col>
                            <Col md={4}><Form.Group className="mb-2 pt-4"><Form.Check type="checkbox" label="Delivery" checked={formData.delivery || false} onChange={e => handleChange("delivery", e.target.checked)} /></Form.Group></Col>
                        </Row>
                        <ImageManager 
                            images={formData.imagenes || []}
                            onChange={(images) => setFormData(prev => ({ 
                                ...prev, 
                                imagenes: images.map(url => ({ imagenUrl: url })) 
                            }))}
                            maxImages={5}
                            entityType="gastronomia"
                            entityId={selected?.id}
                        />
                        <div className="d-flex gap-2 mt-3">
                            <Button size="sm" variant="primary" onClick={handleSave} disabled={saving}>{saving ? <Spinner size="sm" /> : (isNew ? "Crear" : "Guardar")}</Button>
                            {!isNew && selected && (<Button size="sm" variant="outline-danger" onClick={() => setShowDeleteModal(true)}>Eliminar</Button>)}
                            <Button size="sm" variant="secondary" onClick={() => { setSelected(null); setIsNew(false); setMensaje(null); }}>Cancelar</Button>
                        </div>
                    </Form>
                ) : (<p className="text-muted">Selecciona un item o crea uno nuevo</p>)}
            </Col>
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton><Modal.Title>Confirmar</Modal.Title></Modal.Header>
                <Modal.Body>¿Eliminar "{selected?.name}"?</Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button><Button variant="danger" onClick={handleDelete}>Eliminar</Button></Modal.Footer>
            </Modal>
        </Row>
    );
}
