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
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class OauthToken {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    private String accessToken;
    private String refreshToken;
    private String publicKey;
    private Long userId; // ID de MercadoPago
    private Long usuarioId; // ID del usuario interno (auditoría: quién conectó el token)
    private LocalDateTime expiresAt;
    private Boolean liveMode;

    // Identificación del negocio al que pertenece este token
    private Long externalBusinessId; // ID del restaurante o hospedaje
    @Enumerated(EnumType.STRING)
    private TipoServicioEnum tipoServicio; // GASTRONOMICO o HOSPEDAJE
}