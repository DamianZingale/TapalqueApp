package com.tapalque.jwt.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class UserResponse {
    private String email;
    private String contrasena;
    private String lastName;
    private String nameEmprise;
    private List<String> rol;
}
