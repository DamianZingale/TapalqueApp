// src/services/fetchTermas.ts
export interface Terma {
    id: number;
    titulo: string;
    descripcion: string;
    horario: string;
    urlMap: string;
    whatsapp: string;
    imagenes: { imagenUrl: string }[];
}

export async function fetchTermas(): Promise<Terma[]> {
    try {
        const response = await fetch("/api/termas");

        if (!response.ok) {
            throw new Error(`Error al obtener termas: ${response.status}`);
        }

        const data = await response.json();
        return data as Terma[];
    } catch (error) {
        console.error("Error en fetchTermas:", error);
        return [];
    }
}

export async function fetchTermaById(id: string): Promise<Terma | null> {
    try {
        const response = await fetch(`/api/termas/${id}`);

        if (!response.ok) {
            throw new Error(`Error al obtener terma: ${response.status}`);
        }

        const data = await response.json();
        return data as Terma;
    } catch (error) {
        console.error("Error en fetchTermaById:", error);
        return null;
    }
}
