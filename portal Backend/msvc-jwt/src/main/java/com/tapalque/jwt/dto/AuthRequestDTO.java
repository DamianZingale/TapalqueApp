package com.tapalque.jwt.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthRequestDTO {
    @NotBlank(message = "El nombre de usuario es obligatorio")
    String nombreDeUsuario;
    @NotBlank(message = "La contraseña es obligatoria")
    String contrasena;
}
