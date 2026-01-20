import { useState } from 'react';
import { Button, Form, Alert, Image, Row, Col } from 'react-bootstrap';

interface ImageManagerProps {
  images: string[] | { imagenUrl: string }[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  entityType?: string; // 'comercio', 'servicio', etc.
  entityId?: number;
}

export function ImageManager({ images, onChange, maxImages = 5, entityType = 'comercio', entityId }: ImageManagerProps) {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Convertir imágenes al formato uniforme (array de strings)
  const currentImages = Array.isArray(images) 
    ? images.map(img => typeof img === 'string' ? img : img.imagenUrl)
    : [];

  const handleAddImage = () => {
    if (newImageUrl.trim() && currentImages.length < maxImages) {
      const updatedImages = [...currentImages, newImageUrl.trim()];
      onChange(updatedImages);
      setNewImageUrl('');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || currentImages.length >= maxImages) return;

    const file = files[0];
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      alert('Solo se permiten archivos JPEG, JPG o PNG');
      return;
    }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert('El archivo no puede superar los 5MB');
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('imagen', file);
        
        // Usar endpoints específicos para cada tipo de entidad
        if (entityId && entityType) {
          let endpoint = '';
          if (entityType === 'hospedaje') {
            endpoint = `/api/hospedajes/${entityId}/imagenes`;
          } else if (entityType === 'gastronomia') {
            endpoint = `/restaurante/${entityId}/imagenes`;
          } else {
            // Endpoints genéricos para otras entidades
            const endpointMap: { [key: string]: string } = {
              'comercio': '/api/comercio/imagen',
              'servicio': '/api/servicio/imagen',
              'evento': '/api/eventos/imagen',
              'espacio-publico': '/api/espacio-publico/imagen',
              'terma': '/api/terma/imagen'
            };
            endpoint = endpointMap[entityType] || '/api/comercio/imagen';
            endpoint = `${endpoint}/${entityId}`;
          }
          
          // Ajustar el nombre del campo del archivo según el backend
          if (entityType === 'hospedaje' || entityType === 'gastronomia') {
            formData.delete('imagen');
            formData.append('file', file);
          }
          
          console.log('Subiendo imagen a:', endpoint);
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Imagen subida exitosamente:', result);
            const imageUrl = result.imagenUrl || result.url || result.message;
            if (imageUrl) {
              const updatedImages = [...currentImages, imageUrl];
              onChange(updatedImages);
            } else {
              alert('La imagen se subió pero no se recibió la URL');
            }
          } else {
            console.error('Error en respuesta del servidor:', response.status);
            const error = await response.json().catch(() => ({}));
            alert(`Error al subir imagen: ${error.message || error.error || `Error ${response.status}`}`);
          }
        } else {
          // Para nuevas entidades sin ID, mostramos error
          alert('Debe guardar el registro primero antes de subir imágenes');
        }
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      alert('Error de conexión al subir la imagen. Verifique que el backend esté disponible.');
    } finally {
      setUploading(false);
      // Limpiar el input
      event.target.value = '';
    }
  };

  const handleRemoveImage = async (indexToRemove: number) => {
    const imageToRemove = currentImages[indexToRemove];
    
    // Si tenemos ID y tipo de entidad, intentamos eliminar del backend
    if (entityId && entityType) {
      try {
        let endpoint = '';
        if (entityType === 'hospedaje') {
          endpoint = `/api/hospedajes/${entityId}/imagenes`;
        } else if (entityType === 'gastronomia') {
          endpoint = `/restaurante/${entityId}/imagenes`;
        } else {
          const endpointMap: { [key: string]: string } = {
            'comercio': '/api/comercio/imagen',
            'servicio': '/api/servicio/imagen',
            'evento': '/api/eventos/imagen',
            'espacio-publico': '/api/espacio-publico/imagen',
            'terma': '/api/terma/imagen'
          };
          endpoint = endpointMap[entityType] || '/api/comercio/imagen';
          endpoint = `${endpoint}/${entityId}`;
        }
        
        const response = await fetch(endpoint, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ imagenUrl: imageToRemove })
        });

        if (!response.ok) {
          console.warn('No se pudo eliminar la imagen del servidor:', response.status);
        }
      } catch (error) {
        console.error('Error eliminando imagen del backend:', error);
        // Continuamos con la eliminación local incluso si falla el backend
      }
    }
    
    const updatedImages = currentImages.filter((_, index) => index !== indexToRemove);
    onChange(updatedImages);
  };

  return (
    <div className="mb-3">
      <Form.Label className="small mb-2">Imágenes ({currentImages.length}/{maxImages})</Form.Label>
      
      {/* Imágenes actuales */}
      {currentImages.length > 0 && (
        <Row className="mb-3 g-2">
          {currentImages.map((url, index) => (
            <Col key={index} xs={6} md={4} lg={3}>
              <div className="position-relative">
                 <Image 
                   src={url} 
                   alt={`Imagen ${index + 1}`}
                   fluid 
                   className="w-100 h-100" 
                   style={{ objectFit: 'cover', maxHeight: '120px' }}
                   onError={(e) => {
                     console.warn('Error cargando imagen:', url);
                     e.currentTarget.src = 'https://via.placeholder.com/120x120/cccccc/666666?text=Error';
                   }}
                   onLoad={() => {
                     console.log('Imagen cargada exitosamente:', url);
                   }}
                 />
                <Button
                  variant="danger"
                  size="sm"
                  className="position-absolute top-0 end-0 m-1"
                  onClick={() => handleRemoveImage(index)}
                  style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                >
                  ×
                </Button>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {/* Agregar nuevas imágenes */}
      {currentImages.length < maxImages && (
        <Row className="g-2">
          <Col md={6}>
            <div className="d-flex gap-2">
              <Form.Control
                size="sm"
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddImage()}
              />
              <Button size="sm" variant="outline-primary" onClick={handleAddImage}>
                Agregar URL
              </Button>
            </div>
          </Col>
          <Col md={6}>
            <div className="d-flex gap-2 align-items-center">
              <Form.Control
                type="file"
                size="sm"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              {uploading && (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Subiendo...</span>
                </div>
              )}
            </div>
            <small className="text-muted">JPEG, JPG, PNG (máx. 5MB)</small>
          </Col>
        </Row>
      )}

      {currentImages.length >= maxImages && (
        <Alert variant="info" className="py-2 small">
          Máximo de {maxImages} imágenes alcanzado
        </Alert>
      )}
    </div>
  );
}