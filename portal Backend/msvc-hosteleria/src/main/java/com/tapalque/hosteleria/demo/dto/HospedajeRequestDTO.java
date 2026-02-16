package com.tapalque.hosteleria.demo.dto;

import java.util.List;

import com.tapalque.hosteleria.demo.entidades.TipoHospedaje;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class HospedajeRequestDTO {

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @Size(min = 10, message = "La descripción debe tener al menos 10 caracteres")
    private String description;

    @NotBlank(message = "La ubicación es obligatoria")
    private String ubicacion;

    @NotNull(message = "La latitud es obligatoria")
    private Double latitud;

    @NotNull(message = "La longitud es obligatoria")
    private Double longitud;

    @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Número de WhatsApp inválido")
    private String numWhatsapp;

    @NotNull(message = "Debe especificar el tipo de hospedaje")
    private TipoHospedaje tipoHospedaje;

    private List<String> imagenes;

    // Constructor vacío (útil para deserialización automática)
    public HospedajeRequestDTO() {
    }

    // Getters y setters

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

    public TipoHospedaje getTipoHospedaje() {
        return tipoHospedaje;
    }

    public void setTipoHospedaje(TipoHospedaje tipoHospedaje) {
        this.tipoHospedaje = tipoHospedaje;
    }

    public List<String> getImagenes() {
        return imagenes;
    }

    public void setImagenes(List<String> imagenes) {
        this.imagenes = imagenes;
    }
}