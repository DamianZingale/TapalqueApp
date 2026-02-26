package com.tapalque.msvc_pedidos.client;

import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.tapalque.msvc_pedidos.dto.DishPriceDTO;
import com.tapalque.msvc_pedidos.dto.RestaurantWhatsappDTO;

import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
public class GastronomiaClient {

    private final RestTemplate restTemplate;

    public GastronomiaClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Obtiene la configuración de WhatsApp de un restaurante.
     * GET /gastronomia/restaurante/findById/{restaurantId}
     */
    public Mono<RestaurantWhatsappDTO> fetchWhatsappConfig(String restaurantId) {
        return Mono.fromCallable(() -> {
            try {
                Long id = Long.parseLong(restaurantId);
                return restTemplate.getForObject(
                    "http://msvc-gastronomia/gastronomia/restaurante/findById/" + id,
                    RestaurantWhatsappDTO.class
                );
            } catch (Exception e) {
                System.err.println("Error al obtener config WhatsApp del restaurante " + restaurantId + ": " + e.getMessage());
                return null;
            }
        }).subscribeOn(Schedulers.boundedElastic());
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
