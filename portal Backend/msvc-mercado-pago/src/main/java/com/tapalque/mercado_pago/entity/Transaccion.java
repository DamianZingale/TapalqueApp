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

    private LocalDateTime fecha;

    private Long usuarioId; // ID del usuario interno (del microservicio de usuarios)

    @Enumerated(EnumType.STRING)
    private TipoServicioEnum tipoServicio;

    public Transaccion() {
       
    }
    

    public Transaccion(Long idTransaccion, String estado, Long usuarioId, TipoServicioEnum tipoServicioEnum, LocalDateTime fecha) {
        this.idTransaccion = idTransaccion;
        this.estado = estado;
        this.fecha = fecha; //la fecha ya viene desde msvc-pedidos
        this.usuarioId = usuarioId;
        this.tipoServicio = tipoServicioEnum;
    }
}
