import { api } from '../config/api';
import {
  DishCategoryDTO,
  DishRestrictionDTO,
  Imenu,
  MenuResponseDTO,
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

// Obtener todos los ingredientes comunes
export async function fetchCommonIngredients(): Promise<string[]> {
  try {
    const response = await api.get<string[]>(
      '/gastronomia/menu/ingredients/common'
    );
    return response;
  } catch (error) {
    console.error('Error en fetchCommonIngredients:', error);
    return [];
  }
}

// Buscar ingredientes por término de búsqueda (para debounce)
export async function searchIngredients(query: string): Promise<string[]> {
  try {
    const response = await api.get<string[]>(
      `/gastronomia/menu/ingredients/search?query=${encodeURIComponent(query)}`
    );
    return response;
  } catch (error) {
    console.error('Error en searchIngredients:', error);
    return [];
  }
}

// Convertir MenuItem del frontend a DishDTO del backend
function menuItemToBackendDTO(item: Omit<MenuItem, 'id'> | Partial<MenuItem>) {
  const dto: any = {};

  // Solo incluir campos que están definidos
  if (item.dish_name !== undefined) dto.name = item.dish_name;
  if (item.price !== undefined) dto.price = item.price;
  if (item.description !== undefined) dto.description = item.description;
  if (item.available !== undefined) dto.available = item.available;
  if (item.picture !== undefined) dto.picture = item.picture;

  // Solo incluir arrays si están definidos
  if (item.category !== undefined) {
    dto.categories = [{ name: item.category }];
  }
  if (item.ingredients !== undefined) {
    dto.ingredients = item.ingredients.map(name => ({ name }));
  }
  if (item.restrictions !== undefined) {
    dto.restrictions = item.restrictions.map(name => ({ name }));
  }

  return dto;
}

// Crear un nuevo item de menú
export async function crearMenuItem(
  restaurantId: string,
  data: Omit<MenuItem, 'id'>
): Promise<MenuItem | null> {
  try {
    const backendDTO = menuItemToBackendDTO(data);
    const response = await api.post(
      `/gastronomia/menu/restaurant/${restaurantId}/dish`,
      backendDTO
    );

    // Transformar respuesta del backend a formato frontend
    if (response) {
      return {
        id: response.idDish,
        dish_name: response.name,
        price: response.price,
        description: response.description,
        available: response.available !== undefined ? response.available : true,
        picture: response.picture,
        category: response.categories?.[0]?.name || 'Sin categoría',
        ingredients: response.ingredients?.map((i: any) => i.name) || [],
        restrictions: response.restrictions?.map((r: any) => r.name) || [],
      };
    }
    return null;
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
    const backendDTO = menuItemToBackendDTO(data);
    const response = await api.put(
      `/gastronomia/menu/dish/${itemId}`,
      backendDTO
    );

    // Transformar respuesta del backend a formato frontend
    if (response) {
      return {
        id: response.idDish,
        dish_name: response.name,
        price: response.price,
        description: response.description,
        available: response.available !== undefined ? response.available : true,
        picture: response.picture,
        category: response.categories?.[0]?.name || 'Sin categoría',
        ingredients: response.ingredients?.map((i: any) => i.name) || [],
        restrictions: response.restrictions?.map((r: any) => r.name) || [],
      };
    }
    return null;
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

// ========== SABORES HELADERÍA ==========

export interface SaborHeladeria {
  id: number;
  nombre: string;
  habilitado: boolean;
}

/** Obtener todos los sabores de una heladería (admin) */
export async function fetchSaboresHeladeria(restaurantId: string): Promise<SaborHeladeria[]> {
  try {
    return await api.get<SaborHeladeria[]>(`/gastronomia/heladeria/${restaurantId}/sabores`);
  } catch (error) {
    console.error('Error en fetchSaboresHeladeria:', error);
    return [];
  }
}

/** Obtener solo los sabores habilitados (vista usuario) */
export async function fetchSaboresHabilitados(restaurantId: string): Promise<SaborHeladeria[]> {
  try {
    return await api.get<SaborHeladeria[]>(`/gastronomia/heladeria/${restaurantId}/sabores/habilitados`);
  } catch (error) {
    console.error('Error en fetchSaboresHabilitados:', error);
    return [];
  }
}

/** Crear un nuevo sabor */
export async function crearSaborHeladeria(restaurantId: string, nombre: string): Promise<SaborHeladeria | null> {
  try {
    return await api.post<SaborHeladeria>(`/gastronomia/heladeria/${restaurantId}/sabores`, { nombre });
  } catch (error) {
    console.error('Error en crearSaborHeladeria:', error);
    return null;
  }
}

/** Actualizar nombre y/o habilitado de un sabor */
export async function actualizarSaborHeladeria(
  saborId: number,
  data: { nombre?: string; habilitado?: boolean }
): Promise<SaborHeladeria | null> {
  try {
    return await api.put<SaborHeladeria>(`/gastronomia/heladeria/sabores/${saborId}`, data);
  } catch (error) {
    console.error('Error en actualizarSaborHeladeria:', error);
    return null;
  }
}

/** Alternar habilitado/deshabilitado de un sabor */
export async function toggleSaborHeladeria(saborId: number): Promise<SaborHeladeria | null> {
  try {
    return await api.patch<SaborHeladeria>(`/gastronomia/heladeria/sabores/${saborId}/habilitado`, {});
  } catch (error) {
    console.error('Error en toggleSaborHeladeria:', error);
    return null;
  }
}

/** Eliminar un sabor */
export async function eliminarSaborHeladeria(saborId: number): Promise<boolean> {
  try {
    await api.delete(`/gastronomia/heladeria/sabores/${saborId}`);
    return true;
  } catch (error) {
    console.error('Error en eliminarSaborHeladeria:', error);
    return false;
  }
}
