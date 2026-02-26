package com.tapalque.msvc_reservas.client;

import java.util.List;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.tapalque.msvc_reservas.dto.HabitacionDTO;

import reactor.core.publisher.Mono;

@Service
public class HospedajeClient {

    private final WebClient webClient;

    public HospedajeClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("lb://msvc-hosteleria").build();
    }

    public record HospedajeInfoDTO(String emailNotificacion, String titulo) {}

    /**
     * Trae el email de notificación del hospedaje.
     * GET /hospedajes/{id}
     */
    public Mono<HospedajeInfoDTO> fetchEmailNotificacion(String hospedajeId) {
        return webClient.get()
                .uri("/hospedajes/{id}", hospedajeId)
                .retrieve()
                .bodyToMono(HospedajeInfoDTO.class)
                .onErrorResume(e -> Mono.empty());
    }

    /**
     * Trae todas las habitaciones de un hospedaje desde msvc-hosteleria.
     * GET /habitaciones/hospedajes/{hospedajeId}
     */
    public Mono<List<HabitacionDTO>> fetchHabitaciones(String hospedajeId) {
        return webClient.get()
                .uri("/habitaciones/hospedajes/{id}", hospedajeId)
                .retrieve()
                .onStatus(status -> status.is4xxClientError(),
                        resp -> Mono.error(new RuntimeException("msvc-hosteleria: " + resp.statusCode())))
                .onStatus(status -> status.is5xxServerError(),
                        resp -> Mono.error(new RuntimeException("msvc-hosteleria error interno")))
                .bodyToMono(new ParameterizedTypeReference<List<HabitacionDTO>>() {})
                .defaultIfEmpty(List.of());
    }
}
