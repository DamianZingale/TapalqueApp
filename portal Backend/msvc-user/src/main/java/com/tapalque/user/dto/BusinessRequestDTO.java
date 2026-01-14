package com.tapalque.user.dto;

import com.tapalque.user.enu.BusinessType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BusinessRequestDTO {

    @NotNull(message = "El ID del propietario es obligatorio")
    private Long ownerId;

    @NotBlank(message = "El nombre del negocio es obligatorio")
    private String name;

    @NotNull(message = "El tipo de negocio es obligatorio")
    private BusinessType businessType;

    @NotNull(message = "El ID del negocio externo es obligatorio")
    private Long externalBusinessId;

    public BusinessRequestDTO() {
    }

    public BusinessRequestDTO(Long ownerId, String name, BusinessType businessType, Long externalBusinessId) {
        this.ownerId = ownerId;
        this.name = name;
        this.businessType = businessType;
        this.externalBusinessId = externalBusinessId;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BusinessType getBusinessType() {
        return businessType;
    }

    public void setBusinessType(BusinessType businessType) {
        this.businessType = businessType;
    }

    public Long getExternalBusinessId() {
        return externalBusinessId;
    }

    public void setExternalBusinessId(Long externalBusinessId) {
        this.externalBusinessId = externalBusinessId;
    }
}
