package com.tapalque.user.dto;

import com.tapalque.user.entity.Business;
import com.tapalque.user.enu.BusinessType;

public class BusinessDTO {
    private Long id;
    private String name;
    private BusinessType businessType;
    private Long externalBusinessId;

    public BusinessDTO() {
    }

    public BusinessDTO(Long id, String name, BusinessType businessType, Long externalBusinessId) {
        this.id = id;
        this.name = name;
        this.businessType = businessType;
        this.externalBusinessId = externalBusinessId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public static BusinessDTO fromEntity(Business business) {
        return new BusinessDTO(
            business.getId(),
            business.getName(),
            business.getBusinessType(),
            business.getExternalBusinessId()
        );
    }
}
