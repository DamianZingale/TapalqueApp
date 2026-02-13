package com.tapalque.mercado_pago.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.tapalque.mercado_pago.dto.OauthTokenRequestDTO;
import com.tapalque.mercado_pago.dto.TipoServicioEnum;
import com.tapalque.mercado_pago.dto.UserResponseDTO;
import com.tapalque.mercado_pago.entity.OauthToken;
import com.tapalque.mercado_pago.entity.StateOauth;
import com.tapalque.mercado_pago.repository.OauthTokenRepository;
import com.tapalque.mercado_pago.util.EncriptadoUtil;

@Service
public class OauthService {

    @Value("${clientId}")
    String clientId;

    @Value("${redirectUrl}")
    String redirectUrl;

    @Value("${clientSecret}")
    String clientSecret;

    private final UsuarioClient usuarioClient;
    private final OauthTokenRepository oauthRepository;
    private final StateOauthService stateOauthService;
    private final EncriptadoUtil encriptadoUtil;

    public OauthService(UsuarioClient usuarioClient, OauthTokenRepository oauthRepository,
            StateOauthService stateOauthService, EncriptadoUtil encriptadoUtil) {
        this.usuarioClient = usuarioClient;
        this.oauthRepository = oauthRepository;
        this.stateOauthService = stateOauthService;
        this.encriptadoUtil = encriptadoUtil;
    }

    public String UrlAutorizacion(String email, Long externalBusinessId, TipoServicioEnum tipoServicio) {
        Long idUsuarioLogueado = usuarioClient.obtenerUsuarioPorEmail(email)
                .map(UserResponseDTO::getId)
                .block();
        String state = UUID.randomUUID().toString();
        stateOauthService.guardarStateOauth(idUsuarioLogueado, state, externalBusinessId, tipoServicio);
        return "https://auth.mercadopago.com.ar/authorization?response_type=code" +
                "&client_id=" + clientId +
                "&redirect_uri=" + redirectUrl +
                "&state=" + state;
    }

    public void obtenerAccessToken(String code, String state) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "authorization_code");
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            body.add("code", code);
            body.add("redirect_uri", redirectUrl);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<OauthTokenRequestDTO> response = restTemplate.postForEntity(
                    "https://api.mercadopago.com/oauth/token",
                    request,
                    OauthTokenRequestDTO.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("Error al obtener el token de Mercado Pago");
            }

            // Recuperar info del negocio desde el state
            StateOauth stateOauth = stateOauthService.obtenerStateOauthPorState(state);

            guardarTokenNuevo(response.getBody(), stateOauth.getUsuarioId(),
                    stateOauth.getExternalBusinessId(), stateOauth.getTipoServicio());

        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Error de cliente: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener token: " + e.getMessage());
        }
    }

    public void actualizarToken(OauthTokenRequestDTO oauthTokenDTO, Long externalBusinessId, TipoServicioEnum tipoServicio) {
        OauthToken token = oauthRepository.findByExternalBusinessIdAndTipoServicio(externalBusinessId, tipoServicio)
                .orElseThrow(() -> new RuntimeException("Token no encontrado para el negocio"));
        token.setAccessToken(encriptadoUtil.encriptar(oauthTokenDTO.getAccessToken()));
        token.setRefreshToken(encriptadoUtil.encriptar(oauthTokenDTO.getRefreshToken()));
        token.setPublicKey(encriptadoUtil.encriptar(oauthTokenDTO.getPublicKey()));
        token.setUserId(oauthTokenDTO.getUserId());
        token.setLiveMode(oauthTokenDTO.isLiveMode());
        token.setExpiresAt(LocalDateTime.now().plusSeconds(oauthTokenDTO.getExpiresIn()));

        oauthRepository.save(token);
    }

    public void guardarTokenNuevo(OauthTokenRequestDTO oauthTokenDTO, Long idUsuario,
                                   Long externalBusinessId, TipoServicioEnum tipoServicio) {
        // Si ya existe token para este negocio, actualizarlo (re-autorización)
        Optional<OauthToken> existing = oauthRepository
                .findByExternalBusinessIdAndTipoServicio(externalBusinessId, tipoServicio);

        OauthToken token;
        if (existing.isPresent()) {
            token = existing.get();
        } else {
            token = new OauthToken();
        }

        token.setAccessToken(encriptadoUtil.encriptar(oauthTokenDTO.getAccessToken()));
        token.setRefreshToken(encriptadoUtil.encriptar(oauthTokenDTO.getRefreshToken()));
        token.setPublicKey(encriptadoUtil.encriptar(oauthTokenDTO.getPublicKey()));
        token.setUserId(oauthTokenDTO.getUserId());
        token.setLiveMode(oauthTokenDTO.isLiveMode());
        token.setExpiresAt(LocalDateTime.now().plusSeconds(oauthTokenDTO.getExpiresIn()));
        token.setUsuarioId(idUsuario);
        token.setExternalBusinessId(externalBusinessId);
        token.setTipoServicio(tipoServicio);

        oauthRepository.save(token);
    }

    public String obtenerAccessTokenPorNegocio(Long externalBusinessId, TipoServicioEnum tipoServicio) {
        return oauthRepository.findByExternalBusinessIdAndTipoServicio(externalBusinessId, tipoServicio)
                .orElseThrow(() -> new RuntimeException("No se encontro access token para el negocio"))
                .getAccessToken();
    }

    public boolean AccessTokenValido(String accessToken) {
        String url = "https://api.mercadopago.com/users/me";
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED || e.getStatusCode() == HttpStatus.FORBIDDEN) {
                return false;
            }
            return false;
        }
    }
}
