package com.tapalque.msvc_reservas.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
     *   - números de habitación ocupados desde MongoDB (por reservas solapadas)
     * Una habitación está libre si su número no coincide con ninguna reserva activa/pendiente.
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
        // Incluye reservas activas + pendientes de pago (bloqueo temporal de 5 min)
        // Obtiene los números de habitación ocupados para filtrar por habitación específica
        Mono<List<Integer>> numerosOcupadosMono = reservationService
                .getReservationsByHotelAndStayOverlapIncludingPending(hotelId, desdeDateTime, hastaDateTime)
                .map(r -> r.getRoomNumber())
                .filter(n -> n != null)
                .collectList();

        return Mono.zip(habitacionesMono, numerosOcupadosMono)
                .map(tuple -> {
                    List<HabitacionDTO> disponibles = tuple.getT1().stream()
                            .filter(h -> Boolean.TRUE.equals(h.getDisponible()))
                            .toList();
                    Set<Integer> numerosOcupados = new HashSet<>(tuple.getT2());
                    // Habitación libre si su número no está en el conjunto de ocupados.
                    // Habitaciones sin número asignado (numero == null) siempre se muestran.
                    return disponibles.stream()
                            .filter(h -> h.getNumero() == null || !numerosOcupados.contains(h.getNumero()))
                            .toList();
                })
                .onErrorResume(e -> {
                    logger.log(System.Logger.Level.ERROR, () -> "Error en disponibilidad para hotel " + hotelId + ": " + e.getMessage());
                    return Mono.just(List.of());
                });
    }
}
