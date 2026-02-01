package com.tapalque.user.dto;

import com.tapalque.user.entity.HomeConfig;
import com.tapalque.user.enu.SectionType;

public class HomeConfigDTO {

    private Long id;
    private SectionType seccion;
    private String imagenUrl;
    private String titulo;
    private Boolean activo;

    public HomeConfigDTO() {
    }

    public HomeConfigDTO(HomeConfig entity) {
        this.id = entity.getId();
        this.seccion = entity.getSeccion();
        this.imagenUrl = entity.getImagenUrl();
        this.titulo = entity.getTitulo();
        this.activo = entity.getActivo();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SectionType getSeccion() {
        return seccion;
    }

    public void setSeccion(SectionType seccion) {
        this.seccion = seccion;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}
