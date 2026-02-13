package com.tapalque.user.dto;

import com.tapalque.user.entity.Business;
import com.tapalque.user.enu.BusinessType;

public class BusinessDTO {
    private Long id;
    private Long ownerId;
    private String ownerName;
    private String name;
    private BusinessType businessType;
    private Long externalBusinessId;

    public BusinessDTO() {
    }

    public BusinessDTO(Long id, Long ownerId, String ownerName, String name, BusinessType businessType, Long externalBusinessId) {
        this.id = id;
        this.ownerId = ownerId;
        this.ownerName = ownerName;
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

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
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
            business.getOwner().getId(),
            business.getOwner().getFirstName() + " " + business.getOwner().getLastName(),
            business.getName(),
            business.getBusinessType(),
            business.getExternalBusinessId()
        );
    }
}
