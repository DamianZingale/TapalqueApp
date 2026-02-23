import { useEffect, useRef, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { authService } from '../../../services/authService';
import type { Habitacion } from '../../../services/fetchHabitaciones';
import {
  fetchHospedajeById,
  Hospedaje,
} from '../../../services/fetchHospedajes';
import { crearPreferenciaPago } from '../../../services/fetchMercadoPago';
import {
  fetchPolitica,
  type PoliticaReservas,
} from '../../../services/fetchPolitica';
import {
  crearReservaExterna,
  fetchDisponibilidad,
  type BillingInfo,
} from '../../../services/fetchReservas';
import { Carrusel } from '../../../shared/components/Carrusel';
import { Description } from '../../../shared/components/Description';
import { Subtitle } from '../../../shared/components/Subtitle';
import { Title } from '../../../shared/components/Title';
import { WhatsAppButton } from '../../../shared/components/WhatsAppButton';
import { Calendario } from '../components/Calendario';

export default function HospedajeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<Hospedaje | null>(null);
  const [loading, setLoading] = useState(true);
  const [disponibles, setDisponibles] = useState<Habitacion[] | null>(null);
  const [cargandoDisp, setCargandoDisp] = useState(false);
  const [habitacionSeleccionada, setHabitacionSeleccionada] =
    useState<Habitacion | null>(null);
  const [creandoReserva, setCreandoReserva] = useState(false);
  const [politica, setPolitica] = useState<PoliticaReservas | null>(null);
  const fetchIdRef = useRef(0);

  // Estados para facturación y huéspedes
  const [cantidadHuespedes, setCantidadHuespedes] = useState(1);
  const [requiereFacturacion, setRequiereFacturacion] = useState(false);
  const [datosFacturacion, setDatosFacturacion] = useState<BillingInfo>({
    cuitCuil: '',
    razonSocial: '',
    domicilioComercial: '',
    tipoFactura: 'B',
    condicionFiscal: 'Consumidor Final',
  });
  const [errorFacturacion, setErrorFacturacion] = useState<string | null>(null);
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

  // Wizard de reserva para usuarios
  const [modalWizard, setModalWizard] = useState(false);
  const [pasoWizard, setPasoWizard] = useState(1);

  useEffect(() => {
    const cargarHospedaje = async () => {
      if (id) {
        setLoading(true);
        const [hospedaje, pol] = await Promise.all([
          fetchHospedajeById(id),
          fetchPolitica(id),
        ]);
        setData(hospedaje);
        setPolitica(pol);
        setLoading(false);
      }
    };
    cargarHospedaje();
  }, [id]);

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!data) return <p className="text-center py-5">Hospedaje no encontrado</p>;

  const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleDateChange = async (start: Date | null, end: Date | null) => {
    if (!start || !end) {
      setDisponibles(null);
      setHabitacionSeleccionada(null);
      setFechasSeleccionadas(null);
      return;
    }
    setFechasSeleccionadas({ start, end });
    const currentFetch = ++fetchIdRef.current;
    setCargandoDisp(true);
    setHabitacionSeleccionada(null);
    setCantidadHuespedes(1);
    const result = await fetchDisponibilidad(
      id!,
      formatDate(start),
      formatDate(end)
    );
    if (currentFetch === fetchIdRef.current) {
      setDisponibles(result);
      setCargandoDisp(false);
    }
  };

  const esExcepcionMiercoles = (checkIn: Date): boolean => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const checkInCopy = new Date(checkIn);
    checkInCopy.setHours(0, 0, 0, 0);

    // Encontrar el lunes de la semana del check-in
    const diaCheckIn = checkInCopy.getDay(); // 0=dom, 1=lun, ..., 6=sab
    const diasDesdeLunes = diaCheckIn === 0 ? 6 : diaCheckIn - 1;
    const lunesDeLaSemana = new Date(checkInCopy);
    lunesDeLaSemana.setDate(lunesDeLaSemana.getDate() - diasDesdeLunes);

    // El miércoles es 2 días después del lunes
    const miercolesPrevi = new Date(lunesDeLaSemana);
    miercolesPrevi.setDate(miercolesPrevi.getDate() + 2);

    // Permitir si hoy es >= miércoles previo y <= check-in
    return hoy >= miercolesPrevi && hoy <= checkInCopy;
  };

  const calcularPrecioTotal = (
    habitacion: Habitacion,
    noches: number
  ): number => {
    let precioPorNoche = habitacion.precio;

    if (habitacion.tipoPrecio === 'por_persona') {
      const personasACobrar =
        habitacion.minimoPersonasAPagar &&
        cantidadHuespedes < habitacion.minimoPersonasAPagar
          ? habitacion.minimoPersonasAPagar
          : cantidadHuespedes;
      precioPorNoche = habitacion.precio * personasACobrar;
    }

    let precioTotal = precioPorNoche * noches;

    // Aplicar IVA adicional si se requiere facturación y el tipo de IVA es ADICIONAL
    if (requiereFacturacion && data?.tipoIva === 'ADICIONAL') {
      precioTotal = precioTotal * 1.21;
    }

    return Math.round(precioTotal);
  };

  const abrirWizard = (hab: Habitacion) => {
    setHabitacionSeleccionada(hab);
    setCantidadHuespedes(1);
    setRequiereFacturacion(false);
    setDatosFacturacion({
      cuitCuil: '',
      razonSocial: '',
      domicilioComercial: '',
      tipoFactura: 'B',
      condicionFiscal: 'Consumidor Final',
    });
    setErrorFacturacion(null);
    setPasoWizard(1);
    setModalWizard(true);
  };

  const siguientePasoWizard = () => {
    setErrorFacturacion(null);
    // Paso de facturación: validar si requiere factura
    if (data?.permiteFacturacion && pasoWizard === 2 && requiereFacturacion) {
      if (!datosFacturacion.cuitCuil || datosFacturacion.cuitCuil.trim().length < 10) {
        setErrorFacturacion('El CUIT/CUIL debe tener al menos 10 dígitos');
        return;
      }
      if (!datosFacturacion.razonSocial.trim()) {
        setErrorFacturacion('La razón social es obligatoria');
        return;
      }
      if (!datosFacturacion.domicilioComercial.trim()) {
        setErrorFacturacion('El domicilio comercial es obligatorio');
        return;
      }
    }
    setPasoWizard((p) => p + 1);
  };

  const handleAgregarReserva = async (
    _idHabitacion: string,
    start: Date,
    end: Date
  ) => {
    setFechasSeleccionadas({ start, end });
    if (!habitacionSeleccionada) {
      alert('Por favor, seleccioná una habitación de la lista primero.');
      return;
    }
    setCantidadHuespedes(1);
    setRequiereFacturacion(false);
    setDatosFacturacion({
      cuitCuil: '',
      razonSocial: '',
      domicilioComercial: '',
      tipoFactura: 'B',
      condicionFiscal: 'Consumidor Final',
    });
    setErrorFacturacion(null);
    setPasoWizard(1);
    setModalWizard(true);
  };

  const procesarReserva = async (start: Date, end: Date) => {
    // Verificar que haya habitación seleccionada
    if (!habitacionSeleccionada) {
      alert(
        'Por favor, seleccioná una habitación de la lista antes de reservar.'
      );
      return;
    }

    const noches = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Validar estadía mínima general
    if (politica?.estadiaMinima && noches < politica.estadiaMinima) {
      alert(
        `La estadía mínima para este hospedaje es de ${politica.estadiaMinima} noche${politica.estadiaMinima > 1 ? 's' : ''}.\n\nPor favor, seleccioná un período más largo.`
      );
      return;
    }

    // Validar mínimo de noches según política de fin de semana (solo cuando está activa)
    if (politica?.politicaFdsActiva) {
      const checkInDia = start.getDay(); // 0=dom, 1=lun, 2=mar, 3=mie, 4=jue, 5=vie, 6=sab
      const esFds =
        checkInDia === 4 ||
        checkInDia === 5 ||
        checkInDia === 6 ||
        checkInDia === 0;
      if (esFds && noches < 2 && !esExcepcionMiercoles(start)) {
        alert(
          'La estadía mínima de jueves a domingo es de 2 noches.\n\nPara reservar por una noche, intentelo nuevamente a partir del miércoles previo al ingreso.'
        );
        return;
      }
    }

    // Verificar autenticación
    if (!authService.isSessionValid()) {
      alert('Debés iniciar sesión para realizar una reserva.');
      navigate('/login');
      return;
    }

    const user = authService.getUser();
    if (!user) {
      alert(
        'Error al obtener datos del usuario. Por favor, iniciá sesión nuevamente.'
      );
      navigate('/login');
      return;
    }

    // Verificar que el usuario tenga datos completos para reservar
    if (!authService.hasCompleteProfileForReservations()) {
      // Intentar sincronizar con el backend por si los datos ya están actualizados
      const isComplete = await authService.syncUserFromBackend();
      if (!isComplete) {
        const missing = authService.getMissingFieldsForReservations();
        alert(
          `Para realizar una reserva necesitás completar tu perfil.\n\nFaltan los siguientes datos: ${missing.join(', ')}`
        );
        navigate('/perfil/datosPersonales', {
          state: { returnTo: location.pathname },
        });
        return;
      }
      // Si los datos ya estaban completos en el backend, continuar con la reserva
    }

    // Calcular precio total
    const precioTotal = calcularPrecioTotal(habitacionSeleccionada, noches);
    const montoSeña = Math.round(precioTotal * 0.5); // 50% de seña

    // Formato para LocalDateTime del backend (sin timezone)
    const formatDateTime = (date: Date, hours: number): string => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}T${String(hours).padStart(2, '0')}:00:00`;
    };

    setCreandoReserva(true);
    try {
      // 1. Crear la reserva
      const reserva = await crearReservaExterna({
        customer: {
          customerId: String(user.id || user.email || ''),
          customerName:
            `${user.nombre || ''} ${user.apellido || ''}`.trim() ||
            String(user.email || ''),
          customerPhone: String(user.telefono || ''),
          customerEmail: String(user.email || ''),
          customerDni: String(user.dni || ''),
        },
        hotel: {
          hotelId: id!,
          hotelName: data!.titulo,
        },
        stayPeriod: {
          checkInDate: formatDateTime(start, 13), // Check-in 13:00
          checkOutDate: formatDateTime(end, 10), // Check-out 10:00
        },
        payment: {
          isPaid: false,
          hasPendingAmount: true,
          isDeposit: true, // Es un depósito/seña
          paymentType: 'MERCADO_PAGO',
          amountPaid: 0,
          totalAmount: precioTotal,
          remainingAmount: precioTotal, // El resto se paga al llegar
        },
        totalPrice: precioTotal,
        cantidadHuespedes: cantidadHuespedes,
        requiereFacturacion: requiereFacturacion,
        billingInfo: requiereFacturacion ? datosFacturacion : undefined,
        isActive: false, // Se activa cuando se paga
        isCancelled: false,
        roomNumber: habitacionSeleccionada.numero,
      });

      if (!reserva) {
        alert('No se pudo crear la reserva. Por favor, intentá nuevamente.');
        return;
      }

      // 2. Crear preferencia de pago en Mercado Pago (50% del total)
      const urlPago = await crearPreferenciaPago({
        idProducto: Number(habitacionSeleccionada.id),
        title: `Seña - ${habitacionSeleccionada.titulo} en ${data!.titulo} (${noches} noche${noches !== 1 ? 's' : ''})`,
        description: `Reserva de ${habitacionSeleccionada.titulo} en ${data!.titulo}, ${noches} noche(s). Check-in: ${formatDate(start)}, Check-out: ${formatDate(end)}`,
        quantity: 1,
        unitPrice: montoSeña,
        idVendedor: Number(id), // ID del hospedaje (externalBusinessId)
        idComprador: Number(user.id),
        idTransaccion: reserva.id, // ID de la reserva
        tipoServicio: 'HOSPEDAJE',
        payerEmail: user.email || undefined,
        payerName:
          `${user.nombre || ''} ${user.apellido || ''}`.trim() || undefined,
        payerIdentificationNumber: user.dni || undefined,
      });

      if (urlPago) {
        // 3. Redirigir a Mercado Pago
        alert(
          `Reserva creada. Serás redirigido a Mercado Pago para abonar la seña del 50%.\n\nTotal: $${precioTotal.toLocaleString()}\nSeña a pagar: $${montoSeña.toLocaleString()}\nResto al llegar: $${(precioTotal - montoSeña).toLocaleString()}\n\nTenés 5 minutos para completar el pago. Pasado ese tiempo, la habitación volverá a estar disponible.`
        );
        window.location.href = urlPago;
      } else {
        alert(
          `Reserva creada pero hubo un error al generar el link de pago.\n\nPodés intentar pagar desde "Mis Reservas" en tu perfil.`
        );
        setHabitacionSeleccionada(null);
        setDisponibles(null);
      }
    } catch (error) {
      console.error('Error al crear reserva:', error);
      alert('Ocurrió un error al crear la reserva.');
    } finally {
      setCreandoReserva(false);
    }
  };

  // Backend devuelve imagenes como array de strings directamente
  const imagenes = data.imagenes || [];

  // Obtener tipo de hospedaje legible
  const tipoLabel =
    {
      HOTEL: 'Hotel',
      DEPARTAMENTO: 'Departamento',
      CABAÑA: 'Cabaña',
      CASA: 'Casa',
      OTRO: 'Alojamiento',
    }[data.tipoHospedaje] || 'Alojamiento';

  return (
    <div className="container">
      <title>{data.titulo} | Hospedaje - Tapalqué App</title>
      <meta
        name="description"
        content={`${data.titulo} en Tapalqué.${data.ubicacion ? ` ${data.ubicacion}.` : ''} Reservá habitaciones online con confirmación inmediata.`}
      />
      <Title text={data.titulo} />
      <p className="text-center text-muted mb-3">
        <span className="badge bg-info">{tipoLabel}</span>
        {data.ubicacion && <span className="ms-2">{data.ubicacion}</span>}
      </p>
      <Carrusel images={imagenes} />
      <Description description={data.description} />

      {data.numWhatsapp && <WhatsAppButton num={data.numWhatsapp} />}

      <Subtitle text="¡Reserva ahora!" />

      {/* Banner de estadía mínima general */}
      {politica?.estadiaMinima && politica.estadiaMinima > 1 && (
        <div className="alert alert-info py-2 mb-3" role="alert">
          <strong>Estadía mínima:</strong> Se requieren mínimo{' '}
          {politica.estadiaMinima} noches para reservar en este hospedaje.
        </div>
      )}

      {/* Banner de política de estadía mínima de fin de semana */}
      {politica?.politicaFdsActiva && (
        <div className="alert alert-info py-2 mb-3" role="alert">
          <strong>Política de fin de semana:</strong> La estadía mínima de
          jueves a domingo es de 2 noches. Para reservar por una noche,
          intentelo el miércoles previo al ingreso.
        </div>
      )}

      <Calendario
        idHabitacion={
          habitacionSeleccionada
            ? String(habitacionSeleccionada.id)
            : String(data.id)
        }
        onDateChange={handleDateChange}
        onAgregarReserva={handleAgregarReserva}
        maxDate={
          data.fechaLimiteReservas
            ? new Date(data.fechaLimiteReservas)
            : undefined
        }
      />

      {data.fechaLimiteReservas && (
        <p className="text-center text-muted small mt-2">
          Reservas disponibles hasta el{' '}
          <strong>
            {new Date(
              data.fechaLimiteReservas + 'T00:00:00'
            ).toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </strong>
          . Para fechas posteriores, comunicarse con el establecimiento.
        </p>
      )}

      {cargandoDisp && (
        <p className="text-center text-muted my-3">
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          />
          Buscando disponibilidad…
        </p>
      )}

      {creandoReserva && (
        <div className="text-center my-3">
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          />
          <span className="text-primary fw-semibold">Creando reserva…</span>
        </div>
      )}

      {disponibles !== null && !cargandoDisp && (
        <div className="mt-4">
          <h6 className="text-center fw-semibold">
            {disponibles.length > 0
              ? `${disponibles.length} habitación${disponibles.length !== 1 ? 'es' : ''} disponible${disponibles.length !== 1 ? 's' : ''}`
              : 'No hay habitaciones libres para esas fechas'}
          </h6>
          {disponibles.length > 0 && (
            <div className="row justify-content-center">
              {disponibles.map((hab) => (
                <div className="col-auto my-2" key={hab.id}>
                  <div className="card h-100" style={{ width: '16rem' }}>
                    {hab.fotos?.[0] && (
                      <img
                        src={hab.fotos[0]}
                        className="card-img-top"
                        alt={hab.titulo}
                        style={{ height: '120px', objectFit: 'cover' }}
                      />
                    )}
                    <div className="card-body d-flex flex-column">
                      <h6 className="card-title mb-1">{hab.titulo}</h6>
                      <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>
                        Hasta {hab.maxPersonas}{' '}
                        {hab.maxPersonas === 1 ? 'persona' : 'personas'}
                      </p>
                      {hab.servicios && hab.servicios.length > 0 && (
                        <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
                          {hab.servicios.join(', ')}
                        </p>
                      )}
                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-success fw-bold">
                            ${hab.precio.toLocaleString()}
                          </span>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                            /{hab.tipoPrecio === 'por_habitacion' ? 'noche' : 'pers./noche'}
                          </span>
                        </div>
                        <button
                          className="btn btn-success w-100 fw-semibold"
                          onClick={() => abrirWizard(hab)}
                        >
                          Reservar →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Wizard de reserva */}
      {(() => {
        const totalPasos = data?.permiteFacturacion ? 3 : 2;
        const pasosConfig = data?.permiteFacturacion
          ? [{ n: 1, label: 'Personas' }, { n: 2, label: 'Factura' }, { n: 3, label: 'Confirmar' }]
          : [{ n: 1, label: 'Personas' }, { n: 2, label: 'Confirmar' }];
        const noches = fechasSeleccionadas
          ? Math.round(
              (fechasSeleccionadas.end.getTime() - fechasSeleccionadas.start.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0;
        const precioTotal =
          habitacionSeleccionada && noches > 0
            ? calcularPrecioTotal(habitacionSeleccionada, noches)
            : 0;

        return (
          <Modal
            show={modalWizard}
            onHide={() => setModalWizard(false)}
            size="lg"
            centered
          >
            <Modal.Header closeButton className="border-bottom-0 pb-1">
              <Modal.Title className="fs-4">Reservar en {data?.titulo}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-2">
              {errorFacturacion && (
                <Alert variant="danger" dismissible onClose={() => setErrorFacturacion(null)}>
                  {errorFacturacion}
                </Alert>
              )}

              {/* Indicador de pasos */}
              <div className="d-flex align-items-center justify-content-center mb-4">
                {pasosConfig.map(({ n, label }, idx) => (
                  <div key={n} className="d-flex align-items-center">
                    <div className="text-center">
                      <div
                        className={`rounded-circle d-flex align-items-center justify-content-center fw-bold mx-auto ${
                          pasoWizard > n
                            ? 'bg-success text-white'
                            : pasoWizard === n
                            ? 'bg-primary text-white'
                            : 'bg-light text-muted border'
                        }`}
                        style={{ width: 44, height: 44, fontSize: '1rem' }}
                      >
                        {pasoWizard > n ? '✓' : n}
                      </div>
                      <small
                        className={`d-block mt-1 ${
                          pasoWizard === n
                            ? 'fw-bold text-primary'
                            : pasoWizard > n
                            ? 'text-success'
                            : 'text-muted'
                        }`}
                      >
                        {label}
                      </small>
                    </div>
                    {idx < pasosConfig.length - 1 && (
                      <div
                        style={{
                          width: 50,
                          height: 3,
                          backgroundColor: pasoWizard > n ? '#198754' : '#dee2e6',
                          marginBottom: 18,
                          marginLeft: 4,
                          marginRight: 4,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Resumen de habitación y fechas (visible siempre) */}
              {habitacionSeleccionada && fechasSeleccionadas && (
                <div className="d-flex align-items-center gap-3 p-3 bg-light rounded mb-4">
                  {habitacionSeleccionada.fotos?.[0] && (
                    <img
                      src={habitacionSeleccionada.fotos[0]}
                      alt={habitacionSeleccionada.titulo}
                      style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                    />
                  )}
                  <div>
                    <div className="fw-bold fs-5">{habitacionSeleccionada.titulo}</div>
                    <div className="text-muted">
                      {fechasSeleccionadas.start.toLocaleDateString('es-AR')} →{' '}
                      {fechasSeleccionadas.end.toLocaleDateString('es-AR')}
                    </div>
                    <Badge bg="secondary">
                      {noches} noche{noches !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              )}

              {/* PASO 1: Personas */}
              {pasoWizard === 1 && (
                <div>
                  <h5 className="text-center text-muted mb-4">
                    ¿Cuántas personas van a hospedarse?
                  </h5>
                  <div className="d-flex align-items-center justify-content-center gap-4 my-4">
                    <Button
                      variant="outline-secondary"
                      style={{ width: 60, height: 60, fontSize: '2rem', lineHeight: 1, padding: 0 }}
                      onClick={() => setCantidadHuespedes((n) => Math.max(1, n - 1))}
                    >
                      −
                    </Button>
                    <div className="text-center">
                      <div className="display-4 fw-bold">{cantidadHuespedes}</div>
                      <div className="text-muted fs-5">
                        {cantidadHuespedes === 1 ? 'persona' : 'personas'}
                      </div>
                    </div>
                    <Button
                      variant="outline-secondary"
                      style={{ width: 60, height: 60, fontSize: '2rem', lineHeight: 1, padding: 0 }}
                      onClick={() =>
                        setCantidadHuespedes((n) =>
                          Math.min(habitacionSeleccionada?.maxPersonas ?? 10, n + 1)
                        )
                      }
                    >
                      +
                    </Button>
                  </div>

                  {habitacionSeleccionada?.tipoPrecio === 'por_persona' &&
                    habitacionSeleccionada.minimoPersonasAPagar &&
                    cantidadHuespedes < habitacionSeleccionada.minimoPersonasAPagar && (
                      <Alert variant="warning" className="text-center">
                        Mínimo a pagar:{' '}
                        <strong>{habitacionSeleccionada.minimoPersonasAPagar} personas</strong>
                      </Alert>
                    )}

                  {precioTotal > 0 && (
                    <div className="text-center p-3 bg-light rounded mt-3">
                      <div className="text-muted small mb-1">Precio estimado</div>
                      <div className="fs-2 fw-bold text-success">
                        ${precioTotal.toLocaleString()}
                      </div>
                      <div className="text-muted small">
                        Seña del 50%:{' '}
                        <strong>${Math.round(precioTotal * 0.5).toLocaleString()}</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PASO 2: Facturación (solo si permiteFacturacion) */}
              {data?.permiteFacturacion && pasoWizard === 2 && (
                <div>
                  <h5 className="text-center text-muted mb-4">¿Necesitás factura?</h5>
                  <div className="text-center mb-4">
                    <Form.Check
                      type="switch"
                      id="requiere-factura-usuario"
                      label={<span className="fs-5">Sí, necesito factura</span>}
                      checked={requiereFacturacion}
                      onChange={(e) => setRequiereFacturacion(e.target.checked)}
                      className="d-inline-flex align-items-center gap-3"
                    />
                  </div>

                  {requiereFacturacion ? (
                    <>
                      {data?.tipoIva === 'ADICIONAL' && (
                        <Alert variant="warning" className="text-center">
                          ⚠️ Se agregará un <strong>21% de IVA</strong> al precio total
                        </Alert>
                      )}
                      <Card className="border-primary">
                        <Card.Body>
                          <h6 className="text-primary mb-3">Datos de Facturación</h6>
                          <Row className="g-3">
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">CUIT/CUIL *</Form.Label>
                                <Form.Control
                                  size="lg"
                                  type="text"
                                  placeholder="20-12345678-9"
                                  value={datosFacturacion.cuitCuil}
                                  onChange={(e) =>
                                    setDatosFacturacion({
                                      ...datosFacturacion,
                                      cuitCuil: e.target.value,
                                    })
                                  }
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Razón Social *</Form.Label>
                                <Form.Control
                                  size="lg"
                                  type="text"
                                  placeholder="Nombre o empresa"
                                  value={datosFacturacion.razonSocial}
                                  onChange={(e) =>
                                    setDatosFacturacion({
                                      ...datosFacturacion,
                                      razonSocial: e.target.value,
                                    })
                                  }
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Domicilio *</Form.Label>
                                <Form.Control
                                  size="lg"
                                  type="text"
                                  placeholder="Calle 123, Ciudad"
                                  value={datosFacturacion.domicilioComercial}
                                  onChange={(e) =>
                                    setDatosFacturacion({
                                      ...datosFacturacion,
                                      domicilioComercial: e.target.value,
                                    })
                                  }
                                />
                              </Form.Group>
                            </Col>
                            <Col md={3}>
                              <Form.Group>
                                <Form.Label>Tipo</Form.Label>
                                <Form.Select
                                  size="lg"
                                  value={datosFacturacion.tipoFactura}
                                  onChange={(e) =>
                                    setDatosFacturacion({
                                      ...datosFacturacion,
                                      tipoFactura: e.target.value as 'A' | 'B',
                                    })
                                  }
                                >
                                  <option value="B">Factura B</option>
                                  <option value="A">Factura A</option>
                                </Form.Select>
                              </Form.Group>
                            </Col>
                            <Col md={3}>
                              <Form.Group>
                                <Form.Label>Condición Fiscal</Form.Label>
                                <Form.Select
                                  size="lg"
                                  value={datosFacturacion.condicionFiscal}
                                  onChange={(e) =>
                                    setDatosFacturacion({
                                      ...datosFacturacion,
                                      condicionFiscal: e.target.value as BillingInfo['condicionFiscal'],
                                    })
                                  }
                                >
                                  <option value="Consumidor Final">Consumidor Final</option>
                                  <option value="Monotributista">Monotributista</option>
                                  <option value="Responsable Inscripto">
                                    Responsable Inscripto
                                  </option>
                                </Form.Select>
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </>
                  ) : (
                    <div className="text-center py-3 text-muted">
                      <div style={{ fontSize: '3rem' }}>📄</div>
                      <p className="fs-5">Sin factura, avanzá al siguiente paso</p>
                    </div>
                  )}
                </div>
              )}

              {/* ÚLTIMO PASO: Confirmar y pagar */}
              {pasoWizard === totalPasos && (
                <div>
                  <h5 className="text-center text-muted mb-4">
                    Revise su reserva
                  </h5>
                  <Card className="border-2 mb-3">
                    <Card.Body>
                      <Row>
                        <Col sm={6} className="mb-3 mb-sm-0">
                          <div className="text-muted small mb-1">Estadía</div>
                          <div className="fw-bold">
                            {fechasSeleccionadas?.start.toLocaleDateString('es-AR')} →{' '}
                            {fechasSeleccionadas?.end.toLocaleDateString('es-AR')}
                          </div>
                          <div className="d-flex gap-2 mt-2 flex-wrap">
                            <Badge bg="secondary">
                              {noches} noche{noches !== 1 ? 's' : ''}
                            </Badge>
                            <Badge bg="info">
                              {cantidadHuespedes}{' '}
                              {cantidadHuespedes === 1 ? 'persona' : 'personas'}
                            </Badge>
                            {requiereFacturacion && (
                              <Badge bg="primary">
                                Factura tipo {datosFacturacion.tipoFactura}
                              </Badge>
                            )}
                          </div>
                        </Col>
                        <Col sm={6}>
                          <div className="text-muted small mb-1">Pago</div>
                          <div className="d-flex justify-content-between">
                            <span>Total estadía:</span>
                            <strong className="text-primary fs-5">
                              ${precioTotal.toLocaleString()}
                            </strong>
                          </div>
                          <div className="d-flex justify-content-between text-success">
                            <span>Seña ahora (50%):</span>
                            <strong>${Math.round(precioTotal * 0.5).toLocaleString()}</strong>
                          </div>
                          <div className="d-flex justify-content-between text-muted">
                            <span>Resto al llegar:</span>
                            <span>${Math.round(precioTotal * 0.5).toLocaleString()}</span>
                          </div>
                          {requiereFacturacion && data?.tipoIva === 'ADICIONAL' && (
                            <small className="text-warning d-block mt-1">
                              * Precio incluye IVA del 21%
                            </small>
                          )}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  <Alert variant="info" className="text-center mb-0">
                    Vas a ser redirigido a <strong>Mercado Pago</strong> para abonar la seña.
                    <br />
                    <small>Tenés 5 minutos para completar el pago.</small>
                  </Alert>
                </div>
              )}
            </Modal.Body>

            <Modal.Footer className="justify-content-between">
              <Button variant="outline-secondary" onClick={() => setModalWizard(false)}>
                Cancelar
              </Button>
              <div className="d-flex gap-2">
                {pasoWizard > 1 && (
                  <Button
                    variant="outline-primary"
                    size="lg"
                    onClick={() => {
                      setErrorFacturacion(null);
                      setPasoWizard((p) => p - 1);
                    }}
                  >
                    ← Anterior
                  </Button>
                )}
                {pasoWizard < totalPasos ? (
                  <Button variant="primary" size="lg" onClick={siguientePasoWizard}>
                    Siguiente →
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    size="lg"
                    disabled={creandoReserva}
                    onClick={() => {
                      setModalWizard(false);
                      procesarReserva(
                        fechasSeleccionadas!.start,
                        fechasSeleccionadas!.end
                      );
                    }}
                  >
                    {creandoReserva ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Procesando…
                      </>
                    ) : (
                      'Pagar con Mercado Pago →'
                    )}
                  </Button>
                )}
              </div>
            </Modal.Footer>
          </Modal>
        );
      })()}

      {data.latitud != null && data.longitud != null && (
        <div className="text-center my-4">
          <a
            href={`https://www.google.com/maps?q=${data.latitud},${data.longitud}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-dark"
          >
            Ver en Google Maps
          </a>
        </div>
      )}
    </div>
  );
}
