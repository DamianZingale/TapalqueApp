// Servicio para integración con Mercado Pago

export interface ProductoRequest {
  idProducto: number;
  title: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  idVendedor: number;
  idComprador: number;
  idTransaccion: string; // ID de la reserva
  tipoServicio: 'GASTRONOMICO' | 'HOSPEDAJE';
  // Datos del pagador para mejorar tasa de aprobación en MP
  payerEmail?: string;
  payerName?: string;
  payerIdentificationNumber?: string; // DNI
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Crea una preferencia de pago en Mercado Pago
 * @param producto Datos del producto/servicio a pagar
 * @returns URL de pago (initPoint) o null si hay error
 */
export async function crearPreferenciaPago(
  producto: ProductoRequest
): Promise<string | null> {
  try {
    console.log('Creando preferencia de pago:', producto);
    const response = await fetch('/api/mercadopago/pagos/crear', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(producto),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error al crear preferencia de pago:', errorBody);
      throw new Error(`Error al crear preferencia: ${response.status}`);
    }

    // El backend retorna directamente la URL (initPoint)
    const initPoint = await response.text();
    console.log('URL de pago obtenida:', initPoint);
    return initPoint;
  } catch (error) {
    console.error('Error en crearPreferenciaPago:', error);
    return null;
  }
}

/**
 * Obtiene la URL para conectar cuenta de Mercado Pago (OAuth) para un negocio
 * @param email Email del administrador del negocio
 * @param externalBusinessId ID del negocio (restaurante o hospedaje)
 * @param tipoServicio Tipo de servicio: 'GASTRONOMICO' o 'HOSPEDAJE'
 * @returns URL de autorización de Mercado Pago o null si hay error
 */
export async function obtenerUrlOAuthMercadoPago(
  email: string,
  externalBusinessId: string,
  tipoServicio: 'GASTRONOMICO' | 'HOSPEDAJE'
): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      email,
      externalBusinessId,
      tipoServicio,
    });
    const response = await fetch(`/api/mercadopago/oauth/init?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error al obtener URL de OAuth:', errorBody);
      throw new Error(`Error al obtener URL de OAuth: ${response.status}`);
    }

    const url = await response.text();
    return url;
  } catch (error) {
    console.error('Error en obtenerUrlOAuthMercadoPago:', error);
    return null;
  }
}
