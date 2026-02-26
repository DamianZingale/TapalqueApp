package com.tapalque.msvc_pedidos.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.tapalque.msvc_pedidos.client.GastronomiaClient;
import com.tapalque.msvc_pedidos.client.MercadoPagoClient;
import com.tapalque.msvc_pedidos.dto.ItemDTO;
import com.tapalque.msvc_pedidos.dto.OrderDTO;
import com.tapalque.msvc_pedidos.dto.PagoEventoDTO;
import com.tapalque.msvc_pedidos.dto.RestaurantDTO;
import com.tapalque.msvc_pedidos.entity.Order;
import com.tapalque.msvc_pedidos.repository.OrderRepository;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;


@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final RabbitTemplate rabbitTemplate;
    private final AdminNotificationService adminNotificationService;
    private final GastronomiaClient gastronomiaClient;
    private final MercadoPagoClient mercadoPagoClient;


    @Value("${rabbitmq.exchange}")
    private String orderExchange;

    @Value("${rabbitmq.routingKey.mercado.pago}")
    private String routingKeyMercadoPago;

    public OrderServiceImpl(OrderRepository orderRepository, RabbitTemplate rabbitTemplate,
                            AdminNotificationService adminNotificationService,
                            GastronomiaClient gastronomiaClient,
                            MercadoPagoClient mercadoPagoClient) {
        this.orderRepository = orderRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.adminNotificationService = adminNotificationService;
        this.gastronomiaClient = gastronomiaClient;
        this.mercadoPagoClient = mercadoPagoClient;
    }

    @Override
    public Mono<OrderDTO> createOrder(@NonNull OrderDTO orderDto) {
        if (orderDto.getItems() == null || orderDto.getItems().isEmpty()) {
            return Mono.error(new IllegalArgumentException("El pedido debe contener al menos un ítem"));
        }

        // Validar y recalcular precio de cada ítem desde msvc-gastronomia
        List<ItemDTO> items = orderDto.getItems();
        return Flux.fromIterable(items)
            .flatMap(item -> {
                if (item.getProductId() == null) {
                    return Mono.error(new IllegalArgumentException("Ítem sin productId"));
                }
                Long dishId;
                try {
                    dishId = Long.parseLong(item.getProductId());
                } catch (NumberFormatException e) {
                    return Mono.error(new IllegalArgumentException("productId inválido: " + item.getProductId()));
                }
                return gastronomiaClient.getDishById(dishId)
                    .map(dish -> {
                        if (Boolean.FALSE.equals(dish.getAvailable())) {
                            throw new IllegalArgumentException("Plato no disponible: " + item.getItemName());
                        }
                        // Sobreescribir precio con el valor real de la BD
                        item.setItemPrice(dish.getPrice());
                        return item;
                    });
            })
            .collectList()
            .flatMap(validatedItems -> {
                // Recalcular total desde precios verificados
                double realTotal = validatedItems.stream()
                    .mapToDouble(i -> i.getItemPrice() * i.getItemQuantity())
                    .sum();

                Order order = mapToEntity(orderDto);
                order.setTotalPrice(realTotal);
                order.setDateCreated(LocalDateTime.now());
                order.setDateUpdated(LocalDateTime.now());

                return orderRepository.save(order)
                    .flatMap(savedOrder ->
                        Mono.fromCallable(() -> {
                            rabbitTemplate.convertAndSend(
                                orderExchange,
                                routingKeyMercadoPago,
                                Map.of(
                                    "idPedido", savedOrder.getId(),
                                    "monto", savedOrder.getTotalPrice(),
                                    "fecha", savedOrder.getDateCreated().toString()
                                )
                            );

                            // Solo notificar al admin si paga en efectivo (al recibir).
                            // Los pagos con MercadoPago se notifican cuando el pago es confirmado
                            // (ver confirmarPagoPedido).
                            if (Boolean.TRUE.equals(savedOrder.getPaidWithCash())) {
                                adminNotificationService.notificarNuevoPedido(savedOrder);
                            }

                            return mapToDTO(savedOrder);
                        })
                        .subscribeOn(Schedulers.boundedElastic())
                    );
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
    public Flux<Order> getOrdersByRestaurantAndDateRange(
            @NonNull String restaurantId,
            @NonNull LocalDateTime desde,
            @NonNull LocalDateTime hasta) {
        return orderRepository.findByRestaurant_RestaurantIdAndDateCreatedBetween(
                restaurantId, desde, hasta);
    }

    @Override
    public Flux<Order> getOrdersByUserAndDateRange(
            @NonNull String userId,
            @NonNull LocalDateTime desde,
            @NonNull LocalDateTime hasta) {
        return orderRepository.findByUserIdAndDateCreatedBetween(userId, desde, hasta);
    }

    @Override
    public Mono<Void> deleteOrder(@NonNull String id) {
        return orderRepository.findById(id)
                .flatMap(order -> {
                    order.setStatus(Order.OrderStatus.FAILED);
                    order.setDateUpdated(LocalDateTime.now());
                    return orderRepository.save(order);
                })
                .doOnSuccess(order -> {
                    if (order != null) {
                        // Notificar al admin del restaurante y al usuario que hizo el pedido
                        adminNotificationService.notificarPedidoActualizado(order);
                        adminNotificationService.notificarUsuarioPedidoActualizado(order);
                        // Si pagó con Mercado Pago, iniciar reembolso automático
                        if (Boolean.TRUE.equals(order.getPaidWithMercadoPago()) && order.getMercadoPagoId() != null) {
                            mercadoPagoClient.reembolsar(order.getMercadoPagoId())
                                    .doOnSuccess(v -> System.out.println("Reembolso automático iniciado para pedido " + order.getId()))
                                    .doOnError(e -> System.err.println("Error al reembolsar pedido " + order.getId() + ": " + e.getMessage()))
                                    .subscribe();
                        }
                    }
                })
                .then();
    }

    @Override
    public Mono<Order> updateOrderStatus(@NonNull String id, @NonNull String status) {
        return orderRepository.findById(id)
            .flatMap(order -> {
                order.setStatus(Order.OrderStatus.valueOf(status.toUpperCase()));
                order.setDateUpdated(LocalDateTime.now());
                return orderRepository.save(order);
            })
            .doOnSuccess(order -> {
                if (order != null) {
                    adminNotificationService.notificarPedidoActualizado(order);
                    adminNotificationService.notificarUsuarioPedidoActualizado(order);
                }
            });
    }

    @Override
    @Scheduled(cron = "0 0 3 * * ?") // limpieza automática a las 3AM
    public void cleanUnpaidOrders() {
        // Solo borrar pedidos de MercadoPago que nunca se pagaron (no tocar pedidos de efectivo)
        orderRepository.findAll()
            .filter(order -> Boolean.TRUE.equals(order.getPaidWithMercadoPago()) == false
                    && Boolean.TRUE.equals(order.getPaidWithCash()) == false
                    && order.getStatus() == Order.OrderStatus.RECIBIDO
                    && order.getDateCreated().plusHours(24).isBefore(LocalDateTime.now()))
            .flatMap(order -> orderRepository.deleteById(order.getId()))
            .subscribe();
    }

    @Override
    @Scheduled(cron = "0 0 3 * * ?") // limpieza de pedidos pagados con más de 3 meses, 3AM diario
    public void cleanOldPaidOrders() {
        LocalDateTime tresMesesAtras = LocalDateTime.now().minusMonths(3);
        orderRepository.findAll()
            .filter(order -> (Boolean.TRUE.equals(order.getPaidWithMercadoPago())
                              || Boolean.TRUE.equals(order.getPaidWithCash()))
                             && order.getDateCreated().isBefore(tresMesesAtras))
            .flatMap(order -> orderRepository.deleteById(order.getId()))
            .subscribe();
    }

    @Override
    public void confirmarPagoPedido(@NonNull String pedidoId, @NonNull PagoEventoDTO evento) {
        orderRepository.findById(pedidoId)
            .flatMap(order -> {
                order.setStatus(Order.OrderStatus.RECIBIDO);
                order.setPaidWithMercadoPago(true);
                order.setTransaccionId(evento.getTransaccionId());
                order.setMercadoPagoId(evento.getMercadoPagoId());
                order.setFechaPago(evento.getFechaPago());
                order.setDateUpdated(LocalDateTime.now());
                return orderRepository.save(order);
            })
            .doOnSuccess(order -> {
                System.out.println("Pedido " + pedidoId + " confirmado como PAGADO");
                if (order != null) {
                    adminNotificationService.notificarNuevoPedido(order);
                }
            })
            .doOnError(error -> System.err.println("Error al confirmar pago del pedido " + pedidoId + ": " + error.getMessage()))
            .subscribe();
    }

    @Override
    public void rechazarPagoPedido(@NonNull String pedidoId, @NonNull PagoEventoDTO evento) {
        orderRepository.findById(pedidoId)
            .flatMap(order -> {
                order.setStatus(Order.OrderStatus.RECIBIDO); // Mantener como recibido para reintentar pago
                order.setPaidWithMercadoPago(false);
                order.setTransaccionId(evento.getTransaccionId());
                order.setMercadoPagoId(evento.getMercadoPagoId());
                order.setDateUpdated(LocalDateTime.now());
                return orderRepository.save(order);
            })
            .doOnSuccess(order -> System.out.println("Pago rechazado para pedido " + pedidoId))
            .doOnError(error -> System.err.println("Error al procesar rechazo de pago del pedido " + pedidoId + ": " + error.getMessage()))
            .subscribe();
    }

    @Override
    public void marcarPagoPendientePedido(@NonNull String pedidoId, @NonNull PagoEventoDTO evento) {
        orderRepository.findById(pedidoId)
            .flatMap(order -> {
                order.setTransaccionId(evento.getTransaccionId());
                order.setMercadoPagoId(evento.getMercadoPagoId());
                order.setDateUpdated(LocalDateTime.now());
                return orderRepository.save(order);
            })
            .doOnSuccess(order -> System.out.println("Pago pendiente para pedido " + pedidoId))
            .doOnError(error -> System.err.println("Error al procesar pago pendiente del pedido " + pedidoId + ": " + error.getMessage()))
            .subscribe();
    }

    // mapeos
    private Order mapToEntity(OrderDTO dto) {
        Order order = new Order();

        // Campos básicos
        order.setId(dto.getId());
        order.setUserId(dto.getUserId());
        order.setUserName(dto.getUserName());
        order.setUserPhone(dto.getUserPhone());
        order.setTotalPrice(dto.getTotalPrice());
        order.setPaidWithMercadoPago(dto.getPaidWithMercadoPago());
        order.setPaidWithCash(dto.getPaidWithCash());
        order.setStatus(dto.getStatus() != null
            ? Order.OrderStatus.valueOf(dto.getStatus().toUpperCase())
            : Order.OrderStatus.RECIBIDO);

        // Delivery
        order.setIsDelivery(dto.getIsDelivery());
        order.setDeliveryAddress(dto.getDeliveryAddress());

        // Items
        order.setItems(dto.getItems().stream()
            .map(i -> new Order.Item(
                i.getProductId(),
                i.getItemName(),
                i.getItemPrice(),
                i.getItemQuantity(),
                i.getNotas()))
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
        dto.setUserId(order.getUserId());
        dto.setUserName(order.getUserName());
        dto.setUserPhone(order.getUserPhone());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setPaidWithMercadoPago(order.getPaidWithMercadoPago());
        dto.setPaidWithCash(order.getPaidWithCash());
        dto.setStatus(order.getStatus().name());
        dto.setDateCreated(order.getDateCreated());
        dto.setDateUpdated(order.getDateUpdated());

        // Delivery
        dto.setIsDelivery(order.getIsDelivery());
        dto.setDeliveryAddress(order.getDeliveryAddress());

        // Items
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
