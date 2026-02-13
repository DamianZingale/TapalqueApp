package com.tapalque.jwt.dto;

import com.tapalque.jwt.enu.RolName;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class UserClientDTO {

    private String email;
    private String firtName;
    private String password;
    private RolName rol;
}
