package com.tapalque.msvc_pedidos.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableRabbit
public class RabbitMQConfig {

    public static final String QUEUE_PEDIDOS = "pagos.pedidos";
    public static final String QUEUE_GASTRONOMIA = "pagos-gastronomia-queue";
    public static final String EXCHANGE_PEDIDOS = "pedido-exchange";

    @Bean
    public Queue pedidosQueue() {
        return new Queue(QUEUE_PEDIDOS, true);
    }

    @Bean
    public Queue gastronomiaQueue() {
        return new Queue(QUEUE_GASTRONOMIA, true);
    }

    @Bean
    public TopicExchange pedidoExchange() {
        return new TopicExchange(EXCHANGE_PEDIDOS);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}