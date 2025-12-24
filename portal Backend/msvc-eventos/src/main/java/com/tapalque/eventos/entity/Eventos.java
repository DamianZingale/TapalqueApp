package com.tapalque.eventos.entity;

import java.util.Date;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table  (name = "eventos")
public class Eventos {

    private Long id;
    private String nombre;
    private String descripcion;
    private Date fecha;
    private String ubicacion;

    @OneToMany (mappedBy = "eventoId")
    private List<EventImages> eventImages;

    public Eventos() {
    }

    public Eventos(Long id, String nombre, String descripcion, Date fecha, String ubicacion, List<EventImages> eventImages) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.fecha = fecha;
        this.ubicacion = ubicacion;
        this.eventImages = eventImages;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Date getFecha() {
        return fecha;
    }

    public void setFecha(Date fecha) {
        this.fecha = fecha;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    public List<EventImages> getEventImages() {
        return eventImages;
    }

    public void setEventImages(List<EventImages> eventImages) {
        this.eventImages = eventImages;
    }

}
