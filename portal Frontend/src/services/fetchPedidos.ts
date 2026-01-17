// Servicios para gestión de pedidos

export enum EstadoPedido {
    PENDING = "PENDING",
    PAID = "PAID",
    READY = "READY",
    DELIVERED = "DELIVERED"
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
    payment: Payment;
}

export async function fetchPedidosByRestaurant(restaurantId: string): Promise<Pedido[]> {
    try {
        const response = await fetch(`/api/pedidos/orders/restaurant/${restaurantId}`);
        if (!response.ok) {
            throw new Error(`Error al obtener pedidos: ${response.status}`);
        }
        const data = await response.json();
        return data as Pedido[];
    } catch (error) {
        console.error("Error en fetchPedidosByRestaurant:", error);
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
        console.error("Error en fetchPedidosByUser:", error);
        return [];
    }
}

export async function updateEstadoPedido(pedidoId: string, nuevoEstado: EstadoPedido): Promise<boolean> {
    try {
        const response = await fetch(`/api/pedidos/${pedidoId}/estado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: nuevoEstado }),
        });
        return response.ok;
    } catch (error) {
        console.error("Error al actualizar estado del pedido:", error);
        return false;
    }
}
