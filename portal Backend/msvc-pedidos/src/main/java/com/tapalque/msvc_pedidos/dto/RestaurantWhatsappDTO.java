package com.tapalque.msvc_pedidos.dto;

public class RestaurantWhatsappDTO {
    private String whatsappNotificacion;
    private Boolean whatsappActivo;

    public RestaurantWhatsappDTO() {}

    public String getWhatsappNotificacion() { return whatsappNotificacion; }
    public void setWhatsappNotificacion(String whatsappNotificacion) { this.whatsappNotificacion = whatsappNotificacion; }

    public Boolean getWhatsappActivo() { return whatsappActivo; }
    public void setWhatsappActivo(Boolean whatsappActivo) { this.whatsappActivo = whatsappActivo; }
}
