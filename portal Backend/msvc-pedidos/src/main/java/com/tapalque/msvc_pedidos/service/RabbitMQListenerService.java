package com.tapalque.msvc_pedidos.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import com.tapalque.msvc_pedidos.entity.Order.OrderStatus;
import com.tapalque.msvc_pedidos.repository.OrderRepository;

@Service
public class RabbitMQListenerService {

    private static final Logger logger = LoggerFactory.getLogger(RabbitMQListenerService.class);

    private final OrderRepository orderRepository;
    private final NotificationService notificacionService;

    public RabbitMQListenerService(OrderRepository orderRepository, NotificationService notificacionService) {
        this.orderRepository = orderRepository;
        this.notificacionService = notificacionService; 
    }

    @RabbitListener(queues = "pagos-gastronomia-queue")
    public void handlePaymentMessages(Map<String, Object> mensaje) {
        try {
            if (mensaje == null || mensaje.isEmpty()) {
                logger.warn("Mensaje vacío recibido desde RabbitMQ.");
                return;
            }

            String messageType = (String) mensaje.get("messageType");
            if (messageType == null) {
                logger.warn("Mensaje sin messageType: {}", mensaje);
                return;
            }

            switch (messageType) {
                case "INIT_POINT" -> handleInitPoint(mensaje);

                case "WEBHOOK" -> handleWebhook(mensaje);

                default -> logger.warn("Tipo de mensaje desconocido recibido: {}", messageType);
            }

        } catch (Exception e) {
            logger.error("Error procesando mensaje RabbitMQ: {}", e.getMessage(), e);
        }
    }

    private void handleInitPoint(Map<String, Object> mensaje) {
        String initPoint = (String) mensaje.get("initPoint");
        String clientId = (String) mensaje.get("idComprador");

        if (initPoint == null || clientId == null) {
            logger.warn("Mensaje INIT_POINT incompleto: {}", mensaje);
            return;
        }

        try {
            notificacionService.notificarInitPointAlUsuario(clientId, initPoint);
            logger.info("InitPoint enviado a cliente {}: {}", clientId, initPoint);
        } catch (Exception e) {
            logger.error("Error notificando initPoint al usuario {}: {}", clientId, e.getMessage(), e);
        }
    }

    private void handleWebhook(Map<String, Object> mensaje) {
        String idTransaccion = (String) mensaje.get("idTransaccion");
        String estado = (String) mensaje.get("estado");
        String clientId = (String) mensaje.get("idComprador");

        if (idTransaccion == null || estado == null || clientId == null) {
            logger.warn("Mensaje WEBHOOK incompleto: {}", mensaje);
            return;
        }

        orderRepository.findById(idTransaccion)
            .flatMap(order -> {
                switch (estado.toUpperCase()) {
                    case "APROBADO" -> {
                        order.setStatus(OrderStatus.PAID);
                        order.setPaidWithMercadoPago(true);
                }
                    case "RECHAZADO" -> order.setStatus(OrderStatus.FAILED);
                    default -> logger.warn("Estado desconocido en webhook: {}", estado);
                }
                order.setDateUpdated(LocalDateTime.now());

                try {
                    notificacionService.notificarEstadoPagoAlUsuario(clientId, estado);
                } catch (Exception e) {
                    logger.error("Error notificando estado de pago al usuario {}: {}", clientId, e.getMessage(), e);
                }

                return orderRepository.save(order)
                        .doOnSuccess(o -> logger.info("Orden actualizada: {}", o.getId()));
            })
            .doOnError(e -> logger.error("Error actualizando orden: {}", e.getMessage(), e))
            .subscribe();
    }
}