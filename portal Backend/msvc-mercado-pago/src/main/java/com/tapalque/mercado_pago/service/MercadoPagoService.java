package com.tapalque.mercado_pago.service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

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
import com.mercadopago.client.common.IdentificationRequest;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferencePayerRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import com.tapalque.mercado_pago.dto.OauthTokenRequestDTO;
import com.tapalque.mercado_pago.dto.ProductoRequestDTO;
import com.tapalque.mercado_pago.dto.TipoServicioEnum;
import com.tapalque.mercado_pago.dto.WebhookDTO;
import com.tapalque.mercado_pago.entity.Transaccion;
import com.tapalque.mercado_pago.repository.TransaccionRepository;
import com.tapalque.mercado_pago.util.EncriptadoUtil;

@Service
public class MercadoPagoService {

    // Access token de la app (fallback para desarrollo cuando no hay OAuth)
    @Value("${mercadopago.access-token}")
    String appAccessToken;

    @Value("${clientId}")
    String clientId;

    @Value("${clientSecret}")
    String clientSecret;

    @Value("${app.frontend.url:http://localhost:3000}")
    String frontendUrl;

    @Value("${mercadopago.webhook-url}")
    String webhookUrl;

    private final TransaccionRepository transaccionRepository;
    private final OauthService oauthService;
    private final EncriptadoUtil encriptadoUtil;
    private final PagoProducerService pagoProducerService;

    public MercadoPagoService(TransaccionRepository t, OauthService o, EncriptadoUtil e, PagoProducerService p) {
        this.transaccionRepository = t;
        this.oauthService = o;
        this.encriptadoUtil = e;
        this.pagoProducerService = p;
    }

    // ===============CREAR PREFERENCIA===============

    public String crearPreferencia(ProductoRequestDTO p) throws Exception {

        String accessToken;

        // Intenta obtener el access token OAuth del negocio (externalBusinessId + tipoServicio)
        try {
            String accessTokenEncriptado = oauthService.obtenerAccessTokenPorNegocio(p.getIdVendedor(), p.getTipoServicio());
            accessToken = encriptadoUtil.desencriptar(accessTokenEncriptado);

            // Verifico que no este vencido ni revocado
            if (!oauthService.AccessTokenValido(accessToken)) {
                System.out.println("Access token del negocio vencido, usando fallback de la app");
                accessToken = appAccessToken;
            }
        } catch (RuntimeException e) {
            // Fallback: usar el access token de la app (para desarrollo)
            System.out.println("Negocio sin OAuth configurado, usando access token de la app (fallback)");
            accessToken = appAccessToken;
        }

        // Inicializa config
        MercadoPagoConfig.setAccessToken(accessToken);

        // Crea el ítem con datos para mejorar tasa de aprobación
        String categoryId = p.getTipoServicio() == TipoServicioEnum.GASTRONOMICO ? "food" : "services";
        PreferenceItemRequest item = PreferenceItemRequest.builder()
                .id(String.valueOf(p.getIdProducto()))
                .title(p.getTitle())
                .description(p.getDescription() != null ? p.getDescription() : p.getTitle())
                .categoryId(categoryId)
                .quantity(p.getQuantity())
                .currencyId("ARS")
                .unitPrice(p.getUnitPrice())
                .build();


        // Datos del pagador para mejorar tasa de aprobación
        PreferencePayerRequest.PreferencePayerRequestBuilder payerBuilder = PreferencePayerRequest.builder();
        if (p.getPayerEmail() != null) {
            payerBuilder.email(p.getPayerEmail());
        }
        if (p.getPayerName() != null) {
            payerBuilder.name(p.getPayerName());
        }
        if (p.getPayerIdentificationNumber() != null) {
            payerBuilder.identification(
                IdentificationRequest.builder()
                    .type("DNI")
                    .number(p.getPayerIdentificationNumber())
                    .build()
            );
        }
        PreferencePayerRequest payer = payerBuilder.build();

        // Se crea la transaccion en la base de datos y se obtiene id de la misma
        Transaccion transaccion = new Transaccion(p.getIdTransaccion(),"Pendiente",p.getIdComprador(), p.getTipoServicio());
        transaccion.setMonto(p.getUnitPrice().multiply(java.math.BigDecimal.valueOf(p.getQuantity())));
        Transaccion transaccionSave = transaccionRepository.save(transaccion);

        // Tiempo actual
        OffsetDateTime now = OffsetDateTime.now();

        // Expiración de la preferencia (en producción sincronizar con bloqueo temporal de reservas)
        OffsetDateTime expirationFrom = now;
        OffsetDateTime expirationTo = now.plusMinutes(30);

        // URLs de retorno después del pago
        String refParam = "";
        if (p.getIdTransaccion() != null) {
            String paramName = p.getTipoServicio() == TipoServicioEnum.GASTRONOMICO ? "pedido" : "reserva";
            refParam = "&" + paramName + "=" + p.getIdTransaccion();
        }
        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success(frontendUrl + "/pago/exito?transaccion=" + transaccionSave.getId() + refParam)
                .failure(frontendUrl + "/pago/error?transaccion=" + transaccionSave.getId() + refParam)
                .pending(frontendUrl + "/pago/pendiente?transaccion=" + transaccionSave.getId() + refParam)
                .build();

        // Arma la preferencia
        PreferenceRequest.PreferenceRequestBuilder preferenceBuilder = PreferenceRequest.builder()
                .items(List.of(item))
                // Aca se manda el id de la transaccion para obtenerlo cuando se haga el pago
                .externalReference(transaccionSave.getId().toString())
                // URLs de retorno
                .backUrls(backUrls)
                // Datos del pagador
                .payer(payer)
                // URL donde Mercado Pago envía las notificaciones webhook
                .notificationUrl(webhookUrl)
                // Descripción que aparece en el resumen de tarjeta del comprador
                .statementDescriptor("TapalqueApp")
                // Expiración sincronizada con el bloqueo temporal de reservas (5 min)
                .expirationDateFrom(expirationFrom)
                .expirationDateTo(expirationTo);

        // auto_return solo funciona con URLs públicas (no localhost)
        if (!frontendUrl.contains("localhost")) {
            preferenceBuilder.autoReturn("approved");
        }

        PreferenceRequest preferenceRequest = preferenceBuilder.build();

        // Se termina la preferencia
        PreferenceClient client = new PreferenceClient();
        Preference preference = client.create(preferenceRequest);

        return preference.getInitPoint();
    }

