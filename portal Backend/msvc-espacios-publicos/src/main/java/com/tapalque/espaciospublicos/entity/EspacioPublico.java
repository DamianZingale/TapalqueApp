package com.tapalque.espaciospublicos.entity;

import java.util.List;
import java.util.ArrayList;

import com.tapalque.espaciospublicos.dto.EspacioPublicoRequestDTO;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
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
@Table(name = "espacio_publico")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class EspacioPublico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private String direccion;

    private String telefono;

    private Double latitud;

    private Double longitud;

    private String facebook;

    private String instagram;

    private String twitter;

    private String tiktok;

    // Categoría del espacio (plaza, parque, museo, costanera, etc.)
    private String categoria;

    // Horarios de apertura (si aplica)
    private String horario;

    @OneToMany(mappedBy = "espacioPublico", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EspacioPublicoImagen> imagenes = new ArrayList<>();

    public EspacioPublico(EspacioPublicoRequestDTO dto) {
        this.setTitulo(dto.getTitulo());
        this.setDescripcion(dto.getDescripcion());
        this.setDireccion(dto.getDireccion());
        this.setTelefono(dto.getTelefono());
        this.setLatitud(dto.getLatitud());
        this.setLongitud(dto.getLongitud());
        this.setFacebook(dto.getFacebook());
        this.setInstagram(dto.getInstagram());
        this.setTwitter(dto.getTwitter());
        this.setTiktok(dto.getTiktok());
        this.setCategoria(dto.getCategoria());
        this.setHorario(dto.getHorario());
    }

    public void actualizarParcial(EspacioPublicoRequestDTO dto) {
        if (dto.getTitulo() != null)
            this.titulo = dto.getTitulo();
        if (dto.getDescripcion() != null)
            this.descripcion = dto.getDescripcion();
        if (dto.getDireccion() != null)
            this.direccion = dto.getDireccion();
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
        if (dto.getTwitter() != null)
            this.twitter = dto.getTwitter();
        if (dto.getTiktok() != null)
            this.tiktok = dto.getTiktok();
        if (dto.getCategoria() != null)
            this.categoria = dto.getCategoria();
        if (dto.getHorario() != null)
            this.horario = dto.getHorario();
    }
}
