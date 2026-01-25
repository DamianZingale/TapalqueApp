import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchRestaurants, fetchRestaurantById, fetchMenuByRestaurant, type Restaurant, type Menu } from './fetchGastronomia';

describe('fetchGastronomia', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchRestaurants', () => {
    it('debe retornar lista de restaurantes cuando la respuesta es exitosa', async () => {
      const mockRestaurants: Restaurant[] = [
        {
          idRestaurant: 1,
          name: 'Restaurant Test',
          address: 'Calle 123',
          email: 'test@restaurant.com',
          delivery: true,
          coordinate_lat: -36.0,
          coordinate_lon: -59.0,
          categories: [{ idCategory: 1, name: 'Italiana' }],
          schedules: [],
          phoneNumbers: [],
          images: []
        }
      ];

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRestaurants)
      } as Response);

      const result = await fetchRestaurants();

      expect(global.fetch).toHaveBeenCalledWith('/api/gastronomia/restaurants');
      expect(result).toEqual(mockRestaurants);
    });

    it('debe retornar array vacío cuando hay error HTTP', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response);

      const result = await fetchRestaurants();

      expect(result).toEqual([]);
    });

    it('debe retornar array vacío cuando hay error de red', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchRestaurants();

      expect(result).toEqual([]);
    });
  });

  describe('fetchRestaurantById', () => {
    it('debe retornar restaurante cuando la respuesta es exitosa', async () => {
      const mockRestaurant: Restaurant = {
        idRestaurant: 1,
        name: 'Restaurant Test',
        address: 'Calle 123',
        email: 'test@restaurant.com',
        delivery: true,
        coordinate_lat: -36.0,
        coordinate_lon: -59.0,
        categories: [],
        schedules: [],
        phoneNumbers: [],
        images: []
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRestaurant)
      } as Response);

      const result = await fetchRestaurantById(1);

      expect(global.fetch).toHaveBeenCalledWith('/api/gastronomia/restaurants/1');
      expect(result).toEqual(mockRestaurant);
    });

    it('debe aceptar id como string', async () => {
      const mockRestaurant: Restaurant = {
        idRestaurant: 5,
        name: 'Test',
        address: 'Address',
        email: 'email@test.com',
        delivery: false,
        coordinate_lat: 0,
        coordinate_lon: 0,
        categories: [],
        schedules: [],
        phoneNumbers: [],
        images: []
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRestaurant)
      } as Response);

      const result = await fetchRestaurantById('5');

      expect(global.fetch).toHaveBeenCalledWith('/api/gastronomia/restaurants/5');
      expect(result).toEqual(mockRestaurant);
    });

    it('debe retornar null cuando hay error HTTP', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404
      } as Response);

      const result = await fetchRestaurantById(999);

      expect(result).toBeNull();
    });

    it('debe retornar null cuando hay error de red', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchRestaurantById(1);

      expect(result).toBeNull();
    });
  });

  describe('fetchMenuByRestaurant', () => {
    it('debe retornar menú cuando la respuesta es exitosa', async () => {
      const mockMenu: Menu = {
        idMenu: 1,
        name: 'Menú Principal',
        dishes: [
          {
            idDish: 1,
            name: 'Pizza Margherita',
            price: 1500,
            categories: [{ idDishCategory: 1, name: 'Pizzas' }],
            restrictions: [{ idRestriction: 1, name: 'Vegetariano' }],
            ingredients: [{ idIngredient: 1, name: 'Tomate' }]
          }
        ]
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMenu)
      } as Response);

      const result = await fetchMenuByRestaurant(1);

      expect(global.fetch).toHaveBeenCalledWith('/api/gastronomia/menu/restaurant/1');
      expect(result).toEqual(mockMenu);
    });

    it('debe retornar null cuando hay error HTTP', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404
      } as Response);

      const result = await fetchMenuByRestaurant(999);

      expect(result).toBeNull();
    });

    it('debe retornar null cuando hay error de red', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchMenuByRestaurant(1);

      expect(result).toBeNull();
    });
  });
});
