package com.tapalque.gastronomia.demo.DTO;

import java.util.List;
import java.util.stream.Collectors;

import com.tapalque.gastronomia.demo.Entity.Menu;


public class MenuDTO {
    private Long id;
    private String description;
    private Long restaurantId;
    private List<DishDTO> dishes;

    public MenuDTO() {}

    public static MenuDTO fromEntity(Menu menu) {
        if (menu == null) {
            return null;
        }

        MenuDTO dto = new MenuDTO();
        dto.setId(menu.getIdMenu());
        dto.setDescription(menu.getDescription());

        if (menu.getRestaurant() != null) {
            dto.setRestaurantId(menu.getRestaurant().getIdRestaurant());
        }

        if (menu.getDishes() != null && !menu.getDishes().isEmpty()) {
            dto.setDishes(menu.getDishes()
                              .stream()
                              .filter(dish -> dish != null)
                              .map(DishDTO::fromEntity)
                              .collect(Collectors.toList()));
        } else {
            dto.setDishes(new java.util.ArrayList<>());
        }

        return dto;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(Long restaurantId) {
        this.restaurantId = restaurantId;
    }

    public List<DishDTO> getDishes() {
        return dishes;
    }

    public void setDishes(List<DishDTO> dishes) {
        this.dishes = dishes;
    }
}
