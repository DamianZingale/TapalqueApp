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
    tag?: string;
    imagenes: ComercioImagen[];
}

export async function fetchComercios(): Promise<Comercio[]> {
    try {
        // El gateway define /api/comercio/list como público para GET
        const response = await fetch("/api/comercio/list", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.warn(`Backend respondió con status: ${response.status} ${response.statusText}`);
            throw new Error(`Error al obtener comercios: ${response.status}`);
        }

        const data = await response.json();
        console.log("Comercios cargados:", data.length, "items");
        return data as Comercio[];
    } catch (error) {
        console.error("Error en fetchComercios:", error);
        return [];
    }
}

export async function fetchComercioById(id: string | number): Promise<Comercio | null> {
    try {
        // El endpoint es público para GET
        const response = await fetch(`/api/comercio/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.warn(`Backend respondió con status: ${response.status} al obtener comercio ${id}`);
            throw new Error(`Error al obtener comercio: ${response.status}`);
        }

        const data = await response.json();
        console.log("Comercio individual cargado:", data);
        return data as Comercio;
    } catch (error) {
        console.error("Error en fetchComercioById:", error);
        return null;
    }
}
