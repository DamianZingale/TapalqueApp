package com.tapalque.hosteleria.demo.dto;

import java.util.List;

import org.springframework.lang.NonNull;

import com.tapalque.hosteleria.demo.entidades.TipoHospedaje;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class HospedajeRequestDTO {

    @NonNull
    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @Size(min = 10, message = "La descripción debe tener al menos 10 caracteres")
    private String description;

    @NonNull
    @NotBlank(message = "La ubicación es obligatoria")
    private String ubicacion;

    @NonNull
    @NotBlank(message = "La URL de Google Maps es obligatoria")
    @Pattern(regexp = "https?://.*", message = "Debe ser una URL válida")
    private String googleMapsUrl;

    @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Número de WhatsApp inválido")
    private String numWhatsapp;

    @NonNull
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

    public String getGoogleMapsUrl() {
        return googleMapsUrl;
    }

    public void setGoogleMapsUrl(String googleMapsUrl) {
        this.googleMapsUrl = googleMapsUrl;
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