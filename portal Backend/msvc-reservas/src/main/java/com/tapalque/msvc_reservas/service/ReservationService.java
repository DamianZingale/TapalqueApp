package com.tapalque.msvc_reservas.service;


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
}
