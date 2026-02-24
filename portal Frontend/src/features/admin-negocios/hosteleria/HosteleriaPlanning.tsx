import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button, Spinner, Modal, Form, InputGroup, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
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
    return { bg: '#198754', text: '#fff' }; // verde - pagó total
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
function getSlotRange(
  reserva: Reserva,
  viewStart: Date,
  days: Date[]
): [number, number] | null {
  const ci = parseLocalDate(reserva.stayPeriod.checkInDate);
  const co = parseLocalDate(reserva.stayPeriod.checkOutDate);
  const viewEnd = days[days.length - 1];

  if (co < viewStart || ci > viewEnd) return null;
  if (isSameDay(ci, co)) return null;

  let startSlot: number;
  if (ci < viewStart) {
    startSlot = 0;
  } else {
    const ciDayIdx = differenceInDays(ci, viewStart);
    startSlot = ciDayIdx * 2 + 1;
  }

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

// ── Modal de detalle de reserva ───────────────────────────────────────────────
function ReservaDetalleModal({
  reserva,
  onClose,
}: {
  reserva: Reserva;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const { bg, text } = getPaymentColor(reserva);
  const label = getPaymentLabel(reserva);
  const noches = differenceInDays(
    parseLocalDate(reserva.stayPeriod.checkOutDate),
    parseLocalDate(reserva.stayPeriod.checkInDate)
  );

  const handleCopyId = () => {
    navigator.clipboard.writeText(reserva.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getWhatsAppUrl = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return `https://wa.me/${digits}`;
  };

  return (
    <Modal show onHide={onClose} centered size="lg">
      <Modal.Header closeButton style={{ background: '#1e2235', color: '#e8eaf6' }}>
        <Modal.Title style={{ fontSize: '1rem' }}>
          Detalle de Reserva
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* ID de reserva copiable */}
        <div className="d-flex align-items-center gap-2 mb-3 p-2 rounded" style={{ background: '#f5f7fa', border: '1px solid #e0e3ea' }}>
          <span className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ID Reserva:</span>
          <code style={{ fontSize: '0.82rem', color: '#1e2235', flex: 1, userSelect: 'all' }}>{reserva.id}</code>
          <OverlayTrigger placement="top" overlay={<Tooltip>{copied ? '¡Copiado!' : 'Copiar ID'}</Tooltip>}>
            <Button
              size="sm"
              variant={copied ? 'success' : 'outline-secondary'}
              style={{ padding: '2px 10px', fontSize: '0.78rem' }}
              onClick={handleCopyId}
            >
              {copied ? '✓' : '📋'}
            </Button>
          </OverlayTrigger>
        </div>

        <div className="row g-3">
          {/* Cliente */}
          <div className="col-md-6">
            <h6 className="text-muted mb-2" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Cliente
            </h6>
            <p className="mb-1 fw-semibold">{reserva.customer.customerName}</p>
            {reserva.customer.customerPhone && (
              <p className="mb-1 small text-muted d-flex align-items-center gap-2">
                <span>📞 {reserva.customer.customerPhone}</span>
                <a
                  href={getWhatsAppUrl(reserva.customer.customerPhone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Enviar mensaje por WhatsApp"
                  style={{ lineHeight: 1 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </p>
            )}
            {reserva.customer.customerEmail && (
              <p className="mb-1 small text-muted">✉️ {reserva.customer.customerEmail}</p>
            )}
            {reserva.customer.customerDni && (
              <p className="mb-0 small text-muted">DNI: {reserva.customer.customerDni}</p>
            )}
          </div>

          {/* Estadía */}
          <div className="col-md-6">
            <h6 className="text-muted mb-2" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Estadía
            </h6>
            <p className="mb-1">
              <span className="text-muted small">Check-in:</span>{' '}
              <strong>{reserva.stayPeriod.checkInDate.split('T')[0]}</strong>
            </p>
            <p className="mb-1">
              <span className="text-muted small">Check-out:</span>{' '}
              <strong>{reserva.stayPeriod.checkOutDate.split('T')[0]}</strong>
            </p>
            <p className="mb-1 small text-muted">
              {noches} noche{noches !== 1 ? 's' : ''} · {reserva.cantidadHuespedes ?? 1} huésped{(reserva.cantidadHuespedes ?? 1) !== 1 ? 'es' : ''}
            </p>
            {reserva.roomNumber && (
              <p className="mb-0 small">Habitación: <strong>#{reserva.roomNumber}</strong></p>
            )}
          </div>

          {/* Pago */}
          <div className="col-md-6">
            <h6 className="text-muted mb-2" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Pago
            </h6>
            <p className="mb-1">
              <span
                style={{
                  background: bg,
                  color: text,
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                {label}
              </span>
            </p>
            <p className="mb-1 small">Total: <strong>${reserva.payment.totalAmount.toLocaleString('es-AR')}</strong></p>
            <p className="mb-1 small">Pagado: <strong>${reserva.payment.amountPaid.toLocaleString('es-AR')}</strong></p>
            {reserva.payment.remainingAmount > 0 && (
              <p className="mb-1 small text-danger">Restante: <strong>${reserva.payment.remainingAmount.toLocaleString('es-AR')}</strong></p>
            )}
            {reserva.payment.paymentType && (
              <p className="mb-0 small text-muted">Método: {reserva.payment.paymentType}</p>
            )}
          </div>

          {/* Estado / Facturación */}
          <div className="col-md-6">
            <h6 className="text-muted mb-2" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Estado
            </h6>
            <p className="mb-1 small">
              <Badge bg={reserva.isActive ? 'success' : 'secondary'} className="me-1">
                {reserva.isActive ? 'Activa' : 'Inactiva'}
              </Badge>
              {reserva.isCancelled && <Badge bg="danger">Cancelada</Badge>}
            </p>
            {reserva.requiereFacturacion && (
              <p className="mb-1 small">
                <Badge bg="primary">Requiere Facturación</Badge>
              </p>
            )}
            {reserva.billingInfo && (
              <div className="small text-muted mt-1">
                <p className="mb-0">{reserva.billingInfo.razonSocial}</p>
                <p className="mb-0">CUIT/CUIL: {reserva.billingInfo.cuitCuil}</p>
                <p className="mb-0">Factura tipo {reserva.billingInfo.tipoFactura}</p>
              </div>
            )}
            <p className="mb-0 mt-2 small text-muted">
              Creada: {new Date(reserva.dateCreated).toLocaleDateString('es-AR')}
            </p>
          </div>

          {/* Notas */}
          {reserva.notas && (
            <div className="col-12">
              <h6 className="text-muted mb-1" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Notas
              </h6>
              <p className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>{reserva.notas}</p>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={onClose}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
}

export function HosteleriaPlanning({ businessId }: Props) {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [allReservas, setAllReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Buscador de ID
  const [searchId, setSearchId] = useState('');
  const [modalReserva, setModalReserva] = useState<Reserva | null>(null);
  const [searchError, setSearchError] = useState('');

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
      setAllReservas(revs);
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

  // ── Buscador de ID ──────────────────────────────────────────────────────────
  const handleSearch = () => {
    const term = searchId.trim().toLowerCase();
    if (!term) {
      setSearchError('Ingresá un ID para buscar.');
      return;
    }
    const found = allReservas.find((r) => r.id.toLowerCase() === term || r.id.toLowerCase().startsWith(term));
    if (found) {
      setSearchError('');
      setModalReserva(found);
    } else {
      setSearchError('No se encontró ninguna reserva con ese ID.');
    }
  };

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

      {/* Buscador de reserva por ID */}
      <div className="mb-3">
        <InputGroup size="sm" style={{ maxWidth: 480 }}>
          <InputGroup.Text style={{ background: '#1e2235', color: '#e8eaf6', border: 'none' }}>
            🔍 Buscar por ID
          </InputGroup.Text>
          <Form.Control
            placeholder="Pegá el ID de la reserva..."
            value={searchId}
            onChange={(e) => {
              setSearchId(e.target.value);
              setSearchError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
          />
          <Button variant="primary" onClick={handleSearch}>Buscar</Button>
        </InputGroup>
        {searchError && (
          <p className="text-danger small mt-1 mb-0">{searchError}</p>
        )}
      </div>

      {/* Leyenda */}
      <div className="d-flex gap-4 mb-3 align-items-center flex-wrap">
        {[
          { color: '#ffc107', border: true,  label: 'Pagó anticipo' },
          { color: '#dc3545', border: false, label: 'Abona al ingreso' },
          { color: '#198754', border: false, label: 'Pagó total' },
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
                        `ID: ${reserva.id}` +
                        `\n${nombre} · ${personas} persona${personas !== 1 ? 's' : ''} · ${getPaymentLabel(reserva)}` +
                        `\nCheck-in: ${reserva.stayPeriod.checkInDate.split('T')[0]}` +
                        `  Check-out: ${reserva.stayPeriod.checkOutDate.split('T')[0]}`;

                      return (
                        <td
                          key={ci}
                          colSpan={span}
                          title={tooltip}
                          onClick={() => setModalReserva(reserva)}
                          style={{
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
                            cursor:       'pointer',
                            userSelect:   'none',
                          }}
                        >
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

      {/* Modal de detalle */}
      {modalReserva && (
        <ReservaDetalleModal
          reserva={modalReserva}
          onClose={() => setModalReserva(null)}
        />
      )}
    </div>
  );
}
