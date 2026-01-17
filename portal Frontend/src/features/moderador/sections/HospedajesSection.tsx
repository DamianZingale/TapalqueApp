import { useState, useEffect } from "react";
import { Row, Col, Button, Form, Alert, Spinner, ListGroup, Modal } from "react-bootstrap";

type TipoHospedaje = "HOTEL" | "DEPARTAMENTO" | "CABAÑA" | "CASA" | "OTRO";

interface Hospedaje {
    id: number;
    titulo: string;
    description?: string;
    ubicacion: string;
    googleMapsUrl?: string;
    numWhatsapp?: string;
    tipoHospedaje: TipoHospedaje;
    imagenes?: string[];
}

const emptyItem: Partial<Hospedaje> = {
    titulo: "", description: "", ubicacion: "", googleMapsUrl: "", numWhatsapp: "", tipoHospedaje: "HOTEL"
};

export function HospedajesSection() {
    const [items, setItems] = useState<Hospedaje[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Hospedaje | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [formData, setFormData] = useState<Partial<Hospedaje>>(emptyItem);
    const [saving, setSaving] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: "success" | "danger"; texto: string } | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => { cargarDatos(); }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/hospedajes");
            if (res.ok) setItems(await res.json());
        } catch (err) { console.error("Error:", err); }
        finally { setLoading(false); }
    };

    const handleSelect = (item: Hospedaje) => { setSelected(item); setIsNew(false); setFormData({ ...item }); };
    const handleNew = () => { setSelected(null); setIsNew(true); setFormData({ ...emptyItem }); };
    const handleChange = (field: keyof Hospedaje, value: string) => { setFormData(prev => ({ ...prev, [field]: value })); };

    const handleSave = async () => {
        if (!formData.titulo) { setMensaje({ tipo: "danger", texto: "Título requerido" }); return; }
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            const url = isNew ? "/api/hospedajes" : `/api/hospedajes/${selected?.id}`;
            const res = await fetch(url, {
                method: isNew ? "POST" : "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
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
            const res = await fetch(`/api/hospedajes/${selected.id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
            if (res.ok) { setMensaje({ tipo: "success", texto: "Eliminado" }); setSelected(null); setFormData(emptyItem); cargarDatos(); }
        } catch { setMensaje({ tipo: "danger", texto: "Error al eliminar" }); }
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
                            <div className="fw-bold small">{item.titulo}</div>
                            <small className="text-muted">{item.tipoHospedaje} - {item.ubicacion}</small>
                        </ListGroup.Item>
                    ))}
                    {items.length === 0 && <ListGroup.Item className="text-muted">Sin registros</ListGroup.Item>}
                </ListGroup>
            </Col>
            <Col md={8}>
                {mensaje && <Alert variant={mensaje.tipo} className="py-1 small">{mensaje.texto}</Alert>}
                {(selected || isNew) ? (
                    <Form>
                        <h6>{isNew ? "Nuevo Hospedaje" : `Editando: ${selected?.titulo}`}</h6>
                        <Row>
                            <Col md={6}><Form.Group className="mb-2"><Form.Label className="small mb-0">Título *</Form.Label><Form.Control size="sm" value={formData.titulo || ""} onChange={e => handleChange("titulo", e.target.value)} /></Form.Group></Col>
                            <Col md={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="small mb-0">Tipo *</Form.Label>
                                    <Form.Select size="sm" value={formData.tipoHospedaje || "HOTEL"} onChange={e => handleChange("tipoHospedaje", e.target.value)}>
                                        <option value="HOTEL">Hotel</option>
                                        <option value="DEPARTAMENTO">Departamento</option>
                                        <option value="CABAÑA">Cabaña</option>
                                        <option value="CASA">Casa</option>
                                        <option value="OTRO">Otro</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-2"><Form.Label className="small mb-0">Descripción</Form.Label><Form.Control size="sm" as="textarea" rows={2} value={formData.description || ""} onChange={e => handleChange("description", e.target.value)} /></Form.Group>
                        <Row>
                            <Col md={6}><Form.Group className="mb-2"><Form.Label className="small mb-0">Ubicación *</Form.Label><Form.Control size="sm" value={formData.ubicacion || ""} onChange={e => handleChange("ubicacion", e.target.value)} /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-2"><Form.Label className="small mb-0">WhatsApp</Form.Label><Form.Control size="sm" value={formData.numWhatsapp || ""} onChange={e => handleChange("numWhatsapp", e.target.value)} /></Form.Group></Col>
                        </Row>
                        <Form.Group className="mb-2"><Form.Label className="small mb-0">Google Maps URL *</Form.Label><Form.Control size="sm" value={formData.googleMapsUrl || ""} onChange={e => handleChange("googleMapsUrl", e.target.value)} placeholder="https://maps.google.com/..." /></Form.Group>
                        {selected?.imagenes && selected.imagenes.length > 0 && (<div className="mb-2"><Form.Label className="small mb-1">Imágenes</Form.Label><div className="d-flex gap-1 flex-wrap">{selected.imagenes.map((url, i) => (<img key={i} src={url} alt="" style={{ width: 60, height: 60, objectFit: "cover" }} />))}</div></div>)}
                        <div className="d-flex gap-2 mt-3">
                            <Button size="sm" variant="primary" onClick={handleSave} disabled={saving}>{saving ? <Spinner size="sm" /> : (isNew ? "Crear" : "Guardar")}</Button>
                            {!isNew && selected && (<Button size="sm" variant="outline-danger" onClick={() => setShowDeleteModal(true)}>Eliminar</Button>)}
                            <Button size="sm" variant="secondary" onClick={() => { setSelected(null); setIsNew(false); }}>Cancelar</Button>
                        </div>
                    </Form>
                ) : (<p className="text-muted">Selecciona un item o crea uno nuevo</p>)}
            </Col>
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton><Modal.Title>Confirmar</Modal.Title></Modal.Header>
                <Modal.Body>¿Eliminar "{selected?.titulo}"?</Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button><Button variant="danger" onClick={handleDelete}>Eliminar</Button></Modal.Footer>
            </Modal>
        </Row>
    );
}
