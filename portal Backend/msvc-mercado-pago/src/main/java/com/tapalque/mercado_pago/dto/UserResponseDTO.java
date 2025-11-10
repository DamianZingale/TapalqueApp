package com.tapalque.mercado_pago.dto;

import lombok.Data;

@Data
public class UserResponseDTO {
    private Long id;
    private String email;
    private String contrasena;
    private String firtName;
    private String lastName;
    private String nameEmprise;
    private String rol;
}