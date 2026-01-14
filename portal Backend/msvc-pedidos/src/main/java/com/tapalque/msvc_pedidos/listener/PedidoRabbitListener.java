package com.tapalque.msvc_pedidos.listener;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.tapalque.msvc_pedidos.dto.PagoEventoDTO;
import com.tapalque.msvc_pedidos.service.OrderService;

@Component
public class PedidoRabbitListener {

    @Autowired
    private OrderService orderService;

    @RabbitListener(queues = "pagos.pedidos")
    public void recibirPagoPedido(PagoEventoDTO evento) {
        try {
            System.out.println("Recibido evento de pago para pedido ID: " + evento.getReferenciaId());

            if ("APROBADO".equals(evento.getEstado())) {
                orderService.confirmarPagoPedido(evento.getReferenciaId().toString(), evento);
            } else if ("RECHAZADO".equals(evento.getEstado())) {
                orderService.rechazarPagoPedido(evento.getReferenciaId().toString(), evento);
            }

            System.out.println("Pedido ID " + evento.getReferenciaId() + " actualizado con estado: " + evento.getEstado());
        } catch (Exception e) {
            System.err.println("Error al procesar evento de pago pedido: " + e.getMessage());
            throw e; // Para reintento automático
        }
    }
}
