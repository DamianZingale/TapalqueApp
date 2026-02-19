import { useState, useEffect } from "react";
import { Row, Col, Button, Form, Alert, Spinner, ListGroup, Modal } from "react-bootstrap";
import { ImageManager } from "../../../shared/components/ImageManager";
import api from "../../../shared/utils/api";

interface Evento {
    id: number;
    nombreEvento: string;
    lugar: string;
    horario: string;
    fechaInicio: string;
    fechaFin?: string;
    telefonoContacto: string;
    nombreContacto: string;
    descripcion?: string;
    imagenes?: { imagenUrl: string }[];
}

const emptyItem: Partial<Evento> = {
    nombreEvento: "", lugar: "", horario: "", fechaInicio: "", fechaFin: "", telefonoContacto: "", nombreContacto: "", descripcion: "",
    imagenes: []
};

export function EventosSection() {
    const [items, setItems] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Evento | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [formData, setFormData] = useState<Partial<Evento>>(emptyItem);
    const [saving, setSaving] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: "success" | "danger"; texto: string } | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);

    useEffect(() => { cargarDatos(); }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const res = await api.get("/evento");
            setItems(res.data || []);
        } catch (err) { console.error("Error:", err); }
        finally { setLoading(false); }
    };

    const handleSelect = (item: Evento) => { setSelected(item); setIsNew(false); setFormData({ ...item }); setPendingFiles([]); };
    const handleNew = () => { setSelected(null); setIsNew(true); setFormData({ ...emptyItem }); setPendingFiles([]); };
    const handleChange = (field: keyof Evento, value: string) => { setFormData(prev => ({ ...prev, [field]: value })); };

    const handleSave = async () => {
        if (!formData.nombreEvento) { setMensaje({ tipo: "danger", texto: "Nombre requerido" }); return; }
        setSaving(true);
        try {
            const url = isNew ? "/evento" : `/evento/${selected?.id}`;

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, imagenes: _imagenes, ...dataWithoutIdAndImages } = formData;
            const cleanedData = {
                ...(isNew ? dataWithoutIdAndImages : { ...dataWithoutIdAndImages, id: formData.id }),
                fechaFin: dataWithoutIdAndImages.fechaFin || null,
            };

            const res = isNew
                ? await api.post(url, cleanedData)
                : await api.put(url, cleanedData);

            const responseData = res.data;
            const eventoId = isNew ? responseData.id : selected?.id;

            // Subir imágenes pendientes al endpoint de imágenes
            if (pendingFiles.length > 0 && eventoId) {
                for (const file of pendingFiles) {
                    const imageFormData = new FormData();
                    imageFormData.append('file', file);
                    try {
                        await api.post(`/evento/${eventoId}/imagenes`, imageFormData, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                        });
                    } catch (imgError) {
                        console.error('Error subiendo imagen:', imgError);
                    }
                }
                setPendingFiles([]);
            }

            setMensaje({ tipo: "success", texto: isNew ? "Creado" : "Actualizado" });
            cargarDatos();
            if (isNew) { setIsNew(false); setFormData(emptyItem); }
        } catch { setMensaje({ tipo: "danger", texto: "Error de conexión" }); }
        finally { setSaving(false); setTimeout(() => setMensaje(null), 3000); }
    };

    const handleDelete = async () => {
        if (!selected) return;
        try {
            await api.delete(`/evento/${selected.id}`);
            setMensaje({ tipo: "success", texto: "Eliminado" });
            setSelected(null);
            setFormData(emptyItem);
            cargarDatos();
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
                            <div className="fw-bold small">{item.nombreEvento}</div>
                            <small className="text-muted">{item.fechaInicio} - {item.lugar}</small>
                        </ListGroup.Item>
                    ))}
                    {items.length === 0 && <ListGroup.Item className="text-muted">Sin registros</ListGroup.Item>}
                </ListGroup>
            </Col>
            <Col md={8}>
                {mensaje && <Alert variant={mensaje.tipo} className="py-1 small">{mensaje.texto}</Alert>}
                {(selected || isNew) ? (
                    <Form>
                        <h6>{isNew ? "Nuevo Evento" : `Editando: ${selected?.nombreEvento}`}</h6>
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
                            <Col md={6}><Form.Group className="mb-2"><Form.Label className="small mb-0">Nombre *</Form.Label><Form.Control size="sm" value={formData.nombreEvento || ""} onChange={e => handleChange("nombreEvento", e.target.value)} /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-2"><Form.Label className="small mb-0">Lugar *</Form.Label><Form.Control size="sm" value={formData.lugar || ""} onChange={e => handleChange("lugar", e.target.value)} /></Form.Group></Col>
                        </Row>
                        <Row>
                            <Col md={4}><Form.Group className="mb-2"><Form.Label className="small mb-0">Fecha Inicio *</Form.Label><Form.Control size="sm" type="date" value={formData.fechaInicio || ""} onChange={e => handleChange("fechaInicio", e.target.value)} /></Form.Group></Col>
                            <Col md={4}><Form.Group className="mb-2"><Form.Label className="small mb-0">Fecha Fin</Form.Label><Form.Control size="sm" type="date" value={formData.fechaFin || ""} onChange={e => handleChange("fechaFin", e.target.value)} /></Form.Group></Col>
                            <Col md={4}><Form.Group className="mb-2"><Form.Label className="small mb-0">Horario *</Form.Label><Form.Control size="sm" value={formData.horario || ""} onChange={e => handleChange("horario", e.target.value)} /></Form.Group></Col>
                        </Row>
                        <Row>
                            <Col md={6}><Form.Group className="mb-2"><Form.Label className="small mb-0">Nombre Contacto *</Form.Label><Form.Control size="sm" value={formData.nombreContacto || ""} onChange={e => handleChange("nombreContacto", e.target.value)} /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-2"><Form.Label className="small mb-0">Teléfono Contacto *</Form.Label><Form.Control size="sm" value={formData.telefonoContacto || ""} onChange={e => handleChange("telefonoContacto", e.target.value)} /></Form.Group></Col>
                        </Row>
                        <Row>
                            <Col md={12}><Form.Group className="mb-2"><Form.Label className="small mb-0">Descripcion</Form.Label><Form.Control as="textarea" rows={3} size="sm" value={formData.descripcion || ""} onChange={e => handleChange("descripcion", e.target.value)} /></Form.Group></Col>
                        </Row>
                        <ImageManager
                            images={formData.imagenes || []}
                            onChange={(images) => setFormData(prev => ({
                                ...prev,
                                imagenes: images.map(url => ({ imagenUrl: url }))
                            }))}
                            maxImages={5}
                            entityType="evento"
                            entityId={selected?.id}
                            pendingFiles={pendingFiles}
                            onPendingFile={(file) => setPendingFiles((prev) => [...prev, file])}
                            onRemovePendingFile={(index) =>
                                setPendingFiles((prev) => prev.filter((_, i) => i !== index))
                            }
                        />
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
                <Modal.Body>¿Eliminar "{selected?.nombreEvento}"?</Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button><Button variant="danger" onClick={handleDelete}>Eliminar</Button></Modal.Footer>
            </Modal>
        </Row>
    );
}
