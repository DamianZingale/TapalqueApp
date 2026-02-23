// Servicios para gestión de reservas

export interface Customer {
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerDni?: string;
}

export interface Hotel {
  hotelId: string;
  hotelName: string;
}

export interface StayPeriod {
  checkInDate: string;
  checkOutDate: string;
}

export interface Payment {
  isPaid: boolean;
  hasPendingAmount: boolean;
  isDeposit: boolean;
  paymentType: string;
  paymentReceiptPath?: string;
  amountPaid: number;
  totalAmount: number;
  remainingAmount: number;
}

export interface BillingInfo {
  cuitCuil: string;
  razonSocial: string;
  domicilioComercial: string;
  tipoFactura: 'A' | 'B';
  condicionFiscal: 'Monotributista' | 'Responsable Inscripto' | 'Consumidor Final';
}

export interface Reserva {
  id: string;
  customer: Customer;
  hotel: Hotel;
  stayPeriod: StayPeriod;
  payment: Payment;
  totalPrice: number;
  cantidadHuespedes?: number;
  requiereFacturacion?: boolean;
  billingInfo?: BillingInfo;
  isActive: boolean;
  isCancelled: boolean;
  dateCreated: string;
  dateUpdated: string;
  transaccionId?: number;
  mercadoPagoId?: string;
  fechaPago?: string;
  roomNumber?: number;
  notas?: string;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchReservasByHotel(
  hotelId: string,
  desde?: string,
  hasta?: string
): Promise<Reserva[]> {
  try {
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    const query = params.toString();

    const response = await fetch(
      `/api/reservas/reservations/by-hotel/${hotelId}${query ? '?' + query : ''}`,
      {
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) {
      throw new Error(`Error al obtener reservas: ${response.status}`);
    }
    const data = await response.json();
    return data as Reserva[];
  } catch (error) {
    console.error('Error en fetchReservasByHotel:', error);
    return [];
  }
}

export async function cancelarReserva(reservaId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/reservas/reservations/delete/${reservaId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );
    return response.ok;
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    return false;
  }
}

export async function fetchReservasByUser(userId: string): Promise<Reserva[]> {
  try {
    const response = await fetch(
      `/api/reservas/reservations/by-customer/${userId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) {
      throw new Error(`Error al obtener reservas: ${response.status}`);
    }
    const data = await response.json();
    return data as Reserva[];
  } catch (error) {
    console.error('Error en fetchReservasByUser:', error);
    return [];
  }
}

export async function crearReservaExterna(
  reserva: Partial<Reserva>
): Promise<Reserva | null> {
  try {
    console.log('Enviando reserva:', JSON.stringify(reserva, null, 2));
    const response = await fetch('/api/reservas/reservations/new', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reserva),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error response body:', errorBody);
      throw new Error(`Error al crear reserva: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error al crear reserva externa:', error);
    return null;
  }
}

// Actualizar reserva (para completar pago, agregar notas, etc.)
export async function actualizarReserva(
  reserva: Reserva
): Promise<Reserva | null> {
  try {
    const response = await fetch(`/api/reservas/reservations/update/${reserva.id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(reserva),
    });
    if (!response.ok) {
      throw new Error(`Error al actualizar reserva: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    return null;
  }
}

// Obtener una reserva por su ID
export async function fetchReservaById(reservaId: string): Promise<Reserva | null> {
  try {
    const response = await fetch(
      `/api/reservas/reservations/by-id/${reservaId}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) return null;
    const data = await response.json();
    // El endpoint retorna un array (Flux), tomamos el primer elemento
    return Array.isArray(data) ? data[0] || null : data;
  } catch (error) {
    console.error('Error en fetchReservaById:', error);
    return null;
  }
}

// Consulta pública: habitaciones libres de un hospedaje para un rango de fechas.
// El backend (msvc-reservas) combina habitaciones de msvc-hosteleria con reservas solapadas.
import type { Habitacion } from './fetchHabitaciones';

export async function fetchDisponibilidad(
  hotelId: string,
  desde: string,
  hasta: string
): Promise<Habitacion[]> {
  try {
    const response = await fetch(
      `/api/reservas/disponibilidad/${hotelId}?desde=${desde}&hasta=${hasta}`
    );
    if (!response.ok) {
      throw new Error(`Error al consultar disponibilidad: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en fetchDisponibilidad:', error);
    return [];
  }
}

// Política de reservas
export interface PoliticaGlobal {
  hotelId: string;
  reservasHabilitadas: boolean;
  politicaFdsActiva: boolean;
  estadiaMinima: number;
  fechaActualizacion: string;
  actualizadoPor?: string;
}

export async function fetchPoliticaGlobal(hotelId: string): Promise<PoliticaGlobal | null> {
  try {
    const response = await fetch(
      `/api/reservas/politica/${hotelId}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) {
      throw new Error(`Error al obtener política: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en fetchPoliticaGlobal:', error);
    return null;
  }
}

export async function actualizarPoliticaGlobal(
  hotelId: string,
  politica: Partial<PoliticaGlobal>
): Promise<PoliticaGlobal | null> {
  try {
    const response = await fetch(`/api/reservas/politica/${hotelId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(politica),
    });
    if (!response.ok) {
      throw new Error(`Error al actualizar política: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error al actualizar política:', error);
    return null;
  }
}
