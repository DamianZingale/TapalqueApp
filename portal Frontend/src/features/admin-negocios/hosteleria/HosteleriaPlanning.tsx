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

// Cada celda trabaja en unidades de medio-día (AM=0, PM=1 dentro de cada día)
type PlanningCell =
  | { type: 'reservation'; reserva: Reserva; span: number; slotIdx: number }
  | { type: 'empty'; slotIdx: number };

const DAYS_TO_SHOW = 30;
const TOTAL_SLOTS = DAYS_TO_SHOW * 2; // 60 semi-columnas

// ── Colores según estado de pago ─────────────────────────────────────────────
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

// ── Parseo seguro de fechas (sin conversión de timezone) ─────────────────────
function parseLocalDate(dateStr: string): Date {
  const clean = dateStr.split('T')[0];
  const [y, m, d] = clean.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const DAY_NAMES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

// ── Calcula el rango de slots (medio-día) que ocupa una reserva dentro de la vista
//    Modelo: check-in ocupa desde el PM del día de llegada
//            check-out libera desde el PM del día de salida (AM ya libre para limpieza/nuevo check-in)
//    Retorna null si la reserva no intersecta con la vista.
function getSlotRange(
  reserva: Reserva,
  viewStart: Date,
  days: Date[]
): [number, number] | null {
  const ci = parseLocalDate(reserva.stayPeriod.checkInDate);
  const co = parseLocalDate(reserva.stayPeriod.checkOutDate);
  const viewEnd = days[days.length - 1];

  // Reserva completamente fuera de la vista
  if (co < viewStart || ci > viewEnd) return null;
  // Check-in y check-out el mismo día → estadia inválida, ignorar
  if (isSameDay(ci, co)) return null;

  // Slot de inicio: PM del día de check-in (índice *2 + 1)
  // Si el check-in fue antes del inicio de la vista, arrancar desde slot 0 (AM del primer día)
  let startSlot: number;
  if (ci < viewStart) {
    startSlot = 0;
  } else {
    const ciDayIdx = differenceInDays(ci, viewStart);
    startSlot = ciDayIdx * 2 + 1;
  }

  // Slot de fin: AM del día de check-out (índice *2)
  // Si el check-out excede la vista, terminar en el último slot visible
  let endSlot: number;
  if (co > viewEnd) {
    endSlot = TOTAL_SLOTS - 1;
  } else {
    const coDayIdx = differenceInDays(co, viewStart);
    endSlot = coDayIdx * 2;
  }

  if (startSlot > endSlot) return null;
  return [startSlot, endSlot];
}

export function HosteleriaPlanning({ businessId }: Props) {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const [viewStart, setViewStart] = useState<Date>(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  });

  // ── Carga de datos ──────────────────────────────────────────────────────────
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
      console.error('Error cargando planning:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-refresh cada 2 minutos
  useEffect(() => {
    const id = setInterval(loadData, 120_000);
    return () => clearInterval(id);
  }, [loadData]);

  // ── Rango de fechas visible ─────────────────────────────────────────────────
  const days = useMemo<Date[]>(
    () => Array.from({ length: DAYS_TO_SHOW }, (_, i) => addDays(viewStart, i)),
    [viewStart]
  );

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  // Agrupa días por mes → header de meses (colSpan en semi-columnas = count * 2)
  const monthGroups = useMemo(() => {
    const groups: { label: string; count: number }[] = [];
    days.forEach((day) => {
      const label = format(day, 'MMMM yyyy', { locale: es }).toUpperCase();
      const last = groups[groups.length - 1];
      if (last && last.label === label) last.count++;
      else groups.push({ label, count: 1 });
    });
    return groups;
  }, [days]);

  // ── Construcción de celdas por fila (half-day Gantt) ────────────────────────
  const buildRowCells = useCallback(
    (hab: Habitacion): PlanningCell[] => {
      const habReservas = reservas.filter((r) => r.roomNumber === hab.numero);

      // Pre-calcular rangos de slots para las reservas de esta habitación
      const ranges = habReservas
        .map((r) => ({ reserva: r, range: getSlotRange(r, viewStart, days) }))
        .filter((x): x is { reserva: Reserva; range: [number, number] } => x.range !== null);

      const cells: PlanningCell[] = [];
      let slot = 0;

      while (slot < TOTAL_SLOTS) {
        const hit = ranges.find(({ range }) => range[0] <= slot && slot <= range[1]);

        if (hit) {
          const span = hit.range[1] - slot + 1;
          cells.push({ type: 'reservation', reserva: hit.reserva, span, slotIdx: slot });
          slot += span;
        } else {
          cells.push({ type: 'empty', slotIdx: slot });
          slot++;
        }
      }

      return cells;
    },
    [reservas, days, viewStart]
  );

  // ── Navegación ──────────────────────────────────────────────────────────────
  const goToPrev = () => setViewStart((d) => addDays(d, -DAYS_TO_SHOW));
  const goToNext = () => setViewStart((d) => addDays(d, DAYS_TO_SHOW));
  const goToToday = () => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    setViewStart(t);
  };

  // ── Constantes de estilo ────────────────────────────────────────────────────
  const HEADER_BG   = '#1e2235';
  const HEADER_COL  = '#e8eaf6';
  const COL_W_NUM   = 52;   // px - columna #
  const COL_W_NAME  = 160;  // px - columna Nombre
  const COL_W_HALF  = 41;   // px - cada semi-columna (AM o PM)

  const stickyBase: React.CSSProperties = {
    position: 'sticky',
    zIndex: 2,
    boxShadow: '2px 0 5px rgba(0,0,0,0.12)',
  };

  // Dado un slotIdx, retorna el día correspondiente y si es AM
  const slotToDay = (slotIdx: number) => ({
    day: days[Math.floor(slotIdx / 2)],
    isAM: slotIdx % 2 === 0,
  });

  // ── Render ──────────────────────────────────────────────────────────────────
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
        <Button variant="outline-secondary" size="sm" onClick={goToPrev}>← Anterior</Button>
        <Button variant="outline-primary"   size="sm" onClick={goToToday}>Hoy</Button>
        <Button variant="outline-secondary" size="sm" onClick={goToNext}>Siguiente →</Button>

        <span className="text-muted small ms-1">
          {format(days[0], "d 'de' MMMM", { locale: es })}
          {' – '}
          {format(days[days.length - 1], "d 'de' MMMM yyyy", { locale: es })}
        </span>

        <div className="ms-auto d-flex align-items-center gap-2">
          {lastUpdate && (
            <span className="text-muted small">Actualizado: {format(lastUpdate, 'HH:mm')}</span>
          )}
          <Button variant="outline-success" size="sm" onClick={loadData}>↻ Actualizar</Button>
        </div>
      </div>

      {/* Leyenda */}
      <div className="d-flex gap-4 mb-3 align-items-center flex-wrap">
        {[
          { color: '#ffc107', border: true,  label: 'Pagó anticipo' },
          { color: '#dc3545', border: false, label: 'Abona al ingreso' },
          { color: '#fd7e14', border: false, label: 'Pagó total' },
        ].map(({ color, border, label }) => (
          <div key={label} className="d-flex align-items-center gap-2">
            <span style={{
              display: 'inline-block', width: 16, height: 16, borderRadius: 3,
              background: color,
              border: border ? '1px solid rgba(0,0,0,.2)' : 'none',
            }} />
            <small>{label}</small>
          </div>
        ))}
        <div className="d-flex align-items-center gap-2">
          <span style={{
            display: 'inline-block',
            background: '#0d6efd',
            color: '#fff',
            borderRadius: 3,
            fontSize: '0.62rem',
            padding: '1px 5px',
            fontWeight: 700,
            letterSpacing: '0.04em',
          }}>
            FACT
          </span>
          <small>Requiere facturación</small>
        </div>
        <div className="ms-auto text-muted small">
          {habitaciones.length} habitación{habitaciones.length !== 1 ? 'es' : ''}
          <span className="ms-2 text-muted" style={{ fontSize: '0.7rem' }}>
            · cada día dividido al mediodía
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div style={{
        overflowX: 'auto',
        border: '1px solid #dee2e6',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        <table style={{ borderCollapse: 'collapse', minWidth: 'max-content', tableLayout: 'fixed' }}>
          <thead>
            {/* Fila 1: columnas fijas (rowSpan=2) + meses (colSpan en half-slots) */}
            <tr>
              <th rowSpan={2} style={{
                ...stickyBase, left: 0, zIndex: 4,
                width: COL_W_NUM, minWidth: COL_W_NUM,
                background: HEADER_BG, color: HEADER_COL,
                textAlign: 'center', padding: '6px 4px', fontSize: '0.75rem',
                borderRight: '1px solid #3a3f5c', borderBottom: '1px solid #3a3f5c',
                verticalAlign: 'middle',
              }}>
                #
              </th>
              <th rowSpan={2} style={{
                ...stickyBase, left: COL_W_NUM, zIndex: 4,
                width: COL_W_NAME, minWidth: COL_W_NAME,
                background: HEADER_BG, color: HEADER_COL,
                padding: '6px 12px', fontSize: '0.8rem',
                borderRight: '2px solid #4a5080', borderBottom: '1px solid #3a3f5c',
                verticalAlign: 'middle', whiteSpace: 'nowrap',
              }}>
                Habitación
              </th>

              {monthGroups.map((g, idx) => (
                <th
                  key={idx}
                  colSpan={g.count * 2}
                  style={{
                    background: HEADER_BG, color: HEADER_COL,
                    textAlign: 'center', padding: '5px 8px',
                    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
                    borderLeft: idx === 0 ? 'none' : '2px solid #4a5080',
                    borderBottom: '1px solid #3a3f5c',
                  }}
                >
                  {g.label}
                </th>
              ))}
            </tr>

            {/* Fila 2: días, cada uno ocupa 2 semi-columnas con línea divisoria al medio */}
            <tr>
              {days.map((day, i) => {
                const isToday   = isSameDay(day, today);
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const bg = isToday ? '#0d6efd' : isWeekend ? '#2c3155' : HEADER_BG;

                return (
                  <th
                    key={i}
                    colSpan={2}
                    style={{
                      // Línea divisoria al mediodía usando gradiente
                      background: `linear-gradient(to right,
                        ${bg} calc(50% - 0.75px),
                        ${isToday ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)'} calc(50% - 0.75px),
                        ${isToday ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)'} calc(50% + 0.75px),
                        ${bg} calc(50% + 0.75px)
                      )`,
                      color: HEADER_COL,
                      textAlign: 'center',
                      padding: '4px 2px',
                      width: COL_W_HALF * 2,
                      minWidth: COL_W_HALF * 2,
                      fontSize: '0.72rem',
                      borderLeft: i === 0 ? 'none' : '2px solid #3a3f5c',
                      whiteSpace: 'nowrap',
                      fontWeight: isToday ? 700 : 400,
                    }}
                  >
                    <div style={{ opacity: 0.8, fontSize: '0.65rem' }}>{DAY_NAMES[day.getDay()]}</div>
                    <div style={{ fontWeight: 600 }}>{format(day, 'd/M')}</div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {habitaciones.length === 0 ? (
              <tr>
                <td colSpan={2 + TOTAL_SLOTS} className="text-center text-muted py-4"
                  style={{ fontSize: '0.9rem' }}>
                  No hay habitaciones cargadas.
                </td>
              </tr>
            ) : (
              habitaciones.map((hab, rowIdx) => {
                const cells  = buildRowCells(hab);
                const rowBg  = rowIdx % 2 === 0 ? '#ffffff' : '#f5f7fa';

                return (
                  <tr key={hab.id} style={{ height: 42 }}>
                    {/* Columna # */}
                    <td style={{
                      ...stickyBase, left: 0, zIndex: 2,
                      background: rowBg,
                      width: COL_W_NUM, minWidth: COL_W_NUM,
                      textAlign: 'center', fontWeight: 700,
                      fontSize: '0.85rem', color: '#444',
                      borderRight: '1px solid #dee2e6',
                      borderBottom: '1px solid #e9ecef', padding: '4px',
                    }}>
                      {hab.numero}
                    </td>

                    {/* Columna Nombre */}
                    <td title={hab.titulo} style={{
                      ...stickyBase, left: COL_W_NUM, zIndex: 2,
                      background: rowBg,
                      width: COL_W_NAME, minWidth: COL_W_NAME, maxWidth: COL_W_NAME,
                      padding: '4px 12px', fontSize: '0.82rem', fontWeight: 500,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      borderRight: '2px solid #c8cdd8',
                      borderBottom: '1px solid #e9ecef',
                    }}>
                      {hab.titulo}
                    </td>

                    {/* Celdas de medio-día */}
                    {cells.map((cell, ci) => {
                      const { day, isAM } = slotToDay(cell.slotIdx);
                      const isToday   = day ? isSameDay(day, today) : false;
                      const isWeekend = day ? (day.getDay() === 0 || day.getDay() === 6) : false;

                      // Borde izquierdo: más grueso al inicio de cada día (AM), fino al mediodía (PM)
                      const dayBorderL = isAM
                        ? `2px solid ${isToday ? '#0d6efd' : '#d0d4df'}`
                        : `1px dashed ${isToday ? '#5b9bff' : '#dde0ea'}`;

                      if (cell.type === 'empty') {
                        const emptyBg = isToday
                          ? (isAM ? '#edf3ff' : '#f4f7ff')
                          : isWeekend
                          ? (isAM ? '#eceef5' : '#f0f2f8')
                          : rowBg;

                        return (
                          <td key={ci} style={{
                            borderLeft:   dayBorderL,
                            borderBottom: '1px solid #e9ecef',
                            width:   COL_W_HALF,
                            minWidth: COL_W_HALF,
                            background: emptyBg,
                          }} />
                        );
                      }

                      // Celda de reserva
                      const { reserva, span } = cell;
                      const { bg, text }      = getPaymentColor(reserva);
                      const nombre   = reserva.customer.customerName;
                      const personas = reserva.cantidadHuespedes ?? 1;
                      const tooltip  =
                        `${nombre} · ${personas} persona${personas !== 1 ? 's' : ''} · ${getPaymentLabel(reserva)}` +
                        `\nCheck-in: ${reserva.stayPeriod.checkInDate.split('T')[0]}` +
                        `  Check-out: ${reserva.stayPeriod.checkOutDate.split('T')[0]}`;

                      return (
                        <td key={ci} colSpan={span} title={tooltip} style={{
                          background:   bg,
                          color:        text,
                          padding:      '3px 8px',
                          borderLeft:   dayBorderL,
                          borderBottom: '1px solid rgba(0,0,0,0.1)',
                          overflow:     'hidden',
                          whiteSpace:   'nowrap',
                          textOverflow: 'ellipsis',
                          maxWidth:     span * COL_W_HALF,
                          fontSize:     '0.78rem',
                          verticalAlign: 'middle',
                          cursor:       'default',
                          userSelect:   'none',
                        }}>
                          <span style={{ fontWeight: 600 }}>{nombre}</span>
                          <span style={{ marginLeft: 5, opacity: 0.85, fontSize: '0.72rem' }}>
                            {personas}p
                          </span>
                          {reserva.requiereFacturacion && (
                            <span style={{
                              marginLeft: 5,
                              background: '#0d6efd',
                              color: '#fff',
                              borderRadius: 3,
                              fontSize: '0.62rem',
                              padding: '1px 4px',
                              fontWeight: 700,
                              letterSpacing: '0.04em',
                              verticalAlign: 'middle',
                              flexShrink: 0,
                            }}>
                              FACT
                            </span>
                          )}
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

      <div className="text-muted small mt-2 text-end">
        Se actualiza automáticamente cada 2 minutos
      </div>
    </div>
  );
}
