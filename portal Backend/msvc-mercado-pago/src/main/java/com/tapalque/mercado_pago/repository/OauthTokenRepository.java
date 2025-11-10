package com.tapalque.mercado_pago.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tapalque.mercado_pago.entity.OauthToken;


public interface OauthTokenRepository extends JpaRepository<OauthToken, Long> {
    Optional<OauthToken> findByUsuarioId(Long userId);
    Optional <OauthToken> findByUserId(Long idMp);
    List<OauthToken> findByAccessTokenIsNotNull();
}
