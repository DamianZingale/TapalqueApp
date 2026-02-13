import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Col,
  Form,
  ListGroup,
  Modal,
  Row,
  Spinner,
} from 'react-bootstrap';
import { ImageManager } from '../../../shared/components/ImageManager';
import { comercioAPI } from '../api/comercioApi';
import api from '../../../shared/utils/api';

interface Comercio {
  id: number;
  titulo: string;
  descripcion?: string;
  direccion: string;
  horario: string;
  telefono?: string;
  latitud?: number;
  longitud?: number;
  facebook?: string;
  instagram?: string;
  tag?: string;
  imagenes?: { imagenUrl: string }[];
}

const emptyComercio: Partial<Comercio> = {
  titulo: '',
  descripcion: '',
  direccion: '',
  horario: '',
  telefono: '',
  latitud: undefined,
  longitud: undefined,
  facebook: '',
  instagram: '',
  tag: '',
  imagenes: [],
};

export function ComerciosSection() {
  const [items, setItems] = useState<Comercio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Comercio | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [formData, setFormData] = useState<Partial<Comercio>>(emptyComercio);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'danger';
    texto: string;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const res = await comercioAPI.getComercios();
      setItems(res.data);
      console.log('Datos cargados desde API:', res.data);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: Comercio) => {
    console.log('Item seleccionado:', item);
    setSelected(item);
    setIsNew(false);
    setFormData({ ...item });
    setPendingFiles([]);
  };

  const handleNew = () => {
    setSelected(null);
    setIsNew(true);
    setFormData({ ...emptyComercio });
    setPendingFiles([]);
  };

  const handleChange = (field: keyof Comercio, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.titulo) {
      setMensaje({ tipo: 'danger', texto: 'Título requerido' });
      return;
    }
    setSaving(true);
    try {
      const url = isNew ? '/comercio' : `/comercio/${selected?.id}`;

      // Limpiar datos antes de enviar - no enviar undefined para descripción
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, imagenes: _imagenes, ...dataWithoutIdAndImages } = formData;
      const cleanedData = {
        ...(isNew ? dataWithoutIdAndImages : { ...dataWithoutIdAndImages, id: formData.id }),
        descripcion: formData.descripcion?.trim() || '',
        telefono: formData.telefono?.trim() || undefined,
        facebook: formData.facebook?.trim() || undefined,
        instagram: formData.instagram?.trim() || undefined,
        latitud: formData.latitud || undefined,
        longitud: formData.longitud || undefined,
        tag: formData.tag?.trim().toUpperCase() || undefined,
      };

      console.log('Enviando datos:', cleanedData);
      console.log('URL:', url);

      const res = isNew
        ? await api.post(url, cleanedData)
        : await api.patch(url, cleanedData);

      console.log('Respuesta:', res.data);

      const responseData = res.data;
      const comercioId = isNew ? responseData.id : selected?.id;

      // Subir imágenes pendientes al endpoint de imágenes
      if (pendingFiles.length > 0 && comercioId) {
        for (const file of pendingFiles) {
          const imageFormData = new FormData();
          imageFormData.append('file', file);
          try {
            await api.post(`/comercio/imagen/${comercioId}`, imageFormData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          } catch (imgError) {
            console.error('Error subiendo imagen:', imgError);
          }
        }
        setPendingFiles([]);
      }

      setMensaje({
        tipo: 'success',
        texto: isNew ? 'Creado' : 'Actualizado',
      });
      cargarDatos();
      if (isNew) {
        setIsNew(false);
        setFormData(emptyComercio);
      }
    } catch (error: any) {
      console.error('Error en handleSave:', error);
      const errorData = error.response?.data || {};
      setMensaje({
        tipo: 'danger',
        texto: errorData.message || errorData.error || 'Error de conexión',
      });
    } finally {
      setSaving(false);
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await api.delete(`/comercio/${selected.id}`);
      setMensaje({ tipo: 'success', texto: 'Eliminado' });
      setSelected(null);
      setFormData(emptyComercio);
      cargarDatos();
    } catch (error: any) {
      console.error('Error en handleDelete:', error);
      const errorData = error.response?.data || {};
      setMensaje({
        tipo: 'danger',
        texto: errorData.message || errorData.error || 'Error al eliminar',
      });
    } finally {
      setShowDeleteModal(false);
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  if (loading)
    return (
      <div className="text-center py-4">
        <Spinner size="sm" /> Cargando...
      </div>
    );

  return (
    <Row>
      <Col md={4}>
        <div className="d-flex align-items-center mb-2">
          <Button
            variant="success"
            size="sm"
            className="rounded-circle me-2"
            onClick={handleNew}
            style={{ width: 32, height: 32 }}
          >
            +
          </Button>
          <small className="text-muted">Agregar nuevo</small>
        </div>
        <ListGroup style={{ maxHeight: 400, overflowY: 'auto' }}>
          {items.map((item) => (
            <ListGroup.Item
              key={item.id}
              action
              active={selected?.id === item.id}
              onClick={() => handleSelect(item)}
              className="py-2"
            >
              <div className="fw-bold small">{item.titulo}</div>
              <small className="text-muted">{item.direccion}</small>
            </ListGroup.Item>
          ))}
          {items.length === 0 && (
            <ListGroup.Item className="text-muted">
              Sin registros
            </ListGroup.Item>
          )}
        </ListGroup>
      </Col>
      <Col md={8}>
        {mensaje && (
          <Alert variant={mensaje.tipo} className="py-1 small">
            {mensaje.texto}
          </Alert>
        )}
        {selected || isNew ? (
          <Form>
            <h6>
              {isNew ? 'Nuevo Comercio' : `Editando: ${selected?.titulo}`}
            </h6>
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
              <Col md={4}>
                <Form.Group className="mb-2">
                  <Form.Label className="small mb-0">Título *</Form.Label>
                  <Form.Control
                    size="sm"
                    value={formData.titulo || ''}
                    onChange={(e) => handleChange('titulo', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-2">
                  <Form.Label className="small mb-0">Tag</Form.Label>
                  <Form.Control
                    size="sm"
                    placeholder="Ej: REMIS"
                    value={formData.tag || ''}
                    onChange={(e) => handleChange('tag', e.target.value.toUpperCase())}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-2">
                  <Form.Label className="small mb-0">Teléfono</Form.Label>
                  <Form.Control
                    size="sm"
                    value={formData.telefono || ''}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-2">
              <Form.Label className="small mb-0">Descripción</Form.Label>
              <Form.Control
                size="sm"
                as="textarea"
                rows={2}
                value={formData.descripcion || ''}
                onChange={(e) => handleChange('descripcion', e.target.value)}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="small mb-0">Dirección</Form.Label>
                  <Form.Control
                    size="sm"
                    value={formData.direccion || ''}
                    onChange={(e) => handleChange('direccion', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="small mb-0">Horario</Form.Label>
                  <Form.Control
                    size="sm"
                    value={formData.horario || ''}
                    onChange={(e) => handleChange('horario', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="small mb-0">Latitud</Form.Label>
                  <Form.Control
                    size="sm"
                    type="number"
                    step="any"
                    value={formData.latitud ?? ''}
                    onChange={(e) =>
                      handleChange('latitud', parseFloat(e.target.value) || 0)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="small mb-0">Longitud</Form.Label>
                  <Form.Control
                    size="sm"
                    type="number"
                    step="any"
                    value={formData.longitud ?? ''}
                    onChange={(e) =>
                      handleChange('longitud', parseFloat(e.target.value) || 0)
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="small mb-0">Facebook</Form.Label>
                  <Form.Control
                    size="sm"
                    value={formData.facebook || ''}
                    onChange={(e) => handleChange('facebook', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="small mb-0">Instagram</Form.Label>
                  <Form.Control
                    size="sm"
                    value={formData.instagram || ''}
                    onChange={(e) => handleChange('instagram', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <ImageManager
              images={formData.imagenes || []}
              onChange={(images) =>
                setFormData((prev) => ({
                  ...prev,
                  imagenes: images.map((url) => ({ imagenUrl: url })),
                }))
              }
              maxImages={5}
              entityType="comercio"
              entityId={selected?.id}
              pendingFiles={pendingFiles}
              onPendingFile={(file) => setPendingFiles((prev) => [...prev, file])}
              onRemovePendingFile={(index) =>
                setPendingFiles((prev) => prev.filter((_, i) => i !== index))
              }
            />

            <div className="d-flex gap-2 mt-3">
              <Button
                size="sm"
                variant="primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Spinner size="sm" /> : isNew ? 'Crear' : 'Guardar'}
              </Button>
              {!isNew && selected && (
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Eliminar
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setSelected(null);
                  setIsNew(false);
                }}
              >
                Cancelar
              </Button>
            </div>
          </Form>
        ) : (
          <p className="text-muted">Selecciona un item o crea uno nuevo</p>
        )}
      </Col>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Eliminar "{selected?.titulo}"?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
}
