package com.tapalque.termas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TermaRequestDTO {
    private String titulo;

    private String descripcion;

    private String direccion;

    private String horario;

    private String telefono;
    private Double latitud;
    private Double longitud;
    private String facebook;
    private String instagram;
}