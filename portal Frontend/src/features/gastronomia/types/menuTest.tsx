import type { Imenu } from "./Imenu";

export const menuTest: Imenu[] = [
  {
    id: 1,
    dish_name: "Margarita",
    price: 800,
    ingredients: ["Queso", "Tomate", "Albahaca"],
    picture: "https://images.unsplash.com/photo-1601924582971-13e06ef3dc3d?auto=format&fit=crop&w=500&q=80",
    category: "Pizza",
    restrictions: ["Vegetariano"]
  },
  {
    id: 2,
    dish_name: "Napolitana",
    price: 900,
    ingredients: ["Queso", "Tomate", "Jamón", "Ajo"],
    picture: "https://images.unsplash.com/photo-1594007653345-9376f0f930cd?auto=format&fit=crop&w=500&q=80",
    category: "Pizza",
    restrictions: []
  },
  {
    id: 3,
    dish_name: "Empanada de Carne",
    price: 250,
    ingredients: ["Carne", "Cebolla", "Pimiento"],
    picture: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=500&q=80",
    category: "Empanadas",
    restrictions: []
  },
  {
    id: 4,
    dish_name: "Empanada de Espinaca y Queso",
    price: 230,
    ingredients: ["Espinaca", "Queso", "Cebolla"],
    picture: "https://images.unsplash.com/photo-1612197526467-6e7c93ff33cf?auto=format&fit=crop&w=500&q=80",
    category: "Empanadas",
    restrictions: ["Vegetariano"]
  },
  {
    id: 5,
    dish_name: "Coca-Cola",
    price: 150,
    ingredients: ["Agua carbonatada", "Azúcar", "Colorante"],
    picture: "https://images.unsplash.com/photo-1598514982984-1f3b7d62b51f?auto=format&fit=crop&w=500&q=80",
    category: "Bebidas",
    restrictions: ["Sin Alcohol", "Vegano"]
  }
];
