package com.tapalque.comercio.dto;

import java.util.List;

import com.tapalque.comercio.entity.Comercio;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Setter
@Getter
public class ComercioDTO {
    private Long id;
    private String titulo;
    private String description;
    private String direccion;
    private String horario;
    private String telefono;
    private String urlMap;
    private String facebook;
    private String instagram;
    private List<String> imagenes;

    //constructor para matear de entity a dto
    public ComercioDTO(Comercio c){
        //Falta desarrollar
    }
}
