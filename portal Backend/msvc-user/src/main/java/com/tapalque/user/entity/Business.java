package com.tapalque.user.entity;

import com.tapalque.user.enu.BusinessType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "business_tb")
public class Business {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Usuario dueño
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "business_type", nullable = false)
    private BusinessType businessType; // Changed from Business to BusinessType

    // ID del recurso real (restaurante u hospedaje)
    @Column(name = "external_business_id", nullable = false)
    private Long externalBusinessId;

    public Business() {
    }

    public Business(Long id, User owner, String name, BusinessType businessType, Long externalBusinessId) {
        this.id = id;
        this.owner = owner;
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

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BusinessType getBusinessType() { // Changed return type
        return businessType;
    }

    public void setBusinessType(BusinessType businessType) { // Changed parameter type
        this.businessType = businessType;
    }

    public Long getExternalBusinessId() {
        return externalBusinessId;
    }

    public void setExternalBusinessId(Long externalBusinessId) {
        this.externalBusinessId = externalBusinessId;
    }
}