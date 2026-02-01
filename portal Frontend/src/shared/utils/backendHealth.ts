import { useState } from 'react';

/**
 * Utilidades para verificar la conexión con el backend
 */
export const BackendHealthCheck = {
  /**
   * Verifica la conexión usando múltiples endpoints conocidos
   */
  async checkApiConnection(): Promise<{ connected: boolean; endpoint?: string; latency?: number }> {
    // Lista de endpoints a probar en orden de preferencia
    const endpoints = [
      '/api/health',
      '/api/servicio',
      '/api/comercio/list',
      '/api/usuarios'
    ];

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        
        // Usar HEAD para ser más ligero, pero fallback a GET si HEAD falla
        let response = await fetch(endpoint, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(3000)
        });

        // Si HEAD no es soportado, intentar con GET
        if (response.status === 405) {
          response = await fetch(endpoint, { 
            method: 'GET',
            signal: AbortSignal.timeout(5000)
          });
        }

        const latency = Date.now() - startTime;

        if (response.ok || response.status === 401) {
          // 401 significa que el backend responde pero requiere auth
          console.log(`Backend conectado vía ${endpoint} (${latency}ms)`);
          return { 
            connected: true, 
            endpoint, 
            latency 
          };
        }
      } catch (error) {
        console.warn(`Intento con ${endpoint} fallido:`, error);
        continue;
      }
    }

    return { connected: false };
  },

  /**
   * Verifica un endpoint específico con retry
   */
  async checkSpecificEndpoint(
    endpoint: string, 
    retries = 2
  ): Promise<{ status: number; ok: boolean; latency?: number }> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const startTime = Date.now();
        const response = await fetch(endpoint, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(3000)
        });
        const latency = Date.now() - startTime;

        if (response.ok) {
          return { status: response.status, ok: true, latency };
        }

        // Si HEAD no funciona, intentar GET
        if (response.status === 405) {
          const getResponse = await fetch(endpoint, { 
            method: 'GET',
            signal: AbortSignal.timeout(5000)
          });
          const getLatency = Date.now() - startTime;
          return { 
            status: getResponse.status, 
            ok: getResponse.ok, 
            latency: getLatency 
          };
        }

        return { status: response.status, ok: false, latency };
      } catch (error) {
        console.warn(`Intento ${attempt + 1} para ${endpoint} fallido:`, error);
        
        if (attempt < retries) {
          // Esperar antes del siguiente intento (backoff exponencial)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
      }
    }

    return { status: 0, ok: false };
  },

  /**
   * Verifica el estado general del backend
   */
  async getBackendStatus(): Promise<{
    connected: boolean;
    endpoints: Record<string, { ok: boolean; latency?: number; status: number }>;
    overallLatency?: number;
  }> {
    const commonEndpoints = [
      '/api/servicio',
      '/api/comercio/list',
      '/api/user/all',
      '/api/evento',
      '/api/hospedajes'
    ];

    const startTime = Date.now();
    const connectionCheck = await this.checkApiConnection();
    const overallLatency = connectionCheck.connected ? Date.now() - startTime : undefined;

    const endpointChecks = await Promise.allSettled(
      commonEndpoints.map(async (endpoint) => {
        const result = await this.checkSpecificEndpoint(endpoint, 1);
        return { endpoint, ...result };
      })
    );

    const endpoints: Record<string, { ok: boolean; latency?: number; status: number }> = {};
    
    endpointChecks.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { endpoint, ...rest } = result.value;
        endpoints[endpoint] = rest;
      }
    });

    return {
      connected: connectionCheck.connected,
      endpoints,
      overallLatency
    };
  }
};

/**
 * Hook personalizado para reintentos con backoff exponencial
 */
export function useRetryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn();
        setData(result);
        setLoading(false);
        return result;
      } catch (err) {
        console.warn(`Intento ${attempt + 1} fallido:`, err);
        
        if (attempt === maxRetries) {
          setError(`Error después de ${maxRetries + 1} intentos`);
          setLoading(false);
          return;
        }
        
        // Espera exponencial: 1s, 2s, 4s...
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  };

  return { data, loading, error, execute };
}