package com.tapalque.hosteleria.demo.entidades;

public enum TipoIVA {
    INCLUIDO("IVA Incluido"),
    ADICIONAL("IVA Adicional"),
    NO_APLICA("No Aplica IVA");

    private final String etiqueta;

    TipoIVA(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }
}
