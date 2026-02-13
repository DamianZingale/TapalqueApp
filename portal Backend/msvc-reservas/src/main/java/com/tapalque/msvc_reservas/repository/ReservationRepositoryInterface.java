package com.tapalque.msvc_reservas.repository;

import java.time.LocalDateTime;

import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;

import com.tapalque.msvc_reservas.entity.Reservation;

import reactor.core.publisher.Flux;

@Repository
public interface ReservationRepositoryInterface extends ReactiveMongoRepository<Reservation, String> {

    public void deleteAllByPayment_IsPaidFalse();
    public Flux<Reservation> findByHotel_HotelId(String hotelId);
    public Flux<Reservation> findByCustomer_CustomerId(String customerId);

    // Reservas de un hotel filtradas por fecha de creación
    public Flux<Reservation> findByHotel_HotelIdAndDateCreatedBetween(
            String hotelId, LocalDateTime desde, LocalDateTime hasta);

    // Reservas de un cliente filtradas por fecha de creación
    public Flux<Reservation> findByCustomer_CustomerIdAndDateCreatedBetween(
            String customerId, LocalDateTime desde, LocalDateTime hasta);

    // Reservas activas cuya estadía se solapa con el rango [desde, hasta].
    // Solapamiento: checkInDate < hasta  Y  checkOutDate > desde
    @Query("{ 'hotel.hotelId': ?0, 'stayPeriod.checkInDate': { $lt: ?2 }, 'stayPeriod.checkOutDate': { $gt: ?1 }, 'isActive': true, 'isCancelled': false }")
    Flux<Reservation> findByHotelAndStayPeriodOverlap(String hotelId, LocalDateTime desde, LocalDateTime hasta);

    // Igual que la anterior pero también incluye reservas pendientes de pago (creadas hace menos de X minutos)
    // Esto bloquea temporalmente la habitación mientras el usuario completa el pago
    @Query("{ 'hotel.hotelId': ?0, 'stayPeriod.checkInDate': { $lt: ?2 }, 'stayPeriod.checkOutDate': { $gt: ?1 }, 'isCancelled': false, $or: [ { 'isActive': true }, { 'isActive': false, 'payment.isPaid': false, 'dateCreated': { $gte: ?3 } } ] }")
    Flux<Reservation> findByHotelAndStayPeriodOverlapIncludingPending(String hotelId, LocalDateTime desde, LocalDateTime hasta, LocalDateTime creadoDespuesDe);
}
