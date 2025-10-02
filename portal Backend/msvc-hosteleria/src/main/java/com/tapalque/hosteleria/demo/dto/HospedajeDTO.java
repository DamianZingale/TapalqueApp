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
    private String googleMapsUrl;
    private String numWhatsapp;
    private String tipoHospedaje;
    private List<String> imagenes;

    // Constructor vacío (necesario para algunas herramientas de serialización como Jackson)
    public HospedajeDTO() {
    }

    // Constructor que mapea desde la entidad Hospedaje
    public HospedajeDTO(Hospedaje hospedaje) {
        this.id = hospedaje.getId();
        this.titulo = hospedaje.getTitulo();
        this.description = hospedaje.getDescription();
        this.ubicacion = hospedaje.getUbicacion();
        this.googleMapsUrl = hospedaje.getGoogleMapsUrl();
        this.numWhatsapp = hospedaje.getNumWhatsapp();
        this.tipoHospedaje = hospedaje.getTipoHospedaje().name();
        this.imagenes = hospedaje.getImagenes().stream()
                .map(HospedajeImagen::getImagenUrl)
                .collect(Collectors.toList());
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
}