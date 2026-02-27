// Tipos para el módulo Administradores

// Tipos de negocio soportados
export type BusinessType = 'GASTRONOMIA' | 'HOSPEDAJE';

// Negocio del usuario
export interface Business {
  id: string;
  name: string;
  externalBusinessId: string;
  type: BusinessType;
  address: string;
  imageUrl?: string;
  email?: string;
  phone?: string;

  // Configuración Gastronomía
  delivery?: boolean;
  deliveryPrice?: number;
}

// Estados de pedido
export enum EstadoPedido {
  RECIBIDO = 'RECIBIDO',
  EN_PREPARACION = 'EN_PREPARACION',
  LISTO = 'LISTO',
  EN_DELIVERY = 'EN_DELIVERY',
  ENTREGADO = 'ENTREGADO',
  FAILED = 'FAILED',
}

// Estados de reserva con colores
export enum EstadoReservaColor {
  ROJO = 'ROJO', // En ejecución / Paga al ingreso
  AMARILLO = 'AMARILLO', // Reserva con adelanto/garantía
  NARANJA = 'NARANJA', // Pago completo mediante app
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
  notas?: string;
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
  deliveryPrice?: number;
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
  payment?: PagoPedido;
}

// Cliente de reserva
export interface CustomerReserva {
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerDni?: string;
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

// Registro individual de pago (historial)
export interface PaymentRecord {
  date: string;
  amount: number;
  paymentType: string;
  description?: string;
}

// Información de facturación
export interface BillingInfo {
  cuitCuil: string;
  razonSocial: string;
  domicilioComercial: string;
  tipoFactura: 'A' | 'B';
  condicionFiscal: 'Monotributista' | 'Responsable Inscripto' | 'Consumidor Final';
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
  roomNumber?: number;
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
  notas?: string;
  paymentHistory?: PaymentRecord[];
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
  available: boolean;
}

// Habitación/Opción de hospedaje
export interface Habitacion {
  id: string;
  numero: number;
  titulo: string;
  descripcion?: string;
  maxPersonas: number;
  precio: number;
  precioUnaPersona?: number;
  tipoPrecio: 'por_habitacion' | 'por_persona';
  minimoPersonasAPagar?: number;
  fotos?: string[];
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
  customerDni: string;
  checkInDate: string;
  checkOutDate: string;
  roomId?: string;
  totalPrice: number;
  amountPaid: number;
  paymentType:
    | 'EFECTIVO'
    | 'TRANSFERENCIA'
    | 'TARJETA_CREDITO'
    | 'TARJETA_DEBITO'
    | 'MERCADO_PAGO';
  notas: string;
}

// Configuración de facturación de hospedaje
export interface HospedajeConfig {
  permiteFacturacion: boolean;
  tipoIva: 'INCLUIDO' | 'ADICIONAL' | 'NO_APLICA';
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
  'Otros',
] as const;

// Restricciones alimentarias
export const RESTRICCIONES_MENU = [
  'Vegetariano',
  'Vegano',
  'Sin Gluten',
  'Sin Lactosa',
  'Sin Alcohol',
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
export function getEstadoPedidoBadge(estado: EstadoPedido): {
  color: string;
  texto: string;
} {
  switch (estado) {
    case EstadoPedido.RECIBIDO:
      return { color: 'warning', texto: 'Recibido' };
    case EstadoPedido.EN_PREPARACION:
      return { color: 'info', texto: 'En Preparación' };
    case EstadoPedido.LISTO:
      return { color: 'success', texto: 'Listo' };
    case EstadoPedido.EN_DELIVERY:
      return { color: 'primary', texto: 'En Delivery' };
    case EstadoPedido.ENTREGADO:
      return { color: 'secondary', texto: 'Entregado' };
    default:
      return { color: 'secondary', texto: 'Desconocido' };
  }
}

// Helper para obtener siguiente estado de pedido
// Si isDelivery es true y el estado es LISTO, el siguiente es EN_DELIVERY
// Si isDelivery es false y el estado es LISTO, el siguiente es ENTREGADO directamente
export function getSiguienteEstadoPedido(
  estadoActual: EstadoPedido,
  isDelivery?: boolean
): EstadoPedido | null {
  switch (estadoActual) {
    case EstadoPedido.RECIBIDO:
      return EstadoPedido.EN_PREPARACION;
    case EstadoPedido.EN_PREPARACION:
      return EstadoPedido.LISTO;
    case EstadoPedido.LISTO:
      return isDelivery ? EstadoPedido.EN_DELIVERY : EstadoPedido.ENTREGADO;
    case EstadoPedido.EN_DELIVERY:
      return EstadoPedido.ENTREGADO;
    case EstadoPedido.ENTREGADO:
      return null;
    default:
      return null;
  }
}

// Helper para obtener texto del botón de siguiente estado
export function getTextoBotonSiguienteEstado(
  estadoActual: EstadoPedido,
  isDelivery?: boolean
): string {
  switch (estadoActual) {
    case EstadoPedido.RECIBIDO:
      return 'Comenzar preparación';
    case EstadoPedido.EN_PREPARACION:
      return 'Marcar como listo';
    case EstadoPedido.LISTO:
      return isDelivery ? 'Enviar a delivery' : 'Marcar entregado';
    case EstadoPedido.EN_DELIVERY:
      return 'Marcar entregado';
    default:
      return '';
  }
}
