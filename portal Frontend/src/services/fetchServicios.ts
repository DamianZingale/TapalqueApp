// src/services/fetchServicios.ts
export interface Servicio {
    id: number;
    titulo: string;
    descripcion: string;
    horario: string;
    whatsapp: string;
    imagenes: { imagenUrl: string }[];
}

export async function fetchServicios(): Promise<Servicio[]> {
    try {
        const response = await fetch("/api/servicios");

        if (!response.ok) {
            throw new Error(`Error al obtener servicios: ${response.status}`);
        }

        const data = await response.json();
        return data as Servicio[];
    } catch (error) {
        console.error("Error en fetchServicios:", error);
        return [];
    }
}

export async function fetchServicioById(id: string): Promise<Servicio | null> {
    try {
        const response = await fetch(`/api/servicios/${id}`);

        if (!response.ok) {
            throw new Error(`Error al obtener servicio: ${response.status}`);
        }

        const data = await response.json();
        return data as Servicio;
    } catch (error) {
        console.error("Error en fetchServicioById:", error);
        return null;
    }
}
