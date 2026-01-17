package com.tapalque.espaciospublicos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EspacioPublicoImagenRequestDTO {
    private Long espacioPublicoId;
    private String imagenUrl;
}
