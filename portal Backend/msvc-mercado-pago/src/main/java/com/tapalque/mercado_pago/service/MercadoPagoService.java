package com.tapalque.mercado_pago.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import com.tapalque.mercado_pago.dto.OauthTokenRequestDTO;
import com.tapalque.mercado_pago.dto.ProductoRequestDTO;
import com.tapalque.mercado_pago.dto.WebhookDTO;
import com.tapalque.mercado_pago.repository.TransaccionRepository;
import com.tapalque.mercado_pago.util.EncriptadoUtil;

@Service
public class MercadoPagoService {

    private static final Logger logger = LoggerFactory.getLogger(MercadoPagoService.class);

    //===============RABBITMQ=================//
     private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.routingKey.gastronomia}")
    private String routingKeyGastronomia;

    @Value("${rabbitmq.routingKey.hospedaje}")
    private String routingKeyHospedaje;

    
    //=======================================//
    // @Value("${mercadopago.access-token}")
    // String accessToken;
    @Value("${clientId}")
    String clientId;

    @Value("${clientSecret}")
    String clientSecret;

    private final TransaccionRepository transaccionRepository;
    private final OauthService oauthService;
    private final EncriptadoUtil encriptadoUtil;

    public MercadoPagoService(TransaccionRepository t, OauthService o, EncriptadoUtil e, RabbitTemplate rabbitTemplate) {
        this.transaccionRepository = t;
        this.oauthService = o;
        this.encriptadoUtil = e;
        this.rabbitTemplate = rabbitTemplate;
    }

    

    // ===============CREAR PREFERENCIA===============
    public String crearPreferencia(ProductoRequestDTO p) throws Exception {
    
    logger.info("Creando preferencia para transaccion ID: " + p.getIdTransaccion());
    // Obtiene y desencripta el token del vendedor
    String accessTokenEncriptado = oauthService.obtenerAccessTokenPorId(p.getIdVendedor());
    String accessToken = encriptadoUtil.desencriptar(accessTokenEncriptado);

    // Verifica que el token no esté vencido o revocado
    if (!oauthService.AccessTokenValido(accessToken)) {
        logger.error("Access token vencido o revocado para vendedor ID: " + p.getIdVendedor());
        throw new RuntimeException("Access token vencido o revocado por el vendedor");
    }

    // Inicializa configuración de Mercado Pago
    MercadoPagoConfig.setAccessToken(accessToken);

    // Crea el ítem genérico
    PreferenceItemRequest item = PreferenceItemRequest.builder()
            .title("Solicitud de pago")
            .quantity(1)
            .currencyId("ARS")
            .unitPrice(p.getUnitPrice()) // monto total
            .build();

    
    OffsetDateTime now = OffsetDateTime.now();
    OffsetDateTime expirationFrom = now;
    OffsetDateTime expirationTo = now.plusMinutes(2);// Definir tiempo de validez del link (10-15 min en prod)

    // Arma la preferencia con los datos necesarios para el webhook
    PreferenceRequest preferenceRequest = PreferenceRequest.builder()
            .items(List.of(item))
            .externalReference(p.getIdTransaccion().toString()) // ID del otro microservicio
            .metadata(Map.of(
                "clientId", p.getIdComprador().toString(),
                "vendedorId", Long.toString(p.getIdVendedor()),
                "tipoServicio", p.getTipoServicio()
            ))
            .expires(true)
            .expirationDateFrom(expirationFrom)
            .expirationDateTo(expirationTo)
            .build();

    // Crea la preferencia en MP
    PreferenceClient client = new PreferenceClient();
    Preference preference = client.create(preferenceRequest);

    // Retorna la URL de pago
    return preference.getInitPoint();
}
    /*public String crearPreferencia(ProductoRequestDTO p) throws Exception {

        // me falta obtener el id del vendedor ej: producto.getVendedor.getId() = 1
        String accessTokenEncriptado = oauthService.obtenerAccessTokenPorId(p.getIdVendedor());
        String accessToken = encriptadoUtil.desencriptar(accessTokenEncriptado);

        // Verifico que no este vencido ni revocado
        if (!oauthService.AccessTokenValido(accessToken)) {
            throw new RuntimeException("Access token vencido o revocado por el vendedor");
        }

        // Inicializa config
        MercadoPagoConfig.setAccessToken(accessToken);

        // Crea el ítem
        PreferenceItemRequest item = PreferenceItemRequest.builder()
                .title("Solicitud de pago")
                .quantity(1)
                .currencyId("ARS")
                .unitPrice(p.getUnitPrice())
                .build();

        
        // Se crea la transaccion en la base de datos y se obtiene id de la misma
        //agregue LocalDateTime.now() en el constructor de Transaccion
        LocalDateTime fechaTransaccion = LocalDateTime.parse(p.getFecha());
        Transaccion transaccion = new Transaccion(p.getIdTransaccion(),"Pendiente",p.getIdComprador(), p.getTipoServicio(), fechaTransaccion);
        //Transaccion transaccionSave = transaccionRepository.save(transaccion); NO NECESARIA, ESTA GUARDADA EN OTRO MICROSERVICIO

        // Tiempo actual
        OffsetDateTime now = OffsetDateTime.now();

        // Tiempo de expiración: 2 minutos desde ahora
        OffsetDateTime expirationFrom = now;
        OffsetDateTime expirationTo = now.plusMinutes(2); //PASAR A 10 0 15 MIN EN PRODUCCION

        // Arma la preferencia
        PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(List.of(item))
                // Aca se manda el id de la transaccion para obtenerlo cuando se haga el pago
                .externalReference(transaccion.getIdTransaccion().toString())
                .metadata(Map.of(
                    "clientId", p.getIdComprador().toString(),
                    "vendedorId", Long.toString(p.getIdVendedor()),
                    "tipoServicio", p.getTipoServicio()
                    ))
                // Aca se setean datos para que la URL expire y no sea comprada mas alla de lo
                // que dura la reserva
                .expires(true)
                .expirationDateFrom(expirationFrom)
                .expirationDateTo(expirationTo)
                .build();

        // Se termina la preferencia
        PreferenceClient client = new PreferenceClient();
        Preference preference = client.create(preferenceRequest);

        // Retorna la URL de pago
        return preference.getInitPoint();
    }*/

    // =============== MANEJAR WEBHOOK ===============

    public void procesarWebhook(WebhookDTO webhook) {

    logger.info("webhook recibido: " + webhook.getId());

    if (!"payment".equalsIgnoreCase(webhook.getType())) {
        logger.info("Webhook recibido no es de tipo 'payment', se ignora." + webhook.getType());
        return;
    }

    try {
        // Obtengo el ID de pago del webhook
        String paymentId = webhook.getData().getId().toString();

        // Consulto el pago en Mercado Pago
        PaymentClient client = new PaymentClient();
        Payment payment = client.get(Long.valueOf(paymentId));

        // Obtengo estado y metadatos
        String estado = payment.getStatus();
        Map<String, Object> metadata = payment.getMetadata();

        if (metadata == null) {
            logger.warn("Metadata del pago es nula, no se puede procesar webhook." + paymentId);
            return;
        }

        String tipoServicio = metadata.get("tipoServicio").toString();
        String idComprador = metadata.get("clientId").toString();
        String idVendedor = metadata.get("vendedorId").toString();
        String idTransaccion = payment.getExternalReference();

        // Determinar el estado para enviar
        String estadoFinal;
        estadoFinal = switch (estado.toLowerCase()) {
            case "approved" -> "PAGADO";
            case "rejected" -> "RECHAZADO";
            case "pending", "in_process" -> "PENDIENTE";
            default -> "DESCONOCIDO";
        };

        // Armar mensaje para RabbitMQ
        Map<String, Object> mensaje = Map.of(
            "messageType", "WEBHOOK",
            "idTransaccion", idTransaccion,
            "idComprador", idComprador,
            "idVendedor", idVendedor,
            "estado", estadoFinal,
            "tipoServicio", tipoServicio,
            "fecha", OffsetDateTime.now().toString()
        );

        // Envío según tipo de servicio
        if ("GASTRONOMIA".equalsIgnoreCase(tipoServicio)) {
            rabbitTemplate.convertAndSend(exchange, routingKeyGastronomia, mensaje);
            logger.info("Pago enviado a msvc-gastronomico");
        } else if ("HOSPEDAJE".equalsIgnoreCase(tipoServicio)) {
            rabbitTemplate.convertAndSend(exchange, routingKeyHospedaje, mensaje);
            logger.info("Pago enviado a msvc-hospedaje");
        } else {
            logger.warn("Tipo de servicio desconocido en metadata: " + tipoServicio);
        }

    } catch (Exception e) {
        System.out.println("Error al procesar webhook: " + e.getMessage());
        e.printStackTrace();
    }
}

        /*try {
            // Obtengo el ID de pago
            String paymentId = webhook.getData().getId().toString();

            // Con el id obtenido busco el pago
            PaymentClient client = new PaymentClient();
            Payment payment = client.get(Long.parseLong(paymentId));

            // Obtengo el estado de la transaccion
            String estado = payment.getStatus();

            // Obtengo el ID del la transaccion y luego la transaccion completa
            String externalReference = payment.getExternalReference();
            Long transactionId = Long.parseLong(externalReference);
            Transaccion transaccion = transaccionRepository.findById(transactionId)
                    .orElseThrow(() -> new RuntimeException("Transacción no encontrada: ID " + transactionId));

            // // Obtengo el producto de la transaccion
            // Productos producto = transaccion.getProducto();

            // // Obtengo el accessToken del vendedor por si hay que rembolsar
            // String accessTokenEncriptado = oauthService.obtenerAccessTokenPorId(1L);
            // String accessToken = encriptadoUtil.desencriptar(accessTokenEncriptado);


            // // Se verifica que se encontro el id de Transaccion
            // if (externalReference == null) {
            //     System.out.println("No se encontró externalReference (transactionId)");
            //     reembolsarPago(paymentId, accessToken);
            //     return;
            // }
            // // Se chequea que no haya sido vendido anteriormente
            // if (producto.getVendido()) {
            //     // en caso que se haya venido se reembolsa
            //     System.out.println("Producto ya no está disponible, haciendo reembolso...");
            //     reembolsarPago(paymentId, accessToken);
            //     transaccion.setEstado("reembolsado");
            //     return;
            // }
            
            //FALTA ARREGAR PARA REEMBOLSAR SI EL MONTO DEL PROD SE MODIFICO
            // if (payment.getTransactionAmount() !=
            // BigDecimal.valueOf(producto.getPrecio())) {
            // System.out.println("El producto cambio el precio.");
            // reembolsarPago(paymentId);
            // return;
            // }
        
            // se setean los estados en caso que pase las validaciones
        if ("approved".equalsIgnoreCase(estado)) {
        transaccion.setEstado("Pago");
        transaccionRepository.save(transaccion);

        

        // Enviar al microservicio correspondiente
        //Entidad pedidos:
            /*private String id;
            private Double totalPrice;
            private Boolean paidWithMercadoPago;
            private Boolean paidWithCash;
            private OrderStatus status;
            private LocalDateTime dateCreated;
            private LocalDateTime dateUpdated;
            private String paymentReceiptPath;
            private List<Item> items;
            private Restaurant restaurant;*/
        //Entidad reservas:
            /*private Boolean isPaid; // totalmente pagado
            private Boolean hasPendingAmount; // queda saldo pendiente
            private Boolean isDeposit; // seña o pago total
            private PaymentType paymentType; // tipo de pago 
            private String paymentReceiptPath; // comprobante
            private Double amountPaid; // monto abonado
            private Double totalAmount; // total de la reserva
            private Double remainingAmount; // saldo restante
        if (transaccion.getTipoServicio() == TipoServicioEnum.GASTRONOMICO) {
            // Crear payload msvc-pedidos
        Map<String, Object> mensaje = Map.of(
            "idTransaccion", webhook.getData().getId(),
            "idComprador", webhook.getData().getMetadata().get("clientId"),
            "estado", transaccion.getEstado(),
            "tipoServicio", transaccion.getTipoServicio().name(),
            "fecha", OffsetDateTime.now().toString()

        );
            rabbitTemplate.convertAndSend(exchange, routingKeyGastronomia, mensaje);
            System.out.println("Pago enviado a msvc-gastronomico");
        } else {
            // Crear payload msvc-reservas
            Map<String, Object> mensaje = Map.of(
            "idTransaccion", transaccion.getId(),
            "idComprador", transaccion.getUsuarioId(),
            "estado", transaccion.getEstado(),
            "tipoServicio", transaccion.getTipoServicio().name(),
            "fecha", OffsetDateTime.now().toString()
        );
            rabbitTemplate.convertAndSend(exchange, routingKeyHospedaje, mensaje);
            System.out.println("Pago enviado a msvc-hospedaje");
            }
        }
        } catch (Exception e) {
            System.out.println("Error al procesar webhook: " + e.getMessage());
        }*/
    

    // private void reembolsarPago(String paymentId, String accessToken) {
    //     try {
    //         MercadoPagoConfig.setAccessToken(accessToken);
    //         // Obtener el pago con PaymentClient
    //         PaymentClient client = new PaymentClient();
    //         Payment payment = client.get(Long.parseLong(paymentId));
    //         // Ejecutar el reembolso
    //         PaymentRefund refundPayment = client.refund(payment.getId());

    //         System.out.println("Reembolso exitoso: " + refundPayment.getId());

    //     } catch (MPApiException e) {
    //         System.out.println("Error MercadoPago: " + e.getApiResponse().getContent());
    //     } catch (Exception e) {
    //         System.out.println("Error inesperado: " + e.getMessage());
    //     }
    // }

    public OauthTokenRequestDTO refrescarToken(String refreshToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            String url = "https://api.mercadopago.com/oauth/token";

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "refresh_token");
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            body.add("refresh_token", refreshToken);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<OauthTokenRequestDTO> response = restTemplate.postForEntity(url, request, OauthTokenRequestDTO.class);

            return response.getBody();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.BAD_REQUEST || e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                throw new RuntimeException("El refresh token fue revocado o no es válido");
            }
            throw e;
        }
    }
}