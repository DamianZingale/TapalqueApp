package com.tapalque.msvc_pedidos.config;

import org.springframework.amqp.core.Queue;
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

    @Bean
    public Queue pedidosQueue() {
        return new Queue(QUEUE_PEDIDOS, true);
    }

    @Bean
    public Queue gastronomiaQueue() {
        return new Queue(QUEUE_GASTRONOMIA, true);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}