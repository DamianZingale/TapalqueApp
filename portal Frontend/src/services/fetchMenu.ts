import { api } from '../config/api';
import {
  MenuResponseDTO,
  DishCategoryDTO,
  DishRestrictionDTO,
  Imenu,
  transformMenuResponse,
} from '../features/gastronomia/types/Imenu';

// Tipo para items del menú con disponibilidad
export interface MenuItem extends Imenu {
  available: boolean;
  description?: string;
}

// Obtener menú de un restaurante
export async function fetchMenuByRestaurant(
  restaurantId: string
): Promise<Imenu[]> {
  try {
    const response = await api.get<MenuResponseDTO>(
      `/gastronomia/menu/restaurant/${restaurantId}`
    );
    return transformMenuResponse(response);
  } catch (error) {
    console.error('Error en fetchMenuByRestaurant:', error);
    return [];
  }
}

// Obtener menú filtrado por categoría y/o restricciones
export async function fetchMenuFiltered(
  restaurantId: string,
  category?: string,
  restrictions?: string[]
): Promise<Imenu[]> {
  try {
    const params = new URLSearchParams();
    if (category) {
      params.append('category', category);
    }
    if (restrictions && restrictions.length > 0) {
      restrictions.forEach((r) => params.append('restrictions', r));
    }

    const queryString = params.toString();
    const url = `/gastronomia/menu/restaurant/${restaurantId}/filter${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<MenuResponseDTO>(url);
    return transformMenuResponse(response);
  } catch (error) {
    console.error('Error en fetchMenuFiltered:', error);
    return [];
  }
}

// Obtener todas las categorías de platos disponibles
export async function fetchDishCategories(): Promise<DishCategoryDTO[]> {
  try {
    const response = await api.get<DishCategoryDTO[]>(
      '/gastronomia/menu/categories'
    );
    return response;
  } catch (error) {
    console.error('Error en fetchDishCategories:', error);
    return [];
  }
}

// Obtener todas las restricciones dietéticas disponibles
export async function fetchDishRestrictions(): Promise<DishRestrictionDTO[]> {
  try {
    const response = await api.get<DishRestrictionDTO[]>(
      '/gastronomia/menu/restrictions'
    );
    return response;
  } catch (error) {
    console.error('Error en fetchDishRestrictions:', error);
    return [];
  }
}

// Crear un nuevo item de menú
export async function crearMenuItem(
  restaurantId: string,
  data: Omit<MenuItem, 'id'>
): Promise<MenuItem | null> {
  try {
    const response = await api.post<MenuItem>(
      `/gastronomia/menu/restaurant/${restaurantId}/dish`,
      data
    );
    return response;
  } catch (error) {
    console.error('Error en crearMenuItem:', error);
    return null;
  }
}

// Actualizar un item de menú
export async function actualizarMenuItem(
  itemId: number,
  data: Partial<MenuItem>
): Promise<MenuItem | null> {
  try {
    const response = await api.put<MenuItem>(
      `/gastronomia/menu/dish/${itemId}`,
      data
    );
    return response;
  } catch (error) {
    console.error('Error en actualizarMenuItem:', error);
    return null;
  }
}

// Eliminar un item de menú
export async function eliminarMenuItem(itemId: number): Promise<boolean> {
  try {
    await api.delete(`/gastronomia/menu/dish/${itemId}`);
    return true;
  } catch (error) {
    console.error('Error en eliminarMenuItem:', error);
    return false;
  }
}

// Cambiar disponibilidad de un item
export async function cambiarDisponibilidadItem(
  itemId: number,
  available: boolean
): Promise<boolean> {
  try {
    await api.patch(`/gastronomia/menu/dish/${itemId}/availability`, {
      available,
    });
    return true;
  } catch (error) {
    console.error('Error en cambiarDisponibilidadItem:', error);
    return false;
  }
}
