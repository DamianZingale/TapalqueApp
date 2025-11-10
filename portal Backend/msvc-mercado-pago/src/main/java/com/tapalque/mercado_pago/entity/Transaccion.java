package com.tapalque.mercado_pago.entity;

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

@Entity
@Data
@AllArgsConstructor
public class Transaccion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long idTransaccion;

    private String estado;

    private final LocalDateTime fecha;

    private Long usuarioId; // ID del usuario interno (del microservicio de usuarios)

    @Enumerated(EnumType.STRING)
    private TipoServicioEnum tipoServicio;

    public Transaccion(Long idTransaccion, String estado, Long usuarioId, TipoServicioEnum tipoServicioEnum) {
        this.idTransaccion = idTransaccion;
        this.estado = estado;
        this.fecha = LocalDateTime.now();
        this.usuarioId = usuarioId;
        this.tipoServicio = tipoServicioEnum;
    }
}
