import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
} from 'react-bootstrap';
import api from '../../../shared/utils/api';

interface HomeConfig {
  id: number;
  seccion: string;
  imagenUrl: string | null;
  titulo: string | null;
  activo: boolean;
  updatedAt: string | null;
}

const SECCIONES_LABELS: Record<string, string> = {
  COMERCIO: 'Comercios',
  GASTRONOMIA: 'Gastronomía',
  HOSPEDAJE: 'Hospedajes',
  SERVICIOS: 'Servicios',
  ESPACIOS: 'Espacios Públicos',
  EVENTOS: 'Eventos',
  TERMAS: 'Termas',
};

export function ConfigHomeSection() {
  const [configs, setConfigs] = useState<HomeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'danger';
    texto: string;
  } | null>(null);
  const [editingUrls, setEditingUrls] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/home-config');
      const data = res.data || [];
      setConfigs(data);

      const urls: Record<string, string> = {};
      data.forEach((config: HomeConfig) => {
        urls[config.seccion] = config.imagenUrl || '';
      });
      setEditingUrls(urls);
    } catch (err) {
      console.error('Error cargando configuración del home:', err);
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (seccion: string, url: string) => {
    setEditingUrls((prev) => ({ ...prev, [seccion]: url }));
  };

  const handleSave = async (seccion: string) => {
    setSaving(seccion);
    try {
      await api.put(`/home-config/seccion/${seccion}`, {
        imagenUrl: editingUrls[seccion] || null,
      });
      setMensaje({
        tipo: 'success',
        texto: `Imagen de ${SECCIONES_LABELS[seccion]} actualizada`,
      });
      cargarDatos();
    } catch (error: any) {
      console.error('Error guardando:', error);
      setMensaje({
        tipo: 'danger',
        texto: error.response?.data?.message || 'Error al guardar',
      });
    } finally {
      setSaving(null);
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const handleFileSelect = (seccion: string) => {
    fileInputRefs.current[seccion]?.click();
  };

  const handleFileUpload = async (seccion: string, file: File) => {
    if (!file) return;

    // Validar extensión y tipo
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension) || !file.type.match(/^image\/(jpeg|png)$/)) {
      setMensaje({ tipo: 'danger', texto: 'Solo se permiten imágenes JPG, JPEG o PNG. No se admiten .webp, .gif ni otros formatos.' });
      setTimeout(() => setMensaje(null), 3000);
      return;
    }

    // Validar tamaño (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMensaje({ tipo: 'danger', texto: 'La imagen no debe superar 5MB' });
      setTimeout(() => setMensaje(null), 3000);
      return;
    }

    setUploading(seccion);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post(`/home-config/seccion/${seccion}/imagen`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMensaje({
        tipo: 'success',
        texto: `Imagen de ${SECCIONES_LABELS[seccion]} subida correctamente`,
      });

      // Actualizar la URL local
      if (res.data?.imagenUrl) {
        setEditingUrls((prev) => ({ ...prev, [seccion]: res.data.imagenUrl }));
      }

      cargarDatos();
    } catch (error: any) {
      console.error('Error subiendo imagen:', error);
      setMensaje({
        tipo: 'danger',
        texto: error.response?.data?.error || 'Error al subir imagen',
      });
    } finally {
      setUploading(null);
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner size="sm" /> Cargando configuración...
      </div>
    );
  }

  return (
    <div>
      <p className="text-muted small mb-3">
        Configura las imágenes de fondo para cada sección del Home. Puedes subir
        una imagen o pegar una URL externa.
      </p>

      {mensaje && (
        <Alert variant={mensaje.tipo} className="py-2 small">
          {mensaje.texto}
        </Alert>
      )}

      <Row className="g-3">
        {configs.map((config) => (
          <Col md={6} lg={4} key={config.seccion}>
            <Card className="h-100">
              <Card.Header className="py-2">
                <strong className="small">
                  {SECCIONES_LABELS[config.seccion] || config.seccion}
                </strong>
              </Card.Header>
              <Card.Body className="p-2">
                {/* Preview de imagen */}
                <div
                  className="mb-2 rounded position-relative"
                  style={{
                    height: '100px',
                    backgroundImage: editingUrls[config.seccion]
                      ? `url(${editingUrls[config.seccion]})`
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid #dee2e6',
                  }}
                >
                  {uploading === config.seccion && (
                    <div
                      className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    >
                      <Spinner size="sm" variant="light" />
                    </div>
                  )}
                </div>

                {/* Input file oculto */}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  ref={(el) => {
                    fileInputRefs.current[config.seccion] = el;
                  }}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(config.seccion, file);
                    }
                    e.target.value = '';
                  }}
                />

                {/* Botón subir imagen */}
                <Button
                  size="sm"
                  variant="outline-primary"
                  className="w-100 mb-2"
                  onClick={() => handleFileSelect(config.seccion)}
                  disabled={uploading === config.seccion || saving === config.seccion}
                >
                  {uploading === config.seccion ? (
                    <>
                      <Spinner size="sm" className="me-1" /> Subiendo...
                    </>
                  ) : (
                    'Subir imagen'
                  )}
                </Button>

                <div className="text-center small text-muted mb-2">- o usar URL -</div>

                <Form.Group className="mb-2">
                  <Form.Control
                    size="sm"
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={editingUrls[config.seccion] || ''}
                    onChange={(e) => handleUrlChange(config.seccion, e.target.value)}
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleSave(config.seccion)}
                    disabled={saving === config.seccion || uploading === config.seccion}
                    className="flex-grow-1"
                  >
                    {saving === config.seccion ? <Spinner size="sm" /> : 'Guardar URL'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => handleUrlChange(config.seccion, config.imagenUrl || '')}
                    disabled={saving === config.seccion || uploading === config.seccion}
                  >
                    Restaurar
                  </Button>
                </div>

                {config.updatedAt && (
                  <small className="text-muted d-block mt-2">
                    Actualizado: {new Date(config.updatedAt).toLocaleDateString()}
                  </small>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {configs.length === 0 && (
        <Alert variant="info" className="mt-3">
          No hay configuraciones. Se crearán automáticamente al iniciar el
          backend.
        </Alert>
      )}
    </div>
  );
}
