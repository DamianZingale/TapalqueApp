package com.tapalque.mercado_pago.configuracion;


import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    // Cola para mensajes a Mercado Pago
    @Bean
    public Queue mercadoPagoQueue() {
        return new Queue("mercado-pago-queue", true);
    }

    // Exchange usado por el servicio de pedidos
    @Bean
    public TopicExchange pedidoExchange() {
        return new TopicExchange("pedido-exchange");
    }

    // Binding: une el exchange con la cola usando una routing key
    @Bean
    public Binding binding(Queue mercadoPagoQueue, TopicExchange pedidoExchange) {
        return BindingBuilder
                .bind(mercadoPagoQueue)
                .to(pedidoExchange)
                .with("mercado-pago");
    }
}