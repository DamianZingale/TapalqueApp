import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOrder } from './useOrder';
import type { Imenu } from '../types/Imenu';

describe('useOrder', () => {
  const mockItems: Imenu[] = [
    {
      id: 1,
      dish_name: 'Pizza Margherita',
      price: 1500,
      ingredients: ['tomate', 'mozzarella', 'albahaca'],
      category: 'Pizza',
      restrictions: ['Vegetariano']
    },
    {
      id: 2,
      dish_name: 'Hamburguesa Clásica',
      price: 1200,
      ingredients: ['carne', 'lechuga', 'tomate'],
      category: 'Hamburguesas',
      restrictions: []
    },
    {
      id: 3,
      dish_name: 'Empanadas',
      price: 300,
      ingredients: ['carne', 'cebolla'],
      category: 'Empanadas',
      restrictions: []
    }
  ];

  it('debe inicializar con orden vacía', () => {
    const { result } = renderHook(() => useOrder(mockItems));

    expect(result.current.order).toEqual({});
    expect(result.current.pedidoFinal).toEqual([]);
  });

  it('debe actualizar la cantidad de un item', () => {
    const { result } = renderHook(() => useOrder(mockItems));

    act(() => {
      result.current.handleQuantityChange(1, 2);
    });

    expect(result.current.order[1]).toBe(2);
  });

  it('debe generar pedidoFinal con items que tienen cantidad > 0', () => {
    const { result } = renderHook(() => useOrder(mockItems));

    act(() => {
      result.current.handleQuantityChange(1, 2);
      result.current.handleQuantityChange(3, 5);
    });

    expect(result.current.pedidoFinal).toHaveLength(2);
    expect(result.current.pedidoFinal).toEqual([
      { ...mockItems[0], cantidad: 2 },
      { ...mockItems[2], cantidad: 5 }
    ]);
  });

  it('debe excluir items con cantidad 0 del pedidoFinal', () => {
    const { result } = renderHook(() => useOrder(mockItems));

    act(() => {
      result.current.handleQuantityChange(1, 2);
      result.current.handleQuantityChange(2, 0);
    });

    expect(result.current.pedidoFinal).toHaveLength(1);
    expect(result.current.pedidoFinal[0].id).toBe(1);
  });

  it('debe poder actualizar cantidad de un item existente', () => {
    const { result } = renderHook(() => useOrder(mockItems));

    act(() => {
      result.current.handleQuantityChange(1, 2);
    });

    expect(result.current.order[1]).toBe(2);

    act(() => {
      result.current.handleQuantityChange(1, 5);
    });

    expect(result.current.order[1]).toBe(5);
  });

  it('debe manejar múltiples items en la orden', () => {
    const { result } = renderHook(() => useOrder(mockItems));

    act(() => {
      result.current.handleQuantityChange(1, 1);
      result.current.handleQuantityChange(2, 2);
      result.current.handleQuantityChange(3, 3);
    });

    expect(result.current.order).toEqual({ 1: 1, 2: 2, 3: 3 });
    expect(result.current.pedidoFinal).toHaveLength(3);
  });

  it('debe calcular correctamente cuando se reduce cantidad a 0', () => {
    const { result } = renderHook(() => useOrder(mockItems));

    act(() => {
      result.current.handleQuantityChange(1, 3);
    });

    expect(result.current.pedidoFinal).toHaveLength(1);

    act(() => {
      result.current.handleQuantityChange(1, 0);
    });

    expect(result.current.pedidoFinal).toHaveLength(0);
  });

  it('debe funcionar con lista de items vacía', () => {
    const { result } = renderHook(() => useOrder([]));

    expect(result.current.order).toEqual({});
    expect(result.current.pedidoFinal).toEqual([]);

    act(() => {
      result.current.handleQuantityChange(999, 5);
    });

    // La orden se actualiza pero pedidoFinal no encuentra el item
    expect(result.current.order[999]).toBe(5);
    expect(result.current.pedidoFinal).toEqual([]);
  });

  it('debe preservar todas las propiedades del item en pedidoFinal', () => {
    const { result } = renderHook(() => useOrder(mockItems));

    act(() => {
      result.current.handleQuantityChange(1, 2);
    });

    const itemEnPedido = result.current.pedidoFinal[0];

    expect(itemEnPedido.id).toBe(1);
    expect(itemEnPedido.dish_name).toBe('Pizza Margherita');
    expect(itemEnPedido.price).toBe(1500);
    expect(itemEnPedido.ingredients).toEqual(['tomate', 'mozzarella', 'albahaca']);
    expect(itemEnPedido.category).toBe('Pizza');
    expect(itemEnPedido.restrictions).toEqual(['Vegetariano']);
    expect(itemEnPedido.cantidad).toBe(2);
  });
});
