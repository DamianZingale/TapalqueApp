import { fetchPedidosByRestaurant, type Pedido, EstadoPedido } from './fetchPedidos';
import { fetchReservasByHotel } from './fetchReservas';
import { fetchHabitacionesByHospedaje } from './fetchHabitaciones';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface EstadisticasGastronomia {
    pedidosHoy: number;
    ingresosHoy: number;
    promedioPedido: number;
    pedidosPendientes: number;
    pedidosSemana: number;
    ingresosSemana: number;
    pedidosMes: number;
    ingresosMes: number;
    platosMasVendidos: PlatoVendido[];
    pedidosPorEstado: PedidoPorEstado[];
    ventasPorDia: VentaDia[];
}

export interface PlatoVendido {
    nombre: string;
    cantidad: number;
    ingresos: number;
}

export interface PedidoPorEstado {
    estado: string;
    cantidad: number;
}

export interface VentaDia {
    fecha: string;
    pedidos: number;
    ingresos: number;
}

export interface EstadisticasHospedaje {
    reservasActivas: number;
    ocupacionHoy: number;
    ingresosMes: number;
    reservasPendientes: number;
    ocupacionSemana: number[];
    reservasPorMes: ReservaMes[];
}

export interface ReservaMes {
    mes: string;
    cantidad: number;
    ingresos: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
    const r = new Date(d);
    r.setHours(0, 0, 0, 0);
    return r;
}

function parseLocalDate(s: string): Date {
    const clean = s.split('T')[0];
    const [y, m, d] = clean.split('-').map(Number);
    return new Date(y, m - 1, d);
}

const ESTADOS_ACTIVOS: EstadoPedido[] = [
    EstadoPedido.RECIBIDO,
    EstadoPedido.EN_PREPARACION,
    EstadoPedido.LISTO,
    EstadoPedido.EN_DELIVERY,
];

function isPedidoPagado(p: Pedido): boolean {
    return p.paidWithMercadoPago || p.paidWithCash;
}

function getPedidoTotal(p: Pedido): number {
    return p.totalPrice ?? p.totalAmount ?? 0;
}

// ── Gastronomía ───────────────────────────────────────────────────────────────

export async function fetchEstadisticasGastronomia(
    restaurantId: string
): Promise<EstadisticasGastronomia | null> {
    try {
        const pedidos = await fetchPedidosByRestaurant(restaurantId);

        const vacío: EstadisticasGastronomia = {
            pedidosHoy: 0, ingresosHoy: 0,
            promedioPedido: 0, pedidosPendientes: 0,
            pedidosSemana: 0, ingresosSemana: 0,
            pedidosMes: 0, ingresosMes: 0,
            platosMasVendidos: [], pedidosPorEstado: [], ventasPorDia: [],
        };

        if (!pedidos || pedidos.length === 0) return vacío;

        const hoy = startOfDay(new Date());
        const mañana = new Date(hoy); mañana.setDate(mañana.getDate() + 1);
        const hace7 = new Date(hoy); hace7.setDate(hace7.getDate() - 7);

        const getDate = (p: Pedido) => new Date(p.dateCreated);

        const pagadosHoy    = pedidos.filter(p => isPedidoPagado(p) && getDate(p) >= hoy && getDate(p) < mañana);
        const pagadosSemana = pedidos.filter(p => isPedidoPagado(p) && getDate(p) >= hace7);
        const pagadosMes    = pedidos.filter(p => isPedidoPagado(p));

        const pedidosHoy      = pagadosHoy.length;
        const ingresosHoy     = pagadosHoy.reduce((s, p) => s + getPedidoTotal(p), 0);
        const pedidosSemana   = pagadosSemana.length;
        const ingresosSemana  = pagadosSemana.reduce((s, p) => s + getPedidoTotal(p), 0);
        const pedidosMes      = pagadosMes.length;
        const ingresosMes     = pagadosMes.reduce((s, p) => s + getPedidoTotal(p), 0);
        const promedioPedido  = pedidosMes > 0 ? Math.round(ingresosMes / pedidosMes) : 0;
        const pedidosPendientes = pedidos.filter(p => ESTADOS_ACTIVOS.includes(p.status)).length;

        // Platos más vendidos
        const dishMap = new Map<string, PlatoVendido>();
        pagadosMes.forEach(p => {
            p.items.forEach(item => {
                const nombre = item.itemName ?? item.productName ?? 'Desconocido';
                const key    = item.productId ?? nombre;
                const qty    = item.itemQuantity ?? item.quantity ?? 1;
                const ingresos = (item.itemPrice ?? item.unitPrice ?? 0) * qty;
                const prev = dishMap.get(key);
                if (prev) {
                    prev.cantidad += qty;
                    prev.ingresos += ingresos;
                } else {
                    dishMap.set(key, { nombre, cantidad: qty, ingresos });
                }
            });
        });
        const platosMasVendidos = Array.from(dishMap.values())
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 10);

        // Pedidos por estado
        const statusMap = new Map<string, number>();
        pedidos.forEach(p => statusMap.set(p.status, (statusMap.get(p.status) ?? 0) + 1));
        const pedidosPorEstado = Array.from(statusMap.entries())
            .map(([estado, cantidad]) => ({ estado, cantidad }));

        // Ventas por día (últimos 7 días)
        const ventasPorDia: VentaDia[] = [];
        for (let i = 6; i >= 0; i--) {
            const dStart = new Date(hoy); dStart.setDate(dStart.getDate() - i);
            const dEnd   = new Date(dStart); dEnd.setDate(dEnd.getDate() + 1);
            const dayPedidos = pedidos.filter(p => isPedidoPagado(p) && getDate(p) >= dStart && getDate(p) < dEnd);
            ventasPorDia.push({
                fecha: dStart.toISOString().split('T')[0],
                pedidos: dayPedidos.length,
                ingresos: dayPedidos.reduce((s, p) => s + getPedidoTotal(p), 0),
            });
        }

        return {
            pedidosHoy, ingresosHoy,
            promedioPedido, pedidosPendientes,
            pedidosSemana, ingresosSemana,
            pedidosMes, ingresosMes,
            platosMasVendidos, pedidosPorEstado, ventasPorDia,
        };
    } catch (error) {
        console.error('Error en fetchEstadisticasGastronomia:', error);
        return null;
    }
}

