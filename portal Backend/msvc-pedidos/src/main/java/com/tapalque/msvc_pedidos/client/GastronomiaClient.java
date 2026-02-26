package com.tapalque.msvc_pedidos.client;

import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.tapalque.msvc_pedidos.dto.DishPriceDTO;

import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
public class GastronomiaClient {

    private final RestTemplate restTemplate;

    public GastronomiaClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }


    /**
     * Obtiene el precio real de un plato desde msvc-gastronomia.
     * GET /gastronomia/menu/dish/{dishId}
     */
    public Mono<DishPriceDTO> getDishById(Long dishId) {
        return Mono.fromCallable(() -> {
            try {
                DishPriceDTO dish = restTemplate.getForObject(
                    "http://msvc-gastronomia/gastronomia/menu/dish/" + dishId,
                    DishPriceDTO.class
                );
                if (dish == null) {
                    throw new IllegalArgumentException("Plato no encontrado en gastronomía: " + dishId);
                }
                return dish;
            } catch (HttpClientErrorException e) {
                throw new IllegalArgumentException("Plato no encontrado en gastronomía: " + dishId);
            } catch (IllegalArgumentException e) {
                throw e;
            } catch (Exception e) {
                throw new RuntimeException("Error interno en msvc-gastronomia: " + e.getMessage());
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }
}
