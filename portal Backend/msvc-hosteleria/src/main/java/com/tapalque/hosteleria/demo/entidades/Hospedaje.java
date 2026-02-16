package com.tapalque.hosteleria.demo.entidades;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;


@Entity
@Table(name = "hospedajes")
public class Hospedaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;

    @Lob
    private String description;

    private String ubicacion;

    private Double latitud;

    private Double longitud;

    @Column(name = "num_whatsapp")
    private String numWhatsapp;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_hospedaje")
    private TipoHospedaje tipoHospedaje;

    @OneToMany(mappedBy = "hospedaje", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HospedajeImagen> imagenes = new ArrayList<>();

    @OneToMany(mappedBy = "hospedaje", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Habitacion> habitaciones = new ArrayList<>();

    // --- Constructores ---
    public Hospedaje() {
    }

    public Hospedaje(String titulo, String description, String ubicacion, Double latitud,
                     Double longitud, String numWhatsapp, TipoHospedaje tipoHospedaje) {
        this.titulo = titulo;
        this.description = description;
        this.ubicacion = ubicacion;
        this.latitud = latitud;
        this.longitud = longitud;
        this.numWhatsapp = numWhatsapp;
        this.tipoHospedaje = tipoHospedaje;
    }

    // --- Getters y Setters ---
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

    public TipoHospedaje getTipoHospedaje() {
        return tipoHospedaje;
    }

    public void setTipoHospedaje(TipoHospedaje tipoHospedaje) {
        this.tipoHospedaje = tipoHospedaje;
    }

    public List<HospedajeImagen> getImagenes() {
        return imagenes;
    }

    public void setImagenes(List<HospedajeImagen> imagenes) {
        this.imagenes = imagenes;
    }

    public List<Habitacion> getHabitaciones() {
        return habitaciones;
    }

    public void setHabitaciones(List<Habitacion> habitaciones) {
        this.habitaciones = habitaciones;
    }
}
