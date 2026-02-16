import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchHospedajeById,
  Hospedaje,
} from '../../../services/fetchHospedajes';
import { Carrusel } from '../../../shared/components/Carrusel';
import { Description } from '../../../shared/components/Description';
import { Subtitle } from '../../../shared/components/Subtitle';
import { Title } from '../../../shared/components/Title';
import { WhatsAppButton } from '../../../shared/components/WhatsAppButton';
import { Calendario } from '../components/Calendario';
import { fetchDisponibilidad, crearReservaExterna } from '../../../services/fetchReservas';
import type { Habitacion } from '../../../services/fetchHabitaciones';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../../services/authService';
import { crearPreferenciaPago } from '../../../services/fetchMercadoPago';

export default function HospedajeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<Hospedaje | null>(null);
  const [loading, setLoading] = useState(true);
  const [disponibles, setDisponibles] = useState<Habitacion[] | null>(null);
  const [cargandoDisp, setCargandoDisp] = useState(false);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState<Habitacion | null>(null);
  const [creandoReserva, setCreandoReserva] = useState(false);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const cargarHospedaje = async () => {
      if (id) {
        setLoading(true);
        const hospedaje = await fetchHospedajeById(id);
        setData(hospedaje);
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
      return;
    }
    const currentFetch = ++fetchIdRef.current;
    setCargandoDisp(true);
    setHabitacionSeleccionada(null);
    const result = await fetchDisponibilidad(id!, formatDate(start), formatDate(end));
    if (currentFetch === fetchIdRef.current) {
      setDisponibles(result);
      setCargandoDisp(false);
    }
  };

  const handleAgregarReserva = async (_idHabitacion: string, start: Date, end: Date) => {
    // Verificar que haya habitación seleccionada
    if (!habitacionSeleccionada) {
      alert('Por favor, seleccioná una habitación de la lista antes de reservar.');
      return;
    }

    // Verificar autenticación
    if (!authService.isSessionValid()) {
      alert('Debés iniciar sesión para realizar una reserva.');
      navigate('/login');
      return;
    }

    const user = authService.getUser();
    if (!user) {
      alert('Error al obtener datos del usuario. Por favor, iniciá sesión nuevamente.');
      navigate('/login');
      return;
    }

    // Verificar que el usuario tenga datos completos para reservar
    if (!authService.hasCompleteProfileForReservations()) {
      // Intentar sincronizar con el backend por si los datos ya están actualizados
      const isComplete = await authService.syncUserFromBackend();
      if (!isComplete) {
        const missing = authService.getMissingFieldsForReservations();
        alert(`Para realizar una reserva necesitás completar tu perfil.\n\nFaltan los siguientes datos: ${missing.join(', ')}`);
        navigate('/perfil/datosPersonales', { state: { returnTo: location.pathname } });
        return;
      }
      // Si los datos ya estaban completos en el backend, continuar con la reserva
    }

    // Calcular noches y precio total
    const noches = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const precioTotal = habitacionSeleccionada.precio * noches;
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
          customerName: `${user.nombre || ''} ${user.apellido || ''}`.trim() || String(user.email || ''),
          customerPhone: String(user.telefono || ''),
          customerEmail: String(user.email || ''),
          customerDni: String(user.dni || ''),
        },
        hotel: {
          hotelId: id!,
          hotelName: data!.titulo,
        },
        stayPeriod: {
          checkInDate: formatDateTime(start, 13),  // Check-in 13:00
          checkOutDate: formatDateTime(end, 10),   // Check-out 10:00
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
        isActive: false, // Se activa cuando se paga
        isCancelled: false,
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
        payerName: `${user.nombre || ''} ${user.apellido || ''}`.trim() || undefined,
        payerIdentificationNumber: user.dni || undefined,
      });

      if (urlPago) {
        // 3. Redirigir a Mercado Pago
        alert(`Reserva creada. Serás redirigido a Mercado Pago para abonar la seña del 50%.\n\nTotal: $${precioTotal.toLocaleString()}\nSeña a pagar: $${montoSeña.toLocaleString()}\nResto al llegar: $${(precioTotal - montoSeña).toLocaleString()}\n\nTenés 5 minutos para completar el pago. Pasado ese tiempo, la habitación volverá a estar disponible.`);
        window.location.href = urlPago;
      } else {
        alert(`Reserva creada pero hubo un error al generar el link de pago.\n\nPodés intentar pagar desde "Mis Reservas" en tu perfil.`);
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
      <Title text={data.titulo} />
      <p className="text-center text-muted mb-3">
        <span className="badge bg-info">{tipoLabel}</span>
        {data.ubicacion && <span className="ms-2">{data.ubicacion}</span>}
      </p>
      <Carrusel images={imagenes} />
      <Description description={data.description} />

      {data.numWhatsapp && <WhatsAppButton num={data.numWhatsapp} />}

      <Subtitle text="¡Reserva ahora!" />
      <Calendario
        idHabitacion={habitacionSeleccionada ? String(habitacionSeleccionada.id) : String(data.id)}
        onDateChange={handleDateChange}
        onAgregarReserva={handleAgregarReserva}
      />

      {cargandoDisp && (
        <p className="text-center text-muted my-3">
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
          Buscando disponibilidad…
        </p>
      )}

      {creandoReserva && (
        <div className="text-center my-3">
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
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
                    onClick={() => setHabitacionSeleccionada(
                      habitacionSeleccionada?.id === hab.id ? null : hab
                    )}
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
                      <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>
                        Hasta {hab.maxPersonas} {hab.maxPersonas === 1 ? 'persona' : 'personas'}
                      </p>
                      {hab.servicios && hab.servicios.length > 0 && (
                        <p className="text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                          {hab.servicios.join(', ')}
                        </p>
                      )}
                      <div className="d-flex justify-content-between align-items-end mt-auto">
                        <span className="text-success fw-bold">
                          ${hab.precio.toLocaleString()}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          /{hab.tipoPrecio === 'por_habitacion' ? 'noche' : 'pers./noche'}
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
