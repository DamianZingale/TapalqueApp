package com.tapalque.msvc_pedidos.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.tapalque.msvc_pedidos.entity.Order;

@Service
public class AdminNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public AdminNotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void notificarNuevoPedido(Order order) {
        String restaurantId = order.getRestaurant() != null
                ? order.getRestaurant().getRestaurantId()
                : null;
        if (restaurantId == null) return;

        messagingTemplate.convertAndSend(
                "/topic/pedidos/" + restaurantId,
                Map.of(
                        "type", "pedido:nuevo",
                        "payload", order,
                        "businessId", restaurantId,
                        "businessType", "GASTRONOMIA",
                        "timestamp", LocalDateTime.now().toString()
                )
        );
    }

    public void notificarPedidoActualizado(Order order) {
        String restaurantId = order.getRestaurant() != null
                ? order.getRestaurant().getRestaurantId()
                : null;
        if (restaurantId == null) return;

        messagingTemplate.convertAndSend(
                "/topic/pedidos/" + restaurantId,
                Map.of(
                        "type", "pedido:actualizado",
                        "payload", order,
                        "businessId", restaurantId,
                        "businessType", "GASTRONOMIA",
                        "timestamp", LocalDateTime.now().toString()
                )
        );
    }
}
