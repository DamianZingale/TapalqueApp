package com.tapalque.comercio.dto;

import org.springframework.lang.NonNull;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComercioRequestDTO {
    @NonNull
    private String titulo;

    private String descripcion;

    @NonNull
    private String direccion;

    private String horario;
    private String telefono;
    private Double latitud;
    private Double longitud;
    private String facebook;
    private String instagram;
}