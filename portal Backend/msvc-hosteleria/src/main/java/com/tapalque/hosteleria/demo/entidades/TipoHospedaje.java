package com.tapalque.hosteleria.demo.entidades;

public enum TipoHospedaje {
    HOTEL("Hotel"),
    DEPARTAMENTO("Departamento"),
    CABAÑA("Cabaña"),
    CASA("Casa"),
    OTRO("Otro");

    private final String etiqueta;

    TipoHospedaje(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }
}