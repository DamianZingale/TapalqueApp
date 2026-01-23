package com.tapalque.msvc_reservas.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Objects;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.mongodb.lang.NonNull;
import com.tapalque.msvc_reservas.dto.ReservationDTO;
import com.tapalque.msvc_reservas.service.ReservationService;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;





@RestController
@RequestMapping("/reservations")
public class ReservationController {

    private final System.Logger logger = System.getLogger(ReservationController.class.getName());
    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping("/new")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ReservationDTO> createNewReservation(@RequestBody ReservationDTO entity) {
        Objects.requireNonNull(entity, "Entity cannot be null");
        
        return reservationService.createReservation(entity)
            .onErrorResume(e -> {
                logger.log(System.Logger.Level.ERROR, "Error creating reservation: " + e.getMessage());
                return Mono.empty();
            });
    }

    @GetMapping("/by-id/{id}")
    public Flux<ReservationDTO> getReservationById(@NonNull @PathVariable String id)  {
    return reservationService.getReservationById(id)
            .onErrorResume(e -> {
                logger.log(System.Logger.Level.ERROR, "Error fetching reservation by ID: " + e.getMessage());
                return Flux.empty();
            });
}

    @PutMapping("update/{id}")
    public Mono<ReservationDTO> updateReserv(@PathVariable String id, @RequestBody ReservationDTO entity) {
        Objects.requireNonNull(id, "ID cannot be null");
            return reservationService.updateReservation(entity)
            .onErrorResume(e ->{
                logger.log(System.Logger.Level.ERROR, "Error updating reservation: " + e.getMessage());
                return Mono.empty();
            });
        
    }

    @DeleteMapping("/delete/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteReservation(@PathVariable String id) {
        Objects.requireNonNull(id, "ID cannot be null");
        return reservationService.deleteReservation(id)
            .onErrorResume(e -> {
                logger.log(System.Logger.Level.ERROR, "Error deleting reservation: " + e.getMessage());
                return Mono.empty();
            });
}


    @GetMapping("/by-hotel/{hotelId}")
    public Flux<ReservationDTO> getReservationsByHotel(
            @PathVariable String hotelId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        Objects.requireNonNull(hotelId, "Hotel ID cannot be null");

        if (desde != null && hasta != null) {
            LocalDateTime desdeDateTime = desde.atStartOfDay();
            LocalDateTime hastaDateTime = hasta.atTime(LocalTime.MAX);
            return reservationService.getReservationsByHotelAndDateRange(hotelId, desdeDateTime, hastaDateTime)
                .onErrorResume(e -> {
                    logger.log(System.Logger.Level.ERROR, "Error fetching reservations by hotel and date range: " + e.getMessage());
                    return Flux.empty();
                });
        }

        return reservationService.getReservationsByHotel(hotelId)
            .onErrorResume(e -> {
                logger.log(System.Logger.Level.ERROR, "Error fetching reservations by hotel: " + e.getMessage());
                return Flux.empty();
            });
    }

    @GetMapping("/by-customer/{customerId}")
    public Flux<ReservationDTO> getReservationsByCustomer(
            @PathVariable String customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        Objects.requireNonNull(customerId, "Customer ID cannot be null");

        if (desde != null && hasta != null) {
            LocalDateTime desdeDateTime = desde.atStartOfDay();
            LocalDateTime hastaDateTime = hasta.atTime(LocalTime.MAX);
            return reservationService.getReservationsByCustomerAndDateRange(customerId, desdeDateTime, hastaDateTime)
                .onErrorResume(e -> {
                    logger.log(System.Logger.Level.ERROR, "Error fetching reservations by customer and date range: " + e.getMessage());
                    return Flux.empty();
                });
        }

        return reservationService.getReservationsByCustomer(customerId)
            .onErrorResume(e -> {
                logger.log(System.Logger.Level.ERROR, "Error fetching reservations by customer: " + e.getMessage());
                return Flux.empty();
            });
    }

}