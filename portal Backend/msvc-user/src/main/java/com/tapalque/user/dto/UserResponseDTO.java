package com.tapalque.user.dto;

import com.tapalque.user.enu.RolName;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponseDTO {
    private String email;
    private String firtName;
    private String lastName;
    private String nameEmprise;
    private RolName rol;
}

