package com.tapalque.gastronomia.demo.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "dish_restriction_type")
public class DishRestriction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idRestriction;

    private String name; // ej: "Sin gluten", "Vegano", etc.

    public DishRestriction() {}

    // Getters y Setters
    public Long getIdRestriction() { return idRestriction; }
    public void setIdRestriction(Long idRestriction) { this.idRestriction = idRestriction; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
