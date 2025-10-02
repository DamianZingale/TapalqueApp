package com.tapalque.comercio.entity;

import java.util.List;

import com.tapalque.comercio.dto.ComercioRequestDTO;

import java.util.ArrayList;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
@Table(name = "comercio")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Comercio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;

    private String descripcion;

    private String direccion;

    private String horario;

    private String telefono;

    private String urlMap;

    private String facebook;

    private String instagram;

    @OneToMany(mappedBy = "comercio", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ComercioImagen> imagenes = new ArrayList<>();

    public Comercio(ComercioRequestDTO dto) {
        this.setTitulo(dto.getTitulo());
        this.setDescripcion(dto.getDescripcion());
        this.setDireccion(dto.getDireccion());
        this.setHorario(dto.getHorario());
        this.setTelefono(dto.getTelefono());
        this.setUrlMap(dto.getUrlMap());
        this.setFacebook(dto.getFacebook());
        this.setInstagram(dto.getInstagram());
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
        if (dto.getUrlMap() != null)
            this.urlMap = dto.getUrlMap();
        if (dto.getFacebook() != null)
            this.facebook = dto.getFacebook();
        if (dto.getInstagram() != null)
            this.instagram = dto.getInstagram();
    }
}
