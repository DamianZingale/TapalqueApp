package com.tapalque.msvc_reservas.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.msvc_reservas.client.HospedajeClient;
import com.tapalque.msvc_reservas.dto.HabitacionDTO;
import com.tapalque.msvc_reservas.service.ReservationService;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/disponibilidad")
public class AvailabilityController {

    private static final System.Logger logger = System.getLogger(AvailabilityController.class.getName());

    private final HospedajeClient hospedajeClient;
    private final ReservationService reservationService;

    public AvailabilityController(HospedajeClient hospedajeClient, ReservationService reservationService) {
        this.hospedajeClient = hospedajeClient;
        this.reservationService = reservationService;
    }

    /**
     * Retorna las habitaciones libres de un hospedaje para un rango de fechas.
     * Combina reactivamente:
     *   - habitaciones desde msvc-hosteleria (WebClient)
     *   - reservas solapadas desde MongoDB (Flux.count)
     * Habitaciones libres = disponibles - ocupadas
     */
    @GetMapping("/{hotelId}")
    public Mono<List<HabitacionDTO>> getDisponibilidad(
            @PathVariable String hotelId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

        // Alineado a check-in 13:00 / check-out 10:00
        LocalDateTime desdeDateTime = desde.atTime(13, 0);
        LocalDateTime hastaDateTime = hasta.atTime(10, 0);

        Mono<List<HabitacionDTO>> habitacionesMono = hospedajeClient.fetchHabitaciones(hotelId);
        Mono<Long> ocupadasMono = reservationService
                .getReservationsByHotelAndStayOverlap(hotelId, desdeDateTime, hastaDateTime)
                .count();

        return Mono.zip(habitacionesMono, ocupadasMono)
                .map(tuple -> {
                    List<HabitacionDTO> disponibles = tuple.getT1().stream()
                            .filter(h -> Boolean.TRUE.equals(h.getDisponible()))
                            .toList();
                    long ocupadas = tuple.getT2();
                    int cantLibres = (int) Math.max(0, disponibles.size() - ocupadas);
                    return disponibles.subList(0, cantLibres);
                })
                .onErrorResume(e -> {
                    logger.log(System.Logger.Level.ERROR, () -> "Error en disponibilidad para hotel " + hotelId + ": " + e.getMessage());
                    return Mono.just(List.of());
                });
    }
}
