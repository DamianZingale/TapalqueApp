// src/services/fetchGastronomia.ts
import { apiRequest } from '../config/api';

export interface DishCategory {
  idDishCategory: number;
  name: string;
}

export interface DishRestriction {
  idRestriction: number;
  name: string;
}

export interface Ingredient {
  idIngredient: number;
  name: string;
}

export interface Dish {
  idDish: number;
  name: string;
  price: number;
  categories: DishCategory[];
  restrictions: DishRestriction[];
  ingredients: Ingredient[];
}

export interface Menu {
  idMenu: number;
  name: string;
  dishes: Dish[];
}

export interface Restaurant {
  id: number;
  name: string;
  address?: string;
  email?: string;
  delivery: boolean;
  deliveryPrice?: number;
  estimatedWaitTime?: number;
  latitude?: number;
  longitude?: number;
  lastCloseDate?: string;
  categories?: string;
  phones?: string;
  schedule?: string;
  imageUrl?: string;
  esHeladeria?: boolean;
  activo?: boolean;
}

export async function fetchRestaurants(): Promise<Restaurant[]> {
  try {
    const response = await fetch('/api/gastronomia/restaurants');

    if (!response.ok) {
      throw new Error(`Error al obtener restaurantes: ${response.status}`);
    }

    const data = await response.json();
    return data as Restaurant[];
  } catch (error) {
    console.error('Error en fetchRestaurants:', error);
    return [];
  }
}

export async function fetchRestaurantById(
  id: string | number
): Promise<Restaurant | null> {
  try {
    const response = await fetch(`/api/gastronomia/restaurants/${id}`);

    if (!response.ok) {
      throw new Error(`Error al obtener restaurante: ${response.status}`);
    }

    const data = await response.json();
    return data as Restaurant;
  } catch (error) {
    console.error('Error en fetchRestaurantById:', error);
    return null;
  }
}

export async function fetchMenuByRestaurant(
  restaurantId: string | number
): Promise<Menu | null> {
  try {
    const response = await fetch(
      `/api/gastronomia/menu/restaurant/${restaurantId}`
    );

    if (!response.ok) {
      throw new Error(`Error al obtener menú: ${response.status}`);
    }

    const data = await response.json();
    return data as Menu;
  } catch (error) {
    console.error('Error en fetchMenuByRestaurant:', error);
    return null;
  }
}

export async function fetchRestaurantByIdAuth(id: string | number): Promise<Restaurant | null> {
  try {
    return await apiRequest<Restaurant>(`/gastronomia/restaurants/${id}`, { method: 'GET' });
  } catch (error) {
    console.error('Error en fetchRestaurantByIdAuth:', error);
    return null;
  }
}

export async function fetchRestaurantsAdmin(): Promise<Restaurant[]> {
  try {
    return await apiRequest<Restaurant[]>('/gastronomia/admin/restaurants', { method: 'GET' });
  } catch (error) {
    console.error('Error en fetchRestaurantsAdmin:', error);
    return [];
  }
}

export async function toggleRestaurantActivo(id: number, activo: boolean): Promise<boolean> {
  try {
    await apiRequest(`/gastronomia/${id}/activo`, {
      method: 'PATCH',
      body: JSON.stringify({ activo }),
    });
    return true;
  } catch (error) {
    console.error('Error en toggleRestaurantActivo:', error);
    return false;
  }
}


