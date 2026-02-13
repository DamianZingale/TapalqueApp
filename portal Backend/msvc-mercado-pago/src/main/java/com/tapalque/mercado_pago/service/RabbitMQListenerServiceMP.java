package com.tapalque.mercado_pago.service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.tapalque.mercado_pago.dto.ProductoRequestDTO;
import com.tapalque.mercado_pago.dto.TipoServicioEnum;

@Service
public class RabbitMQListenerServiceMP {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(RabbitMQListenerServiceMP.class);

    //===============RABBITMQ=================//
    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.routingKey.gastronomia}")
    private String routingKeyGastronomia;

    @Value("${rabbitmq.routingKey.hospedaje}")
    private String routingKeyHospedaje;
    
    @Autowired
    private final MercadoPagoService mercadoPagoService;

    public RabbitMQListenerServiceMP(MercadoPagoService mercadoPagoService) {
        this.mercadoPagoService = mercadoPagoService;
        this.rabbitTemplate = new RabbitTemplate();
    }

    @RabbitListener(queues = "mercado-pago-queue")
    public void listenPaymentRequests(Map<String, Object> message) {
        System.out.println("Mensaje recibido en Mercado Pago: " + message);
      
        try {
            // Extraer los datos del mensaje
            Long idTransaccion = Long.parseLong(message.get("idTransaccion").toString());
            Long idComprador = Long.parseLong(message.get("idComprador").toString());
            Long idVendedor = Long.parseLong(message.get("idVendedor").toString());
            TipoServicioEnum tipoServicio = TipoServicioEnum.valueOf(message.get("tipoServicio").toString());
            BigDecimal monto = new BigDecimal(message.get("monto").toString());
            String fecha = message.get("fecha").toString();

            // Crear DTO para enviar al servicio
            ProductoRequestDTO request = new ProductoRequestDTO();
            request.setIdTransaccion(String.valueOf(idTransaccion));
            request.setIdComprador(idComprador);
            request.setIdVendedor(idVendedor);
            request.setTipoServicio(tipoServicio);
            request.setUnitPrice(monto);

            // Llamar al servicio para crear la preferencia
            String initPoint = mercadoPagoService.crearPreferencia(request);
            logger.info("InitPoint recibido de Mercado Pago: " + initPoint);
            initPointToRabbitMQ(message, initPoint);

            

        } catch (Exception e) {
            System.err.println("Error procesando mensaje de RabbitMQ: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void initPointToRabbitMQ(Map<String, Object> message, String initPoint) {

        Map<String, Object> mensaje = Map.of(
        "messageType", "INIT_POINT",
        "idTransaccion", message.get("idTransaccion"),
        "idComprador", message.get("idComprador"),
        "idVendedor", message.get("idVendedor"),
        "estado", "PENDIENTE",
        "tipoServicio", message.get("tipoServicio"),
        "fecha", OffsetDateTime.now().toString(),
        "initPoint", initPoint // <-- URL de pago
    );

    // Envío según tipo de servicio
    if ("GASTRONOMIA".equalsIgnoreCase(message.get("tipoServicio").toString())) {
        rabbitTemplate.convertAndSend(exchange, routingKeyGastronomia, mensaje);
        logger.info("InitPoint enviado a msvc-gastronomico");
    } else if ("HOSPEDAJE".equalsIgnoreCase(message.get("tipoServicio").toString())) {
        rabbitTemplate.convertAndSend(exchange, routingKeyHospedaje, mensaje);
        logger.info("InitPoint enviado a msvc-hospedaje");
    } else {
        logger.warn("Tipo de servicio desconocido en metadata: " + message.get("tipoServicio").toString());
    }
            
        }
}
