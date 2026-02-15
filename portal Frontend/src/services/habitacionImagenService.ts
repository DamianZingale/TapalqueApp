// Servicios para gestión de imágenes de habitaciones
// Endpoint separado del de hospedaje para evitar mezcla de fotos

interface ImagenResponse {
  imagenUrl: string;
}

export async function subirImagenHabitacion(
  file: File
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const response = await fetch('/api/habitaciones/imagenes/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result: ImagenResponse = await response.json();
    return result.imagenUrl;
  } catch (error) {
    console.error('Error al subir imagen de habitación:', error);
    throw new Error('No se pudo subir la imagen');
  }
}

export async function eliminarImagenHabitacion(
  imagenUrl: string
): Promise<void> {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/habitaciones/imagenes', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imagenUrl }),
    });

    if (!response.ok) {
      console.warn(
        'No se pudo eliminar la imagen del servidor:',
        response.status
      );
    }
  } catch (error) {
    console.error('Error al eliminar imagen de habitación:', error);
    throw new Error('No se pudo eliminar la imagen');
  }
}
