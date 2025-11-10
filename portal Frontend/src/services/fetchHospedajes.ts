// src/services/fetchHospedajes.ts
export interface Hospedaje {
    id: string;
    nombre: string;
    descripcion: string;
    imagenes: string[];
    servicios: string[];
    ubicacion: string;
    contacto: {
        whatsapp?: string;
        telefono?: string;
        web?: string;
    };
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