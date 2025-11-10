package com.tapalque.msvc_pedidos.repository;

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

}
