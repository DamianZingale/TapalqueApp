package com.tapalque.hosteleria.demo.dto;

import java.util.List;
import java.util.stream.Collectors;

import com.tapalque.hosteleria.demo.entidades.Hospedaje;
import com.tapalque.hosteleria.demo.entidades.HospedajeImagen;

public class HospedajeDTO {

    private Long id;
    private String titulo;
    private String description;
    private String ubicacion;
    private Double latitud;
    private Double longitud;
    private String numWhatsapp;
    private String emailNotificacion;
    private String tipoHospedaje;
    private List<String> imagenes;
    private java.time.LocalDateTime lastCloseDate;
    private java.time.LocalDate fechaLimiteReservas;
    private Boolean permiteFacturacion;
    private String tipoIva;

    // Constructor vacío (necesario para algunas herramientas de serialización como Jackson)
    public HospedajeDTO() {
    }

    // Constructor que mapea desde la entidad Hospedaje
    public HospedajeDTO(Hospedaje hospedaje) {
        this.id = hospedaje.getId();
        this.titulo = hospedaje.getTitulo();
        this.description = hospedaje.getDescription();
        this.ubicacion = hospedaje.getUbicacion();
        this.latitud = hospedaje.getLatitud();
        this.longitud = hospedaje.getLongitud();
        this.numWhatsapp = hospedaje.getNumWhatsapp();
        this.emailNotificacion = hospedaje.getEmailNotificacion();
        this.tipoHospedaje = hospedaje.getTipoHospedaje() != null
                ? hospedaje.getTipoHospedaje().name()
                : null;
        this.imagenes = hospedaje.getImagenes() != null
                ? hospedaje.getImagenes().stream()
                        .map(HospedajeImagen::getImagenUrl)
                        .collect(Collectors.toList())
                : List.of();
        this.lastCloseDate = hospedaje.getLastCloseDate();
        this.fechaLimiteReservas = hospedaje.getFechaLimiteReservas();
        this.permiteFacturacion = hospedaje.getPermiteFacturacion();
        this.tipoIva = hospedaje.getTipoIva() != null
                ? hospedaje.getTipoIva().name()
                : "NO_APLICA";
    }

    // Getters y setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    public Double getLatitud() {
        return latitud;
    }

    public void setLatitud(Double latitud) {
        this.latitud = latitud;
    }

    public Double getLongitud() {
        return longitud;
    }

    public void setLongitud(Double longitud) {
        this.longitud = longitud;
    }

    public String getNumWhatsapp() {
        return numWhatsapp;
    }

    public void setNumWhatsapp(String numWhatsapp) {
        this.numWhatsapp = numWhatsapp;
    }

    public String getEmailNotificacion() {
        return emailNotificacion;
    }

    public void setEmailNotificacion(String emailNotificacion) {
        this.emailNotificacion = emailNotificacion;
    }

    public String getTipoHospedaje() {
        return tipoHospedaje;
    }

    public void setTipoHospedaje(String tipoHospedaje) {
        this.tipoHospedaje = tipoHospedaje;
    }

    public List<String> getImagenes() {
        return imagenes;
    }

    public void setImagenes(List<String> imagenes) {
        this.imagenes = imagenes;
    }

    public java.time.LocalDateTime getLastCloseDate() {
        return lastCloseDate;
    }

    public void setLastCloseDate(java.time.LocalDateTime lastCloseDate) {
        this.lastCloseDate = lastCloseDate;
    }

    public java.time.LocalDate getFechaLimiteReservas() {
        return fechaLimiteReservas;
    }

    public void setFechaLimiteReservas(java.time.LocalDate fechaLimiteReservas) {
        this.fechaLimiteReservas = fechaLimiteReservas;
    }

    public Boolean getPermiteFacturacion() {
        return permiteFacturacion;
    }

    public void setPermiteFacturacion(Boolean permiteFacturacion) {
        this.permiteFacturacion = permiteFacturacion;
    }

    public String getTipoIva() {
        return tipoIva;
    }

    public void setTipoIva(String tipoIva) {
        this.tipoIva = tipoIva;
    }

}