package com.tapalque.msvc_reservas.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.tapalque.msvc_reservas.dto.ReservationDTO;

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

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Value("${wppconnect.url:http://wppconnect:21465}")
    private String wppconnectUrl;

    @Value("${wppconnect.token:}")
    private String wppconnectToken;

    @Value("${wppconnect.session:tapalque}")
    private String wppconnectSession;

    public void notificarNuevaReserva(ReservationDTO reserva, String telefonoDestino) {
        if (wppconnectToken.isBlank()) return;
        if (telefonoDestino == null || telefonoDestino.isBlank()) return;

        try {
            String phone = telefonoDestino.replaceAll("[^\\d]", "");
            String mensaje = buildMensaje(reserva);
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
                    System.err.println("Error al enviar WhatsApp reserva: " + ex.getMessage());
                } else {
                    System.out.println("WhatsApp reserva enviado. Status: " + resp.statusCode());
                }
            });
        } catch (Exception e) {
            System.err.println("Error al construir request WhatsApp reserva: " + e.getMessage());
        }
    }

    private String buildMensaje(ReservationDTO r) {
        String hotel = r.getHotel() != null && r.getHotel().getHotelName() != null
                ? r.getHotel().getHotelName() : "Hospedaje";
        String huesped = r.getCustomer() != null ? r.getCustomer().getCustomerName() : "-";
        String checkIn = r.getStayPeriod() != null ? r.getStayPeriod().getCheckInDate().format(FMT) : "-";
        String checkOut = r.getStayPeriod() != null ? r.getStayPeriod().getCheckOutDate().format(FMT) : "-";
        String habitacion = r.getRoomNumber() != null ? r.getRoomNumber().toString() : "-";
        String total = r.getTotalPrice() != null ? String.format("%.0f", r.getTotalPrice()) : "-";

        return "Nueva reserva en " + hotel + "\n"
            + "Huesped: " + huesped + "\n"
            + "Check-in: " + checkIn + "\n"
            + "Check-out: " + checkOut + "\n"
            + "Habitacion: " + habitacion + "\n"
            + "Total: $" + total;
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }
}
