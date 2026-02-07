// Servicios para gestión de pedidos

export enum EstadoPedido {
  RECIBIDO = 'RECIBIDO',
  EN_PREPARACION = 'EN_PREPARACION',
  LISTO = 'LISTO',
  EN_DELIVERY = 'EN_DELIVERY',
  ENTREGADO = 'ENTREGADO',
}

// Helper para obtener headers con autenticación
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
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
  try {
    const response = await fetch(
      `/api/pedidos/orders/restaurant/${restaurantId}`
    );
    if (!response.ok) {
      throw new Error(`Error al obtener pedidos: ${response.status}`);
    }
    const data = await response.json();
    return data as Pedido[];
  } catch (error) {
    console.error('Error en fetchPedidosByRestaurant:', error);
    return [];
  }
}

export async function fetchPedidosByUser(userId: string): Promise<Pedido[]> {
  try {
    const response = await fetch(`/api/pedidos/orders/user/${userId}`);
    if (!response.ok) {
      throw new Error(`Error al obtener pedidos: ${response.status}`);
    }
    const data = await response.json();
    return data as Pedido[];
  } catch (error) {
    console.error('Error en fetchPedidosByUser:', error);
    return [];
  }
}

export async function updateEstadoPedido(
  pedidoId: string,
  nuevoEstado: EstadoPedido
): Promise<boolean> {
  try {
    const response = await fetch(`/api/pedidos/orders/${pedidoId}/estado`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: nuevoEstado }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    return false;
  }
}

export async function crearPedido(pedido: CrearPedidoDTO): Promise<Pedido | null> {
  try {
    const response = await fetch('/api/pedidos/orders/new', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(pedido),
    });
    if (!response.ok) {
      throw new Error(`Error al crear pedido: ${response.status}`);
    }
    const data = await response.json();
    return data as Pedido;
  } catch (error) {
    console.error('Error en crearPedido:', error);
    return null;
  }
}
