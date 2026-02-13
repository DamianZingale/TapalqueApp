package com.tapalque.mercado_pago.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.tapalque.mercado_pago.dto.OauthTokenRequestDTO;
import com.tapalque.mercado_pago.entity.OauthToken;
import com.tapalque.mercado_pago.repository.OauthTokenRepository;
import com.tapalque.mercado_pago.util.EncriptadoUtil;

@Component
public class TokenRefreshScheduler {

    private final OauthTokenRepository oauthTokenRepository;
    private final MercadoPagoService mercadoPagoService;
    private final OauthService oauthService;
    private final EncriptadoUtil encriptadoUtil;

    public TokenRefreshScheduler(OauthTokenRepository oauthTokenRepository,
                                  MercadoPagoService mercadoPagoService,
                                  OauthService oauthService,
                                  EncriptadoUtil encriptadoUtil) {
        this.oauthTokenRepository = oauthTokenRepository;
        this.mercadoPagoService = mercadoPagoService;
        this.oauthService = oauthService;
        this.encriptadoUtil = encriptadoUtil;
    }

    // Ejecuta cada 24 horas. Refresca tokens que vencen en los proximos 7 dias.
    @Scheduled(fixedRate = 86400000) // 24h en milisegundos
    public void refrescarTokensProximosAVencer() {
        LocalDateTime limite = LocalDateTime.now().plusDays(7);

        List<OauthToken> tokensPorVencer = oauthTokenRepository
                .findByRefreshTokenIsNotNullAndExpiresAtBefore(limite);

        if (tokensPorVencer.isEmpty()) {
            System.out.println("[TokenRefresh] No hay tokens por vencer en los proximos 7 dias.");
            return;
        }

        System.out.println("[TokenRefresh] Encontrados " + tokensPorVencer.size() + " tokens por vencer. Refrescando...");

        for (OauthToken token : tokensPorVencer) {
            try {
                String refreshTokenDecriptado = encriptadoUtil.desencriptar(token.getRefreshToken());
                OauthTokenRequestDTO nuevoToken = mercadoPagoService.refrescarToken(refreshTokenDecriptado);

                if (nuevoToken != null) {
                    oauthService.actualizarToken(nuevoToken, token.getExternalBusinessId(), token.getTipoServicio());
                    System.out.println("[TokenRefresh] Token refrescado para negocio "
                            + token.getTipoServicio() + " ID: " + token.getExternalBusinessId());
                }
            } catch (Exception e) {
                System.out.println("[TokenRefresh] Error al refrescar token del negocio "
                        + token.getTipoServicio() + " ID " + token.getExternalBusinessId()
                        + ": " + e.getMessage());
            }
        }
    }
}
