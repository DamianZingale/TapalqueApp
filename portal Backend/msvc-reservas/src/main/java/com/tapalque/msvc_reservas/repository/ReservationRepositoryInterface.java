package com.tapalque.msvc_reservas.repository;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;

import com.tapalque.msvc_reservas.entity.Reservation;

import reactor.core.publisher.Flux;

@Repository
public interface ReservationRepositoryInterface extends ReactiveMongoRepository<Reservation, String> {

    public void deleteAllByPayment_IsPaidFalse();
    public Flux<Reservation> findByHotel_HotelId(String hotelId);
    public Flux<Reservation>findByCustomer_CustomerId(String customerId);
}
