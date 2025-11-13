package com.tapalque.user.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;


@Entity
@Builder
@Table(name = "usuarios_tb")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Email
    @NotBlank
    @Column(unique = true)
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String firtName;

    @NotBlank
    private String lastName;

    private String nameEmprise;

    private LocalDateTime registrationDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rol_id")
    private Role role;

    public User() {
    }

    //CONSTRUCTOR SIN ID
    public User(@Email @NotBlank String email, @NotBlank String password, @NotBlank String firtName,
            @NotBlank String lastName, String nameEmprise, LocalDateTime registrationDate, Role role) {
        this.email = email;
        this.password = password;
        this.firtName = firtName;
        this.lastName = lastName;
        this.nameEmprise = nameEmprise;
        this.registrationDate = registrationDate;
        this.role = role;
    }

    

    public User(Long id, @Email @NotBlank String email, @NotBlank String password, @NotBlank String firtName,
            @NotBlank String lastName, String nameEmprise, LocalDateTime registrationDate, Role role) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.firtName = firtName;
        this.lastName = lastName;
        this.nameEmprise = nameEmprise;
        this.registrationDate = registrationDate;
        this.role = role;
    }

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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public LocalDateTime getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    
    
}
