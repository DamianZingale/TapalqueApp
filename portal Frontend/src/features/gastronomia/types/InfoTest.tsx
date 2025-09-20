
import { Info } from "../components/Info";
import type { IRestaurantInfo } from "../types/IrestaurantInfo";

export const mockData: IRestaurantInfo = {
  id: "1",
  name: "Pizzería Giuseppe",
  address: "Av 9 de Julio 500",
  phone: "1234567890",
  email: "giusseppe@gmail.com",
  delivery: true,
  imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  destination: { lat: "-36.357295", lng: "-60.025322" }, // strings
  
};

export const InfoTest = () => <Info {...mockData} />;
