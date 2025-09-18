export interface Imenu {
  id: number;
  dish_name: string;
  price: number;
  ingredients: string[];
  picture: string;
  category: string;      // "Pizza", "Empanadas", "Bebidas"
  restrictions: string[]; // ["Vegano", "Celiaco", "Sin Lactosa"]
}
