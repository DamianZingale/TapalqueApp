import { getToken } from "./authService";

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
        const token = getToken();

        const API_URL = import.meta.env.VITE_API_URL;

        const response = await fetch(`${API_URL}/api/hospedajes`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });



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
