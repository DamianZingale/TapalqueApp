package com.tapalque.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UserRegistrationDTO {

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email debe ser válido")
    @JsonProperty("correo")  // ← Frontend envía "correo"
    private String email;

    @NotBlank(message = "El nombre es obligatorio")
    @JsonProperty("nombre")  // ← Frontend envía "nombre"
    private String firtName;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    @JsonProperty("contrasenia")  // ← Frontend envía "contrasenia"
    private String password;

    @JsonProperty("role")
    private String role;

    // Constructores
    public UserRegistrationDTO() {
    }

    public UserRegistrationDTO(String email, String firtName, String password) {
        this.email = email;
        this.firtName = firtName;
        this.password = password;
    }

    // Getters y Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirtName() {
        return firtName;
    }

    public void setFirtName(String firtName) {
        this.firtName = firtName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}