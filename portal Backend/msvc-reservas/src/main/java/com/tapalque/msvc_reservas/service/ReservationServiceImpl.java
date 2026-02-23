package com.tapalque.msvc_reservas.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Objects;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.tapalque.msvc_reservas.client.HospedajeClient;
import com.tapalque.msvc_reservas.client.MercadoPagoClient;
import com.tapalque.msvc_reservas.dto.PagoEventoDTO;
import com.tapalque.msvc_reservas.dto.ReservationDTO;
import com.tapalque.msvc_reservas.entity.Reservation;
import com.tapalque.msvc_reservas.enums.PaymentType;
import com.tapalque.msvc_reservas.maper.dto.ReservationMapper;
import com.tapalque.msvc_reservas.repository.ReservationRepositoryInterface;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepositoryInterface reservationRepository;
    private final AdminNotificationService adminNotificationService;
    private final HospedajeClient hospedajeClient;
    private final MercadoPagoClient mercadoPagoClient;
    private final PoliticaService politicaService;

    public ReservationServiceImpl(ReservationRepositoryInterface reservationRepository,
                                  AdminNotificationService adminNotificationService,
                                  HospedajeClient hospedajeClient,
                                  MercadoPagoClient mercadoPagoClient,
                                  PoliticaService politicaService) {
        this.reservationRepository = reservationRepository;
        this.adminNotificationService = adminNotificationService;
        this.hospedajeClient = hospedajeClient;
        this.mercadoPagoClient = mercadoPagoClient;
        this.politicaService = politicaService;
    }

    @Override
    public Mono<ReservationDTO> createReservation(ReservationDTO reservationDto) {
        if (reservationDto.getHotel() == null || reservationDto.getHotel().getHotelId() == null) {
            return Mono.error(new IllegalArgumentException("La reserva debe incluir el hotel"));
        }
        if (reservationDto.getStayPeriod() == null
                || reservationDto.getStayPeriod().getCheckInDate() == null
                || reservationDto.getStayPeriod().getCheckOutDate() == null) {
            return Mono.error(new IllegalArgumentException("La reserva debe incluir fechas de check-in y check-out"));
        }
        if (reservationDto.getRoomNumber() == null) {
            return Mono.error(new IllegalArgumentException("La reserva debe incluir el número de habitación"));
        }

        String hotelId = reservationDto.getHotel().getHotelId();
        Integer roomNumber = reservationDto.getRoomNumber();
        LocalDateTime checkIn = reservationDto.getStayPeriod().getCheckInDate();
        LocalDateTime checkOut = reservationDto.getStayPeriod().getCheckOutDate();
        long noches = ChronoUnit.DAYS.between(checkIn.toLocalDate(), checkOut.toLocalDate());

        if (noches <= 0) {
            return Mono.error(new IllegalArgumentException("Las fechas de estadía son inválidas"));
        }

        return politicaService.obtenerPolitica(hotelId)
            .flatMap(politica -> {
                // Validar política de mínimo de noches para fin de semana (solo cuando está activa)
                if (Boolean.TRUE.equals(politica.getPoliticaFdsActiva())) {
                    DayOfWeek checkInDia = checkIn.toLocalDate().getDayOfWeek();
                    boolean esFds = checkInDia == DayOfWeek.THURSDAY
                            || checkInDia == DayOfWeek.FRIDAY
                            || checkInDia == DayOfWeek.SATURDAY
                            || checkInDia == DayOfWeek.SUNDAY;
                    if (esFds && noches < 2) {
                        LocalDate hoy = LocalDate.now();
                        boolean esHoyMiercoles = hoy.getDayOfWeek() == DayOfWeek.WEDNESDAY;
                        long diasHastaCheckIn = ChronoUnit.DAYS.between(hoy, checkIn.toLocalDate());
                        boolean esFdsSiguiente = diasHastaCheckIn >= 0 && diasHastaCheckIn <= 4;
                        if (!(esHoyMiercoles && esFdsSiguiente)) {
                            return Mono.error(new IllegalArgumentException(
                                    "De jueves a domingo la estadía mínima es de 2 noches. Solo el miércoles previo se permite reservar 1 noche para ese fin de semana."));
                        }
                    }
                }

                // Validar estadía mínima general
                if (politica.getEstadiaMinima() != null && noches < politica.getEstadiaMinima()) {
                    return Mono.error(new IllegalArgumentException(
                            "La estadía mínima para este hospedaje es de " + politica.getEstadiaMinima() + " noche(s)"));
                }

                return hospedajeClient.fetchHabitaciones(hotelId);
            })
            .flatMap(habitaciones -> {
                return habitaciones.stream()
                    .filter(h -> roomNumber.equals(h.getNumero()))
                    .findFirst()
                    .map(habitacion -> {
                        // Calcular precio según tipo de tarifa
                        double precioPorNoche;
                        if ("por_persona".equalsIgnoreCase(habitacion.getTipoPrecio())) {
                            // Validar cantidad de huéspedes
                            Integer cantidadHuespedes = reservationDto.getCantidadHuespedes();
                            if (cantidadHuespedes == null || cantidadHuespedes <= 0) {
                                throw new IllegalArgumentException("Debe especificar la cantidad de huéspedes");
                            }

                            // Determinar cuántas personas se cobrarán
                            Integer minimoPersonasAPagar = habitacion.getMinimoPersonasAPagar();
                            int personasACobrar = (minimoPersonasAPagar != null && minimoPersonasAPagar > cantidadHuespedes)
                                    ? minimoPersonasAPagar
                                    : cantidadHuespedes;

                            precioPorNoche = habitacion.getPrecio().doubleValue() * personasACobrar;
                        } else {
                            // POR_HABITACION
                            precioPorNoche = habitacion.getPrecio().doubleValue();
                        }

                        double precioReal = precioPorNoche * noches;

                        Reservation reservation = ReservationMapper.toEntity(reservationDto);
                        reservation.setTotalPrice(precioReal);
                        // Sobreescribir montos de pago con valores calculados en el servidor.
                        // setTotalAmount + setAmountPaid(0) recalcula remainingAmount, isPaid y hasPendingAmount.
                        if (reservation.getPayment() != null) {
                            reservation.getPayment().setTotalAmount(precioReal);
                            reservation.getPayment().setAmountPaid(0.0);
                        }
                        reservation.setDateCreated(LocalDateTime.now());
                        reservation.setDateUpdated(LocalDateTime.now());

                        return reservationRepository.save(reservation)
                                .map(ReservationMapper::toDto);
                                // Nota: No notificamos aquí. La notificación se envía cuando se confirma el pago en confirmarPagoReserva()
                    })
                    .orElse(Mono.error(new IllegalArgumentException(
                        "Habitación número " + roomNumber + " no encontrada en el hospedaje")));
            });
    }

    @Override
    public Flux<ReservationDTO> getReservationById(String id) {
    return reservationRepository.findAll()
            .filter(reservation -> reservation.getId().equals(id))
            .map(ReservationMapper::toDto);
}

    
    @Override
