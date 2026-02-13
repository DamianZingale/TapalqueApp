package com.tapalque.mercado_pago.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tapalque.mercado_pago.dto.TipoServicioEnum;
import com.tapalque.mercado_pago.entity.OauthToken;


public interface OauthTokenRepository extends JpaRepository<OauthToken, Long> {
    Optional<OauthToken> findByUsuarioId(Long userId);
    Optional <OauthToken> findByUserId(Long idMp);
    List<OauthToken> findByAccessTokenIsNotNull();
    List<OauthToken> findByRefreshTokenIsNotNullAndExpiresAtBefore(LocalDateTime fecha);

    // Buscar token por negocio (externalBusinessId + tipoServicio)
    Optional<OauthToken> findByExternalBusinessIdAndTipoServicio(Long externalBusinessId, TipoServicioEnum tipoServicio);
}
