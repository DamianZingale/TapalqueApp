package com.tapalque.gastronomia.demo.Entity;


import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "phone_number")

public class PhoneNumber {

    

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPhoneNumber;

    @Column(nullable = false)
    private String number;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private PhoneType type; // MOBILE, LANDLINE, WHATSAPP, etc.

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "idRestaurant", nullable = false)
    private Restaurant restaurant;

    public PhoneNumber() {
    }

    public PhoneNumber(Long idPhoneNumber, String number, PhoneType type, Restaurant restaurant) {
        this.idPhoneNumber = idPhoneNumber;
        this.number = number;
        this.type = type;
        this.restaurant = restaurant;
    }
    public Long getIdPhoneNumber() {
        return idPhoneNumber;
    }

    public void setIdPhoneNumber(Long idPhoneNumber) {
        this.idPhoneNumber = idPhoneNumber;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public PhoneType getType() {
        return type;
    }

    public void setType(PhoneType type) {
        this.type = type;
    }

    public Restaurant getRestaurant() {
        return restaurant;
    }

    public void setRestaurant(Restaurant restaurant) {
        this.restaurant = restaurant;
    }
}
