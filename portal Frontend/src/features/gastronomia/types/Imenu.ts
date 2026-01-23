// Tipos que coinciden con la respuesta del backend
export interface DishCategoryDTO {
  idDishCategory: number;
  name: string;
}

export interface IngredientDTO {
  idIngredient: number;
  name: string;
}

export interface DishRestrictionDTO {
  idRestriction: number;
  name: string;
}

export interface DishDTO {
  idDish: number;
  name: string;
  price: number;
  categories: DishCategoryDTO[];
  ingredients: IngredientDTO[];
  restrictions: DishRestrictionDTO[];
}

export interface MenuResponseDTO {
  id: number;
  description: string;
  restaurantId: number;
  dishes: DishDTO[];
}

// Tipo transformado para uso en el frontend
export interface Imenu {
  id: number;
  dish_name: string;
  price: number;
  ingredients: string[];
  picture?: string;
  category: string;
  restrictions: string[];
  address?: string;
}

export interface PedidoItem extends Imenu {
  cantidad: number;
}

// Alias para compatibilidad
export interface MenuResponse {
  dishes: Imenu[];
}

// Función para transformar la respuesta del backend al formato del frontend
export function transformMenuResponse(backendResponse: MenuResponseDTO): Imenu[] {
  if (!backendResponse || !backendResponse.dishes) {
    return [];
  }

  return backendResponse.dishes.map((dish) => ({
    id: dish.idDish,
    dish_name: dish.name,
    price: dish.price,
    ingredients: dish.ingredients?.map((i) => i.name) || [],
    category: dish.categories?.[0]?.name || 'Sin categoría',
    restrictions: dish.restrictions?.map((r) => r.name) || [],
  }));
}