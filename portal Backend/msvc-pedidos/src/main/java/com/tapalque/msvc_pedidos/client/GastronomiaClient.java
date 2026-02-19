package com.tapalque.msvc_pedidos.client;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.tapalque.msvc_pedidos.dto.DishPriceDTO;

import reactor.core.publisher.Mono;

@Service
public class GastronomiaClient {

    private final WebClient webClient;

    public GastronomiaClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("lb://msvc-gastronomia").build();
    }

    /**
     * Obtiene el precio real de un plato desde msvc-gastronomia.
     * GET /gastronomia/menu/dish/{dishId}
     */
    public Mono<DishPriceDTO> getDishById(Long dishId) {
        return webClient.get()
                .uri("/gastronomia/menu/dish/{id}", dishId)
                .retrieve()
                .onStatus(status -> status.is4xxClientError(),
                        resp -> Mono.error(new IllegalArgumentException("Plato no encontrado en gastronomía: " + dishId)))
                .onStatus(status -> status.is5xxServerError(),
                        resp -> Mono.error(new RuntimeException("Error interno en msvc-gastronomia")))
                .bodyToMono(DishPriceDTO.class);
    }
}
