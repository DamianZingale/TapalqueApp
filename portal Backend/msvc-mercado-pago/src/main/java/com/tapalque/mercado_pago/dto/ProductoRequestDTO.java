package com.tapalque.mercado_pago.dto;

import java.math.BigDecimal;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoRequestDTO {
    @NotNull(message = "Debe enviar id del producto a comprar")
    long idProducto;

    String title;

    int quantity;

    BigDecimal unitPrice;

    long idVendedor;

    Long idComprador;

    Long idTransaccion;

    @Enumerated(EnumType.STRING)
    private TipoServicioEnum tipoServicio;
}
