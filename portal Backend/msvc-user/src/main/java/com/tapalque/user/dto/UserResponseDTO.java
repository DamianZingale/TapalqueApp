package com.tapalque.user.dto;

import com.tapalque.user.enu.RolName;

import lombok.Builder;



@Builder
public class UserResponseDTO {
    private String email;
    private String contrasena;
    private String firtName;
    private String lastName;
    private String nameEmprise;
    private RolName rol;

    public UserResponseDTO() {
    }

    public UserResponseDTO(String email, String contrasena, String firtName, String lastName, String nameEmprise,
            RolName rol) {
        this.email = email;
        this.contrasena = contrasena;
        this.firtName = firtName;
        this.lastName = lastName;
        this.nameEmprise = nameEmprise;
        this.rol = rol;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }

    public String getFirtName() {
        return firtName;
    }

    public void setFirtName(String firtName) {
        this.firtName = firtName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getNameEmprise() {
        return nameEmprise;
    }

    public void setNameEmprise(String nameEmprise) {
        this.nameEmprise = nameEmprise;
    }

    public RolName getRol() {
        return rol;
    }

    public void setRol(RolName rol) {
        this.rol = rol;
    }

    
    
}

