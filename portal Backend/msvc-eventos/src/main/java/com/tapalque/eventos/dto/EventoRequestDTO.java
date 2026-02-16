package com.tapalque.eventos.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class EventoRequestDTO {

    @NotBlank(message = "El nombre del evento es obligatorio")
    private String nombreEvento;

    @NotBlank(message = "El lugar es obligatorio")
    private String lugar;

    @NotBlank(message = "El horario es obligatorio")
    private String horario;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    private LocalDate fechaFin;

    @NotBlank(message = "El teléfono de contacto es obligatorio")
    private String telefonoContacto;

    @NotBlank(message = "El nombre del contacto es obligatorio")
    private String nombreContacto;

    private String descripcion;
}
