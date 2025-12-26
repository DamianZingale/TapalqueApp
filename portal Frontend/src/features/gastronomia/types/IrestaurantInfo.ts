export interface IRestaurantInfo {
  id: string;
  name?: string;
  title?: string;
  address?: string;
  phone?: string;
  email?: string;
  category?: string;
  schedule?: string;
  delivery?: boolean;
  imageUrl?: string;
  destination?: { lat: string; lng: string }; // Nueva propiedad para la dirección de destino
}
