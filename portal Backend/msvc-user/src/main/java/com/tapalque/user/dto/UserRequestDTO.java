package com.tapalque.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;


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

    

    public UserRequestDTO() {
    }

    

    public UserRequestDTO(@Email @NotBlank String correo, @NotBlank String contrasena, @NotBlank String nombre,
            @NotBlank String apellido, String empresa) {
        this.correo = correo;
        this.contrasena = contrasena;
        this.nombre = nombre;
        this.apellido = apellido;
        this.empresa = empresa;
    }



    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getEmpresa() {
        return empresa;
    }

    public void setEmpresa(String empresa) {
        this.empresa = empresa;
    }

    
}