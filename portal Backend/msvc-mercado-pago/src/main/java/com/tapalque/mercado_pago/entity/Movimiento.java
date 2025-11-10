package com.tapalque.mercado_pago.entity;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Movimiento {
    private Long id;
    private String type;
    private String status;
    private String detail;
    private Double amount;
    private String date_created;
}
