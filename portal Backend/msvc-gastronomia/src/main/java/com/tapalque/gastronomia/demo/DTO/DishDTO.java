package com.tapalque.gastronomia.demo.DTO;

import java.util.List;
import java.util.stream.Collectors;

import com.tapalque.gastronomia.demo.Entity.Dish;

public class DishDTO {

    private Long idDish;
    private String name;
    private Double price;
    private List<DishCategoryDTO> categories;  
    private List<IngredientDTO> ingredients;
    private List<DishRestrictionDTO> restrictions;

    public DishDTO() {}

    // 🔹 Factory method: entidad → DTO
    public static DishDTO fromEntity(Dish dish) {
        DishDTO dto = new DishDTO();
        dto.setIdDish(dish.getIdDish());
        dto.setName(dish.getName());
        dto.setPrice(dish.getPrice());

        if (dish.getCategories() != null) {
            dto.setCategories(
                dish.getCategories()
                    .stream()
                    .map(DishCategoryDTO::fromEntity)
                    .collect(Collectors.toList())
            );
        }

        if (dish.getIngredients() != null) {
            dto.setIngredients(
                dish.getIngredients()
                    .stream()
                    .map(IngredientDTO::fromEntity)
                    .collect(Collectors.toList())
            );
        }

        if (dish.getRestrictions() != null) {
            dto.setRestrictions(
                dish.getRestrictions()
                    .stream()
                    .map(DishRestrictionDTO::fromEntity)
                    .collect(Collectors.toList())
            );
        }

        return dto;
    }

    // 🔹 Getters y Setters
    public Long getIdDish() { return idDish; }
    public void setIdDish(Long idDish) { this.idDish = idDish; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public List<DishCategoryDTO> getCategories() { return categories; }
    public void setCategories(List<DishCategoryDTO> categories) { this.categories = categories; }

    public List<IngredientDTO> getIngredients() { return ingredients; }
    public void setIngredients(List<IngredientDTO> ingredients) { this.ingredients = ingredients; }

    public List<DishRestrictionDTO> getRestrictions() { return restrictions; }
    public void setRestrictions(List<DishRestrictionDTO> restrictions) { this.restrictions = restrictions; }
}
