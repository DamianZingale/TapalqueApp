package com.tapalque.servicios.dto;

import java.util.List;
import java.util.stream.Collectors;

import com.tapalque.servicios.entity.Servicio;

public class ServicioResponseDTO {
    private Long id;
    private String titulo;
    private String descripcion;
    private String direccion;
    private String horario;
    private String telefono;
    private Double latitud;
    private Double longitud;
    private String facebook;
    private String instagram;
    private String tag;
    private List<ImagenResponseDTO> imagenes;

    public ServicioResponseDTO() {}

    public ServicioResponseDTO(Servicio c) {
        this.id = c.getId();
        this.titulo = c.getTitulo();
        this.descripcion = c.getDescripcion();
        this.direccion = c.getDireccion();
        this.horario = c.getHorario();
        this.telefono = c.getTelefono();
        this.latitud = c.getLatitud();
        this.longitud = c.getLongitud();
        this.facebook = c.getFacebook();
        this.instagram = c.getInstagram();
        this.tag = c.getTag();
        this.imagenes = c.getImagenes()
                .stream()
                .map(img -> new ImagenResponseDTO(img.getImagenUrl()))
                .collect(Collectors.toList());
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getHorario() { return horario; }
    public void setHorario(String horario) { this.horario = horario; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public Double getLatitud() { return latitud; }
    public void setLatitud(Double latitud) { this.latitud = latitud; }

    public Double getLongitud() { return longitud; }
    public void setLongitud(Double longitud) { this.longitud = longitud; }

    public String getFacebook() { return facebook; }
    public void setFacebook(String facebook) { this.facebook = facebook; }

    public String getInstagram() { return instagram; }
    public void setInstagram(String instagram) { this.instagram = instagram; }

    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }

    public List<ImagenResponseDTO> getImagenes() { return imagenes; }
    public void setImagenes(List<ImagenResponseDTO> imagenes) { this.imagenes = imagenes; }
}
