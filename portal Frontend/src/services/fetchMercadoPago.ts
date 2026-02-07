// Servicio para integración con Mercado Pago

export interface ProductoRequest {
  idProducto: number;
  title: string;
  quantity: number;
  unitPrice: number;
  idVendedor: number;
  idComprador: number;
  idTransaccion: string; // ID de la reserva
  tipoServicio: 'GASTRONOMICO' | 'HOSPEDAJE';
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
 * Obtiene la URL para conectar cuenta de Mercado Pago (OAuth)
 * @param email Email del administrador del negocio
 * @returns URL de autorización de Mercado Pago o null si hay error
 */
export async function obtenerUrlOAuthMercadoPago(
  email: string
): Promise<string | null> {
  try {
    const response = await fetch(`/api/mercadopago/oauth/init?email=${encodeURIComponent(email)}`, {
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
