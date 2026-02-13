package com.tapalque.hosteleria.demo.dto;

import java.math.BigDecimal;

public class DisponibilidadResponseDTO {

    private boolean disponible;
    private BigDecimal precioTotal;

    public DisponibilidadResponseDTO() {
    }

    public DisponibilidadResponseDTO(boolean disponible, BigDecimal precioTotal) {
        this.disponible = disponible;
        this.precioTotal = precioTotal;
    }

    public boolean isDisponible() {
        return disponible;
    }

    public void setDisponible(boolean disponible) {
        this.disponible = disponible;
    }

    public BigDecimal getPrecioTotal() {
        return precioTotal;
    }

    public void setPrecioTotal(BigDecimal precioTotal) {
        this.precioTotal = precioTotal;
    }
}
