import { useState } from 'react';
import { Button, Form, Alert, Image, Row, Col } from 'react-bootstrap';

interface ImageManagerProps {
  images: string[] | { imagenUrl: string }[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  entityType?: string; // 'comercio', 'servicio', etc.
  entityId?: number;
  onPendingFile?: (file: File) => void; // Callback para archivos pendientes cuando no hay entityId
  pendingFiles?: File[]; // Archivos pendientes de subir
  onRemovePendingFile?: (index: number) => void; // Callback para eliminar archivo pendiente
}

export function ImageManager({ images, onChange, maxImages = 5, entityType = 'comercio', entityId, onPendingFile, pendingFiles = [], onRemovePendingFile }: ImageManagerProps) {
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
    if (!files || files.length === 0 || (currentImages.length + pendingFiles.length) >= maxImages) return;

    const file = files[0];

    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      alert('Solo se permiten archivos JPG, JPEG o PNG. No se admiten .webp, .gif, .bmp ni otros formatos.');
      event.target.value = '';
      return;
    }

    if (!file.type.match(/^image\/(jpeg|png)$/)) {
      alert('Solo se permiten archivos JPG, JPEG o PNG. No se admiten .webp, .gif, .bmp ni otros formatos.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('El archivo no puede superar los 5MB');
      event.target.value = '';
      return;
    }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('imagen', file);
        
        // Usar endpoints específicos para cada tipo de entidad (según gateway)
        if (entityId && entityType) {
          let endpoint = '';
          const endpointMap: { [key: string]: string } = {
            'comercio': `/api/comercio/imagen/${entityId}`,
            'hospedaje': `/api/hospedajes/${entityId}/imagenes`,
            'gastronomia': `/api/restaurante/${entityId}/imagenes`,
            'terma': `/api/terma/${entityId}/imagenes`,
            'servicio': `/api/servicio/${entityId}/imagenes`,
            'evento': `/api/evento/${entityId}/imagenes`,
            'espacio-publico': `/api/espacio-publico/${entityId}/imagenes`
          };
          endpoint = endpointMap[entityType] || `/api/comercio/imagen/${entityId}`;

          // Ajustar el nombre del campo del archivo según el backend
          formData.delete('imagen');
          formData.append('file', file);
          
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
        } else if (onPendingFile) {
          // Para nuevas entidades sin ID, guardar archivo como pendiente
          onPendingFile(file);
        } else {
          // Para nuevas entidades sin ID y sin callback, mostramos error
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

    // Si tenemos ID y tipo de entidad, eliminamos del backend primero
    if (entityId && entityType) {
      try {
        const endpointMap: { [key: string]: string } = {
          'comercio': `/api/comercio/imagen/${entityId}`,
          'hospedaje': `/api/hospedajes/${entityId}/imagenes`,
          'gastronomia': `/api/restaurante/${entityId}/imagenes`,
          'terma': `/api/terma/${entityId}/imagenes`,
          'servicio': `/api/servicio/${entityId}/imagenes`,
          'evento': `/api/evento/${entityId}/imagenes`,
          'espacio-publico': `/api/espacio-publico/${entityId}/imagenes`
        };
        const endpoint = endpointMap[entityType] || `/api/comercio/imagen/${entityId}`;

        const response = await fetch(endpoint, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ imagenUrl: imageToRemove })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = errorData.message || errorData.error || `Error ${response.status}`;
          alert(`No se pudo eliminar la imagen: ${errorMsg}`);
          return; // No actualizar el estado local si el backend rechazó la eliminación
        }
      } catch (error) {
        console.error('Error eliminando imagen del backend:', error);
        alert('Error de conexión al intentar eliminar la imagen.');
        return;
      }
    }

    const updatedImages = currentImages.filter((_, index) => index !== indexToRemove);
    onChange(updatedImages);
  };

  return (
    <div className="mb-3">
      <Form.Label className="small mb-2">Imágenes ({currentImages.length + pendingFiles.length}/{maxImages})</Form.Label>
      
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

      {/* Archivos pendientes de subir */}
      {pendingFiles.length > 0 && (
        <>
          <Form.Label className="small mb-2 text-warning">
            Archivos pendientes ({pendingFiles.length}) - Se subirán al guardar
          </Form.Label>
          <Row className="mb-3 g-2">
            {pendingFiles.map((file, index) => (
              <Col key={`pending-${index}`} xs={6} md={4} lg={3}>
                <div className="position-relative border border-warning rounded p-1">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`Pendiente ${index + 1}`}
                    fluid
                    className="w-100 h-100"
                    style={{ objectFit: 'cover', maxHeight: '120px' }}
                  />
                  {onRemovePendingFile && (
                    <Button
                      variant="warning"
                      size="sm"
                      className="position-absolute top-0 end-0 m-1"
                      onClick={() => onRemovePendingFile(index)}
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                    >
                      ×
                    </Button>
                  )}
                  <small className="d-block text-center text-muted text-truncate" style={{ fontSize: '0.65rem' }}>
                    {file.name}
                  </small>
                </div>
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Agregar nuevas imágenes */}
      {(currentImages.length + pendingFiles.length) < maxImages && (
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

      {(currentImages.length + pendingFiles.length) >= maxImages && (
        <Alert variant="info" className="py-2 small">
          Máximo de {maxImages} imágenes alcanzado
        </Alert>
      )}
    </div>
  );
}