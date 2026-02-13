package com.tapalque.msvc_pedidos.repository;

import java.time.LocalDateTime;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;

import com.tapalque.msvc_pedidos.entity.Order;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface  OrderRepository extends ReactiveMongoRepository<Order, String> {

    // Pedidos de un restaurante
    Flux<Order> findByRestaurant_RestaurantId(String restaurantId);

    // Pedidos de un usuario
    Flux<Order> findByUserId(String userId);

    // Pedidos no pagados para limpieza
    Mono<Void> deleteByPaidWithMercadoPagoFalseAndPaidWithCashFalse();

    // Pedidos de un restaurante filtrados por fecha
    Flux<Order> findByRestaurant_RestaurantIdAndDateCreatedBetween(
            String restaurantId, LocalDateTime desde, LocalDateTime hasta);

    // Pedidos de un usuario filtrados por fecha
    Flux<Order> findByUserIdAndDateCreatedBetween(
            String userId, LocalDateTime desde, LocalDateTime hasta);

}
