package com.tapalque.termas.dto;

import java.util.List;
import java.util.stream.Collectors;

import com.tapalque.termas.entity.Terma;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Setter
@Getter
public class TermaResponseDTO {
    private Long id;
    private String titulo;
    private String description;
    private String direccion;
    private String horario;
    private String telefono;
    private Double latitud;
    private Double longitud;
    private String facebook;
    private String instagram;
    private List<ImagenResponseDTO> imagenes;

    // constructor para mapear de entity a dto
    public TermaResponseDTO(Terma c) {
        this.id = c.getId();
        this.titulo = c.getTitulo();
        this.description = c.getDescripcion();
        this.direccion = c.getDireccion();
        this.horario = c.getHorario();
        this.telefono = c.getTelefono();
        this.latitud = c.getLatitud();
        this.longitud = c.getLongitud();
        this.facebook = c.getFacebook();
        this.instagram = c.getInstagram();
        this.imagenes = c.getImagenes() != null
                ? c.getImagenes().stream()
                        .map(img -> new ImagenResponseDTO(img.getImagenUrl()))
                        .collect(Collectors.toList())
                : List.of();
    }
}
