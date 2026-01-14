package com.tapalque.mercado_pago.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "pagos.exchange";
    public static final String QUEUE_PEDIDOS = "pagos.pedidos";
    public static final String QUEUE_RESERVAS = "pagos.reservas";
    public static final String ROUTING_KEY_PEDIDOS = "pago.pedido";
    public static final String ROUTING_KEY_RESERVAS = "pago.reserva";

    @Bean
    public DirectExchange pagosExchange() {
        return new DirectExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue pedidosQueue() {
        return new Queue(QUEUE_PEDIDOS, true); // durable
    }

    @Bean
    public Queue reservasQueue() {
        return new Queue(QUEUE_RESERVAS, true); // durable
    }

    @Bean
    public Binding bindingPedidos() {
        return BindingBuilder
            .bind(pedidosQueue())
            .to(pagosExchange())
            .with(ROUTING_KEY_PEDIDOS);
    }

    @Bean
    public Binding bindingReservas() {
        return BindingBuilder
            .bind(reservasQueue())
            .to(pagosExchange())
            .with(ROUTING_KEY_RESERVAS);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
