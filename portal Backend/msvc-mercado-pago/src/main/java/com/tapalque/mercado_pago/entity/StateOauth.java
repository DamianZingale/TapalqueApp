package com.tapalque.mercado_pago.entity;

import java.time.LocalDateTime;

import com.tapalque.mercado_pago.dto.TipoServicioEnum;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "state_oauth_tb")
public class StateOauth {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String state;
    private Long usuarioId;
    private LocalDateTime creado;

    // Identificación del negocio para el que se está conectando MP
    private Long externalBusinessId;
    @Enumerated(EnumType.STRING)
    private TipoServicioEnum tipoServicio;

    public StateOauth(Long idUsuarioLogueado, String state, Long externalBusinessId, TipoServicioEnum tipoServicio) {
        this.usuarioId = idUsuarioLogueado;
        this.state = state;
        this.externalBusinessId = externalBusinessId;
        this.tipoServicio = tipoServicio;
        this.creado = LocalDateTime.now();
    }
}
