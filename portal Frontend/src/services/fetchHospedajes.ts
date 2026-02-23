// src/services/fetchHospedajes.ts
import { apiRequest } from '../config/api';

export interface Hospedaje {
    id: number;
    titulo: string;
    description: string;
    ubicacion: string;
    latitud?: number;
    longitud?: number;
    numWhatsapp?: string;
    tipoHospedaje: 'HOTEL' | 'DEPARTAMENTO' | 'CABAÑA' | 'CASA' | 'OTRO';
    imagenes: string[];
    lastCloseDate?: string;
    fechaLimiteReservas?: string;
    userId?: number;
    permiteFacturacion?: boolean;
    tipoIva?: 'INCLUIDO' | 'ADICIONAL' | 'NO_APLICA';
}

export async function fetchHospedajes(): Promise<Hospedaje[]> {
    try {
        return await apiRequest<Hospedaje[]>('/hospedajes', { method: 'GET' });
    } catch (error) {
        console.error("Error en fetchHospedajes:", error);
        return [];
    }
}

export async function fetchHospedajeById(id: string | number): Promise<Hospedaje | null> {
    try {
        return await apiRequest<Hospedaje>(`/hospedajes/${id}`, { method: 'GET' });
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
        return await apiRequest<{ disponible: boolean; precioTotal?: number }>(
            `/hospedajes/${hospedajeId}/disponibilidad?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&personas=${cantidadPersonas}`,
            { method: 'GET' }
        );
    } catch (error) {
        console.error("Error en consultarDisponibilidad:", error);
        return { disponible: false };
    }
}

export async function actualizarConfiguracionFacturacion(
    hospedajeId: string | number,
    permiteFacturacion: boolean,
    tipoIva: 'INCLUIDO' | 'ADICIONAL' | 'NO_APLICA'
): Promise<boolean> {
    try {
        await apiRequest(`/hospedajes/${hospedajeId}`, {
            method: 'PATCH',
            body: JSON.stringify({ permiteFacturacion, tipoIva })
        });
        return true;
    } catch (error) {
        console.error("Error en actualizarConfiguracionFacturacion:", error);
        return false;
    }
}