    // =============== MANEJAR WEBHOOK ===============

    public void procesarWebhook(WebhookDTO webhook) {
        if (!"payment".equalsIgnoreCase(webhook.getType())) {
            System.out.println("Webhook ignorado: tipo no soportado " + webhook.getType());
            return;
        }

        try {
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
                transaccion.setMercadoPagoId(paymentId);
                transaccion.setFechaPago(LocalDateTime.now());
                transaccionRepository.save(transaccion);

                // Crear evento para RabbitMQ
                com.tapalque.mercado_pago.dto.PagoEventoDTO evento = new com.tapalque.mercado_pago.dto.PagoEventoDTO(
                    transaccion.getId(),
                    transaccion.getIdTransaccion(),
                    transaccion.getTipoServicio().name(),
                    "APROBADO",
                    transaccion.getMonto(),
                    transaccion.getMercadoPagoId(),
                    transaccion.getUsuarioId(),
                    transaccion.getFechaPago()
                );

                // Enviar a la cola correspondiente
                if(transaccion.getTipoServicio()== TipoServicioEnum.GASTRONOMICO){
                    pagoProducerService.enviarNotificacionPagoPedido(evento);
                }else{
                    pagoProducerService.enviarNotificacionPagoReserva(evento);
                }
            } else if ("rejected".equalsIgnoreCase(estado)) {
                transaccion.setEstado("Rechazado");
                transaccion.setMercadoPagoId(paymentId);
                transaccionRepository.save(transaccion);

                // Crear evento de rechazo
                com.tapalque.mercado_pago.dto.PagoEventoDTO evento = new com.tapalque.mercado_pago.dto.PagoEventoDTO(
                    transaccion.getId(),
                    transaccion.getIdTransaccion(),
                    transaccion.getTipoServicio().name(),
                    "RECHAZADO",
                    transaccion.getMonto(),
                    transaccion.getMercadoPagoId(),
                    transaccion.getUsuarioId(),
                    LocalDateTime.now()
                );

                // Enviar notificación de rechazo
                if(transaccion.getTipoServicio()== TipoServicioEnum.GASTRONOMICO){
                    pagoProducerService.enviarNotificacionPagoPedido(evento);
                }else{
                    pagoProducerService.enviarNotificacionPagoReserva(evento);
                }
            } else if ("pending".equalsIgnoreCase(estado) || "in_process".equalsIgnoreCase(estado)) {
                transaccion.setEstado("Pendiente");
                transaccion.setMercadoPagoId(paymentId);
                transaccionRepository.save(transaccion);

                com.tapalque.mercado_pago.dto.PagoEventoDTO evento = new com.tapalque.mercado_pago.dto.PagoEventoDTO(
                    transaccion.getId(),
                    transaccion.getIdTransaccion(),
                    transaccion.getTipoServicio().name(),
                    "PENDIENTE",
                    transaccion.getMonto(),
                    transaccion.getMercadoPagoId(),
                    transaccion.getUsuarioId(),
                    LocalDateTime.now()
                );

                if(transaccion.getTipoServicio()== TipoServicioEnum.GASTRONOMICO){
                    pagoProducerService.enviarNotificacionPagoPedido(evento);
                }else{
                    pagoProducerService.enviarNotificacionPagoReserva(evento);
                }
            }
        } catch (Exception e) {
            System.out.println("Error al procesar webhook: " + e.getMessage());
        }
    }

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