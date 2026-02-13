package com.tapalque.msvc_reservas.service;

import java.time.LocalDateTime;

import com.tapalque.msvc_reservas.dto.PagoEventoDTO;
import com.tapalque.msvc_reservas.dto.ReservationDTO;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReservationService {

    Mono<ReservationDTO> createReservation(ReservationDTO reservationDto);
    public Flux<ReservationDTO> getReservationById(String id);
    public Mono<ReservationDTO> updateReservation(ReservationDTO reservationDto);
    public Mono<Void> deleteReservation(String id);
    public Flux<ReservationDTO> getReservationsByHotel(String hotelId);
    public Flux<ReservationDTO> getReservationsByCustomer(String customerId);
    public void cleanUnpaidReservations();

    // Filtrado por fechas (fecha de creación)
    public Flux<ReservationDTO> getReservationsByHotelAndDateRange(
            String hotelId, LocalDateTime desde, LocalDateTime hasta);
    public Flux<ReservationDTO> getReservationsByCustomerAndDateRange(
            String customerId, LocalDateTime desde, LocalDateTime hasta);

    // Reservas activas cuya estadía se solapa con un rango de fechas
    public Flux<ReservationDTO> getReservationsByHotelAndStayOverlap(
            String hotelId, LocalDateTime desde, LocalDateTime hasta);

    // Igual que la anterior pero incluye reservas pendientes de pago (bloqueo temporal)
    public Flux<ReservationDTO> getReservationsByHotelAndStayOverlapIncludingPending(
            String hotelId, LocalDateTime desde, LocalDateTime hasta);

    // Métodos para RabbitMQ - confirmación de pagos
    void confirmarPagoReserva(String reservaId, PagoEventoDTO evento);
    void rechazarPagoReserva(String reservaId, PagoEventoDTO evento);
    void marcarPagoPendienteReserva(String reservaId, PagoEventoDTO evento);
}
