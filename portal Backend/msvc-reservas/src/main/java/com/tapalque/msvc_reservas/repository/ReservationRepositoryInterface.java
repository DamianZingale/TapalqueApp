package com.tapalque.msvc_reservas.repository;

import java.time.LocalDateTime;

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
}
