package com.tapalque.gastronomia.demo.DTO;

import com.tapalque.gastronomia.demo.Entity.DishRestriction;

public class DishRestrictionDTO {

    private Long idRestriction;
    private String name;

    public DishRestrictionDTO() {}

    public static DishRestrictionDTO fromEntity(DishRestriction restriction) {
        DishRestrictionDTO dto = new DishRestrictionDTO();
        dto.setIdRestriction(restriction.getIdRestriction());
        dto.setName(restriction.getName());
        return dto;
    }

    // Getters y Setters
    public Long getIdRestriction() { return idRestriction; }
    public void setIdRestriction(Long idRestriction) { this.idRestriction = idRestriction; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
