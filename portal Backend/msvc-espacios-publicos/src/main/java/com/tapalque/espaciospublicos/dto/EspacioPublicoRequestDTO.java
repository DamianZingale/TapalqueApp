package com.tapalque.espaciospublicos.dto;

import org.springframework.lang.NonNull;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EspacioPublicoRequestDTO {
    @NonNull
    private String titulo;

    @NonNull
    private String descripcion;

    @NonNull
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
}
