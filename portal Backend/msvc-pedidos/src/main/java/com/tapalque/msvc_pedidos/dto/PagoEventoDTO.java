package com.tapalque.msvc_pedidos.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

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

    // Constructor vacío
    public PagoEventoDTO() {}

    // Constructor completo
    public PagoEventoDTO(Long transaccionId, String referenciaId, String tipo, String estado,
                         BigDecimal monto, String mercadoPagoId, Long userId, LocalDateTime fechaPago) {
        this.transaccionId = transaccionId;
        this.referenciaId = referenciaId;
        this.tipo = tipo;
        this.estado = estado;
        this.monto = monto;
        this.mercadoPagoId = mercadoPagoId;
        this.userId = userId;
        this.fechaPago = fechaPago;
    }

    // Getters y Setters
    public Long getTransaccionId() { return transaccionId; }
    public void setTransaccionId(Long transaccionId) { this.transaccionId = transaccionId; }

    public String getReferenciaId() { return referenciaId; }
    public void setReferenciaId(String referenciaId) { this.referenciaId = referenciaId; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }

    public String getMercadoPagoId() { return mercadoPagoId; }
    public void setMercadoPagoId(String mercadoPagoId) { this.mercadoPagoId = mercadoPagoId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public LocalDateTime getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDateTime fechaPago) { this.fechaPago = fechaPago; }
}
