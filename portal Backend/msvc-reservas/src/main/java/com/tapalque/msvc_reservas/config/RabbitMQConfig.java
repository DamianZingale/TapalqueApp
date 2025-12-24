package com.tapalque.msvc_reservas.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {


     
    @Bean
    public Queue queueHospedaje() {
        return new Queue("pagos-hospedaje-queue", true);
    }

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange("pagos-exchange");
    }



    @Bean
    public Binding bindingHospedaje(Queue queueHospedaje, TopicExchange exchange) {
        return BindingBuilder.bind(queueHospedaje).to(exchange).with("pagos.hospedaje");
    }
}

