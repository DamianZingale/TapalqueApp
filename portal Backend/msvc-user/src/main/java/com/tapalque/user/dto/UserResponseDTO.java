package com.tapalque.user.dto;

import com.tapalque.user.entity.User;

public class UserResponseDTO {

    private Long id;
    private String email;
    private String nombre;
    private String apellido;
    private String direccion;
    private String rol;
    private boolean emailVerified;

    public UserResponseDTO() {
    }

    public UserResponseDTO(Long id, String email, String nombre, String apellido,
                           String direccion, String rol, boolean emailVerified) {
        this.id = id;
        this.email = email;
        this.nombre = nombre;
        this.apellido = apellido;
        this.direccion = direccion;
        this.rol = rol;
        this.emailVerified = emailVerified;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    // Método estático para convertir
    public static UserResponseDTO fromEntity(User user) {
        return new UserResponseDTO(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getDireccion(),
            user.getRole().getName().toString(),
            user.isEmailVerified()
        );
    }
}