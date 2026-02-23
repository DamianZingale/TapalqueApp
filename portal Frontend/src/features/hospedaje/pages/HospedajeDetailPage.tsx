import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
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
  const [mostrarModalFacturacion, setMostrarModalFacturacion] = useState(false);
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

  const validarDatosFacturacion = (): boolean => {
    if (!datosFacturacion.cuitCuil || datosFacturacion.cuitCuil.length < 10) {
      setErrorFacturacion('El CUIT/CUIL debe tener al menos 10 dígitos');
      return false;
    }
    if (!datosFacturacion.razonSocial.trim()) {
      setErrorFacturacion('La razón social es obligatoria');
      return false;
    }
    if (!datosFacturacion.domicilioComercial.trim()) {
      setErrorFacturacion('El domicilio comercial es obligatorio');
      return false;
    }
    setErrorFacturacion(null);
    return true;
  };

  const handleConfirmarFacturacion = () => {
    if (!validarDatosFacturacion()) return;
    setMostrarModalFacturacion(false);
    if (fechasSeleccionadas) {
      procesarReserva(fechasSeleccionadas.start, fechasSeleccionadas.end);
    }
  };

  const handleAgregarReserva = async (
    _idHabitacion: string,
    start: Date,
    end: Date
  ) => {
    // Guardar las fechas para usar después en el modal de facturación
    setFechasSeleccionadas({ start, end });

    // Si requiere facturación, abrir modal primero
    if (requiereFacturacion && data?.permiteFacturacion) {
      setMostrarModalFacturacion(true);
      return;
    }

    // Si no requiere facturación, procesar directamente
    await procesarReserva(start, end);
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
                  <div
                    className={`card h-100 ${habitacionSeleccionada?.id === hab.id ? 'border-primary border-2' : ''}`}
                    style={{ width: '16rem', cursor: 'pointer' }}
                    onClick={() => {
                      const nuevaSeleccion =
                        habitacionSeleccionada?.id === hab.id ? null : hab;
                      setHabitacionSeleccionada(nuevaSeleccion);
                      if (nuevaSeleccion) {
                        setCantidadHuespedes(1);
                        setRequiereFacturacion(false);
                      }
                    }}
                  >
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
                      <p
                        className="text-muted mb-1"
                        style={{ fontSize: '0.8rem' }}
                      >
                        Hasta {hab.maxPersonas}{' '}
                        {hab.maxPersonas === 1 ? 'persona' : 'personas'}
                      </p>
                      {hab.servicios && hab.servicios.length > 0 && (
                        <p
                          className="text-muted mb-1"
                          style={{ fontSize: '0.75rem' }}
                        >
                          {hab.servicios.join(', ')}
                        </p>
                      )}
                      <div className="d-flex justify-content-between align-items-end mt-auto">
                        <span className="text-success fw-bold">
                          ${hab.precio.toLocaleString()}
                        </span>
                        <span
                          className="text-muted"
                          style={{ fontSize: '0.75rem' }}
                        >
                          /
                          {hab.tipoPrecio === 'por_habitacion'
                            ? 'noche'
                            : 'pers./noche'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Opciones de huéspedes y facturación */}
      {habitacionSeleccionada && fechasSeleccionadas && (
        <div className="container mt-4 mb-3">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card border-primary">
                <div className="card-body">
                  <h6 className="card-title text-primary mb-3">
                    Detalles de la reserva
                  </h6>

                  {/* Selector de cantidad de huéspedes */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Cantidad de huéspedes
                    </label>
                    <select
                      className="form-select"
                      value={cantidadHuespedes}
                      onChange={(e) =>
                        setCantidadHuespedes(Number(e.target.value))
                      }
                    >
                      {Array.from(
                        { length: habitacionSeleccionada.maxPersonas },
                        (_, i) => i + 1
                      ).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'persona' : 'personas'}
                        </option>
                      ))}
                    </select>

                    {/* Alerta de mínimo de personas a pagar */}
                    {habitacionSeleccionada.tipoPrecio === 'por_persona' &&
                      habitacionSeleccionada.minimoPersonasAPagar &&
                      cantidadHuespedes <
                        habitacionSeleccionada.minimoPersonasAPagar && (
                        <div className="alert alert-warning mt-2 mb-0 py-2 small">
                          <strong>Nota:</strong> Mínimo a pagar:{' '}
                          {habitacionSeleccionada.minimoPersonasAPagar} personas
                        </div>
                      )}
                  </div>

                  {/* Checkbox de facturación (solo si el hospedaje lo permite) */}
                  {data?.permiteFacturacion && (
                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="requiereFacturacion"
                          checked={requiereFacturacion}
                          onChange={(e) =>
                            setRequiereFacturacion(e.target.checked)
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="requiereFacturacion"
                        >
                          Requiero factura
                        </label>
                      </div>

                      {/* Alerta de IVA adicional */}
                      {requiereFacturacion && data?.tipoIva === 'ADICIONAL' && (
                        <div className="alert alert-warning mt-2 mb-0 py-2 small">
                          <strong>⚠️ Atención:</strong> Se agregará un 21% de
                          IVA adicional al precio total
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resumen de precio */}
                  {fechasSeleccionadas && (
                    <div className="border-top pt-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold">Precio total:</span>
                        <span className="text-success fw-bold fs-5">
                          $
                          {calcularPrecioTotal(
                            habitacionSeleccionada,
                            Math.round(
                              (fechasSeleccionadas.end.getTime() -
                                fechasSeleccionadas.start.getTime()) /
                                (1000 * 60 * 60 * 24)
                            )
                          ).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-muted small mb-0 mt-1">
                        Seña del 50% a pagar ahora, resto al llegar
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de datos de facturación */}
      <Modal
        show={mostrarModalFacturacion}
        onHide={() => setMostrarModalFacturacion(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Datos de Facturación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorFacturacion && (
            <Alert variant="danger">{errorFacturacion}</Alert>
          )}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>CUIT/CUIL *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: 20-12345678-9"
                value={datosFacturacion.cuitCuil}
                onChange={(e) =>
                  setDatosFacturacion({
                    ...datosFacturacion,
                    cuitCuil: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Razón Social *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nombre completo o razón social"
                value={datosFacturacion.razonSocial}
                onChange={(e) =>
                  setDatosFacturacion({
                    ...datosFacturacion,
                    razonSocial: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Domicilio Comercial *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Dirección fiscal"
                value={datosFacturacion.domicilioComercial}
                onChange={(e) =>
                  setDatosFacturacion({
                    ...datosFacturacion,
                    domicilioComercial: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tipo de Factura *</Form.Label>
              <Form.Select
                value={datosFacturacion.tipoFactura}
                onChange={(e) =>
                  setDatosFacturacion({
                    ...datosFacturacion,
                    tipoFactura: e.target.value as 'A' | 'B',
                  })
                }
              >
                <option value="B">B - Consumidor Final / Monotributista</option>
                <option value="A">A - Responsable Inscripto</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Condición Fiscal *</Form.Label>
              <Form.Select
                value={datosFacturacion.condicionFiscal}
                onChange={(e) =>
                  setDatosFacturacion({
                    ...datosFacturacion,
                    condicionFiscal: e.target.value as
                      | 'Monotributista'
                      | 'Responsable Inscripto'
                      | 'Consumidor Final',
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
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setMostrarModalFacturacion(false)}
          >
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirmarFacturacion}>
            Confirmar y Reservar
          </Button>
        </Modal.Footer>
      </Modal>

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
