// Matches RestaurantDTO from backend msvc-gastronomia
export interface IRestaurantInfo {
  id: number;          // Backend returns Long
  name?: string;
  address?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  categories?: string; // Comma-separated categories
  phones?: string;     // Comma-separated phones
  schedule?: string;   // Format: "1:09:00-22:00; 2:09:00-22:00"
  delivery?: boolean;
  deliveryPrice?: number;
  estimatedWaitTime?: number;
  // Note: Backend doesn't return imageUrl in RestaurantDTO
  imageUrl?: string;   // For UI compatibility - may be undefined
  esHeladeria?: boolean;
}
