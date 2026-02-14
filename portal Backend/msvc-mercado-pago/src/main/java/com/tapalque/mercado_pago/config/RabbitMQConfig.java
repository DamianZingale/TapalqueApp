package com.tapalque.mercado_pago.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // ========== RECEPCIÓN: cola donde MP recibe solicitudes de pago ==========
    public static final String QUEUE_MERCADO_PAGO = "mercado-pago-queue";
    public static final String EXCHANGE_PEDIDO = "pedido-exchange";
    public static final String ROUTING_KEY_MP = "mercado-pago";

    @Bean
    public Queue mercadoPagoQueue() {
        return new Queue(QUEUE_MERCADO_PAGO, true);
    }

    @Bean
    public TopicExchange pedidoExchange() {
        return new TopicExchange(EXCHANGE_PEDIDO);
    }

    @Bean
    public Binding bindingMercadoPago() {
        return BindingBuilder
                .bind(mercadoPagoQueue())
                .to(pedidoExchange())
                .with(ROUTING_KEY_MP);
    }

    // ========== RESPUESTA initPoint: colas donde pedidos/reservas reciben initPoint ==========
    public static final String QUEUE_GASTRONOMIA = "pagos-gastronomia-queue";
    public static final String QUEUE_HOSPEDAJE = "pagos-hospedaje-queue";

    @Bean
    public Queue gastronomiaQueue() {
        return new Queue(QUEUE_GASTRONOMIA, true);
    }

    @Bean
    public Queue hospedajeQueue() {
        return new Queue(QUEUE_HOSPEDAJE, true);
    }

    @Bean
    public Binding bindingGastronomia() {
        return BindingBuilder
                .bind(gastronomiaQueue())
                .to(pedidoExchange())
                .with("pagos-gastronomia");
    }

    @Bean
    public Binding bindingHospedaje() {
        return BindingBuilder
                .bind(hospedajeQueue())
                .to(pedidoExchange())
                .with("pagos-hospedaje");
    }

    // ========== ENVÍO resultados de pago: exchange para notificar a pedidos/reservas ==========
    public static final String EXCHANGE_PAGOS = "pagos.exchange";
    public static final String QUEUE_PAGOS_PEDIDOS = "pagos.pedidos";
    public static final String QUEUE_PAGOS_RESERVAS = "pagos.reservas";
    public static final String ROUTING_KEY_PEDIDOS = "pago.pedido";
    public static final String ROUTING_KEY_RESERVAS = "pago.reserva";

    @Bean
    public DirectExchange pagosExchange() {
        return new DirectExchange(EXCHANGE_PAGOS);
    }

    @Bean
    public Queue pedidosQueue() {
        return new Queue(QUEUE_PAGOS_PEDIDOS, true);
    }

    @Bean
    public Queue reservasQueue() {
        return new Queue(QUEUE_PAGOS_RESERVAS, true);
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

    // ========== Serialización y template ==========
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
