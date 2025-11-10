package com.tapalque.jwt.dto;

import com.tapalque.jwt.enu.RolName;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class UserResponseDTO {
    private String email;
    private String contrasena;
    private String firtName;
    private String lastName;
    private String nameEmprise;
    private RolName rol;
}
