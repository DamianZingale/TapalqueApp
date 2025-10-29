package com.tapalque.mercado_pago.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
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

    public StateOauth(Long idUsuarioLogueado, String state2) {
        this.usuarioId = idUsuarioLogueado;
        this.state = state2;
        this.creado = LocalDateTime.now();
    }
}