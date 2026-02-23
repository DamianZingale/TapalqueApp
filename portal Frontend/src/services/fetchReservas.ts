// Servicios para gestión de reservas
import { api } from '../config/api';

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

export interface PaymentRecord {
  date: string;
  amount: number;
  paymentType: string;
  description?: string;
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
  paymentHistory?: PaymentRecord[];
}

export async function fetchReservasByHotel(
  hotelId: string,
  desde?: string,
  hasta?: string
): Promise<Reserva[]> {
  const params = new URLSearchParams();
  if (desde) params.append('desde', desde);
  if (hasta) params.append('hasta', hasta);
  const query = params.toString();
  const data = await api.get<Reserva[]>(
    `/reservas/reservations/by-hotel/${hotelId}${query ? '?' + query : ''}`
  );
  return data ?? [];
}

export async function cancelarReserva(reservaId: string): Promise<boolean> {
  try {
    await api.delete(`/reservas/reservations/delete/${reservaId}`);
    return true;
  } catch {
    return false;
  }
}

export async function fetchReservasByUser(userId: string): Promise<Reserva[]> {
  try {
    const data = await api.get<Reserva[]>(`/reservas/reservations/by-customer/${userId}`);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function crearReservaExterna(
  reserva: Partial<Reserva>
): Promise<Reserva | null> {
  try {
    return await api.post<Reserva>('/reservas/reservations/new', reserva);
  } catch {
    return null;
  }
}

// Actualizar reserva (para completar pago, agregar notas, etc.)
export async function actualizarReserva(
  reserva: Reserva
): Promise<Reserva | null> {
  try {
    return await api.put<Reserva>(`/reservas/reservations/update/${reserva.id}`, reserva);
  } catch {
    return null;
  }
}

// Obtener una reserva por su ID
export async function fetchReservaById(reservaId: string): Promise<Reserva | null> {
  try {
    const data = await api.get<Reserva | Reserva[]>(`/reservas/reservations/by-id/${reservaId}`);
    // El endpoint retorna un array (Flux), tomamos el primer elemento
    return Array.isArray(data) ? data[0] || null : data;
  } catch {
    return null;
  }
}

// Reservas con pagos en un rango de fechas (para cierre del día)
export async function fetchReservasParaCierre(
  hotelId: string,
  desde: string,
  hasta: string
): Promise<Reserva[]> {
  // Backend espera LocalDateTime (sin zona) → quitar 'Z' y milisegundos sobrantes
  const formatDT = (iso: string) => iso.replace('Z', '').replace(/\.\d{3}$/, '');
  const params = new URLSearchParams({
    desde: formatDT(desde),
    hasta: formatDT(hasta),
  });
  const data = await api.get<Reserva[]>(
    `/reservas/reservations/cierre/${hotelId}?${params}`
  );
  return data ?? [];
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
    return await api.get<PoliticaGlobal>(`/reservas/politica/${hotelId}`);
  } catch {
    return null;
  }
}

export async function actualizarPoliticaGlobal(
  hotelId: string,
  politica: Partial<PoliticaGlobal>
): Promise<PoliticaGlobal | null> {
  try {
    return await api.put<PoliticaGlobal>(`/reservas/politica/${hotelId}`, politica);
  } catch {
    return null;
  }
}
