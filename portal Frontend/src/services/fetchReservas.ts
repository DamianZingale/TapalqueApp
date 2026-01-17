// Servicios para gestión de reservas

export interface Customer {
    customerId: string;
    customerName: string;
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

export interface Reserva {
    id: string;
    customer: Customer;
    hotel: Hotel;
    stayPeriod: StayPeriod;
    payment: Payment;
    totalPrice: number;
    isActive: boolean;
    isCancelled: boolean;
    dateCreated: string;
    dateUpdated: string;
    transaccionId?: number;
    mercadoPagoId?: string;
    fechaPago?: string;
}

export async function fetchReservasByHotel(hotelId: string): Promise<Reserva[]> {
    try {
        const response = await fetch(`/api/reservas/reservations/by-hotel/${hotelId}`);
        if (!response.ok) {
            throw new Error(`Error al obtener reservas: ${response.status}`);
        }
        const data = await response.json();
        return data as Reserva[];
    } catch (error) {
        console.error("Error en fetchReservasByHotel:", error);
        return [];
    }
}

export async function cancelarReserva(reservaId: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/reservas/reservations/delete/${reservaId}`, {
            method: 'DELETE',
        });
        return response.ok;
    } catch (error) {
        console.error("Error al cancelar reserva:", error);
        return false;
    }
}

export async function fetchReservasByUser(userId: string): Promise<Reserva[]> {
    try {
        const response = await fetch(`/api/reservas/reservations/by-customer/${userId}`);
        if (!response.ok) {
            throw new Error(`Error al obtener reservas: ${response.status}`);
        }
        const data = await response.json();
        return data as Reserva[];
    } catch (error) {
        console.error("Error en fetchReservasByUser:", error);
        return [];
    }
}

export async function crearReservaExterna(reserva: Partial<Reserva>): Promise<Reserva | null> {
    try {
        const response = await fetch('/api/reservas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reserva),
        });
        if (!response.ok) {
            throw new Error(`Error al crear reserva: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error al crear reserva externa:", error);
        return null;
    }
}
