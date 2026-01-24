// src/services/fetchEventos.ts
export interface Evento {
  id: number;
  nombreEvento: string;
  lugar: string;
  horario: string;
  fechaInicio: string;
  fechaFin?: string;
  telefonoContacto: string;
  nombreContacto: string;
  imagenes: { imagenUrl: string }[];
}

export async function fetchEventos(): Promise<Evento[]> {
  try {
    const response = await fetch('/api/evento');

    if (!response.ok) {
      throw new Error(`Error al obtener eventos: ${response.status}`);
    }

    const data = await response.json();
    return data as Evento[];
  } catch (error) {
    console.error('Error en fetchEventos:', error);
    return [];
  }
}

export async function fetchEventoById(id: string): Promise<Evento | null> {
  try {
    const response = await fetch(`/api/evento/${id}`);

    if (!response.ok) {
      throw new Error(`Error al obtener evento: ${response.status}`);
    }

    const data = await response.json();
    return data as Evento;
  } catch (error) {
    console.error('Error en fetchEventoById:', error);
    return null;
  }
}
