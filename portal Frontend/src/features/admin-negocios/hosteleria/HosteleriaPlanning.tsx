import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { addDays, differenceInDays, isSameDay, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { fetchHabitacionesByHospedaje, type Habitacion } from '../../../services/fetchHabitaciones';
import { fetchReservasByHotel, type Reserva } from '../../../services/fetchReservas';

interface Props {
  businessId: string;
  businessName: string;
}

type PlanningCell =
  | { type: 'reservation'; reserva: Reserva; span: number }
  | { type: 'empty' };

const DAYS_TO_SHOW = 30;

// ── Colores según estado de pago ──────────────────────────────────────────────
function getPaymentColor(reserva: Reserva): { bg: string; text: string } {
  if (reserva.payment.isPaid && !reserva.payment.hasPendingAmount) {
    return { bg: '#fd7e14', text: '#fff' }; // naranja - pagó total
  }
  if (reserva.payment.amountPaid > 0) {
    return { bg: '#ffc107', text: '#000' }; // amarillo - pagó anticipo
  }
  return { bg: '#dc3545', text: '#fff' }; // rojo - abona al ingreso
}

function getPaymentLabel(reserva: Reserva): string {
  if (reserva.payment.isPaid && !reserva.payment.hasPendingAmount) return 'Pagó total';
  if (reserva.payment.amountPaid > 0) return 'Pagó anticipo';
  return 'Abona al ingreso';
}

// ── Parseo seguro de fechas (sin conversión de timezone) ──────────────────────
function parseLocalDate(dateStr: string): Date {
  const clean = dateStr.split('T')[0];
  const [y, m, d] = clean.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// ── Nombres de días en español abreviados ─────────────────────────────────────
const DAY_NAMES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

export function HosteleriaPlanning({ businessId }: Props) {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const [viewStart, setViewStart] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  // ── Carga de datos ───────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [habs, revs] = await Promise.all([
        fetchHabitacionesByHospedaje(businessId),
        fetchReservasByHotel(businessId),
      ]);
      setHabitaciones([...habs].sort((a, b) => a.numero - b.numero));
      setReservas(revs.filter((r) => !r.isCancelled));
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error cargando datos del planning:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  // Carga inicial
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh cada 2 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 120_000);
    return () => clearInterval(interval);
  }, [loadData]);

  // ── Rango de fechas visible ──────────────────────────────────────────────────
  const days = useMemo<Date[]>(() => {
    return Array.from({ length: DAYS_TO_SHOW }, (_, i) => addDays(viewStart, i));
  }, [viewStart]);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  // Agrupa días por mes para el header doble
  const monthGroups = useMemo(() => {
    const groups: { label: string; count: number }[] = [];
    days.forEach((day) => {
      const label = format(day, 'MMMM yyyy', { locale: es }).toUpperCase();
      const last = groups[groups.length - 1];
      if (last && last.label === label) {
        last.count++;
      } else {
        groups.push({ label, count: 1 });
      }
    });
    return groups;
  }, [days]);

  // ── Construcción de celdas por fila (algoritmo Gantt con colspan) ─────────────
  const buildRowCells = useCallback(
    (hab: Habitacion): PlanningCell[] => {
      const habReservas = reservas.filter((r) => r.roomNumber === hab.numero);
      const cells: PlanningCell[] = [];
      let i = 0;

      while (i < days.length) {
        const date = days[i];

        // Busca una reserva que cubra este día
        const reserva = habReservas.find((r) => {
          const ci = parseLocalDate(r.stayPeriod.checkInDate);
          const co = parseLocalDate(r.stayPeriod.checkOutDate);
          return date >= ci && date <= co;
        });

        if (reserva) {
          const checkOut = parseLocalDate(reserva.stayPeriod.checkOutDate);
          const lastVisibleDay = checkOut <= days[days.length - 1] ? checkOut : days[days.length - 1];
          const span = differenceInDays(lastVisibleDay, date) + 1;
          cells.push({ type: 'reservation', reserva, span: Math.max(span, 1) });
          i += span;
        } else {
          cells.push({ type: 'empty' });
          i++;
        }
      }

      return cells;
    },
    [reservas, days]
  );

  // ── Navegación ───────────────────────────────────────────────────────────────
  const goToPrev = () => setViewStart((d) => addDays(d, -DAYS_TO_SHOW));
  const goToNext = () => setViewStart((d) => addDays(d, DAYS_TO_SHOW));
  const goToToday = () => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    setViewStart(t);
  };

  // ── Estilos ──────────────────────────────────────────────────────────────────
  const HEADER_BG = '#1e2235';
  const HEADER_COLOR = '#e8eaf6';
  const STICKY_SHADOW = '2px 0 5px rgba(0,0,0,0.15)';
  const COL_W_NUM = 52;   // px - columna #
  const COL_W_NAME = 160; // px - columna Nombre
  const COL_W_DAY = 82;   // px - columna de día

  const stickyBase: React.CSSProperties = {
    position: 'sticky',
    zIndex: 2,
    boxShadow: STICKY_SHADOW,
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando planning...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Barra de navegación */}
      <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
        <Button variant="outline-secondary" size="sm" onClick={goToPrev}>
          ← Anterior
        </Button>
        <Button variant="outline-primary" size="sm" onClick={goToToday}>
          Hoy
        </Button>
        <Button variant="outline-secondary" size="sm" onClick={goToNext}>
          Siguiente →
        </Button>

        <span className="text-muted small ms-1">
          {format(days[0], "d 'de' MMMM", { locale: es })}
          {' – '}
          {format(days[days.length - 1], "d 'de' MMMM yyyy", { locale: es })}
        </span>

        <div className="ms-auto d-flex align-items-center gap-2">
          {lastUpdate && (
            <span className="text-muted small">
              Actualizado: {format(lastUpdate, 'HH:mm')}
            </span>
          )}
          <Button variant="outline-success" size="sm" onClick={loadData}>
            ↻ Actualizar
          </Button>
        </div>
      </div>

      {/* Leyenda */}
      <div className="d-flex gap-4 mb-3 align-items-center flex-wrap">
        <div className="d-flex align-items-center gap-2">
          <span
            style={{
              display: 'inline-block',
              width: 16,
              height: 16,
              borderRadius: 3,
              background: '#ffc107',
              border: '1px solid rgba(0,0,0,.15)',
            }}
          />
          <small>Pagó anticipo</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span
            style={{
              display: 'inline-block',
              width: 16,
              height: 16,
              borderRadius: 3,
              background: '#dc3545',
            }}
          />
          <small>Abona al ingreso</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span
            style={{
              display: 'inline-block',
              width: 16,
              height: 16,
              borderRadius: 3,
              background: '#fd7e14',
            }}
          />
          <small>Pagó total</small>
        </div>
        <div className="ms-auto text-muted small">
          {habitaciones.length} habitación{habitaciones.length !== 1 ? 'es' : ''}
        </div>
      </div>

      {/* Tabla */}
      <div
        style={{
          overflowX: 'auto',
          border: '1px solid #dee2e6',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <table
          style={{
            borderCollapse: 'collapse',
            minWidth: 'max-content',
            tableLayout: 'fixed',
          }}
        >
          <thead>
            {/* Fila 1: columnas sticky + meses */}
            <tr>
              {/* # */}
              <th
                rowSpan={2}
                style={{
                  ...stickyBase,
                  left: 0,
                  zIndex: 4,
                  width: COL_W_NUM,
                  minWidth: COL_W_NUM,
                  background: HEADER_BG,
                  color: HEADER_COLOR,
                  textAlign: 'center',
                  padding: '6px 4px',
                  fontSize: '0.75rem',
                  borderRight: '1px solid #3a3f5c',
                  borderBottom: '1px solid #3a3f5c',
                  verticalAlign: 'middle',
                }}
              >
                #
              </th>

              {/* Nombre */}
              <th
                rowSpan={2}
                style={{
                  ...stickyBase,
                  left: COL_W_NUM,
                  zIndex: 4,
                  width: COL_W_NAME,
                  minWidth: COL_W_NAME,
                  background: HEADER_BG,
                  color: HEADER_COLOR,
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  borderRight: '2px solid #4a5080',
                  borderBottom: '1px solid #3a3f5c',
                  verticalAlign: 'middle',
                  whiteSpace: 'nowrap',
                }}
              >
                Habitación
              </th>

              {/* Meses */}
              {monthGroups.map((g, idx) => (
                <th
                  key={idx}
                  colSpan={g.count}
                  style={{
                    background: HEADER_BG,
                    color: HEADER_COLOR,
                    textAlign: 'center',
                    padding: '5px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    borderLeft: idx === 0 ? 'none' : '2px solid #4a5080',
                    borderBottom: '1px solid #3a3f5c',
                  }}
                >
                  {g.label}
                </th>
              ))}
            </tr>

            {/* Fila 2: días */}
            <tr>
              {days.map((day, i) => {
                const isToday = isSameDay(day, today);
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const bg = isToday
                  ? '#0d6efd'
                  : isWeekend
                  ? '#2c3155'
                  : HEADER_BG;
                return (
                  <th
                    key={i}
                    style={{
                      background: bg,
                      color: HEADER_COLOR,
                      textAlign: 'center',
                      padding: '4px 2px',
                      width: COL_W_DAY,
                      minWidth: COL_W_DAY,
                      fontSize: '0.72rem',
                      borderLeft: '1px solid #3a3f5c',
                      whiteSpace: 'nowrap',
                      fontWeight: isToday ? 700 : 400,
                    }}
                  >
                    <div style={{ opacity: 0.8, fontSize: '0.65rem' }}>
                      {DAY_NAMES[day.getDay()]}
                    </div>
                    <div style={{ fontWeight: 600 }}>{format(day, 'd/M')}</div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {habitaciones.length === 0 ? (
              <tr>
                <td
                  colSpan={2 + DAYS_TO_SHOW}
                  className="text-center text-muted py-4"
                  style={{ fontSize: '0.9rem' }}
                >
                  No hay habitaciones cargadas.
                </td>
              </tr>
            ) : (
              habitaciones.map((hab, rowIdx) => {
                const cells = buildRowCells(hab);
                const rowBg = rowIdx % 2 === 0 ? '#ffffff' : '#f5f7fa';

                return (
                  <tr key={hab.id} style={{ height: 42 }}>
                    {/* # */}
                    <td
                      style={{
                        ...stickyBase,
                        left: 0,
                        zIndex: 2,
                        background: rowBg,
                        width: COL_W_NUM,
                        minWidth: COL_W_NUM,
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: '#444',
                        borderRight: '1px solid #dee2e6',
                        borderBottom: '1px solid #e9ecef',
                        padding: '4px',
                      }}
                    >
                      {hab.numero}
                    </td>

                    {/* Nombre */}
                    <td
                      title={hab.titulo}
                      style={{
                        ...stickyBase,
                        left: COL_W_NUM,
                        zIndex: 2,
                        background: rowBg,
                        width: COL_W_NAME,
                        minWidth: COL_W_NAME,
                        maxWidth: COL_W_NAME,
                        padding: '4px 12px',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        borderRight: '2px solid #c8cdd8',
                        borderBottom: '1px solid #e9ecef',
                      }}
                    >
                      {hab.titulo}
                    </td>

                    {/* Celdas de días */}
                    {cells.map((cell, ci) => {
                      if (cell.type === 'empty') {
                        // Detectar si es hoy para marcar la columna
                        const dayIndex = cells
                          .slice(0, ci)
                          .reduce((acc, c) => acc + (c.type === 'reservation' ? c.span : 1), 0);
                        const isCurrentDay = isSameDay(days[dayIndex], today);
                        const isWEnd =
                          days[dayIndex]?.getDay() === 0 || days[dayIndex]?.getDay() === 6;

                        return (
                          <td
                            key={ci}
                            style={{
                              borderLeft: isCurrentDay
                                ? '2px solid #0d6efd'
                                : '1px solid #e9ecef',
                              borderBottom: '1px solid #e9ecef',
                              width: COL_W_DAY,
                              minWidth: COL_W_DAY,
                              background: isWEnd ? '#f0f2f8' : rowBg,
                            }}
                          />
                        );
                      }

                      // Calcular el índice de día del inicio de esta celda
                      const startIdx = cells
                        .slice(0, ci)
                        .reduce((acc, c) => acc + (c.type === 'reservation' ? c.span : 1), 0);
                      const isCurrentDay = isSameDay(days[startIdx], today);

                      const { reserva, span } = cell;
                      const { bg, text } = getPaymentColor(reserva);
                      const nombre = reserva.customer.customerName;
                      const personas = reserva.cantidadHuespedes ?? 1;
                      const tooltip = `${nombre} | ${personas} persona${personas !== 1 ? 's' : ''} | ${getPaymentLabel(reserva)} | Check-in: ${reserva.stayPeriod.checkInDate.split('T')[0]} | Check-out: ${reserva.stayPeriod.checkOutDate.split('T')[0]}`;

                      return (
                        <td
                          key={ci}
                          colSpan={span}
                          title={tooltip}
                          style={{
                            background: bg,
                            color: text,
                            padding: '3px 8px',
                            borderLeft: isCurrentDay
                              ? '2px solid #0d6efd'
                              : '1px solid rgba(0,0,0,0.12)',
                            borderBottom: '1px solid rgba(0,0,0,0.1)',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            maxWidth: span * COL_W_DAY,
                            fontSize: '0.78rem',
                            verticalAlign: 'middle',
                            cursor: 'default',
                            userSelect: 'none',
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{nombre}</span>
                          <span
                            style={{
                              marginLeft: 5,
                              opacity: 0.85,
                              fontSize: '0.72rem',
                            }}
                          >
                            {personas}p
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pie con info de actualización */}
      <div className="text-muted small mt-2 text-end">
        Se actualiza automáticamente cada 2 minutos
      </div>
    </div>
  );
}
