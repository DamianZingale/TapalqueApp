package com.tapalque.espaciospublicos.dto;

import java.util.List;
import java.util.stream.Collectors;

import com.tapalque.espaciospublicos.entity.EspacioPublico;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Setter
@Getter
public class EspacioPublicoResponseDTO {
    private Long id;
    private String titulo;
    private String descripcion;
    private String direccion;
    private String telefono;
    private Double latitud;
    private Double longitud;
    private String facebook;
    private String instagram;
    private String twitter;
    private String tiktok;
    private String categoria;
    private String horario;
    private List<ImagenResponseDTO> imagenes;

    public EspacioPublicoResponseDTO(EspacioPublico e) {
        this.id = e.getId();
        this.titulo = e.getTitulo();
        this.descripcion = e.getDescripcion();
        this.direccion = e.getDireccion();
        this.telefono = e.getTelefono();
        this.latitud = e.getLatitud();
        this.longitud = e.getLongitud();
        this.facebook = e.getFacebook();
        this.instagram = e.getInstagram();
        this.twitter = e.getTwitter();
        this.tiktok = e.getTiktok();
        this.categoria = e.getCategoria();
        this.horario = e.getHorario();
        this.imagenes = e.getImagenes()
                .stream()
                .map(img -> new ImagenResponseDTO(img.getImagenUrl()))
                .collect(Collectors.toList());
    }
}
