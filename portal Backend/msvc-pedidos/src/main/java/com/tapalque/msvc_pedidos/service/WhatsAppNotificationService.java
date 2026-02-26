package com.tapalque.msvc_pedidos.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.tapalque.msvc_pedidos.entity.Order;

/**
 * Envía notificaciones de WhatsApp vía WPPConnect (self-hosted).
 *
 * Variables de entorno requeridas:
 *   WPPCONNECT_URL     → URL del contenedor (ej: http://wppconnect:21465)
 *   WPPCONNECT_TOKEN   → Token generado al iniciar la sesión
 *   WPPCONNECT_SESSION → Nombre de la sesión (ej: tapalque)
 *
 * Setup inicial (una sola vez):
 *   1. POST {url}/api/{SECRET_KEY}/{session}/generate-token → guarda el token
 *   2. POST {url}/api/{token}/{session}/start-session       → escanear QR
 *   3. Cargar WPPCONNECT_TOKEN en .env y reiniciar
 */
@Service
public class WhatsAppNotificationService {

    @Value("${wppconnect.url:http://wppconnect:21465}")
    private String wppconnectUrl;

    @Value("${wppconnect.token:}")
    private String wppconnectToken;

    @Value("${wppconnect.session:tapalque}")
    private String wppconnectSession;

    public void notificarNuevoPedido(Order order, String telefonoDestino) {
        if (wppconnectToken.isBlank()) return;
        if (telefonoDestino == null || telefonoDestino.isBlank()) return;

        try {
            String phone = telefonoDestino.replaceAll("[^\\d]", "");
            String mensaje = buildMensaje(order);
            String body = "{\"phone\":\"" + phone + "\",\"message\":\"" + escape(mensaje) + "\",\"isGroup\":false}";
            String url = wppconnectUrl + "/api/" + wppconnectToken + "/" + wppconnectSession + "/send-message";

            HttpClient.newHttpClient().sendAsync(
                HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build(),
                HttpResponse.BodyHandlers.ofString()
            ).whenComplete((resp, ex) -> {
                if (ex != null) {
                    System.err.println("Error al enviar WhatsApp pedido: " + ex.getMessage());
                } else {
                    System.out.println("WhatsApp pedido enviado. Status: " + resp.statusCode());
                }
            });
        } catch (Exception e) {
            System.err.println("Error al construir request WhatsApp pedido: " + e.getMessage());
        }
    }

    private String buildMensaje(Order order) {
        String restaurante = order.getRestaurant() != null && order.getRestaurant().getRestaurantName() != null
                ? order.getRestaurant().getRestaurantName() : "Restaurante";
        String cliente = order.getUserName() != null ? order.getUserName() : "-";
        String items = buildItemsText(order);
        String pago = Boolean.TRUE.equals(order.getPaidWithMercadoPago()) ? "Mercado Pago"
                : Boolean.TRUE.equals(order.getPaidWithCash()) ? "Efectivo" : "-";
        String total = order.getTotalPrice() != null ? String.format("%.0f", order.getTotalPrice()) : "-";

        return "Nuevo pedido en " + restaurante + "\n"
            + "Cliente: " + cliente + "\n"
            + "Items: " + items + "\n"
            + "Pago: " + pago + "\n"
            + "Total: $" + total;
    }

    private String buildItemsText(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) return "-";
        StringBuilder sb = new StringBuilder();
        for (Order.Item item : order.getItems()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(item.getItemName()).append(" x").append(item.getItemQuantity());
        }
        return sb.toString();
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }
}