public Mono<ReservationDTO> updateReservation(ReservationDTO reservationDto) {
    if (reservationDto.getId() == null) {
        return Mono.error(new IllegalArgumentException("Reservation ID cannot be null"));
    }

    return reservationRepository.findById(reservationDto.getId())
            .flatMap(existing -> {
                Reservation updated = ReservationMapper.toEntity(reservationDto);
                updated.setDateUpdated(LocalDateTime.now());
                return reservationRepository.save(updated);
            })
            .map(ReservationMapper::toDto)
            .doOnSuccess(dto -> {
                if (dto != null) adminNotificationService.notificarReservaActualizada(dto);
            });
}

    @Override
    public Mono<Void> deleteReservation(String id) {
        Objects.requireNonNull(id, "id cant be null");
        return reservationRepository.findById(id)
                .flatMap(reservation -> {
                    reservation.setIsCancelled(true);
                    reservation.setIsActive(false);
                    reservation.setDateUpdated(LocalDateTime.now());
                    return reservationRepository.save(reservation);
                })
                .doOnSuccess(saved -> {
                    if (saved != null) {
                        adminNotificationService.notificarReservaActualizada(ReservationMapper.toDto(saved));
                        // Si ya pagó con Mercado Pago, iniciar reembolso automático
                        String mpId = saved.getMercadoPagoId();
                        double pagado = saved.getPayment() != null && saved.getPayment().getAmountPaid() != null
                                ? saved.getPayment().getAmountPaid() : 0.0;
                        if (mpId != null && pagado > 0) {
                            mercadoPagoClient.reembolsar(mpId)
                                    .doOnSuccess(v -> System.out.println("Reembolso automático iniciado para reserva " + saved.getId()))
                                    .doOnError(e -> System.err.println("Error al reembolsar reserva " + saved.getId() + ": " + e.getMessage()))
                                    .subscribe();
                        }
                    }
                })
                .then();
    }

    @Override
    public Flux<ReservationDTO> getReservationsByHotel(String hotelId) {
        return reservationRepository.findByHotel_HotelId(hotelId).map(ReservationMapper::toDto);
    }

    @Override
    @Scheduled(cron = "0 0 3 * * SUN")
    public void cleanUnpaidReservations() {
    reservationRepository.deleteAllByPayment_IsPaidFalse();
    System.out.println("Limpieza de reservas no pagadas realizada el domingo a las 3am.");
}

    @Override
    @Scheduled(cron = "0 0 3 * * SUN") // limpieza de reservas pagadas con más de 3 meses, domingos 3AM
    public void cleanOldPaidReservations() {
        LocalDateTime tresMesesAtras = LocalDateTime.now().minusMonths(3);
        reservationRepository.findAll()
            .filter(r -> r.getPayment() != null
                         && Boolean.TRUE.equals(r.getPayment().getIsPaid())
                         && r.getDateCreated().isBefore(tresMesesAtras))
            .flatMap(r -> reservationRepository.deleteById(r.getId()))
            .subscribe();
        System.out.println("Limpieza de reservas pagadas con más de 3 meses realizada.");
    }

    @Override
    public Flux<ReservationDTO> getReservationsByCustomer(String customerId) {
        return reservationRepository.findByCustomer_CustomerId(customerId).map(ReservationMapper::toDto);
    }

    @Override
    public Flux<ReservationDTO> getReservationsByHotelAndDateRange(
            String hotelId, LocalDateTime desde, LocalDateTime hasta) {
        return reservationRepository.findByHotel_HotelIdAndDateCreatedBetween(hotelId, desde, hasta)
                .map(ReservationMapper::toDto);
    }

    @Override
    public Flux<ReservationDTO> getReservationsByCustomerAndDateRange(
            String customerId, LocalDateTime desde, LocalDateTime hasta) {
        return reservationRepository.findByCustomer_CustomerIdAndDateCreatedBetween(customerId, desde, hasta)
                .map(ReservationMapper::toDto);
    }

    @Override
    public Flux<ReservationDTO> getReservationsByHotelAndStayOverlap(
            String hotelId, LocalDateTime desde, LocalDateTime hasta) {
        return reservationRepository.findByHotelAndStayPeriodOverlap(hotelId, desde, hasta)
                .map(ReservationMapper::toDto);
    }

    @Override
    public Flux<ReservationDTO> getReservationsByHotelAndStayOverlapIncludingPending(
            String hotelId, LocalDateTime desde, LocalDateTime hasta) {
        // Incluir reservas pendientes de pago creadas en los últimos 5 minutos
        LocalDateTime limiteBloqueo = LocalDateTime.now().minusMinutes(5);
        return reservationRepository.findByHotelAndStayPeriodOverlapIncludingPending(hotelId, desde, hasta, limiteBloqueo)
                .map(ReservationMapper::toDto);
    }

    @Override
    public Flux<ReservationDTO> getReservationsWithPaymentsInRange(
            String hotelId, LocalDateTime desde, LocalDateTime hasta) {
        return reservationRepository.findByHotelIdWithPaymentsInRange(hotelId, desde, hasta)
                .map(ReservationMapper::toDto);
    }

    @Override
    public void confirmarPagoReserva(String reservaId, PagoEventoDTO evento) {
        reservationRepository.findById(reservaId)
            .flatMap(reservation -> {
                // Actualizar estado de pago con el monto recibido
                double montoRecibido = evento.getMonto() != null ? evento.getMonto().doubleValue() : 0.0;
                if (reservation.getPayment() != null) {
                    // setAmountPaid recalcula remainingAmount, isPaid y hasPendingAmount
                    reservation.getPayment().setAmountPaid(montoRecibido);
                }
                // Registrar en historial de pagos
                if (reservation.getPaymentHistory() == null) {
                    reservation.setPaymentHistory(new ArrayList<>());
                }
                reservation.getPaymentHistory().add(new Reservation.PaymentRecord(
                    LocalDateTime.now(), montoRecibido, PaymentType.MERCADO_PAGO, "Pago confirmado via Mercado Pago"
                ));
                reservation.setIsActive(true);
                reservation.setTransaccionId(evento.getTransaccionId());
                reservation.setMercadoPagoId(evento.getMercadoPagoId());
                reservation.setFechaPago(evento.getFechaPago());
                reservation.setDateUpdated(LocalDateTime.now());
                return reservationRepository.save(reservation);
            })
            .doOnSuccess(reservation -> {
                System.out.println("Reserva " + reservaId + " confirmada como PAGADA");
                if (reservation != null) {
                    // Notificamos como NUEVA reserva cuando se confirma el pago (es cuando realmente se crea para el admin)
                    adminNotificationService.notificarNuevaReserva(ReservationMapper.toDto(reservation));
                }
            })
            .doOnError(error -> System.err.println("Error al confirmar pago de reserva " + reservaId + ": " + error.getMessage()))
            .subscribe();
    }

    @Override
    public void marcarPagoPendienteReserva(String reservaId, PagoEventoDTO evento) {
        reservationRepository.findById(reservaId)
            .flatMap(reservation -> {
                // Pago pendiente: la reserva no se activa aún
                reservation.setIsActive(false);
                reservation.setIsCancelled(false);
                reservation.setTransaccionId(evento.getTransaccionId());
                reservation.setMercadoPagoId(evento.getMercadoPagoId());
                reservation.setDateUpdated(LocalDateTime.now());
                return reservationRepository.save(reservation);
            })
            .doOnSuccess(reservation -> System.out.println("Reserva " + reservaId + " marcada como pago PENDIENTE"))
            .doOnError(error -> System.err.println("Error al marcar pago pendiente de reserva " + reservaId + ": " + error.getMessage()))
            .subscribe();
    }

    @Override
    public void rechazarPagoReserva(String reservaId, PagoEventoDTO evento) {
        reservationRepository.findById(reservaId)
            .flatMap(reservation -> {
                // Cancelar reserva por pago rechazado
                reservation.setIsCancelled(true);
                reservation.setIsActive(false);
                if (reservation.getPayment() != null) {
                    reservation.getPayment().setIsPaid(false);
                }
                reservation.setTransaccionId(evento.getTransaccionId());
                reservation.setMercadoPagoId(evento.getMercadoPagoId());
                reservation.setDateUpdated(LocalDateTime.now());
                return reservationRepository.save(reservation);
            })
            .doOnSuccess(reservation -> System.out.println("Pago rechazado para reserva " + reservaId))
            .doOnError(error -> System.err.println("Error al procesar rechazo de pago de reserva " + reservaId + ": " + error.getMessage()))
            .subscribe();
    }
}
