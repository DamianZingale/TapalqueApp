package com.tapalque.msvc_reservas.dto;

public class BillingInfoDTO {
    private String cuitCuil;
    private String razonSocial;
    private String domicilioComercial;
    private String tipoFactura; // "A" o "B"
    private String condicionFiscal; // "Monotributista", "Responsable Inscripto", "Consumidor Final"

    public BillingInfoDTO() {}

    public BillingInfoDTO(String cuitCuil, String razonSocial, String domicilioComercial,
                         String tipoFactura, String condicionFiscal) {
        this.cuitCuil = cuitCuil;
        this.razonSocial = razonSocial;
        this.domicilioComercial = domicilioComercial;
        this.tipoFactura = tipoFactura;
        this.condicionFiscal = condicionFiscal;
    }

    public String getCuitCuil() {
        return cuitCuil;
    }

    public void setCuitCuil(String cuitCuil) {
        this.cuitCuil = cuitCuil;
    }

    public String getRazonSocial() {
        return razonSocial;
    }

    public void setRazonSocial(String razonSocial) {
        this.razonSocial = razonSocial;
    }

    public String getDomicilioComercial() {
        return domicilioComercial;
    }

    public void setDomicilioComercial(String domicilioComercial) {
        this.domicilioComercial = domicilioComercial;
    }

    public String getTipoFactura() {
        return tipoFactura;
    }

    public void setTipoFactura(String tipoFactura) {
        this.tipoFactura = tipoFactura;
    }

    public String getCondicionFiscal() {
        return condicionFiscal;
    }

    public void setCondicionFiscal(String condicionFiscal) {
        this.condicionFiscal = condicionFiscal;
    }
}
