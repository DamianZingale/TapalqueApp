package com.tapalque.msvc_reservas.service;

import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.tapalque.msvc_reservas.dto.ReservationDTO;

import jakarta.mail.internet.MimeMessage;

@Service
@ConditionalOnProperty(name = "spring.mail.username")
public class ReservaEmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:tapalqueapp@gmail.com}")
    private String fromAddress;

    @Value("${app.mail.from-name:TapalqueApp}")
    private String fromName;

    public ReservaEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void notificarNuevaReserva(ReservationDTO reserva, String adminEmail) {
        if (adminEmail == null || adminEmail.isBlank()) return;
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, false, "UTF-8");
            helper.setFrom(fromAddress, fromName);
            helper.setTo(adminEmail);
            helper.setSubject("Nueva reserva — " + hotelName(reserva));
            helper.setText(buildBody(reserva), false);
            mailSender.send(msg);
        } catch (Exception e) {
            System.err.println("Error al enviar email de nueva reserva: " + e.getMessage());
        }
    }

    private String hotelName(ReservationDTO r) {
        return r.getHotel() != null && r.getHotel().getHotelName() != null
                ? r.getHotel().getHotelName()
                : "Hospedaje";
    }

    private String buildBody(ReservationDTO r) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        StringBuilder sb = new StringBuilder();
        sb.append("Se registró una nueva reserva en ").append(hotelName(r)).append(".\n\n");

        if (r.getCustomer() != null) {
            sb.append("— Huésped: ").append(r.getCustomer().getCustomerName()).append("\n");
            if (r.getCustomer().getCustomerEmail() != null)
                sb.append("  Email: ").append(r.getCustomer().getCustomerEmail()).append("\n");
            if (r.getCustomer().getCustomerPhone() != null)
                sb.append("  Teléfono: ").append(r.getCustomer().getCustomerPhone()).append("\n");
            if (r.getCustomer().getCustomerDni() != null)
                sb.append("  DNI: ").append(r.getCustomer().getCustomerDni()).append("\n");
        }

        if (r.getStayPeriod() != null) {
            sb.append("\n— Check-in:  ").append(r.getStayPeriod().getCheckInDate().format(fmt)).append("\n");
            sb.append("— Check-out: ").append(r.getStayPeriod().getCheckOutDate().format(fmt)).append("\n");
        }

        if (r.getRoomNumber() != null)
            sb.append("— Habitación: ").append(r.getRoomNumber()).append("\n");
        if (r.getCantidadHuespedes() != null)
            sb.append("— Huéspedes: ").append(r.getCantidadHuespedes()).append("\n");
        if (r.getTotalPrice() != null)
            sb.append("— Total: $").append(String.format("%.2f", r.getTotalPrice())).append("\n");
        if (r.getNotas() != null && !r.getNotas().isBlank())
            sb.append("— Notas: ").append(r.getNotas()).append("\n");

        sb.append("\nID de reserva: ").append(r.getId());
        return sb.toString();
    }
}
