import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
  Tab,
  Table,
  Tabs,
} from 'react-bootstrap';
import { api } from '../../../config/api';
import {
  fetchHospedajeById,
  type Hospedaje,
} from '../../../services/fetchHospedajes';
import { PhoneInput } from '../../../shared/components/PhoneInput';
import {
  actualizarReserva,
  cancelarReserva,
  crearReservaExterna,
  fetchReservasByHotel,
} from '../../../services/fetchReservas';
import { useNotifications } from '../../../shared/context/NotificationContext';
import { useWebSocket } from '../hooks/useWebSocket';
import type { FormReservaExterna, Reserva } from '../types';
import { getColorEstadoReserva } from '../types';

interface HosteleriaReservasProps {
  businessId: string;
  businessName: string;
}

interface ResumenCierreHospedaje {
  reservas: Reserva[];
  totalReservas: number;
  totalIngresado: number;
  porMedioDePago: Record<string, number>;
  desde: string;
  hasta: string;
}

const LABEL_MEDIO_PAGO: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  TARJETA_CREDITO: 'Tarjeta Crédito',
  TARJETA_DEBITO: 'Tarjeta Débito',
  MERCADO_PAGO: 'MercadoPago',
};

const initialFormReserva: FormReservaExterna = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  customerDni: '',
  checkInDate: '',
  checkOutDate: '',
  totalPrice: 0,
  amountPaid: 0,
  paymentType: 'EFECTIVO',
  notas: '',
};

