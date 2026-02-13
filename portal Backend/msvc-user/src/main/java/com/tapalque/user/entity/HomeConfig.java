package com.tapalque.user.entity;

import java.time.LocalDateTime;

import com.tapalque.user.enu.SectionType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "home_config")
public class HomeConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private SectionType seccion;

    @Column(name = "imagen_url", length = 500)
    private String imagenUrl;

    @Column(length = 255)
    private String titulo;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public HomeConfig() {
    }

    public HomeConfig(SectionType seccion, String imagenUrl, String titulo) {
        this.seccion = seccion;
        this.imagenUrl = imagenUrl;
        this.titulo = titulo;
        this.activo = true;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