// ── Hospedaje ─────────────────────────────────────────────────────────────────

export async function fetchEstadisticasHospedaje(
    hotelId: string
): Promise<EstadisticasHospedaje | null> {
    try {
        const [reservas, habitaciones] = await Promise.all([
            fetchReservasByHotel(hotelId),
            fetchHabitacionesByHospedaje(hotelId),
        ]);

        const totalHabs = habitaciones.length || 1;

        const hoy    = startOfDay(new Date());
        const mesActual = hoy.getMonth();
        const año       = hoy.getFullYear();

        const noCancel = reservas.filter(r => !r.isCancelled);

        // Reservas activas
        const reservasActivas = noCancel.filter(r => r.isActive).length;

        // Ocupación hoy: check-in ≤ hoy < check-out
        const ocupadasHoy = noCancel.filter(r => {
            const ci = parseLocalDate(r.stayPeriod.checkInDate);
            const co = parseLocalDate(r.stayPeriod.checkOutDate);
            return ci <= hoy && co > hoy;
        }).length;
        const ocupacionHoy = Math.min(Math.round((ocupadasHoy / totalHabs) * 100), 100);

        // Ingresos del mes (usando paymentHistory si existe, sino amountPaid si la reserva es de este mes)
        const ingresosMes = noCancel.reduce((sum, r) => {
            if (r.paymentHistory && r.paymentHistory.length > 0) {
                return sum + r.paymentHistory
                    .filter(ph => {
                        const d = new Date(ph.date);
                        return d.getMonth() === mesActual && d.getFullYear() === año;
                    })
                    .reduce((s, ph) => s + ph.amount, 0);
            }
            const created = new Date(r.dateCreated);
            if (created.getMonth() === mesActual && created.getFullYear() === año) {
                return sum + r.payment.amountPaid;
            }
            return sum;
        }, 0);

        // Reservas con pago pendiente
        const reservasPendientes = noCancel.filter(
            r => r.payment.hasPendingAmount && r.payment.remainingAmount > 0
        ).length;

        // Ocupación semana (próximos 7 días desde hoy)
        const ocupacionSemana: number[] = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(hoy); day.setDate(day.getDate() + i);
            const occupied = noCancel.filter(r => {
                const ci = parseLocalDate(r.stayPeriod.checkInDate);
                const co = parseLocalDate(r.stayPeriod.checkOutDate);
                return ci <= day && co > day;
            }).length;
            ocupacionSemana.push(Math.min(Math.round((occupied / totalHabs) * 100), 100));
        }

        // Reservas por mes (últimos 6 meses)
        const reservasPorMes: ReservaMes[] = [];
        for (let i = 5; i >= 0; i--) {
            const mesStart = new Date(año, mesActual - i, 1);
            const mesEnd   = new Date(año, mesActual - i + 1, 1);
            const mesRevs  = noCancel.filter(r => {
                const ci = parseLocalDate(r.stayPeriod.checkInDate);
                return ci >= mesStart && ci < mesEnd;
            });
            const mesIngresos = mesRevs.reduce((s, r) => s + r.payment.amountPaid, 0);
            const label = mesStart.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
            reservasPorMes.push({ mes: label, cantidad: mesRevs.length, ingresos: mesIngresos });
        }

        return {
            reservasActivas,
            ocupacionHoy,
            ingresosMes: Math.round(ingresosMes),
            reservasPendientes,
            ocupacionSemana,
            reservasPorMes,
        };
    } catch (error) {
        console.error('Error en fetchEstadisticasHospedaje:', error);
        return null;
    }
}
