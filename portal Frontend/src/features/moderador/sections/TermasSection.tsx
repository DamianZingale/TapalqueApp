import { useState, useEffect } from "react";
import { Row, Col, Button, Form, Alert, Spinner, ListGroup } from "react-bootstrap";
import { ImageManager } from "../../../shared/components/ImageManager";

interface Terma {
    id: number;
    titulo: string;
    description?: string;
    direccion?: string;
    horario: string;
    telefono?: string;
    latitud?: number;
    longitud?: number;
    facebook?: string;
    instagram?: string;
    imagenes?: { imagenUrl: string }[];
}

const emptyItem: Partial<Terma> = {
    titulo: "", description: "", direccion: "", horario: "", telefono: "",
    latitud: undefined, longitud: undefined, facebook: "", instagram: "",
    imagenes: []
};

export function TermasSection() {
    const [items, setItems] = useState<Terma[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Terma | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [formData, setFormData] = useState<Partial<Terma>>(emptyItem);
    const [saving, setSaving] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: "success" | "danger"; texto: string } | null>(null);

    useEffect(() => { cargarDatos(); }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/terma", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            
            if (res.ok) {
                const data = await res.json();
                console.log('Termas cargadas:', data);
                setItems(data || []);
            } else {
                console.error("Error al cargar termas:", res.status, res.statusText);
                setItems([]);
            }
        } catch (err) { 
            console.error("Error:", err); 
            setItems([]);
        }
        finally { setLoading(false); }
    };

    const handleSelect = (item: Terma) => { setSelected(item); setIsNew(false); setFormData({ ...item }); };
    const handleNew = () => { setSelected(null); setIsNew(true); setFormData({ ...emptyItem }); };
    const handleChange = (field: keyof Terma, value: string | number | undefined) => { setFormData(prev => ({ ...prev, [field]: value })); };

