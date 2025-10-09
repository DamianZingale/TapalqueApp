package com.tapalque.gastronomia.demo.DTO;

import com.tapalque.gastronomia.demo.Entity.DishCategory;

public class DishCategoryDTO {

    private Long idDishCategory;
    private String name;

    public DishCategoryDTO() {}

    // Factory method: Entidad -> DTO
    public static DishCategoryDTO fromEntity(DishCategory category) {
        DishCategoryDTO dto = new DishCategoryDTO();
        dto.setIdDishCategory(category.getIdDishCategory());
        dto.setName(category.getName());
        return dto;
    }

    // Getters y Setters
    public Long getIdDishCategory() { return idDishCategory; }
    public void setIdDishCategory(Long idDishCategory) { this.idDishCategory = idDishCategory; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
