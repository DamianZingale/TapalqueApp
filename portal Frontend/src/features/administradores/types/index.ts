// Tipos para el módulo Administradores

// Tipos de negocio soportados
export type BusinessType = 'GASTRONOMIA' | 'HOSPEDAJE';

// Negocio del usuario
export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  address: string;
  imageUrl?: string;
  email?: string;
  phone?: string;
}

// Estados de pedido
export enum EstadoPedido {
  PENDING = 'PENDING',
  PAID = 'PAID',
  READY = 'READY',
  DELIVERED = 'DELIVERED'
}

// Estados de reserva con colores
export enum EstadoReservaColor {
  ROJO = 'ROJO',       // En ejecución / Paga al ingreso
  AMARILLO = 'AMARILLO', // Reserva con adelanto/garantía
  NARANJA = 'NARANJA'    // Pago completo mediante app
}

// Item de pedido
export interface ItemPedido {
  productId?: string;
  productName?: string;
  itemName?: string;
  itemPrice?: number;
  itemQuantity?: number;
  unitPrice?: number;
  quantity: number;
}

// Información de pago de pedido
export interface PagoPedido {
  isPaid: boolean;
  paymentId?: string;
  paymentDate?: string;
}

// Pedido completo
export interface Pedido {
  id: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  userAddress?: string;
  totalPrice?: number;
  totalAmount?: number;
  paidWithMercadoPago: boolean;
  paidWithCash: boolean;
  isDelivery: boolean;
  deliveryAddress?: string;
  status: EstadoPedido;
  dateCreated: string;
  dateUpdated: string;
  paymentReceiptPath?: string;
  items: ItemPedido[];
  restaurant?: {
    restaurantId: string;
    restaurantName: string;
  };
  restaurantId?: string;
  restaurantName?: string;
  transaccionId?: number;
  mercadoPagoId?: string;
  fechaPago?: string;
  payment: PagoPedido;
}

// Cliente de reserva
export interface CustomerReserva {
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
}

// Hotel de reserva
export interface HotelReserva {
  hotelId: string;
  hotelName: string;
}

// Período de estadía
export interface StayPeriod {
  checkInDate: string;
  checkOutDate: string;
}

// Información de pago de reserva
export interface PagoReserva {
  isPaid: boolean;
  hasPendingAmount: boolean;
  isDeposit: boolean;
  paymentType: string;
  paymentReceiptPath?: string;
  amountPaid: number;
  totalAmount: number;
  remainingAmount: number;
}

// Reserva completa
export interface Reserva {
  id: string;
  customer: CustomerReserva;
  hotel: HotelReserva;
  stayPeriod: StayPeriod;
  payment: PagoReserva;
  roomType?: string;
  roomId?: string;
  totalPrice: number;
  isActive: boolean;
  isCancelled: boolean;
  dateCreated: string;
  dateUpdated: string;
  transaccionId?: number;
  mercadoPagoId?: string;
  fechaPago?: string;
  notas?: string;
}

// Item de menú
export interface MenuItem {
  id: number;
  dish_name: string;
  description?: string;
  price: number;
  ingredients: string[];
  picture?: string;
  category: string;
  restrictions: string[];
  available: boolean;
  restaurantId?: string;
}

// Nuevo item de menú (para crear)
export interface NuevoMenuItem {
  dish_name: string;
  description?: string;
  price: number;
  ingredients: string[];
  picture?: string;
  category: string;
  restrictions: string[];
  available?: boolean;
}

// Habitación/Opción de hospedaje
export interface Habitacion {
  id: string;
  titulo: string;
  descripcion?: string;
  maxPersonas: number;
  precio: number;
  tipoPrecio: 'por_habitacion' | 'por_persona';
  foto?: string;
  servicios?: string[];
  disponible: boolean;
}

// Mensajes WebSocket
export type WebSocketMessageType =
  | 'pedido:nuevo'
  | 'pedido:actualizado'
  | 'reserva:nueva'
  | 'reserva:actualizada'
  | 'connection:established'
  | 'connection:error';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: Pedido | Reserva | null;
  businessId: string;
  businessType: BusinessType;
  timestamp: string;
}

// Formulario para crear reserva externa
export interface FormReservaExterna {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  checkInDate: string;
  checkOutDate: string;
  roomId?: string;
  totalPrice: number;
  amountPaid: number;
  paymentType: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'MERCADOPAGO';
  notas: string;
}

// Categorías de menú
export const CATEGORIAS_MENU = [
  'Pizza',
  'Empanadas',
  'Hamburguesas',
  'Pastas',
  'Carnes',
  'Ensaladas',
  'Bebidas',
  'Postres',
  'Otros'
] as const;

// Restricciones alimentarias
export const RESTRICCIONES_MENU = [
  'Vegetariano',
  'Vegano',
  'Sin Gluten',
  'Sin Lactosa',
  'Sin Alcohol'
] as const;

// Helper para obtener color de estado de reserva
export function getColorEstadoReserva(reserva: Reserva): EstadoReservaColor {
  const { payment, isActive } = reserva;

  // Pago completo mediante app
  if (payment.isPaid && !payment.hasPendingAmount) {
    return EstadoReservaColor.NARANJA;
  }

  // Reserva con adelanto/garantía
  if (payment.isDeposit && payment.hasPendingAmount) {
    return EstadoReservaColor.AMARILLO;
  }

  // En ejecución / Paga al ingreso
  if (isActive && !payment.isPaid) {
    return EstadoReservaColor.ROJO;
  }

  // Default
  return EstadoReservaColor.AMARILLO;
}

// Helper para obtener badge de estado de pedido
export function getEstadoPedidoBadge(estado: EstadoPedido): { color: string; texto: string } {
  switch (estado) {
    case EstadoPedido.PENDING:
      return { color: 'secondary', texto: 'Pendiente' };
    case EstadoPedido.PAID:
      return { color: 'info', texto: 'Pagado' };
    case EstadoPedido.READY:
      return { color: 'success', texto: 'Listo' };
    case EstadoPedido.DELIVERED:
      return { color: 'dark', texto: 'Entregado' };
    default:
      return { color: 'secondary', texto: 'Desconocido' };
  }
}

// Helper para obtener siguiente estado de pedido
export function getSiguienteEstadoPedido(estadoActual: EstadoPedido): EstadoPedido | null {
  switch (estadoActual) {
    case EstadoPedido.PENDING:
      return EstadoPedido.PAID;
    case EstadoPedido.PAID:
      return EstadoPedido.READY;
    case EstadoPedido.READY:
      return EstadoPedido.DELIVERED;
    case EstadoPedido.DELIVERED:
      return null;
    default:
      return null;
  }
}
