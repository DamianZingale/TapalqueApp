package com.tapalque.comercio.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComercioRequestDTO {
    private String titulo;
    private String descripcion;
    private String direccion;
    private String horario;
    private String telefono;
    private String urlMap;
    private String facebook;
    private String instagram;
}