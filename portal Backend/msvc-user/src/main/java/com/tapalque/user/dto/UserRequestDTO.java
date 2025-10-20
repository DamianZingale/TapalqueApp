package com.tapalque.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserRequestDTO {

    @Email
    @NotBlank
    private String correo;

    @NotBlank
    private String contrasena;

    @NotBlank
    private String nombre;

    @NotBlank
    private String apellido;

    private String empresa;
}