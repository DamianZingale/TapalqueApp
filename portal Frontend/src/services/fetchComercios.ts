// src/services/fetchComercios.ts

export interface ComercioImagen {
    id: number;
    imagenUrl: string;
}

export interface Comercio {
    id: number;
    titulo: string;
    descripcion: string;
    direccion: string;
    horario: string;
    telefono: string;
    latitud: number;
    longitud: number;
    facebook?: string;
    instagram?: string;
    imagenes: ComercioImagen[];
}

export async function fetchComercios(): Promise<Comercio[]> {
    try {
        const response = await fetch("/api/comercio");

        if (!response.ok) {
            throw new Error(`Error al obtener comercios: ${response.status}`);
        }

        const data = await response.json();
        return data as Comercio[];
    } catch (error) {
        console.error("Error en fetchComercios:", error);
        return [];
    }
}

export async function fetchComercioById(id: string | number): Promise<Comercio | null> {
    try {
        const response = await fetch(`/api/comercio/${id}`);

        if (!response.ok) {
            throw new Error(`Error al obtener comercio: ${response.status}`);
        }

        const data = await response.json();
        return data as Comercio;
    } catch (error) {
        console.error("Error en fetchComercioById:", error);
        return null;
    }
}
