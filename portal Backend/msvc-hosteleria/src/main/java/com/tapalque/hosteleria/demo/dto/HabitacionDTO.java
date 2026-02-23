package com.tapalque.hosteleria.demo.dto;

import java.math.BigDecimal;
import java.util.List;

import com.tapalque.hosteleria.demo.entidades.Habitacion;

public class HabitacionDTO {

    private Long id;
    private Integer numero;
    private String titulo;
    private String descripcion;
    private Integer maxPersonas;
    private BigDecimal precio;
    private String tipoPrecio;
    private Integer minimoPersonasAPagar;
    private List<String> fotos;
    private List<String> servicios;
    private Boolean disponible;
    private Long hospedajeId;

    public HabitacionDTO() {
    }

    public HabitacionDTO(Habitacion habitacion) {
        this.id = habitacion.getId();
        this.numero = habitacion.getNumero();
        this.titulo = habitacion.getTitulo();
        this.descripcion = habitacion.getDescripcion();
        this.maxPersonas = habitacion.getMaxPersonas();
        this.precio = habitacion.getPrecio();
        this.tipoPrecio = habitacion.getTipoPrecio() != null
            ? habitacion.getTipoPrecio().name().toLowerCase()
            : "por_habitacion";
        this.minimoPersonasAPagar = habitacion.getMinimoPersonasAPagar();
        this.fotos = habitacion.getFotos() != null ? new java.util.ArrayList<>(habitacion.getFotos()) : new java.util.ArrayList<>();
        this.servicios = habitacion.getServicios() != null ? new java.util.ArrayList<>(habitacion.getServicios()) : new java.util.ArrayList<>();
        this.disponible = habitacion.getDisponible();
        this.hospedajeId = habitacion.getHospedaje() != null
            ? habitacion.getHospedaje().getId()
            : null;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getNumero() {
        return numero;
    }

    public void setNumero(Integer numero) {
        this.numero = numero;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Integer getMaxPersonas() {
        return maxPersonas;
    }

    public void setMaxPersonas(Integer maxPersonas) {
        this.maxPersonas = maxPersonas;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public String getTipoPrecio() {
        return tipoPrecio;
    }

    public void setTipoPrecio(String tipoPrecio) {
        this.tipoPrecio = tipoPrecio;
    }

    public List<String> getFotos() {
        return fotos;
    }

    public void setFotos(List<String> fotos) {
        this.fotos = fotos;
    }

    public List<String> getServicios() {
        return servicios;
    }

    public void setServicios(List<String> servicios) {
        this.servicios = servicios;
    }

    public Boolean getDisponible() {
        return disponible;
    }

    public void setDisponible(Boolean disponible) {
        this.disponible = disponible;
    }

    public Long getHospedajeId() {
        return hospedajeId;
    }

    public void setHospedajeId(Long hospedajeId) {
        this.hospedajeId = hospedajeId;
    }

    public Integer getMinimoPersonasAPagar() {
        return minimoPersonasAPagar;
    }

    public void setMinimoPersonasAPagar(Integer minimoPersonasAPagar) {
        this.minimoPersonasAPagar = minimoPersonasAPagar;
    }
}
