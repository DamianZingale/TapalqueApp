package com.tapalque.comercio.dto;

import java.util.List;
import java.util.stream.Collectors;

import com.tapalque.comercio.entity.Comercio;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Setter
@Getter
public class ComercioResponseDTO {
    private Long id;
    private String titulo;
    private String description;
    private String direccion;
    private String horario;
    private String telefono;
    private String urlMap;
    private String facebook;
    private String instagram;
    private List<ImagenResponseDTO> imagenes;

    // constructor para matear de entity a dto
    public ComercioResponseDTO(Comercio c) {
        this.id = c.getId();
        this.titulo = c.getTitulo();
        this.description = c.getDescripcion();
        this.direccion = c.getDireccion();
        this.horario = c.getHorario();
        this.telefono = c.getTelefono();
        this.urlMap = c.getUrlMap();
        this.facebook = c.getFacebook();
        this.instagram = c.getInstagram();
        this.imagenes = c.getImagenes()
                .stream()
                .map(img -> new ImagenResponseDTO(img.getImagenUrl()))
                .collect(Collectors.toList());
    }
}
