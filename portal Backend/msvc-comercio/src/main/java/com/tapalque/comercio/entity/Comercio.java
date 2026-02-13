package com.tapalque.comercio.entity;

import java.util.List;

import com.tapalque.comercio.dto.ComercioRequestDTO;

import java.util.ArrayList;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
@Table(name = "comercio")
public class Comercio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private String direccion;

    private String horario;

    private String telefono;

    private Double latitud;

    private Double longitud;

    private String facebook;

    private String instagram;

    private String tag;

    @OneToMany(mappedBy = "comercio", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ComercioImagen> imagenes = new ArrayList<>();

    public Comercio() {}

    public Comercio(ComercioRequestDTO dto) {
        this.titulo = dto.getTitulo();
        this.descripcion = dto.getDescripcion();
        this.direccion = dto.getDireccion();
        this.horario = dto.getHorario();
        this.telefono = dto.getTelefono();
        this.latitud = dto.getLatitud();
        this.longitud = dto.getLongitud();
        this.facebook = dto.getFacebook();
        this.instagram = dto.getInstagram();
        this.tag = dto.getTag() != null ? dto.getTag().toUpperCase() : null;
    }

    public void actualizarParcial(ComercioRequestDTO dto) {
        if (dto.getTitulo() != null)
            this.titulo = dto.getTitulo();
        if (dto.getDescripcion() != null)
            this.descripcion = dto.getDescripcion();
        if (dto.getDireccion() != null)
            this.direccion = dto.getDireccion();
        if (dto.getHorario() != null)
            this.horario = dto.getHorario();
        if (dto.getTelefono() != null)
            this.telefono = dto.getTelefono();
        if (dto.getLatitud() != null)
            this.latitud = dto.getLatitud();
        if (dto.getLongitud() != null)
            this.longitud = dto.getLongitud();
        if (dto.getFacebook() != null)
            this.facebook = dto.getFacebook();
        if (dto.getInstagram() != null)
            this.instagram = dto.getInstagram();
        if (dto.getTag() != null)
            this.tag = dto.getTag().toUpperCase();
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

    public List<ComercioImagen> getImagenes() { return imagenes; }
    public void setImagenes(List<ComercioImagen> imagenes) { this.imagenes = imagenes; }
}
