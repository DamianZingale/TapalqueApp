package com.tapalque.mercado_pago.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PagoEventoDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long transaccionId;
    private String referenciaId; // ID del pedido o reserva (MongoDB ObjectId)
    private String tipo; // "PEDIDO" o "RESERVA"
    private String estado; // "APROBADO", "RECHAZADO", "PENDIENTE"
    private BigDecimal monto;
    private String mercadoPagoId;
    private Long userId;
    private LocalDateTime fechaPago;
}
