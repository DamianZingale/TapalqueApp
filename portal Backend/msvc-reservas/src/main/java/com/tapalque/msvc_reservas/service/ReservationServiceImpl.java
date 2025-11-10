package com.tapalque.msvc_reservas.service;

import java.time.LocalDateTime;
import java.util.Objects;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.tapalque.msvc_reservas.dto.ReservationDTO;
import com.tapalque.msvc_reservas.entity.Reservation;
import com.tapalque.msvc_reservas.maper.dto.ReservationMapper;
import com.tapalque.msvc_reservas.repository.ReservationRepositoryInterface;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepositoryInterface reservationRepository;

    public ReservationServiceImpl(ReservationRepositoryInterface reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    @Override
    public Mono<ReservationDTO> createReservation(ReservationDTO reservationDto) {
        // Mapeo DTO -> Entity usando método estático
        Reservation reservation = ReservationMapper.toEntity(reservationDto);
        reservation.setDateCreated(LocalDateTime.now());
        reservation.setDateUpdated(LocalDateTime.now());

        // Guardamos en Mongo y mapeamos de nuevo a DTO para devolver
        return reservationRepository.save(reservation)
                .map(ReservationMapper::toDto);
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
            .map(ReservationMapper::toDto);
}

    @Override
    public Mono<Void> deleteReservation(String id) {
        return Objects.requireNonNull(reservationRepository.deleteById(id), "id cant be null");
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
    public Flux<ReservationDTO> getReservationsByCustomer(String customerId) {
        return reservationRepository.findByCustomer_CustomerId(customerId).map(ReservationMapper::toDto);
    }
}