const handleSave = async () => {
        if (!formData.titulo) { 
            setMensaje({ tipo: "danger", texto: "Título requerido" }); 
            return; 
        }
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            const url = isNew ? "/api/terma" : `/api/terma/${selected?.id}`;
            
            const cleanedData = {
                ...formData,
                description: formData.description?.trim() || undefined,
                direccion: formData.direccion?.trim() || undefined,
                horario: formData.horario?.trim() || undefined,
                telefono: formData.telefono?.trim() || undefined,
                facebook: formData.facebook?.trim() || undefined,
                instagram: formData.instagram?.trim() || undefined,
                latitud: formData.latitud || undefined,
                longitud: formData.longitud || undefined,
                imagenes: (formData.imagenes?.length ?? 0) > 0 ? formData.imagenes : undefined,
            };
            
            const res = await fetch(url, {
                method: isNew ? "POST" : "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(cleanedData)
            });
            if (res.ok) {
                setMensaje({ tipo: "success", texto: isNew ? "Creado" : "Actualizado" });
                cargarDatos();
                if (isNew) { setIsNew(false); setFormData(emptyItem); }
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error('Error del servidor:', errorData);
                setMensaje({ 
                    tipo: "danger", 
                    texto: errorData.message || errorData.error || `Error ${res.status}: ${res.statusText}` 
                });
            }
        } catch (error) {
            console.error('Error en handleSave:', error);
            setMensaje({ tipo: "danger", texto: "Error de conexión" });
        }
        finally { setSaving(false); setTimeout(() => setMensaje(null), 3000); }
    };

    if (loading) return <div className="text-center py-4"><Spinner size="sm" /> Cargando...</div>;

    return (
        <Row>
            <Col md={4}>
                <div className="d-flex align-items-center mb-2">
                    <Button variant="success" size="sm" className="rounded-circle me-2" onClick={handleNew} style={{width: 32, height: 32}}>+</Button>
                    <small className="text-muted">Crear primera terma</small>
                </div>
                <ListGroup style={{ maxHeight: 400, overflowY: "auto" }}>
                    {items.map(item => (
                        <ListGroup.Item key={item.id} action active={selected?.id === item.id} onClick={() => handleSelect(item)} className="py-2">
                            <div className="fw-bold small">{item.titulo}</div>
                            <small className="text-muted">{item.direccion}</small>
                        </ListGroup.Item>
                    ))}
                    {items.length === 0 && <ListGroup.Item className="text-muted">Sin registros - crea la primera</ListGroup.Item>}
                </ListGroup>
            </Col>
            <Col md={8}>
                {mensaje && <Alert variant={mensaje.tipo} className="py-1 small">{mensaje.texto}</Alert>}
                {(selected || isNew) ? (
                    <Form>
                        <h6>{isNew ? "Nueva Terma" : `Editando: ${selected?.titulo}`}</h6>
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
                        <Row>
                            <Col md={6}><Form.Group className="mb-2"><Form.Label className="small mb-0">Título *</Form.Label><Form.Control size="sm" value={formData.titulo || ""} onChange={e => handleChange("titulo", e.target.value)} /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-2"><Form.Label className="small mb-0">Teléfono</Form.Label><Form.Control size="sm" value={formData.telefono || ""} onChange={e => handleChange("telefono", e.target.value)} /></Form.Group></Col>
                        </Row>
                        <Form.Group className="mb-2"><Form.Label className="small mb-0">Descripción</Form.Label><Form.Control size="sm" as="textarea" rows={2} value={formData.description || ""} onChange={e => handleChange("description", e.target.value)} /></Form.Group>
                        <Row>
                            <Col md={6}><Form.Group className="mb-2"><Form.Label className="small mb-0">Dirección</Form.Label><Form.Control size="sm" value={formData.direccion || ""} onChange={e => handleChange("direccion", e.target.value)} /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-2"><Form.Label className="small mb-0">Horario</Form.Label><Form.Control size="sm" value={formData.horario || ""} onChange={e => handleChange("horario", e.target.value)} /></Form.Group></Col>
                        </Row>
                        <Row>
                            <Col md={6}><Form.Group className="mb-2"><Form.Label className="small mb-0">Latitud</Form.Label><Form.Control size="sm" type="number" step="any" value={formData.latitud ?? ""} onChange={e => handleChange("latitud", parseFloat(e.target.value) || 0)} /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-2"><Form.Label className="small mb-0">Longitud</Form.Label><Form.Control size="sm" type="number" step="any" value={formData.longitud ?? ""} onChange={e => handleChange("longitud", parseFloat(e.target.value) || 0)} /></Form.Group></Col>
                        </Row>
                        <Row>
                            <Col md={6}><Form.Group className="mb-2"><Form.Label className="small mb-0">Facebook</Form.Label><Form.Control size="sm" value={formData.facebook || ""} onChange={e => handleChange("facebook", e.target.value)} /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-2"><Form.Label className="small mb-0">Instagram</Form.Label><Form.Control size="sm" value={formData.instagram || ""} onChange={e => handleChange("instagram", e.target.value)} /></Form.Group></Col>
                        </Row>
                        <ImageManager 
                            images={formData.imagenes || []}
                            onChange={(images) => setFormData(prev => ({ 
                                ...prev, 
                                imagenes: images.map(url => ({ imagenUrl: url })) 
                            }))}
                            maxImages={5}
                            entityType="terma"
                            entityId={selected?.id}
                        />
                        {selected?.imagenes && selected.imagenes.length > 0 && (<div className="mb-2"><Form.Label className="small mb-1">Imágenes</Form.Label><div className="d-flex gap-1 flex-wrap">{selected.imagenes.map((img, i) => (<img key={i} src={img.imagenUrl} alt="" style={{ width: 60, height: 60, objectFit: "cover" }} />))}</div></div>)}
                        <div className="d-flex gap-2 mt-3">
                            <Button size="sm" variant="primary" onClick={handleSave} disabled={saving}>{saving ? <Spinner size="sm" /> : (isNew ? "Crear" : "Guardar")}</Button>
                            <Button size="sm" variant="secondary" onClick={() => { setSelected(null); setIsNew(false); }}>Cancelar</Button>
                        </div>
                    </Form>
                ) : (<p className="text-muted">Selecciona la terma para editar o crea una nueva</p>)}
            </Col>
        </Row>
    );
}
