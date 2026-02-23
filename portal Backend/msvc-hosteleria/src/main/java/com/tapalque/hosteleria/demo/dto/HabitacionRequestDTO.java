package com.tapalque.hosteleria.demo.dto;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.lang.NonNull;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class HabitacionRequestDTO {

    @NonNull
    @NotNull(message = "El número de habitación es obligatorio")
    @Min(value = 1, message = "El número de habitación debe ser mayor a 0")
    private Integer numero;

    @NonNull
    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    private String descripcion;

    @NonNull
    @NotNull(message = "La capacidad máxima de personas es obligatoria")
    @Min(value = 1, message = "La capacidad mínima es 1 persona")
    private Integer maxPersonas;

    @NonNull
    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor a 0")
    private BigDecimal precio;

    @NonNull
    @NotBlank(message = "El tipo de precio es obligatorio")
    private String tipoPrecio;

    private Integer minimoPersonasAPagar;

    private BigDecimal precioUnaPersona;

    private List<String> fotos;

    private List<String> servicios;

    private Boolean disponible;

    public HabitacionRequestDTO() {
    }

    // Getters and Setters
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

    public Integer getMinimoPersonasAPagar() {
        return minimoPersonasAPagar;
    }

    public void setMinimoPersonasAPagar(Integer minimoPersonasAPagar) {
        this.minimoPersonasAPagar = minimoPersonasAPagar;
    }

    public BigDecimal getPrecioUnaPersona() {
        return precioUnaPersona;
    }

    public void setPrecioUnaPersona(BigDecimal precioUnaPersona) {
        this.precioUnaPersona = precioUnaPersona;
    }
}
