package com.tapalque.msvc_pedidos.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import com.tapalque.msvc_pedidos.entity.Order.OrderStatus;
import com.tapalque.msvc_pedidos.repository.OrderRepository;

@Service
public class RabbitMQListenerService {

    private final OrderRepository orderRepository;

    public RabbitMQListenerService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @RabbitListener(queues = "pagos-gastronomia-queue")
    public void sendOrderCreatedMessage (Map<String, Object> mensaje) {


        String idTransaccion = mensaje.get("idTransaccion").toString();
        if (idTransaccion == null || idTransaccion.isEmpty()) {
            System.err.println("El mensaje no contiene un id-Transaccion válido.");
            return;
        }
        orderRepository.findById(idTransaccion)
            .flatMap(order -> {
                // Si existe, actualizar
                order.setStatus(OrderStatus.PAID);
                order.setPaidWithMercadoPago(true);
                order.setDateUpdated(LocalDateTime.now());
                return orderRepository.save(order)
                        .doOnSuccess(o -> System.out.println("Orden actualizada como pagada: " + o.getId()));
            })
           
            .doOnError(e -> {
                System.err.println("Error procesando mensaje de RabbitMQ: " + e.getMessage());
                e.printStackTrace();
            })
            .subscribe(); // Ejecuta la operación reactiva
    }
}
