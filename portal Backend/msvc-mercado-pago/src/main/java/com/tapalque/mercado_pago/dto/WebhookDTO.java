package com.tapalque.mercado_pago.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class WebhookDTO {
    private String action;
    private String api_version;
    private WebhookData data;
    private String date_created;
    private String id;
    private boolean live_mode;
    private String type;
    private Long user_id;

    @Data
    public static class WebhookData {
        private Long id;
    }
}