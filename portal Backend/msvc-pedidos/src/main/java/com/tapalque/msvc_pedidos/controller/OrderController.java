package com.tapalque.msvc_pedidos.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Objects;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.msvc_pedidos.dto.ItemDTO;
import com.tapalque.msvc_pedidos.dto.OrderDTO;
import com.tapalque.msvc_pedidos.dto.OrderStatusUpdateDTO;
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
    @PostMapping ("/new")
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

    // --- Obtener pedidos por restaurante (con filtro opcional de fechas) ---
    @GetMapping("/restaurant/{restaurantId}")
    public Flux<OrderDTO> getOrdersByRestaurant(
            @PathVariable @NonNull String restaurantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

        if (desde != null && hasta != null) {
            LocalDateTime desdeDateTime = Objects.requireNonNull(desde).atStartOfDay();
            LocalDateTime hastaDateTime = Objects.requireNonNull(hasta).atTime(LocalTime.MAX);
            return orderService.getOrdersByRestaurantAndDateRange(restaurantId, desdeDateTime, hastaDateTime)
                    .map(this::mapToDTO);
        }
        return orderService.getOrdersByRestaurant(restaurantId).map(this::mapToDTO);
    }

    // --- Obtener pedidos por usuario (con filtro opcional de fechas) ---
    @GetMapping("/user/{userId}")
    public Flux<OrderDTO> getOrdersByUser(
            @PathVariable @NonNull String userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

        if (desde != null && hasta != null) {
            LocalDateTime desdeDateTime = desde.atStartOfDay();
            LocalDateTime hastaDateTime = hasta.atTime(LocalTime.MAX);
            return orderService.getOrdersByUserAndDateRange(userId, desdeDateTime, hastaDateTime)
                    .map(this::mapToDTO);
        }
        return orderService.getOrdersByUser(userId).map(this::mapToDTO);
    }

    // --- Actualizar pedido ---
    @PutMapping("/{id}")
    public Mono<OrderDTO> updateOrder(@PathVariable @NonNull String id, @RequestBody @NonNull OrderDTO orderDTO) {
        return orderService.updateOrder(orderDTO).map(this::mapToDTO);
    }

    // --- Borrar pedido ---
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteOrder(@PathVariable @NonNull String id) {
        return orderService.deleteOrder(id);
    }

    // --- Actualizar estado del pedido ---
    @PatchMapping("/{id}/estado")
    public Mono<OrderDTO> updateOrderStatus(
            @PathVariable @NonNull String id,
            @RequestBody @NonNull OrderStatusUpdateDTO update) {
        return orderService.updateOrderStatus(id, update.getStatus()).map(this::mapToDTO);
    }

    // --- Mapeo DTO <-> Entity ---
    private OrderDTO mapToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUserId());
        dto.setUserName(order.getUserName());
        dto.setUserPhone(order.getUserPhone());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setPaidWithMercadoPago(order.getPaidWithMercadoPago());
        dto.setPaidWithCash(order.getPaidWithCash());
        dto.setStatus(order.getStatus().name());
        dto.setDateCreated(order.getDateCreated());
        dto.setDateUpdated(order.getDateUpdated());
        dto.setIsDelivery(order.getIsDelivery());
        dto.setDeliveryAddress(order.getDeliveryAddress());
        dto.setItems(order.getItems().stream()
                .map(i -> {
                    var itemDto = new ItemDTO();
                    itemDto.setProductId(i.getProductId());
                    itemDto.setItemName(i.getItemName());
                    itemDto.setItemPrice(i.getItemPrice());
                    itemDto.setItemQuantity(i.getItemQuantity());
                    itemDto.setNotas(i.getNotas());
                    return itemDto;
                }).toList());
        if (order.getRestaurant() != null) {
            var restaurantDto = new RestaurantDTO();
            restaurantDto.setRestaurantId(order.getRestaurant().getRestaurantId());
            restaurantDto.setRestaurantName(order.getRestaurant().getRestaurantName());
            dto.setRestaurant(restaurantDto);
        }
        return dto;
    }

    @SuppressWarnings("unused")
    private Order mapToEntity(OrderDTO dto) {
        Order order = new Order();
        order.setId(dto.getId());
        order.setUserId(dto.getUserId());
        order.setUserName(dto.getUserName());
        order.setUserPhone(dto.getUserPhone());
        order.setTotalPrice(dto.getTotalPrice());
        order.setPaidWithMercadoPago(dto.getPaidWithMercadoPago());
        order.setPaidWithCash(dto.getPaidWithCash());
        order.setStatus(dto.getStatus() != null ? Order.OrderStatus.valueOf(dto.getStatus().toUpperCase()) : Order.OrderStatus.RECIBIDO);
        order.setIsDelivery(dto.getIsDelivery());
        order.setDeliveryAddress(dto.getDeliveryAddress());
        order.setItems(dto.getItems().stream()
                .map(i -> new Order.Item(i.getProductId(), i.getItemName(), i.getItemPrice(), i.getItemQuantity(), i.getNotas()))
                .collect(java.util.stream.Collectors.toList()));
        if (dto.getRestaurant() != null) {
            var restaurant = new Order.Restaurant(dto.getRestaurant().getRestaurantId(), dto.getRestaurant().getRestaurantName());
            order.setRestaurant(restaurant);
        }
        return order;
    }
}