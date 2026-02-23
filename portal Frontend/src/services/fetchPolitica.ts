// Servicio para gestión de la política de reservas por hospedaje

export interface PoliticaReservas {
  id?: string;
  hotelId: string;
  reservasHabilitadas: boolean;   // ON/OFF de reservas para este hospedaje
  politicaFdsActiva: boolean;     // Activa regla mínimo 2 noches jue-dom
  estadiaMinima?: number;         // Noches mínimas requeridas para cualquier reserva
  fechaActualizacion?: string;
  actualizadoPor?: string;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchPolitica(hotelId: string): Promise<PoliticaReservas | null> {
  try {
    const response = await fetch(`/api/reservas/politica/${hotelId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error al obtener política de reservas:', error);
    return null;
  }
}

export async function actualizarPolitica(
  hotelId: string,
  datos: Partial<PoliticaReservas>
): Promise<PoliticaReservas | null> {
  try {
    const response = await fetch(`/api/reservas/politica/${hotelId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...datos, hotelId }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error al actualizar política de reservas:', error);
    return null;
  }
}
