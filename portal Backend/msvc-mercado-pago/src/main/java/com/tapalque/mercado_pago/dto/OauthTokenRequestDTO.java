package com.tapalque.mercado_pago.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OauthTokenRequestDTO {
    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("refresh_token")
    private String refreshToken;

    @JsonProperty("public_key")
    private String publicKey;

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("expires_in")
    private Long expiresIn;

    @JsonProperty("live_mode")
    private boolean liveMode;
}
