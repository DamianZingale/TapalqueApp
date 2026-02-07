import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe retornar el valor inicial inmediatamente', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));

    expect(result.current).toBe('initial');
  });

  it('debe retornar el valor debounced después del delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Cambiar el valor
    rerender({ value: 'updated', delay: 500 });

    // Inmediatamente después del cambio, aún debería ser el valor anterior
    expect(result.current).toBe('initial');

    // Avanzar el tiempo
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Ahora debería ser el nuevo valor
    expect(result.current).toBe('updated');
  });

  it('debe cancelar el timer anterior si el valor cambia antes del delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    );

    // Primer cambio
    rerender({ value: 'second', delay: 500 });

    // Avanzar parcialmente
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Segundo cambio antes de que termine el primer delay
    rerender({ value: 'third', delay: 500 });

    // Avanzar el tiempo completo desde el segundo cambio
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Debería mostrar 'third', no 'second'
    expect(result.current).toBe('third');
  });

  it('debe respetar diferentes delays', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 1000 } }
    );

    rerender({ value: 'updated', delay: 1000 });

    // Después de 500ms aún no debería haber cambiado
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('initial');

    // Después de 1000ms total debería haber cambiado
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });

  it('debe funcionar con delay de 0', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    );

    rerender({ value: 'updated', delay: 0 });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe('updated');
  });

  it('debe manejar strings vacíos', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'some text', delay: 300 } }
    );

    rerender({ value: '', delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('');
  });
});
