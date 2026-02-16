// src/services/fetchHospedajes.ts

export interface Hospedaje {
    id: number;
    titulo: string;
    description: string;
    ubicacion: string;
    latitud?: number;
    longitud?: number;
    numWhatsapp?: string;
    tipoHospedaje: 'HOTEL' | 'DEPARTAMENTO' | 'CABAÑA' | 'CASA' | 'OTRO';
    imagenes: string[];  // Backend returns array of URLs directly
    userId?: number; // ID del propietario/administrador
}

export async function fetchHospedajes(): Promise<Hospedaje[]> {
    try {
        const response = await fetch("/api/hospedajes");

        if (!response.ok) {
            throw new Error(`Error al obtener hospedajes: ${response.status}`);
        }

        const data = await response.json();
        return data as Hospedaje[];
    } catch (error) {
        console.error("Error en fetchHospedajes:", error);
        return [];
    }
}

export async function fetchHospedajeById(id: string | number): Promise<Hospedaje | null> {
    try {
        const response = await fetch(`/api/hospedajes/${id}`);

        if (!response.ok) {
            throw new Error(`Error al obtener hospedaje: ${response.status}`);
        }

        const data = await response.json();
        return data as Hospedaje;
    } catch (error) {
        console.error("Error en fetchHospedajeById:", error);
        return null;
    }
}

export async function consultarDisponibilidad(
    hospedajeId: string,
    fechaInicio: string,
    fechaFin: string,
    cantidadPersonas: number
): Promise<{ disponible: boolean; precioTotal?: number }> {
    try {
        const response = await fetch(
            `/api/hospedajes/${hospedajeId}/disponibilidad?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&personas=${cantidadPersonas}`
        );

        if (!response.ok) {
            throw new Error(`Error al consultar disponibilidad: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error en consultarDisponibilidad:", error);
        return { disponible: false };
    }
}
