// Servicios para gestión de pedidos
import { api } from '../config/api';

export enum EstadoPedido {
  RECIBIDO = 'RECIBIDO',
  EN_PREPARACION = 'EN_PREPARACION',
  LISTO = 'LISTO',
  EN_DELIVERY = 'EN_DELIVERY',
  ENTREGADO = 'ENTREGADO',
  FAILED = 'FAILED',
}

export interface ItemPedido {
  productId?: string;
  productName?: string;
  itemName?: string;
  itemPrice?: number;
  itemQuantity?: number;
  unitPrice?: number;
  quantity: number;
}

export interface Restaurant {
  restaurantId: string;
  restaurantName: string;
}

export interface Payment {
  isPaid: boolean;
  paymentId?: string;
  paymentDate?: string;
}

export interface Pedido {
  id: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  totalPrice?: number;
  totalAmount?: number;
  paidWithMercadoPago: boolean;
  paidWithCash: boolean;
  status: EstadoPedido;
  dateCreated: string;
  dateUpdated: string;
  paymentReceiptPath?: string;
  items: ItemPedido[];
  restaurant?: Restaurant;
  restaurantId?: string;
  restaurantName?: string;
  transaccionId?: number;
  mercadoPagoId?: string;
  fechaPago?: string;
  payment?: Payment;
  isDelivery: boolean;
  deliveryAddress?: string;
}

export interface CrearPedidoDTO {
  userId: string;
  userName: string;
  userPhone: string;
  totalPrice: number;
  items: ItemPedido[];
  restaurant: Restaurant;
  isDelivery: boolean;
  deliveryAddress?: string;
  paidWithMercadoPago: boolean;
  paidWithCash: boolean;
}

export async function fetchPedidosByRestaurant(
  restaurantId: string
): Promise<Pedido[]> {
  const data = await api.get<Pedido[]>(
    `/pedidos/orders/restaurant/${restaurantId}`
  );
  return data ?? [];
}

export async function fetchPedidosByUser(userId: string): Promise<Pedido[]> {
  const data = await api.get<Pedido[]>(`/pedidos/orders/user/${userId}`);
  return data ?? [];
}

export async function fetchPedidoById(
  pedidoId: string
): Promise<Pedido | null> {
  try {
    return await api.get<Pedido>(`/pedidos/orders/${pedidoId}`);
  } catch {
    return null;
  }
}

export async function updateEstadoPedido(
  pedidoId: string,
  nuevoEstado: EstadoPedido
): Promise<boolean> {
  try {
    await api.patch(`/pedidos/orders/${pedidoId}/estado`, {
      status: nuevoEstado,
    });
    return true;
  } catch {
    return false;
  }
}

export async function fetchPedidosByRestaurantAndDateRange(
  restaurantId: string,
  desde: string,
  hasta: string
): Promise<Pedido[]> {
  const params = new URLSearchParams({ desde, hasta });
  const data = await api.get<Pedido[]>(
    `/pedidos/orders/restaurant/${restaurantId}?${params}`
  );
  return data ?? [];
}

export async function crearPedido(
  pedido: CrearPedidoDTO
): Promise<Pedido | null> {
  try {
    return await api.post<Pedido>('/pedidos/orders/new', pedido);
  } catch {
    return null;
  }
}

export async function cancelarPedido(pedidoId: string): Promise<boolean> {
  return updateEstadoPedido(pedidoId, EstadoPedido.FAILED);
}
