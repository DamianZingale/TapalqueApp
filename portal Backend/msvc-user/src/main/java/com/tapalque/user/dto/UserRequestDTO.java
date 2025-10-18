package com.tapalque.user.dto;

import lombok.Data;

@Data
public class UserRequestDTO {
    private String nombreDeUsuario;
    private String correo;
    private String contrasena;
    private String nombre;
    private String apellido;
    private String empresa;
}
