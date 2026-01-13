package com.tapalque.user.dto;

import com.tapalque.user.entity.User;

public class UserResponseDTO {

    private Long id;
    private String email;
    private String nombre;
    private String rol;
    // NO incluir password en la respuesta

    public UserResponseDTO() {
    }

    public UserResponseDTO(Long id, String email, String nombre, String rol) {
        this.id = id;
        this.email = email;
        this.nombre = nombre;
        this.rol = rol;
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

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    // Método estático para convertir
    public static UserResponseDTO fromEntity(User user) {
        return new UserResponseDTO(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getRole().getName().toString()
        );
    }
}