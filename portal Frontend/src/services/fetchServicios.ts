// src/services/fetchServicios.ts
// Matches ServicioResponseDTO from backend
export interface Servicio {
    id: number;
    titulo: string;
    descripcion?: string;
    direccion?: string;
    horario?: string;
    telefono?: string;
    latitud?: number;
    longitud?: number;
    facebook?: string;
    instagram?: string;
    imagenes?: { imagenUrl: string }[];
}

export async function fetchServicios(): Promise<Servicio[]> {
    try {
        // El gateway define /api/servicio como público para GET
        const response = await fetch("/api/servicio", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.warn(`Backend respondió con status: ${response.status} ${response.statusText}`);
            throw new Error(`Error al obtener servicios: ${response.status}`);
        }

        const data = await response.json();
        console.log("Servicios cargados:", data.length, "items");
        return data as Servicio[];
    } catch (error) {
        console.error("Error en fetchServicios:", error);
        // Retornar array vacío en caso de error para evitar romper la UI
        return [];
    }
}
            throw new Error(`Error al obtener servicios: ${response.status}`);
        }

        const data = await response.json();
        console.log("Servicios cargados:", data.length, "items");
        return data as Servicio[];
    } catch (error) {
        console.error("Error en fetchServicios:", error);
        // Retornar array vacío en caso de error para evitar romper la UI
        return [];
    }
}

export async function fetchServicioById(id: string): Promise<Servicio | null> {
    try {
        // El gateway requiere autenticación para detalles individuales
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/servicio/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });

        if (!response.ok) {
            console.warn(`Backend respondió con status: ${response.status} al obtener servicio ${id}`);
            throw new Error(`Error al obtener servicio: ${response.status}`);
        }

        const data = await response.json();
        console.log("Servicio individual cargado:", data);
        return data as Servicio;
    } catch (error) {
        console.error("Error en fetchServicioById:", error);
        return null;
    }
}
