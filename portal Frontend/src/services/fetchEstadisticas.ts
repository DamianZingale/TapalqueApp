import { api } from "../config/api";

export interface EstadisticasGastronomia {
    pedidosHoy: number;
    ingresosHoy: number;
    promedioPedido: number;
    pedidosPendientes: number;
    pedidosSemana: number;
    ingresosSemana: number;
    pedidosMes: number;
    ingresosMes: number;
    platosMasVendidos: PlatoVendido[];
    pedidosPorEstado: PedidoPorEstado[];
    ventasPorDia: VentaDia[];
}

export interface PlatoVendido {
    nombre: string;
    cantidad: number;
    ingresos: number;
}

export interface PedidoPorEstado {
    estado: string;
    cantidad: number;
}

export interface VentaDia {
    fecha: string;
    pedidos: number;
    ingresos: number;
}

export interface EstadisticasHospedaje {
    reservasActivas: number;
    ocupacionHoy: number;
    ingresosMes: number;
    reservasPendientes: number;
    ocupacionSemana: number[];
    reservasPorMes: ReservaMes[];
}

export interface ReservaMes {
    mes: string;
    cantidad: number;
    ingresos: number;
}

export async function fetchEstadisticasGastronomia(restaurantId: string): Promise<EstadisticasGastronomia | null> {
    try {
        const response = await api.get<EstadisticasGastronomia>(`/gastronomia/api/estadisticas/${restaurantId}`);
        return response;
    } catch (error) {
        console.error("Error en fetchEstadisticasGastronomia:", error);
        return null;
    }
}

export async function fetchEstadisticasHospedaje(hotelId: string): Promise<EstadisticasHospedaje | null> {
    try {
        const response = await api.get<EstadisticasHospedaje>(`/hospedaje/api/estadisticas/${hotelId}`);
        return response;
    } catch (error) {
        console.error("Error en fetchEstadisticasHospedaje:", error);
        return null;
    }
}
