package com.tapalque.mercado_pago.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagoNotificacionDTO {
    private String mensaje;
    private Double monto;
    private String email;
    private LocalDateTime hora;
}

