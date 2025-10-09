package com.tapalque.gastronomia.demo.DTO;


import com.tapalque.gastronomia.demo.Entity.Ingredient;

public class IngredientDTO {
    private Long idIngredient;
    private String name;

    public IngredientDTO() {}

    public static IngredientDTO fromEntity(Ingredient ingredient) {
        IngredientDTO dto = new IngredientDTO();
        dto.setIdIngredient(ingredient.getIdIngredient());
        dto.setName(ingredient.getName());
        return dto;
    }

    // Getters y Setters
    public Long getIdIngredient() {
        return idIngredient;
    }

    public void setIdIngredient(Long idIngredient) {
        this.idIngredient = idIngredient;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
