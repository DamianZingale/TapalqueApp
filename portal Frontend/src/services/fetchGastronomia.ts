// src/services/fetchGastronomia.ts

export interface RestaurantImage {
    id: number;
    imageUrl: string;
}

export interface Category {
    idCategory: number;
    name: string;
}

export interface Schedule {
    idSchedule: number;
    dayOfWeek: string;
    openingTime: string;
    closingTime: string;
}

export interface PhoneNumber {
    idPhone: number;
    number: string;
    phoneType: 'FIJO' | 'CELULAR' | 'WHATSAPP';
}

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
    idRestaurant: number;
    name: string;
    address: string;
    email: string;
    delivery: boolean;
    coordinate_lat: number;
    coordinate_lon: number;
    categories: Category[];
    schedules: Schedule[];
    phoneNumbers: PhoneNumber[];
    images: RestaurantImage[];
    menus?: Menu;
}

export async function fetchRestaurants(): Promise<Restaurant[]> {
    try {
        const response = await fetch("/api/gastronomia/restaurants");

        if (!response.ok) {
            throw new Error(`Error al obtener restaurantes: ${response.status}`);
        }

        const data = await response.json();
        return data as Restaurant[];
    } catch (error) {
        console.error("Error en fetchRestaurants:", error);
        return [];
    }
}

export async function fetchRestaurantById(id: string | number): Promise<Restaurant | null> {
    try {
        const response = await fetch(`/api/gastronomia/restaurants/${id}`);

        if (!response.ok) {
            throw new Error(`Error al obtener restaurante: ${response.status}`);
        }

        const data = await response.json();
        return data as Restaurant;
    } catch (error) {
        console.error("Error en fetchRestaurantById:", error);
        return null;
    }
}

export async function fetchMenuByRestaurant(restaurantId: string | number): Promise<Menu | null> {
    try {
        const response = await fetch(`/api/gastronomia/menu/restaurant/${restaurantId}`);

        if (!response.ok) {
            throw new Error(`Error al obtener menú: ${response.status}`);
        }

        const data = await response.json();
        return data as Menu;
    } catch (error) {
        console.error("Error en fetchMenuByRestaurant:", error);
        return null;
    }
}
