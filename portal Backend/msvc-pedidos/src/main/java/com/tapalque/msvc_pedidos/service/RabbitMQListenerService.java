package com.tapalque.msvc_pedidos.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import com.tapalque.msvc_pedidos.entity.Order;
import com.tapalque.msvc_pedidos.entity.Order.OrderStatus;
import com.tapalque.msvc_pedidos.repository.OrderRepository;

import reactor.core.publisher.Mono;

@Service
public class RabbitMQListenerService {

    private final OrderRepository orderRepository;

    public RabbitMQListenerService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @RabbitListener(queues = "pagos-gastronomia-queue")
    public void recibirPago(Map<String, Object> mensaje) {
        System.out.println("Pago recibido en msvc-pedidos: " + mensaje);

        String id = mensaje.get("idTransaccion").toString();
        Double monto = Double.valueOf(mensaje.get("monto").toString());

        orderRepository.findById(id)
            .flatMap(order -> {
                // Si existe, actualizar
                order.setStatus(OrderStatus.PAID);
                order.setPaidWithMercadoPago(true);
                order.setDateUpdated(LocalDateTime.now());
                return orderRepository.save(order)
                        .doOnSuccess(o -> System.out.println("Orden actualizada como pagada: " + o.getId()));
            })
            .switchIfEmpty(
                // Si no existe, crear nueva
                Mono.defer(() -> {
                    Order nueva = new Order();
                    nueva.setId(id);
                    nueva.setTotalPrice(monto);
                    nueva.setPaidWithMercadoPago(true);
                    nueva.setPaidWithCash(false);
                    nueva.setStatus(OrderStatus.PAID);
                    nueva.setDateCreated(LocalDateTime.now());
                    nueva.setDateUpdated(LocalDateTime.now());
                    return orderRepository.save(nueva)
                            .doOnSuccess(o -> System.out.println("Nueva orden guardada: " + o.getId()));
                })
            )
            .doOnError(e -> {
                System.err.println("Error procesando mensaje de RabbitMQ: " + e.getMessage());
                e.printStackTrace();
            })
            .subscribe(); // Ejecuta la operación reactiva
    }
}
