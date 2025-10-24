package com.tapalque.msvc_pedidos.controller;

import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.msvc_pedidos.dto.ItemDTO;
import com.tapalque.msvc_pedidos.dto.OrderDTO;
import com.tapalque.msvc_pedidos.dto.RestaurantDTO;
import com.tapalque.msvc_pedidos.entity.Order;
import com.tapalque.msvc_pedidos.service.OrderService;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // --- Crear pedido ---
    @PostMapping ("new")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<OrderDTO> createOrder(@RequestBody OrderDTO orderDto) {
        Objects.requireNonNull(orderDto, "Order must not be null");
        return orderService.createOrder(orderDto);
    }

    // --- Obtener pedido por ID ---
    @GetMapping("/{id}")
    public Mono<OrderDTO> getOrderById(@PathVariable @NonNull String id) {
        return orderService.getOrderById(id).map(this::mapToDTO);
    }

    // --- Obtener pedidos por restaurante ---
    @GetMapping("/restaurant/{restaurantId}")
    public Flux<OrderDTO> getOrdersByRestaurant(@PathVariable @NonNull String restaurantId) {
        return orderService.getOrdersByRestaurant(restaurantId).map(this::mapToDTO);
    }

    // --- Obtener pedidos por usuario ---
    @GetMapping("/user/{userId}")
    public Flux<OrderDTO> getOrdersByUser(@PathVariable @NonNull String userId) {
        return orderService.getOrdersByUser(userId).map(this::mapToDTO);
    }

    // --- Actualizar pedido ---
    @PutMapping("/{id}")
    public Mono<OrderDTO> updateOrder(@PathVariable @NonNull String id, @RequestBody @NonNull OrderDTO orderDTO) {
        orderDTO.setId(id);
        return orderService.updateOrder(orderDTO).map(this::mapToDTO);
    }

    // --- Borrar pedido ---
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteOrder(@PathVariable @NonNull String id) {
        return orderService.deleteOrder(id);
    }

    // --- Mapeo DTO <-> Entity ---
    private OrderDTO mapToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setPaidWithMercadoPago(order.getPaidWithMercadoPago());
        dto.setPaidWithCash(order.getPaidWithCash());
        dto.setStatus(order.getStatus().name());
        dto.setDateCreated(order.getDateCreated());
        dto.setDateUpdated(order.getDateUpdated());
        dto.setItems(order.getItems().stream()
                .map(i -> {
                    var itemDto = new ItemDTO();
                    itemDto.setProductId(i.getProductId());
                    itemDto.setItemName(i.getItemName());
                    itemDto.setItemPrice(i.getItemPrice());
                    itemDto.setItemQuantity(i.getItemQuantity());
                    return itemDto;
                }).toList());
        var restaurantDto = new RestaurantDTO();
        restaurantDto.setRestaurantId(order.getRestaurant().getRestaurantId());
        restaurantDto.setRestaurantName(order.getRestaurant().getRestaurantName());
        dto.setRestaurant(restaurantDto);
        return dto;
    }

    @SuppressWarnings("unused")
    private Order mapToEntity(OrderDTO dto) {
        Order order = new Order();
        order.setTotalPrice(dto.getTotalPrice());
        order.setPaidWithMercadoPago(dto.getPaidWithMercadoPago());
        order.setPaidWithCash(dto.getPaidWithCash());
        order.setStatus(dto.getStatus() != null ? Order.OrderStatus.valueOf(dto.getStatus().toUpperCase()) : Order.OrderStatus.PENDING);
        order.setItems(dto.getItems().stream()
                .map(i -> new Order.Item(i.getProductId(), i.getItemName(), i.getItemPrice(), i.getItemQuantity()))
                .toList());
        var restaurant = new Order.Restaurant(dto.getRestaurant().getRestaurantId(), dto.getRestaurant().getRestaurantName());
        order.setRestaurant(restaurant);
        return order;
    }
}