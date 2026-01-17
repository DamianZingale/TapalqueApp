import { api } from "../config/api";

export interface MenuItem {
    id: number;
    dish_name: string;
    description?: string;
    price: number;
    ingredients: string[];
    picture?: string;
    category: string;
    restrictions: string[];
    available: boolean;
    restaurantId?: string;
}

export interface NuevoMenuItem {
    dish_name: string;
    description?: string;
    price: number;
    ingredients: string[];
    picture?: string;
    category: string;
    restrictions: string[];
    available?: boolean;
}

export const CATEGORIAS_MENU = [
    "Pizza",
    "Empanadas",
    "Hamburguesas",
    "Pastas",
    "Carnes",
    "Ensaladas",
    "Bebidas",
    "Postres",
    "Otros"
];

export const RESTRICCIONES_MENU = [
    "Vegetariano",
    "Vegano",
    "Sin Gluten",
    "Sin Lactosa",
    "Sin Alcohol"
];

export async function fetchMenuByRestaurant(restaurantId: string): Promise<MenuItem[]> {
    try {
        const response = await api.get<MenuItem[]>(`/gastronomia/api/menu/restaurant/${restaurantId}`);
        return response;
    } catch (error) {
        console.error("Error en fetchMenuByRestaurant:", error);
        return [];
    }
}

export async function crearMenuItem(restaurantId: string, item: NuevoMenuItem): Promise<MenuItem | null> {
    try {
        const response = await api.post<MenuItem>(`/gastronomia/api/menu/restaurant/${restaurantId}`, {
            ...item,
            available: item.available ?? true
        });
        return response;
    } catch (error) {
        console.error("Error en crearMenuItem:", error);
        return null;
    }
}

export async function actualizarMenuItem(itemId: number, data: Partial<MenuItem>): Promise<MenuItem | null> {
    try {
        const response = await api.put<MenuItem>(`/gastronomia/api/menu/${itemId}`, data);
        return response;
    } catch (error) {
        console.error("Error en actualizarMenuItem:", error);
        return null;
    }
}

export async function cambiarDisponibilidadItem(itemId: number, available: boolean): Promise<boolean> {
    try {
        await api.patch(`/gastronomia/api/menu/${itemId}/disponibilidad`, { available });
        return true;
    } catch (error) {
        console.error("Error en cambiarDisponibilidadItem:", error);
        return false;
    }
}

export async function eliminarMenuItem(itemId: number): Promise<boolean> {
    try {
        await api.delete(`/gastronomia/api/menu/${itemId}`);
        return true;
    } catch (error) {
        console.error("Error en eliminarMenuItem:", error);
        return false;
    }
}
