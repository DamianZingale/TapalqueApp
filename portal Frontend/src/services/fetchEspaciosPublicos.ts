// src/services/fetchEspaciosPublicos.ts

export interface EspacioPublicoImagen {
    id: number;
    imagenUrl: string;
}

export interface EspacioPublico {
    id: number;
    titulo: string;
    descripcion: string;
    direccion: string;
    telefono?: string;
    latitud?: number;
    longitud?: number;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    categoria?: string;
    horario?: string;
    imagenes: EspacioPublicoImagen[];
}

export async function fetchEspaciosPublicos(): Promise<EspacioPublico[]> {
    try {
        const response = await fetch("/api/espacio-publico");

        if (!response.ok) {
            throw new Error(`Error al obtener espacios públicos: ${response.status}`);
        }

        const data = await response.json();
        return data as EspacioPublico[];
    } catch (error) {
        console.error("Error en fetchEspaciosPublicos:", error);
        return [];
    }
}

export async function fetchEspacioPublicoById(id: number | string): Promise<EspacioPublico | null> {
    try {
        const response = await fetch(`/api/espacio-publico/${id}`);

        if (!response.ok) {
            throw new Error(`Error al obtener espacio público: ${response.status}`);
        }

        const data = await response.json();
        return data as EspacioPublico;
    } catch (error) {
        console.error("Error en fetchEspacioPublicoById:", error);
        return null;
    }
}

export async function fetchEspaciosPublicosByCategoria(categoria: string): Promise<EspacioPublico[]> {
    try {
        const response = await fetch(`/api/espacio-publico?categoria=${categoria}`);

        if (!response.ok) {
            throw new Error(`Error al obtener espacios públicos por categoría: ${response.status}`);
        }

        const data = await response.json();
        return data as EspacioPublico[];
    } catch (error) {
        console.error("Error en fetchEspaciosPublicosByCategoria:", error);
        return [];
    }
}
