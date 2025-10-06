package com.tapalque.gastronomia.demo.DTO;

import java.util.List;
import java.util.stream.Collectors;

import com.tapalque.gastronomia.demo.Entity.Dish;

public class DishDTO {
    private Long idDish;
    private String name;
    private Double price;
    private CategoryDTO category;
    private List<IngredientDTO> ingredients;

    public DishDTO() {}

    public static DishDTO fromEntity(Dish dish) {
        DishDTO dto = new DishDTO();
        dto.setIdDish(dish.getIdDish());
        dto.setName(dish.getName());
        dto.setPrice(dish.getPrice());

        // La categoría puede ser null, chequeamos
        if (dish.getCategory() != null) {
            dto.setCategory(CategoryDTO.fromEntity(dish.getCategory()));
        }

        if (dish.getIngredients() != null) {
            dto.setIngredients(
                dish.getIngredients()
                    .stream()
                    .map(IngredientDTO::fromEntity)
                    .collect(Collectors.toList())
            );
        }

        return dto;
    }

    // Getters y Setters
    public Long getIdDish() { return idDish; }
    public void setIdDish(Long idDish) { this.idDish = idDish; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public CategoryDTO getCategory() { return category; }
    public void setCategory(CategoryDTO category) { this.category = category; }

    public List<IngredientDTO> getIngredients() { return ingredients; }
    public void setIngredients(List<IngredientDTO> ingredients) { this.ingredients = ingredients; }
}
