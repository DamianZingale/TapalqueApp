package com.tapalque.mercado_pago.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tapalque.mercado_pago.config.RabbitMQConfig;
import com.tapalque.mercado_pago.dto.PagoEventoDTO;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PagoProducerService {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void enviarNotificacionPagoPedido(PagoEventoDTO evento) {
        try {
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_PAGOS,
                RabbitMQConfig.ROUTING_KEY_PEDIDOS,
                evento
            );
            log.info("Enviado evento de pago pedido ID: {}", evento.getReferenciaId());
        } catch (Exception e) {
            log.error("Error al enviar evento de pago pedido", e);
        }
    }

    public void enviarNotificacionPagoReserva(PagoEventoDTO evento) {
        try {
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_PAGOS,
                RabbitMQConfig.ROUTING_KEY_RESERVAS,
                evento
            );
            log.info("Enviado evento de pago reserva ID: {}", evento.getReferenciaId());
        } catch (Exception e) {
            log.error("Error al enviar evento de pago reserva", e);
        }
    }
}
