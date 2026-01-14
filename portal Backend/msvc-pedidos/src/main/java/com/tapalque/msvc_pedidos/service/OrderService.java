package com.tapalque.msvc_pedidos.service;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.tapalque.msvc_pedidos.dto.OrderDTO;
import com.tapalque.msvc_pedidos.dto.PagoEventoDTO;
import com.tapalque.msvc_pedidos.entity.Order;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public interface OrderService {

    Mono<OrderDTO> createOrder(@NonNull OrderDTO order);

    Mono<Order> updateOrder(@NonNull OrderDTO order);

    Mono<Order> getOrderById(@NonNull String id);

    Flux<Order> getOrdersByRestaurant(@NonNull String restaurantId);

    Flux<Order> getOrdersByUser(@NonNull String userId);

    Mono<Void> deleteOrder(@NonNull String id);

    // limpieza de pedidos no pagados
    void cleanUnpaidOrders();

    // Métodos para RabbitMQ - confirmación de pagos
    void confirmarPagoPedido(@NonNull String pedidoId, @NonNull PagoEventoDTO evento);

    void rechazarPagoPedido(@NonNull String pedidoId, @NonNull PagoEventoDTO evento);

}
