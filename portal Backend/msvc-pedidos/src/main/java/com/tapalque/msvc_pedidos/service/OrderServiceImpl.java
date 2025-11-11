package com.tapalque.msvc_pedidos.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.tapalque.msvc_pedidos.dto.ItemDTO;
import com.tapalque.msvc_pedidos.dto.OrderDTO;
import com.tapalque.msvc_pedidos.dto.RestaurantDTO;
import com.tapalque.msvc_pedidos.entity.Order;
import com.tapalque.msvc_pedidos.repository.OrderRepository;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;


@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.pedido.exchange}")
    private String orderExchange;

    @Value("${rabbitmq.routingKey.mercado.pago}")
    private String routingKeyMercadoPago;

    public OrderServiceImpl(OrderRepository orderRepository, RabbitTemplate rabbitTemplate) {
        this.orderRepository = orderRepository;
        this.rabbitTemplate = rabbitTemplate;
    }
    
    @Override
    public Mono<OrderDTO> createOrder(@NonNull OrderDTO orderDto) {
    Order order = mapToEntity(orderDto);
    order.setDateCreated(LocalDateTime.now());
    order.setDateUpdated(LocalDateTime.now());

    return orderRepository.save(order)
        .map(savedOrder -> {
            rabbitTemplate.convertAndSend(
                orderExchange,  
                routingKeyMercadoPago,                      
                Map.of(
                    "idPedido", savedOrder.getId(),
                    "monto", savedOrder.getTotalPrice(),
                    "fecha", savedOrder.getDateCreated().toString()
                )
            );

            return mapToDTO(savedOrder);
        });
}

    @Override
    public Mono<Order> updateOrder(@NonNull OrderDTO orderDto) {
        Order order = mapToEntity(orderDto);
        order.setDateUpdated(LocalDateTime.now());
        return orderRepository.save(order);
    }

    @Override
    public Mono<Order> getOrderById(@NonNull String id) {
        return orderRepository.findById(id);
    }

    @Override
    public Flux<Order> getOrdersByRestaurant(@NonNull String restaurantId) {
        return orderRepository.findByRestaurant_RestaurantId(restaurantId);
    }

    @Override
    public Flux<Order> getOrdersByUser(@NonNull String userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    public Mono<Void> deleteOrder(@NonNull String id) {
        return orderRepository.deleteById(id);
    }

    @Override
    @Scheduled(cron = "0 0 3 * * ?") // limpieza automática a las 3AM
    public void cleanUnpaidOrders() {
        orderRepository.deleteByPaidWithMercadoPagoFalseAndPaidWithCashFalse()
            .subscribe();
    }
    // mapeos
    private Order mapToEntity(OrderDTO dto) {
    Order order = new Order();
    
    // Campos básicos
    order.setId(dto.getId()); // opcional si es creación nueva
    order.setTotalPrice(dto.getTotalPrice());
    order.setPaidWithMercadoPago(dto.getPaidWithMercadoPago());
    order.setPaidWithCash(dto.getPaidWithCash());
    order.setStatus(dto.getStatus() != null 
        ? Order.OrderStatus.valueOf(dto.getStatus().toUpperCase()) 
        : Order.OrderStatus.PENDING);

    // Items
    order.setItems(dto.getItems().stream()
        .map(i -> new Order.Item(
            i.getProductId(),
            i.getItemName(),
            i.getItemPrice(),
            i.getItemQuantity()))
        .toList());

    // Restaurant
    var restaurantDto = dto.getRestaurant();
    if (restaurantDto != null) {
        order.setRestaurant(new Order.Restaurant(
            restaurantDto.getRestaurantId(),
            restaurantDto.getRestaurantName()
        ));
    }

    return order;
}

    @SuppressWarnings("unused")
    private OrderDTO mapToDTO(Order order) {
    OrderDTO dto = new OrderDTO();
    
    dto.setId(order.getId());
    dto.setTotalPrice(order.getTotalPrice());
    dto.setPaidWithMercadoPago(order.getPaidWithMercadoPago());
    dto.setPaidWithCash(order.getPaidWithCash());
    dto.setStatus(order.getStatus().name());
    dto.setDateCreated(order.getDateCreated());
    dto.setDateUpdated(order.getDateUpdated());

    // Items
    dto.setItems(order.getItems().stream()
        .map(i -> {
            var itemDto = new ItemDTO();
            itemDto.setProductId(i.getProductId());
            itemDto.setItemName(i.getItemName());
            itemDto.setItemPrice(i.getItemPrice());
            itemDto.setItemQuantity(i.getItemQuantity());
            return itemDto;
        }).toList());

    // Restaurant
    if (order.getRestaurant() != null) {
        var restaurantDto = new RestaurantDTO();
        restaurantDto.setRestaurantId(order.getRestaurant().getRestaurantId());
        restaurantDto.setRestaurantName(order.getRestaurant().getRestaurantName());
        dto.setRestaurant(restaurantDto);
    }

    return dto;
}
}
