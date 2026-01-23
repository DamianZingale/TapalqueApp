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

type TipoHospedaje = 'HOTEL' | 'DEPARTAMENTO' | 'CABAÑA' | 'CASA' | 'OTRO';

interface Hospedaje {
  id: number;
  titulo: string;
  description?: string;
  ubicacion: string;
  googleMapsUrl?: string;
  numWhatsapp?: string;
  tipoHospedaje: TipoHospedaje;
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

const emptyItem: Partial<Hospedaje> = {
  titulo: '',
  description: '',
  ubicacion: '',
  googleMapsUrl: '',
  numWhatsapp: '',
  tipoHospedaje: 'HOTEL',
  imagenes: [],
  userId: undefined,
};

export function HospedajesSection() {
  const [items, setItems] = useState<Hospedaje[]>([]);
  const [administradores, setAdministradores] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Hospedaje | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [formData, setFormData] = useState<Partial<Hospedaje>>(emptyItem);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'danger';
    texto: string;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentBusiness, setCurrentBusiness] = useState<any>(null);

  useEffect(() => {
    cargarDatos();
    cargarAdministradores();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/hospedajes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
        console.log('Hospedajes cargados desde API:', data);
      }
    } catch (err) {
      console.error('Error cargando hospedajes:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarAdministradores = async () => {
    try {
      const res = await fetch('/api/user/administradores', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAdministradores(data || []);
      }
    } catch (err) {
      console.error('Error cargando administradores:', err);
    }
  };

  const handleSelect = async (item: Hospedaje) => {
    console.log('Hospedaje seleccionado:', item);
    setSelected(item);
    setIsNew(false);
    setFormData({ ...item });
    await loadBusinessData(item.id);
  };

  const handleNew = () => {
    setSelected(null);
    setIsNew(true);
    setFormData({ ...emptyItem });
    setCurrentBusiness(null);
  };

  const handleChange = (field: keyof Hospedaje, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const loadBusinessData = async (hospedajeId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/business/external/${hospedajeId}/type/HOSPEDAJE`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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
      console.error('Error loading business:', err);
      setCurrentBusiness(null);
    }
  };

  const handleSave = async () => {
    if (!formData.titulo) {
      setMensaje({ tipo: 'danger', texto: 'Título requerido' });
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const url = isNew ? '/api/hospedajes' : `/api/hospedajes/${selected?.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const cleanedData = {
        ...formData,
        description: formData.description?.trim() || '',
        ubicacion: formData.ubicacion?.trim() || undefined,
        googleMapsUrl: formData.googleMapsUrl?.trim() || undefined,
        numWhatsapp: formData.numWhatsapp?.trim() || undefined,
        imagenes:
          (formData.imagenes ?? []).length > 0 ? formData.imagenes : undefined,
      };

      console.log('Enviando hospedaje:', cleanedData);
      console.log('URL:', url);
      console.log('Método:', method);

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanedData),
      });

      console.log('Respuesta status:', res.status);

      if (res.ok) {
        const createdData = await res.json();

        // Si es nuevo y se seleccionó un administrador, crear el Business
        if (isNew && formData.userId) {
          const businessPayload = {
            ownerId: formData.userId,
            name: formData.titulo,
            businessType: 'HOSPEDAJE',
            externalBusinessId: createdData.id,
          };

          const businessRes = await fetch('/api/business', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(businessPayload),
          });

          if (!businessRes.ok) {
            console.warn('No se pudo asignar el administrador al negocio');
          }
        }

        // Si es edición y hay un cambio en el administrador, actualizar el Business
        if (!isNew && currentBusiness && formData.userId && formData.userId !== currentBusiness.ownerId) {
          const updatePayload = { ownerId: formData.userId };
          
          const businessRes = await fetch(`/api/business/${currentBusiness.id}/owner`, {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json', 
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(updatePayload)
          });

          if (!businessRes.ok) {
            console.warn('No se pudo actualizar el administrador del negocio');
          } else {
            // Actualizar el business actual con los nuevos datos
            const updatedBusiness = await businessRes.json();
            setCurrentBusiness(updatedBusiness);
          }
        }

        setMensaje({
          tipo: 'success',
          texto: isNew ? 'Creado' : 'Actualizado',
        });
        cargarDatos();
        if (isNew) {
          setIsNew(false);
          setFormData(emptyItem);
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Error del servidor:', errorData);
        setMensaje({
          tipo: 'danger',
          texto:
            errorData.message ||
            errorData.error ||
            `Error ${res.status}: ${res.statusText}`,
        });
      }
    } catch (error) {
      console.error('Error en handleSave de hospedaje:', error);
      setMensaje({ tipo: 'danger', texto: 'Error de conexión' });
    } finally {
      setSaving(false);
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/hospedajes/${selected.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMensaje({ tipo: 'success', texto: 'Eliminado' });
        setSelected(null);
        setFormData(emptyItem);
        cargarDatos();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setMensaje({
          tipo: 'danger',
          texto: errorData.message || errorData.error || 'Error al eliminar',
        });
      }
    } catch (error) {
      console.error('Error en handleDelete de hospedaje:', error);
      setMensaje({ tipo: 'danger', texto: 'Error de conexión al eliminar' });
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
              <small className="text-muted">
                {item.tipoHospedaje} - {item.ubicacion}
              </small>
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
              {isNew ? 'Nuevo Hospedaje' : `Editando: ${selected?.titulo}`}
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
            <Row className="mb-2">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small mb-0">Administrador/Dueño</Form.Label>
                  <Form.Select
                    size="sm"
                    value={formData.userId || ''}
                    onChange={(e) => handleChange('userId', e.target.value)}
                  >
                    <option value="">Seleccionar administrador...</option>
                    {administradores.map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.firstName} {admin.lastName} ({admin.email})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="small mb-0">Título *</Form.Label>
                  <Form.Control
                    size="sm"
                    value={formData.titulo || ''}
                    onChange={(e) => handleChange('titulo', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="small mb-0">Tipo *</Form.Label>
                  <Form.Select
                    size="sm"
                    value={formData.tipoHospedaje || 'HOTEL'}
                    onChange={(e) =>
                      handleChange('tipoHospedaje', e.target.value)
                    }
                  >
                    <option value="HOTEL">Hotel</option>
                    <option value="DEPARTAMENTO">Departamento</option>
                    <option value="CABAÑA">Cabaña</option>
                    <option value="CASA">Casa</option>
                    <option value="OTRO">Otro</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-2">
              <Form.Label className="small mb-0">Descripción</Form.Label>
              <Form.Control
                size="sm"
                as="textarea"
                rows={2}
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="small mb-0">Ubicación *</Form.Label>
                  <Form.Control
                    size="sm"
                    value={formData.ubicacion || ''}
                    onChange={(e) => handleChange('ubicacion', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="small mb-0">WhatsApp</Form.Label>
                  <Form.Control
                    size="sm"
                    value={formData.numWhatsapp || ''}
                    onChange={(e) =>
                      handleChange('numWhatsapp', e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-2">
              <Form.Label className="small mb-0">Google Maps URL *</Form.Label>
              <Form.Control
                size="sm"
                value={formData.googleMapsUrl || ''}
                onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </Form.Group>

            <ImageManager
              images={formData.imagenes || []}
              onChange={(images) =>
                setFormData((prev) => ({
                  ...prev,
                  imagenes: images.map((url) => ({ imagenUrl: url })),
                }))
              }
              maxImages={5}
              entityType="hospedaje"
              entityId={selected?.id}
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
          <Modal.Title>Confirmar</Modal.Title>
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
