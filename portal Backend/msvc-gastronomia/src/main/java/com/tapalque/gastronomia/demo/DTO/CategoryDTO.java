package com.tapalque.gastronomia.demo.DTO;

import com.tapalque.gastronomia.demo.Entity.Category;

public class CategoryDTO {
    private Long idCategory;
    private String name;

    public static CategoryDTO fromEntity(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setIdCategory(category.getIdCategory());
        dto.setName(category.getName());
        return dto;
    }

    // Getters y Setters
    public Long getIdCategory() {
        return idCategory;
    }

    public void setIdCategory(Long idCategory) {
        this.idCategory = idCategory;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
