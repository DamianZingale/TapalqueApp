package com.tapalque.eventos.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import com.tapalque.eventos.entity.Evento;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class EventoResponseDTO {
    private Long id;
    private String nombreEvento;
    private String lugar;
    private String horario;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String telefonoContacto;
    private String nombreContacto;
    private String descripcion;
    private List<ImagenResponseDTO> imagenes;

    public EventoResponseDTO(Evento evento) {
        this.id = evento.getId();
        this.nombreEvento = evento.getNombreEvento();
        this.lugar = evento.getLugar();
        this.horario = evento.getHorario();
        this.fechaInicio = evento.getFechaInicio();
        this.fechaFin = evento.getFechaFin();
        this.telefonoContacto = evento.getTelefonoContacto();
        this.nombreContacto = evento.getNombreContacto();
        this.descripcion = evento.getDescripcion();
        this.imagenes = evento.getImagenes()
                .stream()
                .map(img -> new ImagenResponseDTO(img.getImagenUrl()))
                .collect(Collectors.toList());
    }
}
