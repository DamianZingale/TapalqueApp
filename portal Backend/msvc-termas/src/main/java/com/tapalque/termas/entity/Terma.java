package com.tapalque.termas.entity;

import java.util.List;

import com.tapalque.termas.dto.TermaRequestDTO;

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
import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
@Table(name = "terma")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Terma {
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

    @OneToMany(mappedBy = "terma", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TermaImagen> imagenes = new ArrayList<>();

    public Terma(TermaRequestDTO dto) {
        this.setTitulo(dto.getTitulo());
        this.setDescripcion(dto.getDescripcion());
        this.setDireccion(dto.getDireccion());
        this.setHorario(dto.getHorario());
        this.setTelefono(dto.getTelefono());
        this.setLatitud(dto.getLatitud());
        this.setLongitud(dto.getLongitud());
        this.setFacebook(dto.getFacebook());
        this.setInstagram(dto.getInstagram());
    }

    public void actualizarParcial(TermaRequestDTO dto) {
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
    }
}
