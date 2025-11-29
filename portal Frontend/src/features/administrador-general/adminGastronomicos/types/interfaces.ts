import type { Imenu } from "../../../gastronomia/types/Imenu";

export interface Item {
  id: number;
  dish_name: string;
  price: number;
  cantidad: number;
}

export interface Delivery {
  id: number;
  items: Item[];
  total: number;
  delivery: boolean;
  address: string;
  status: "En preparación" | "Listo";
}

export interface ItemsMenu {
  items: Imenu[]; 
}