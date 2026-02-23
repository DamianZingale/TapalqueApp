// Servicios para gestión de habitaciones de hospedajes
import { api } from '../config/api';

export interface Habitacion {
  id: string;
  numero: number;
  titulo: string;
  descripcion?: string;
  maxPersonas: number;
  precio: number;
  tipoPrecio: 'por_habitacion' | 'por_persona';
  minimoPersonasAPagar?: number;
  fotos?: string[];
  servicios?: string[];
  disponible: boolean;
  hospedajeId: string;
}

export interface NuevaHabitacion {
  numero: number;
  titulo: string;
  descripcion?: string;
  maxPersonas: number;
  precio: number;
  tipoPrecio: 'por_habitacion' | 'por_persona';
  minimoPersonasAPagar?: number;
  fotos?: string[];
  servicios?: string[];
  disponible?: boolean;
}

export async function fetchHabitacionesByHospedaje(hospedajeId: string): Promise<Habitacion[]> {
  try {
    const response = await api.get<Habitacion[]>(`/habitaciones/hospedajes/${hospedajeId}`);
    return response || [];
  } catch (error) {
    console.error('Error en fetchHabitacionesByHospedaje:', error);
    return [];
  }
}

export async function crearHabitacion(hospedajeId: string, habitacion: NuevaHabitacion): Promise<Habitacion | null> {
  try {
    const response = await api.post<Habitacion>(`/habitaciones/hospedajes/${hospedajeId}`, habitacion);
    return response;
  } catch (error) {
    console.error('Error al crear habitación:', error);
    return null;
  }
}

export async function actualizarHabitacion(habitacionId: string, datos: Partial<Habitacion>): Promise<Habitacion | null> {
  try {
    const response = await api.put<Habitacion>(`/habitaciones/${habitacionId}`, datos);
    return response;
  } catch (error) {
    console.error('Error al actualizar habitación:', error);
    return null;
  }
}

export async function eliminarHabitacion(habitacionId: string): Promise<boolean> {
  try {
    await api.delete(`/habitaciones/${habitacionId}`);
    return true;
  } catch (error) {
    console.error('Error al eliminar habitación:', error);
    return false;
  }
}

export async function cambiarDisponibilidadHabitacion(habitacionId: string, disponible: boolean): Promise<boolean> {
  try {
    await api.patch(`/habitaciones/${habitacionId}/disponibilidad`, { disponible });
    return true;
  } catch (error) {
    console.error('Error al cambiar disponibilidad:', error);
    return false;
  }
}
