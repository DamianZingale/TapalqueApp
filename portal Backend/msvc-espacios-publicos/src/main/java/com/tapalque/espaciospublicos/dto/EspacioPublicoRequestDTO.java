package com.tapalque.espaciospublicos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EspacioPublicoRequestDTO {
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
}
