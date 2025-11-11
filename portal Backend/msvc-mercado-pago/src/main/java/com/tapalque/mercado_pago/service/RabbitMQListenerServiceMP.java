package com.tapalque.mercado_pago.service;

import java.util.Map;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQListenerServiceMP {

    @RabbitListener(queues = "mercado-pago-queue")
    public void listenPaymentRequests(Map<String, Object> message) {
        System.out.println("Mensaje recibido en Mercado Pago: " + message);
        
        // Aquí iría la lógica para procesar el pago usando la información del mensaje


}

}
