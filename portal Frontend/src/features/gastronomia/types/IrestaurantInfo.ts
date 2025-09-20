
export interface IRestaurantInfo {
  id: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  delivery?: boolean;
  imageUrl?: string;
  destination?: { lat: string; lng: string }; // Nueva propiedad para la dirección de destino
  
}
