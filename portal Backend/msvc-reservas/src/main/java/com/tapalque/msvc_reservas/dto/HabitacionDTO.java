package com.tapalque.msvc_reservas.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO espejo de com.tapalque.hosteleria.demo.dto.HabitacionDTO.
 * Se usa para deserializar la respuesta de msvc-hosteleria en el WebClient.
 */
public class HabitacionDTO {

    private Long id;
    private String titulo;
    private String descripcion;
    private Integer maxPersonas;
    private BigDecimal precio;
    private String tipoPrecio;
    private List<String> fotos;
    private List<String> servicios;
    private Boolean disponible;
    private Long hospedajeId;

    public HabitacionDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Integer getMaxPersonas() { return maxPersonas; }
    public void setMaxPersonas(Integer maxPersonas) { this.maxPersonas = maxPersonas; }

    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }

    public String getTipoPrecio() { return tipoPrecio; }
    public void setTipoPrecio(String tipoPrecio) { this.tipoPrecio = tipoPrecio; }

    public List<String> getFotos() { return fotos; }
    public void setFotos(List<String> fotos) { this.fotos = fotos; }

    public List<String> getServicios() { return servicios; }
    public void setServicios(List<String> servicios) { this.servicios = servicios; }

    public Boolean getDisponible() { return disponible; }
    public void setDisponible(Boolean disponible) { this.disponible = disponible; }

    public Long getHospedajeId() { return hospedajeId; }
    public void setHospedajeId(Long hospedajeId) { this.hospedajeId = hospedajeId; }
}
