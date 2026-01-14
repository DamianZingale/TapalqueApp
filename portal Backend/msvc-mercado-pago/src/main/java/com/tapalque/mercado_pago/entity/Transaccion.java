package com.tapalque.mercado_pago.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.tapalque.mercado_pago.dto.TipoServicioEnum;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Transaccion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long idTransaccion; // ID del pedido o reserva (referenciaId)

    private String estado; // Pendiente, Pago, Rechazado

    private LocalDateTime fecha;

    private Long usuarioId; // ID del usuario interno (del microservicio de usuarios)

    @Enumerated(EnumType.STRING)
    private TipoServicioEnum tipoServicio; // GASTRONOMICO o HOSPEDAJE

    private BigDecimal monto; // Monto total de la transacción

    private String mercadoPagoId; // ID del pago en Mercado Pago

    private LocalDateTime fechaPago; // Fecha en que se aprobó el pago

    public Transaccion(Long idTransaccion, String estado, Long usuarioId, TipoServicioEnum tipoServicioEnum) {
        this.idTransaccion = idTransaccion;
        this.estado = estado;
        this.fecha = LocalDateTime.now();
        this.usuarioId = usuarioId;
        this.tipoServicio = tipoServicioEnum;
    }
}