export function HosteleriaReservas({
  businessId,
  businessName,
}: HosteleriaReservasProps) {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<
    | 'TODAS'
    | 'ACTIVAS'
    | 'PAGADAS'
    | 'CANCELADAS'
    | 'FINALIZADAS'
    | 'HOY'
    | 'CHECKOUT_HOY'
  >('TODAS');
  const [ordenPor, setOrdenPor] = useState<'reciente' | 'checkIn' | 'monto'>(
    'checkIn'
  );
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'danger';
    texto: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'activas' | 'historial'>(
    'activas'
  );

  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

  const [modalCrear, setModalCrear] = useState(false);
  const [formReserva, setFormReserva] =
    useState<FormReservaExterna>(initialFormReserva);
  const [totalPriceInput, setTotalPriceInput] = useState('');
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const [roomNumberInput, setRoomNumberInput] = useState('');

  // Estado para modal de detalle de reserva
  const [modalDetalle, setModalDetalle] = useState(false);
  const [reservaDetalle, setReservaDetalle] = useState<Reserva | null>(null);

  // Estado para modal de completar pago
  const [modalCompletarPago, setModalCompletarPago] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] =
    useState<Reserva | null>(null);
  const [montoAdicionalInput, setMontoAdicionalInput] = useState('');
  const [metodoPagoRestante, setMetodoPagoRestante] =
    useState<FormReservaExterna['paymentType']>('EFECTIVO');
  const [notasPago, setNotasPago] = useState('');
  const [guardandoPago, setGuardandoPago] = useState(false);
  const [errorPago, setErrorPago] = useState<string | null>(null);

  // Cierre del día
  const [showCierreModal, setShowCierreModal] = useState(false);
  const [resumenCierre, setResumenCierre] = useState<ResumenCierreHospedaje | null>(null);
  const [loadingCierre, setLoadingCierre] = useState(false);
  const [hospedaje, setHospedaje] = useState<Hospedaje | null>(null);

  const { isConnected, lastMessage } = useWebSocket(businessId, 'HOSPEDAJE');
  const { addNotification } = useNotifications();

  const cargarHospedaje = useCallback(async () => {
    try {
      const data = await fetchHospedajeById(businessId);
      if (data) setHospedaje(data);
    } catch {
      console.error('Error al cargar hospedaje');
    }
  }, [businessId]);

  useEffect(() => {
    cargarReservas();
    cargarHospedaje();
  }, [businessId, cargarHospedaje]);

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'reserva:nueva') {
        const nuevaReserva = lastMessage.payload as Reserva;
        setReservas((prev) => [nuevaReserva, ...prev]);
        playNotificationSound();
        setMensaje({ tipo: 'success', texto: '¡Nueva reserva recibida!' });
        addNotification({
          type: 'reserva',
          title: 'Nueva reserva',
          message: `${nuevaReserva.customer.customerName} - ${new Date(nuevaReserva.stayPeriod.checkInDate).toLocaleDateString('es-AR')}`,
          businessId,
          businessName,
        });
      } else if (lastMessage.type === 'reserva:actualizada') {
        const reservaActualizada = lastMessage.payload as Reserva;
        setReservas((prev) =>
          prev.map((r) =>
            r.id === reservaActualizada.id ? reservaActualizada : r
          )
        );
      }
    }
  }, [lastMessage, addNotification, businessId, businessName]);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    } catch {
      console.log('No se pudo reproducir sonido');
    }
  };

  const cargarReservas = async () => {
    try {
      setLoading(true);
      const data = await fetchReservasByHotel(businessId);
      setReservas(data);
    } catch (error) {
      console.error('Error cargando reservas:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar las reservas' });
    } finally {
      setLoading(false);
    }
  };

  // Pre-filtro: solo reservas con pago confirmado o medio de pago en efectivo
  const reservasConPago = reservas.filter(
    (r) => r.payment.isPaid || r.payment.amountPaid > 0 || r.payment.paymentType === 'EFECTIVO' || r.transaccionId
  );

  const reservasFiltradas = reservasConPago
    .filter((r) => {
      if (filtroEstado === 'ACTIVAS' && !r.isActive) return false;
      if (filtroEstado === 'PAGADAS' && !r.payment.isPaid) return false;
      if (filtroEstado === 'CANCELADAS' && !r.isCancelled) return false;
      if (filtroEstado === 'FINALIZADAS' && (r.isActive || r.isCancelled))
        return false;
      if (filtroEstado === 'HOY') {
        const hoy = new Date();
        const checkIn = new Date(r.stayPeriod.checkInDate);
        const esHoy =
          hoy.getFullYear() === checkIn.getFullYear() &&
          hoy.getMonth() === checkIn.getMonth() &&
          hoy.getDate() === checkIn.getDate();
        if (!esHoy || !r.isActive || r.isCancelled) return false;
      }
      if (filtroEstado === 'CHECKOUT_HOY') {
        const hoy = new Date();
        const checkOut = new Date(r.stayPeriod.checkOutDate);
        const esHoy =
          hoy.getFullYear() === checkOut.getFullYear() &&
          hoy.getMonth() === checkOut.getMonth() &&
          hoy.getDate() === checkOut.getDate();
        if (!esHoy || !r.isActive || r.isCancelled) return false;
      }

      // Filtrar por fechas de check-in en historial
      if (fechaDesde || fechaHasta) {
        const fechaCheckIn = new Date(r.stayPeriod.checkInDate);
        // Normalizar a solo fecha (sin hora) para comparación
        const checkInSoloFecha = new Date(
          fechaCheckIn.getFullYear(),
          fechaCheckIn.getMonth(),
          fechaCheckIn.getDate()
        );

        if (fechaDesde) {
          const [year, month, day] = fechaDesde.split('-').map(Number);
          const desde = new Date(year, month - 1, day);
          if (checkInSoloFecha < desde) return false;
        }
        if (fechaHasta) {
          const [year, month, day] = fechaHasta.split('-').map(Number);
          const hasta = new Date(year, month - 1, day);
          if (checkInSoloFecha > hasta) return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (ordenPor) {
        case 'reciente':
          return (
            new Date(b.dateCreated).getTime() -
            new Date(a.dateCreated).getTime()
          );
        case 'checkIn':
          return (
            new Date(a.stayPeriod.checkInDate).getTime() -
            new Date(b.stayPeriod.checkInDate).getTime()
          );
        case 'monto':
          return b.totalPrice - a.totalPrice;
        default:
          return 0;
      }
    });

  const reservasActivas = reservasFiltradas.filter(
    (r) => r.isActive && !r.isCancelled
  );

  const handleCancelarReserva = async (reserva: Reserva) => {
    if (
      !window.confirm(
        `¿Estás seguro de cancelar la reserva de ${reserva.customer.customerName}?`
      )
    )
      return;

    try {
      const result = await cancelarReserva(reserva.id);

      if (result) {
        setReservas(
          reservas.map((r) =>
            r.id === reserva.id
              ? { ...r, isCancelled: true, isActive: false }
              : r
          )
        );
        setMensaje({ tipo: 'success', texto: 'Reserva cancelada' });
      }
    } catch (error) {
      console.error('Error cancelando reserva:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cancelar la reserva' });
    }
  };

  const handleCheckout = async (reserva: Reserva) => {
    if (
      !window.confirm(
        `¿Confirmar check-out de ${reserva.customer.customerName}?`
      )
    )
      return;

    try {
      const fechaHoy = new Date().toLocaleDateString('es-AR');
      const notaCheckout = `[${fechaHoy}] Check-out realizado`;
      const notasActualizadas = reserva.notas
        ? `${reserva.notas}\n${notaCheckout}`
        : notaCheckout;

      const reservaActualizada: Reserva = {
        ...reserva,
        isActive: false,
        notas: notasActualizadas,
      };

      const resultado = await actualizarReserva(reservaActualizada);

      if (resultado) {
        setReservas(reservas.map((r) => (r.id === reserva.id ? resultado : r)));
        setMensaje({ tipo: 'success', texto: 'Check-out completado' });
      }
    } catch (error) {
      console.error('Error en checkout:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al realizar check-out' });
    }
  };

  const handleCrearReserva = async () => {
    setErrorForm(null);

    if (!formReserva.customerName.trim()) {
      setErrorForm('El nombre del cliente es obligatorio');
      return;
    }
    if (!formReserva.checkInDate || !formReserva.checkOutDate) {
      setErrorForm('Las fechas de check-in y check-out son obligatorias');
      return;
    }
    if (
      new Date(formReserva.checkOutDate) <= new Date(formReserva.checkInDate)
    ) {
      setErrorForm('La fecha de check-out debe ser posterior al check-in');
      return;
    }

    const totalPrice = parseFloat(totalPriceInput) || 0;
    const amountPaid = parseFloat(amountPaidInput) || 0;

    if (totalPrice <= 0) {
      setErrorForm('El precio total debe ser mayor a 0');
      return;
    }

    try {
      setGuardando(true);

      // Convertir fechas a formato LocalDateTime (ISO 8601 con hora)
      // Check-in a las 14:00 (2pm), Check-out a las 11:00 (11am)
      const checkInDateTime = `${formReserva.checkInDate}T14:00:00`;
      const checkOutDateTime = `${formReserva.checkOutDate}T11:00:00`;

      const nuevaReserva: Partial<Reserva> = {
        customer: {
          customerId: '',
          customerName: formReserva.customerName,
          customerPhone: formReserva.customerPhone,
          customerEmail: formReserva.customerEmail,
          customerDni: formReserva.customerDni,
        },
        hotel: {
          hotelId: businessId,
          hotelName: businessName,
        },
        stayPeriod: {
          checkInDate: checkInDateTime,
          checkOutDate: checkOutDateTime,
        },
        payment: {
          isPaid: amountPaid >= totalPrice,
          hasPendingAmount: amountPaid < totalPrice,
          isDeposit: amountPaid > 0 && amountPaid < totalPrice,
          paymentType: formReserva.paymentType,
          amountPaid: amountPaid,
          totalAmount: totalPrice,
          remainingAmount: totalPrice - amountPaid,
        },
        totalPrice: totalPrice,
        roomNumber: roomNumberInput ? Number(roomNumberInput) : undefined,
        isActive: true,
        isCancelled: false,
        notas: formReserva.notas,
      };

      const creada = await crearReservaExterna(nuevaReserva);

      if (creada) {
        setReservas([creada, ...reservas]);
        setModalCrear(false);
        setFormReserva(initialFormReserva);
        setTotalPriceInput('');
        setAmountPaidInput('');
        setRoomNumberInput('');
        setMensaje({ tipo: 'success', texto: 'Reserva creada correctamente' });
      }
    } catch (error) {
      console.error('Error creando reserva:', error);
      setErrorForm('Error al crear la reserva');
    } finally {
      setGuardando(false);
    }
  };

  const abrirModalCompletarPago = (reserva: Reserva) => {
    setReservaSeleccionada(reserva);
    setMontoAdicionalInput(reserva.payment.remainingAmount.toString());
    setMetodoPagoRestante('EFECTIVO');
    setNotasPago('');
    setErrorPago(null);
    setModalCompletarPago(true);
  };

  const handleCompletarPago = async () => {
    if (!reservaSeleccionada) return;

    setErrorPago(null);
    const montoAdicional = parseFloat(montoAdicionalInput) || 0;

    if (montoAdicional <= 0) {
      setErrorPago('El monto a abonar debe ser mayor a 0');
      return;
    }

    if (montoAdicional > reservaSeleccionada.payment.remainingAmount) {
      setErrorPago('El monto no puede ser mayor al saldo pendiente');
      return;
    }

    try {
      setGuardandoPago(true);

      const nuevoMontoPagado =
        reservaSeleccionada.payment.amountPaid + montoAdicional;
      const nuevoSaldoPendiente =
        reservaSeleccionada.payment.totalAmount - nuevoMontoPagado;
      const estaPagado = nuevoSaldoPendiente <= 0;

      // Construir nota con información del pago
      const fechaHoy = new Date().toLocaleDateString('es-AR');
      const notaPagoNueva = `[${fechaHoy}] Pago de $${montoAdicional.toLocaleString()} - Método: ${metodoPagoRestante}${notasPago ? ` - ${notasPago}` : ''}`;
      const notasActualizadas = reservaSeleccionada.notas
        ? `${reservaSeleccionada.notas}\n${notaPagoNueva}`
        : notaPagoNueva;

      const reservaActualizada: Reserva = {
        ...reservaSeleccionada,
        payment: {
          ...reservaSeleccionada.payment,
          amountPaid: nuevoMontoPagado,
          remainingAmount: nuevoSaldoPendiente,
          isPaid: estaPagado,
          hasPendingAmount: !estaPagado,
          isDeposit: !estaPagado && nuevoMontoPagado > 0,
          paymentType: metodoPagoRestante,
        },
        notas: notasActualizadas,
      };

      const resultado = await actualizarReserva(reservaActualizada);

      if (resultado) {
        setReservas(
          reservas.map((r) => (r.id === reservaSeleccionada.id ? resultado : r))
        );
        setModalCompletarPago(false);
        setReservaSeleccionada(null);
        setMensaje({
          tipo: 'success',
          texto: estaPagado
            ? 'Pago completado - Reserva pagada en su totalidad'
            : 'Pago registrado correctamente',
        });
      } else {
        setErrorPago('Error al actualizar la reserva');
      }
    } catch (error) {
      console.error('Error completando pago:', error);
      setErrorPago('Error al registrar el pago');
    } finally {
      setGuardandoPago(false);
    }
  };

  const calcularTotales = () => {
    const filtradas = reservasFiltradas;
    return {
      cantidad: filtradas.length,
      total: filtradas.reduce((sum, r) => sum + r.totalPrice, 0),
      pagado: filtradas.reduce((sum, r) => sum + r.payment.amountPaid, 0),
      pendiente: filtradas.reduce(
        (sum, r) => sum + r.payment.remainingAmount,
        0
      ),
    };
  };

  const totales = calcularTotales();

  const calcularNoches = (checkIn: string, checkOut: string): number => {
    const inicio = new Date(checkIn);
    const fin = new Date(checkOut);
    const diff = fin.getTime() - inicio.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // --- Cierre del día ---

  const handleCerrarDia = async () => {
    setLoadingCierre(true);
    try {
      const desde = hospedaje?.lastCloseDate || new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
      const hasta = new Date().toISOString();

      // fetchReservasByHotel acepta desde/hasta como LocalDate (YYYY-MM-DD)
      const desdeDate = desde.slice(0, 10);
      const hastaDate = hasta.slice(0, 10);

      const data = await fetchReservasByHotel(businessId, desdeDate, hastaDate);
      // Solo reservas con pagos realizados
      const conPagos = data.filter((r) => r.payment.amountPaid > 0);

      // Agrupar por medio de pago
      const porMedioDePago: Record<string, number> = {};
      for (const r of conPagos) {
        const tipo = r.payment.paymentType || 'OTRO';
        porMedioDePago[tipo] = (porMedioDePago[tipo] || 0) + r.payment.amountPaid;
      }

      const resumen: ResumenCierreHospedaje = {
        reservas: conPagos,
        totalReservas: conPagos.length,
        totalIngresado: conPagos.reduce((sum, r) => sum + r.payment.amountPaid, 0),
        porMedioDePago,
        desde,
        hasta,
      };

      setResumenCierre(resumen);
      setShowCierreModal(true);
    } catch {
      setMensaje({ tipo: 'danger', texto: 'Error al generar el cierre del día' });
    } finally {
      setLoadingCierre(false);
    }
  };

  const handleConfirmarCierre = async () => {
    try {
      const now = new Date().toISOString();
      const updated = await api.patch<Hospedaje>(
        `/hospedajes/${businessId}`,
        { lastCloseDate: now }
      );
      setHospedaje(updated);
      setShowCierreModal(false);
      setResumenCierre(null);
      setMensaje({ tipo: 'success', texto: 'Cierre de día registrado' });
    } catch {
      setMensaje({ tipo: 'danger', texto: 'Error al registrar el cierre. Descargue el PDF primero.' });
    }
  };

  const handleDescargarPDF = () => {
    if (!resumenCierre) return;

    const doc = new jsPDF();
    const desde = new Date(resumenCierre.desde);
    const hasta = new Date(resumenCierre.hasta);
    const formatDate = (d: Date) =>
      d.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });

    doc.setFontSize(18);
    doc.text(`Cierre del día - ${businessName}`, 14, 20);
    doc.setFontSize(11);
    doc.text(`Desde: ${formatDate(desde)}`, 14, 30);
    doc.text(`Hasta: ${formatDate(hasta)}`, 14, 37);

    doc.setFontSize(14);
    doc.text('Resumen', 14, 50);
    doc.setFontSize(11);
    doc.text(`Total de reservas con ingresos: ${resumenCierre.totalReservas}`, 14, 58);
    doc.text(
      `Total ingresado: $${resumenCierre.totalIngresado.toLocaleString('es-AR')}`,
      14,
      65
    );

    // Desglose por medio de pago
    let yPos = 75;
    doc.setFontSize(12);
    doc.text('Desglose por medio de pago:', 14, yPos);
    doc.setFontSize(11);
    yPos += 8;
    for (const [tipo, monto] of Object.entries(resumenCierre.porMedioDePago)) {
      const label = LABEL_MEDIO_PAGO[tipo] || tipo;
      doc.text(`${label}: $${monto.toLocaleString('es-AR')}`, 18, yPos);
      yPos += 7;
    }

    if (resumenCierre.reservas.length > 0) {
      const tableData = resumenCierre.reservas.map((r) => [
        `#${r.id.slice(-6)}`,
        r.customer.customerName,
        r.roomNumber ? `Hab. #${r.roomNumber}` : '-',
        new Date(r.stayPeriod.checkInDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
        new Date(r.stayPeriod.checkOutDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
        LABEL_MEDIO_PAGO[r.payment.paymentType] || r.payment.paymentType || '-',
        `$${r.payment.amountPaid.toLocaleString('es-AR')}`,
      ]);

      autoTable(doc, {
        startY: yPos + 5,
        head: [['Reserva', 'Cliente', 'Habitación', 'Check-in', 'Check-out', 'Medio de pago', 'Ingresado']],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [52, 58, 64] },
      });
    }

    const fileName = `cierre_${businessName.replace(/\s+/g, '_')}_${hasta.toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando reservas...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <span
            className={`rounded-circle ${isConnected ? 'bg-success' : 'bg-danger'}`}
            style={{ width: '12px', height: '12px', display: 'inline-block' }}
          />
          <small className="text-muted">
            {isConnected
              ? 'Conectado - Actualizaciones en tiempo real'
              : 'Desconectado - Reconectando...'}
          </small>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="success"
            size="sm"
            onClick={() => setModalCrear(true)}
          >
            + Crear Reserva Manual
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={cargarReservas}
          >
            Actualizar
          </Button>
        </div>
      </div>

      {mensaje && (
        <Alert
          variant={mensaje.tipo}
          dismissible
          onClose={() => setMensaje(null)}
        >
          {mensaje.texto}
        </Alert>
      )}

      <Card className="mb-3">
        <Card.Body className="py-2">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <small className="text-muted me-3">Código de colores:</small>
              <Badge bg="danger" className="me-2">
                Paga al ingreso
              </Badge>
              <Badge bg="warning" text="dark" className="me-2">
                Con adelanto
              </Badge>
              <Badge
                className="me-2"
                style={{ backgroundColor: '#fd7e14', color: 'white' }}
              >
                Pago completo
              </Badge>
              <Badge bg="info" className="me-2">
                ENTRA HOY
              </Badge>
              <Badge bg="warning" text="dark" className="me-2">
                SALE HOY
              </Badge>
            </div>
            {(() => {
              const hoy = new Date();
              const checkInsHoy = reservasActivas.filter((r) => {
                const checkIn = new Date(r.stayPeriod.checkInDate);
                return (
                  hoy.getFullYear() === checkIn.getFullYear() &&
                  hoy.getMonth() === checkIn.getMonth() &&
                  hoy.getDate() === checkIn.getDate()
                );
              }).length;
              const checkOutsHoy = reservasActivas.filter((r) => {
                const checkOut = new Date(r.stayPeriod.checkOutDate);
                return (
                  hoy.getFullYear() === checkOut.getFullYear() &&
                  hoy.getMonth() === checkOut.getMonth() &&
                  hoy.getDate() === checkOut.getDate()
                );
              }).length;
              return (
                <div className="d-flex gap-2">
                  {checkInsHoy > 0 && (
                    <Badge
                      bg={filtroEstado === 'HOY' ? 'primary' : 'info'}
                      className="fs-6"
                      style={{ cursor: 'pointer' }}
                      onClick={() =>
                        setFiltroEstado(
                          filtroEstado === 'HOY' ? 'TODAS' : 'HOY'
                        )
                      }
                      title={
                        filtroEstado === 'HOY'
                          ? 'Mostrar todas las reservas'
                          : 'Filtrar por check-ins de hoy'
                      }
                    >
                      {checkInsHoy} check-in{checkInsHoy > 1 ? 's' : ''} hoy{' '}
                      {filtroEstado === 'HOY' && '✓'}
                    </Badge>
                  )}
                  {checkOutsHoy > 0 && (
                    <Badge
                      bg={
                        filtroEstado === 'CHECKOUT_HOY' ? 'primary' : 'warning'
                      }
                      text="dark"
                      className="fs-6"
                      style={{ cursor: 'pointer' }}
                      onClick={() =>
                        setFiltroEstado(
                          filtroEstado === 'CHECKOUT_HOY'
                            ? 'TODAS'
                            : 'CHECKOUT_HOY'
                        )
                      }
                      title={
                        filtroEstado === 'CHECKOUT_HOY'
                          ? 'Mostrar todas las reservas'
                          : 'Filtrar por check-outs de hoy'
                      }
                    >
                      {checkOutsHoy} check-out{checkOutsHoy > 1 ? 's' : ''} hoy{' '}
                      {filtroEstado === 'CHECKOUT_HOY' && '✓'}
                    </Badge>
                  )}
                </div>
              );
            })()}
          </div>
        </Card.Body>
      </Card>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k as 'activas' | 'historial')}
        className="mb-3"
      >
        <Tab eventKey="activas" title={`Activas (${reservasActivas.length})`}>
          <Row className="mb-3 g-2">
            <Col md={4}>
              <Form.Select
                value={filtroEstado}
                onChange={(e) =>
                  setFiltroEstado(e.target.value as typeof filtroEstado)
                }
              >
                <option value="TODAS">Todas</option>
                <option value="HOY">Check-in hoy</option>
                <option value="CHECKOUT_HOY">Check-out hoy</option>
                <option value="ACTIVAS">Activas</option>
                <option value="PAGADAS">Pagadas</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select
                value={ordenPor}
                onChange={(e) => setOrdenPor(e.target.value as typeof ordenPor)}
              >
                <option value="checkIn">Por fecha de ingreso</option>
                <option value="reciente">Más reciente</option>
                <option value="monto">Mayor monto</option>
              </Form.Select>
            </Col>
          </Row>

          <Row xs={2} md={3} lg={4} className="g-2">
            {reservasActivas.map((reserva) => (
              <Col key={reserva.id}>
                <ReservaCardCompacta
                  reserva={reserva}
                  onClick={() => {
                    setReservaDetalle(reserva);
                    setModalDetalle(true);
                  }}
                />
              </Col>
            ))}
          </Row>

          {reservasActivas.length === 0 && (
            <div className="text-center py-5">
              <div style={{ fontSize: '4rem' }}>📭</div>
              <h4>No hay reservas activas</h4>
              <p className="text-muted">
                Las nuevas reservas aparecerán aquí automáticamente
              </p>
            </div>
          )}
        </Tab>

        <Tab eventKey="historial" title="Historial">
          <Card className="mb-3">
            <Card.Body>
              <Row className="align-items-end g-2">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Desde</Form.Label>
                    <Form.Control
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Hasta</Form.Label>
                    <Form.Control
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={filtroEstado}
                    onChange={(e) =>
                      setFiltroEstado(e.target.value as typeof filtroEstado)
                    }
                  >
                    <option value="TODAS">Todas</option>
                    <option value="ACTIVAS">Activas</option>
                    <option value="FINALIZADAS">Finalizadas</option>
                    <option value="PAGADAS">Pagadas</option>
                    <option value="CANCELADAS">Canceladas</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setFechaDesde('');
                      setFechaHasta('');
                      setFiltroEstado('TODAS');
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row className="mb-3 g-3">
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3>{totales.cantidad}</h3>
                  <small className="text-muted">Reservas</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center bg-success text-white">
                <Card.Body>
                  <h3>${totales.total.toLocaleString()}</h3>
                  <small>Total</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center bg-primary text-white">
                <Card.Body>
                  <h3>${totales.pagado.toLocaleString()}</h3>
                  <small>Cobrado</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center bg-warning">
                <Card.Body>
                  <h3>${totales.pendiente.toLocaleString()}</h3>
                  <small>Pendiente</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row xs={2} md={3} lg={4} className="g-2">
            {reservasFiltradas.map((reserva) => (
              <Col key={reserva.id}>
                <ReservaCardCompacta
                  reserva={reserva}
                  onClick={() => {
                    setReservaDetalle(reserva);
                    setModalDetalle(true);
                  }}
                />
              </Col>
            ))}
          </Row>

          {reservasFiltradas.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted">
                No hay reservas en el período seleccionado
              </p>
            </div>
          )}
        </Tab>
      </Tabs>

      {/* Modal Crear Reserva */}
      <Modal show={modalCrear} onHide={() => setModalCrear(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Crear Reserva Manual</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorForm && <Alert variant="danger">{errorForm}</Alert>}

          <h6 className="text-muted mb-3">Datos del Cliente</h6>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre completo *</Form.Label>
                <Form.Control
                  type="text"
                  value={formReserva.customerName}
                  onChange={(e) =>
                    setFormReserva({
                      ...formReserva,
                      customerName: e.target.value,
                    })
                  }
                  placeholder="Nombre y apellido"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <PhoneInput
                  value={formReserva.customerPhone}
                  onChange={(val) =>
                    setFormReserva({ ...formReserva, customerPhone: val })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formReserva.customerEmail}
                  onChange={(e) =>
                    setFormReserva({
                      ...formReserva,
                      customerEmail: e.target.value,
                    })
                  }
                  placeholder="correo@ejemplo.com"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>DNI</Form.Label>
                <Form.Control
                  type="text"
                  value={formReserva.customerDni}
                  onChange={(e) =>
                    setFormReserva({
                      ...formReserva,
                      customerDni: e.target.value,
                    })
                  }
                  placeholder="Documento de identidad"
                />
              </Form.Group>
            </Col>
          </Row>

          <hr />
          <h6 className="text-muted mb-3">Datos de la Reserva</h6>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>N° de habitación</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  value={roomNumberInput}
                  onChange={(e) => setRoomNumberInput(e.target.value)}
                  placeholder="Ej: 101"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Check-in *</Form.Label>
                <Form.Control
                  type="date"
                  value={formReserva.checkInDate}
                  onChange={(e) =>
                    setFormReserva({
                      ...formReserva,
                      checkInDate: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Check-out *</Form.Label>
                <Form.Control
                  type="date"
                  value={formReserva.checkOutDate}
                  onChange={(e) =>
                    setFormReserva({
                      ...formReserva,
                      checkOutDate: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          {formReserva.checkInDate && formReserva.checkOutDate && (
            <Alert variant="info" className="py-2">
              <strong>
                {calcularNoches(
                  formReserva.checkInDate,
                  formReserva.checkOutDate
                )}{' '}
                noches
              </strong>
            </Alert>
          )}

          <hr />
          <h6 className="text-muted mb-3">Datos del Pago</h6>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Precio total *</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="decimal"
                  value={totalPriceInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setTotalPriceInput(value);
                    }
                  }}
                  placeholder="Ej: 50000.00"
                  isInvalid={
                    totalPriceInput !== '' &&
                    (isNaN(parseFloat(totalPriceInput)) ||
                      parseFloat(totalPriceInput) < 0)
                  }
                />
                <Form.Text className="text-muted">
                  Usa punto (.) como separador decimal
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Monto pagado</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="decimal"
                  value={amountPaidInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setAmountPaidInput(value);
                    }
                  }}
                  placeholder="Ej: 25000.00"
                  isInvalid={
                    amountPaidInput !== '' &&
                    (isNaN(parseFloat(amountPaidInput)) ||
                      parseFloat(amountPaidInput) < 0)
                  }
                />
                <Form.Text className="text-muted">
                  Usa punto (.) como separador decimal
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Forma de pago</Form.Label>
                <Form.Select
                  value={formReserva.paymentType}
                  onChange={(e) =>
                    setFormReserva({
                      ...formReserva,
                      paymentType: e.target
                        .value as FormReservaExterna['paymentType'],
                    })
                  }
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                  <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                  <option value="MERCADO_PAGO">MercadoPago</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {parseFloat(totalPriceInput) > 0 &&
            parseFloat(amountPaidInput || '0') <
              parseFloat(totalPriceInput) && (
              <Alert variant="warning" className="py-2">
                Saldo pendiente:{' '}
                <strong>
                  $
                  {(
                    parseFloat(totalPriceInput) -
                    parseFloat(amountPaidInput || '0')
                  ).toLocaleString()}
                </strong>
              </Alert>
            )}

          <Form.Group className="mb-3">
            <Form.Label>Notas</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formReserva.notas}
              onChange={(e) =>
                setFormReserva({ ...formReserva, notas: e.target.value })
              }
              placeholder="Observaciones adicionales..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalCrear(false)}>
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={handleCrearReserva}
            disabled={guardando}
          >
            {guardando ? <Spinner size="sm" /> : 'Crear Reserva'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Detalle de Reserva */}
      <Modal
        show={modalDetalle}
        onHide={() => setModalDetalle(false)}
        size="lg"
      >
        {reservaDetalle && (
          <>
            <Modal.Header closeButton>
              <Modal.Title className="d-flex align-items-center gap-2">
                <span>Reserva #{reservaDetalle.id.slice(-6).toUpperCase()}</span>
                {reservaDetalle.roomNumber && (
                  <Badge bg="secondary">Hab. #{reservaDetalle.roomNumber}</Badge>
                )}
                {(() => {
                  const hoy = new Date();
                  const checkIn = new Date(reservaDetalle.stayPeriod.checkInDate);
                  const checkOut = new Date(reservaDetalle.stayPeriod.checkOutDate);
                  const esCheckInHoy = hoy.getFullYear() === checkIn.getFullYear() && hoy.getMonth() === checkIn.getMonth() && hoy.getDate() === checkIn.getDate();
                  const esCheckOutHoy = hoy.getFullYear() === checkOut.getFullYear() && hoy.getMonth() === checkOut.getMonth() && hoy.getDate() === checkOut.getDate();
                  return (
                    <>
                      {esCheckInHoy && reservaDetalle.isActive && !reservaDetalle.isCancelled && (
                        <Badge bg="info" className="pulse-animation">ENTRA HOY</Badge>
                      )}
                      {esCheckOutHoy && reservaDetalle.isActive && !reservaDetalle.isCancelled && (
                        <Badge bg="warning" text="dark" className="pulse-animation">SALE HOY</Badge>
                      )}
                    </>
                  );
                })()}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <h6 className="text-muted">Cliente</h6>
                  <p className="mb-1"><strong>{reservaDetalle.customer.customerName}</strong></p>
                  {reservaDetalle.customer.customerDni && (
                    <p className="mb-1 small">DNI: {reservaDetalle.customer.customerDni}</p>
                  )}
                  {reservaDetalle.customer.customerPhone && (
                    <p className="mb-1 small d-flex align-items-center gap-2">
                      Tel: {reservaDetalle.customer.customerPhone}
                      <a
                        href={`https://wa.me/${reservaDetalle.customer.customerPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-success btn-sm py-0 px-1"
                        title="Enviar WhatsApp"
                        style={{ fontSize: '0.75rem', lineHeight: 1.2 }}
                      >
                        <i className="bi bi-whatsapp"></i>
                      </a>
                    </p>
                  )}
                  {reservaDetalle.customer.customerEmail && (
                    <p className="mb-1 small">Email: {reservaDetalle.customer.customerEmail}</p>
                  )}
                </Col>
                <Col md={6}>
                  <h6 className="text-muted">Estadía</h6>
                  <div className="p-2 bg-light rounded">
                    <Row>
                      <Col>
                        <small className="text-muted">Check-in</small>
                        <div><strong>{new Date(reservaDetalle.stayPeriod.checkInDate).toLocaleDateString('es-AR')}</strong></div>
                      </Col>
                      <Col className="text-center">
                        <Badge bg="secondary">
                          {calcularNoches(reservaDetalle.stayPeriod.checkInDate, reservaDetalle.stayPeriod.checkOutDate)} noches
                        </Badge>
                      </Col>
                      <Col className="text-end">
                        <small className="text-muted">Check-out</small>
                        <div><strong>{new Date(reservaDetalle.stayPeriod.checkOutDate).toLocaleDateString('es-AR')}</strong></div>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>

              <hr />

              <h6 className="text-muted">Pago</h6>
              <Card className="bg-light">
                <Card.Body className="py-2">
                  <div className="d-flex justify-content-between">
                    <span>Total:</span>
                    <strong>${reservaDetalle.totalPrice.toLocaleString()}</strong>
                  </div>
                  <div className="d-flex justify-content-between text-success">
                    <span>Pagado:</span>
                    <span>${reservaDetalle.payment.amountPaid.toLocaleString()}</span>
                  </div>
                  {reservaDetalle.payment.remainingAmount > 0 && (
                    <div className="d-flex justify-content-between text-danger fw-bold">
                      <span>Pendiente:</span>
                      <span>${reservaDetalle.payment.remainingAmount.toLocaleString()}</span>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {reservaDetalle.payment.paymentReceiptPath && (
                <div className="mt-2">
                  <a
                    href={reservaDetalle.payment.paymentReceiptPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary"
                  >
                    Ver comprobante
                  </a>
                </div>
              )}

              {reservaDetalle.notas && (
                <>
                  <hr />
                  <h6 className="text-muted">Notas</h6>
                  <p className="small" style={{ whiteSpace: 'pre-line' }}>{reservaDetalle.notas}</p>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              {reservaDetalle.isActive && !reservaDetalle.isCancelled && (
                <div className="d-flex gap-2 w-100">
                  {reservaDetalle.payment.remainingAmount > 0 && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => {
                        setModalDetalle(false);
                        abrirModalCompletarPago(reservaDetalle);
                      }}
                    >
                      Registrar Pago
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setModalDetalle(false);
                      handleCheckout(reservaDetalle);
                    }}
                  >
                    Check-out
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="ms-auto"
                    onClick={() => {
                      setModalDetalle(false);
                      handleCancelarReserva(reservaDetalle);
                    }}
                  >
                    Cancelar Reserva
                  </Button>
                </div>
              )}
              {(!reservaDetalle.isActive || reservaDetalle.isCancelled) && (
                <Button variant="secondary" size="sm" onClick={() => setModalDetalle(false)}>
                  Cerrar
                </Button>
              )}
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* Modal Completar Pago */}
      <Modal
        show={modalCompletarPago}
        onHide={() => setModalCompletarPago(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Registrar Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorPago && <Alert variant="danger">{errorPago}</Alert>}

          {reservaSeleccionada && (
            <>
              <Card className="mb-3 bg-light">
                <Card.Body className="py-2">
                  <div className="d-flex justify-content-between">
                    <span>Cliente:</span>
                    <strong>{reservaSeleccionada.customer.customerName}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Total reserva:</span>
                    <span>
                      $
                      {reservaSeleccionada.payment.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between text-success">
                    <span>Ya pagado:</span>
                    <span>
                      ${reservaSeleccionada.payment.amountPaid.toLocaleString()}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between text-danger fw-bold">
                    <span>Saldo pendiente:</span>
                    <span>
                      $
                      {reservaSeleccionada.payment.remainingAmount.toLocaleString()}
                    </span>
                  </div>
                </Card.Body>
              </Card>

              <Form.Group className="mb-3">
                <Form.Label>Monto a abonar *</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="decimal"
                  value={montoAdicionalInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setMontoAdicionalInput(value);
                    }
                  }}
                  placeholder="Ej: 25000.00"
                  isInvalid={
                    montoAdicionalInput !== '' &&
                    (isNaN(parseFloat(montoAdicionalInput)) ||
                      parseFloat(montoAdicionalInput) < 0)
                  }
                />
                <Form.Text className="text-muted">
                  Usa punto (.) como separador decimal
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Método de pago *</Form.Label>
                <Form.Select
                  value={metodoPagoRestante}
                  onChange={(e) =>
                    setMetodoPagoRestante(
                      e.target.value as FormReservaExterna['paymentType']
                    )
                  }
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                  <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                  <option value="MERCADO_PAGO">MercadoPago</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Notas adicionales</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={notasPago}
                  onChange={(e) => setNotasPago(e.target.value)}
                  placeholder="Observaciones sobre este pago..."
                />
              </Form.Group>

              {parseFloat(montoAdicionalInput || '0') > 0 && (
                <Alert variant="info" className="py-2">
                  {parseFloat(montoAdicionalInput) >=
                  reservaSeleccionada.payment.remainingAmount ? (
                    <span className="text-success fw-bold">
                      La reserva quedará completamente pagada
                    </span>
                  ) : (
                    <span>
                      Nuevo saldo pendiente:{' '}
                      <strong>
                        $
                        {(
                          reservaSeleccionada.payment.remainingAmount -
                          parseFloat(montoAdicionalInput)
                        ).toLocaleString()}
                      </strong>
                    </span>
                  )}
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setModalCompletarPago(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={handleCompletarPago}
            disabled={guardandoPago}
          >
            {guardandoPago ? <Spinner size="sm" /> : 'Registrar Pago'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Botón Cerrar el día */}
      <div className="text-center mt-4 mb-3">
        <Button variant="outline-dark" size="lg" onClick={handleCerrarDia} disabled={loadingCierre}>
          {loadingCierre ? <Spinner animation="border" size="sm" /> : 'Cerrar el día'}
        </Button>
      </div>

      {/* Modal de cierre */}
      <Modal
        show={showCierreModal}
        onHide={() => setShowCierreModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Cierre del día - {businessName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {resumenCierre && (
            <>
              <Alert variant="info">
                Descargue el PDF antes de confirmar el cierre. Este resumen no se almacena.
              </Alert>

              <Row className="mb-3">
                <Col sm={4}>
                  <Card className="text-center">
                    <Card.Body>
                      <h4>{resumenCierre.totalReservas}</h4>
                      <small className="text-muted">Reservas con ingresos</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm={4}>
                  <Card className="text-center">
                    <Card.Body>
                      <h4>${resumenCierre.totalIngresado.toLocaleString('es-AR')}</h4>
                      <small className="text-muted">Total ingresado</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm={4}>
                  <Card className="text-center">
                    <Card.Body>
                      {Object.entries(resumenCierre.porMedioDePago).map(([tipo, monto]) => (
                        <div key={tipo}>
                          <strong>${monto.toLocaleString('es-AR')}</strong>{' '}
                          <small className="text-muted">{LABEL_MEDIO_PAGO[tipo] || tipo}</small>
                        </div>
                      ))}
                      {Object.keys(resumenCierre.porMedioDePago).length === 0 && (
                        <small className="text-muted">Sin ingresos</small>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {resumenCierre.reservas.length > 0 && (
                <Table size="sm" striped responsive>
                  <thead>
                    <tr>
                      <th>Reserva</th>
                      <th>Cliente</th>
                      <th>Hab.</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Medio de pago</th>
                      <th>Ingresado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumenCierre.reservas.map((r) => (
                      <tr key={r.id}>
                        <td>#{r.id.slice(-6)}</td>
                        <td>{r.customer.customerName}</td>
                        <td>{r.roomNumber ? `#${r.roomNumber}` : '-'}</td>
                        <td>{new Date(r.stayPeriod.checkInDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</td>
                        <td>{new Date(r.stayPeriod.checkOutDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</td>
                        <td>{LABEL_MEDIO_PAGO[r.payment.paymentType] || r.payment.paymentType || '-'}</td>
                        <td>${r.payment.amountPaid.toLocaleString('es-AR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleDescargarPDF}>
            Descargar PDF
          </Button>
          <Button variant="success" onClick={handleConfirmarCierre}>
            Confirmar cierre
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

interface ReservaCardCompactaProps {
  reserva: Reserva;
  onClick: () => void;
}

function ReservaCardCompacta({ reserva, onClick }: ReservaCardCompactaProps) {
  const colorEstado = getColorEstadoReserva(reserva);
  const borderColor = colorEstado === 'ROJO' ? '#dc3545' : colorEstado === 'AMARILLO' ? '#ffc107' : '#fd7e14';

  const hoy = new Date();
  const checkIn = new Date(reserva.stayPeriod.checkInDate);
  const checkOut = new Date(reserva.stayPeriod.checkOutDate);
  const esCheckInHoy = hoy.getFullYear() === checkIn.getFullYear() && hoy.getMonth() === checkIn.getMonth() && hoy.getDate() === checkIn.getDate();
  const esCheckOutHoy = hoy.getFullYear() === checkOut.getFullYear() && hoy.getMonth() === checkOut.getMonth() && hoy.getDate() === checkOut.getDate();

  const getEstadoBadge = () => {
    if (reserva.isCancelled) return <Badge bg="dark">Cancelada</Badge>;
    if (!reserva.isActive) return <Badge bg="secondary">Finalizada</Badge>;
    if (colorEstado === 'ROJO') return <Badge bg="danger">Paga al ingreso</Badge>;
    if (colorEstado === 'AMARILLO') return <Badge bg="warning" text="dark">Con adelanto</Badge>;
    return <Badge style={{ backgroundColor: '#fd7e14', color: 'white' }}>Pago completo</Badge>;
  };

  return (
    <Card
      onClick={onClick}
      style={{
        borderLeft: `4px solid ${borderColor}`,
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
      }}
      className="h-100"
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
    >
      <Card.Body className="py-2 px-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <strong>
            {reserva.roomNumber ? `Hab. #${reserva.roomNumber}` : 'Sin asignar'}
          </strong>
          {getEstadoBadge()}
        </div>
        <div className="small text-muted">
          {new Date(reserva.stayPeriod.checkInDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
          {' → '}
          {new Date(reserva.stayPeriod.checkOutDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
        </div>
        <div className="small text-muted">{reserva.customer.customerName}</div>
        {(esCheckInHoy || esCheckOutHoy) && reserva.isActive && !reserva.isCancelled && (
          <div className="mt-1">
            {esCheckInHoy && <Badge bg="info" className="me-1 pulse-animation" style={{ fontSize: '0.65rem' }}>ENTRA HOY</Badge>}
            {esCheckOutHoy && <Badge bg="warning" text="dark" className="pulse-animation" style={{ fontSize: '0.65rem' }}>SALE HOY</Badge>}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
