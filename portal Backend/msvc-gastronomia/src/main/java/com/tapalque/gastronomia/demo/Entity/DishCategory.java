package com.tapalque.gastronomia.demo.Entity;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "dish_category")
public class DishCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDishCategory;

    private String name; // Pizza, Empanadas, Ensaladas, etc.

    @ManyToMany(mappedBy = "categories")
    private List<Dish> dishes;

    public DishCategory() {}

    public DishCategory(Long idDishCategory, String name, List<Dish> dishes) {
        this.idDishCategory = idDishCategory;
        this.name = name;
        this.dishes = dishes;
    }

    public Long getIdDishCategory() {
        return idDishCategory;
    }

    public void setIdDishCategory(Long idDishCategory) {
        this.idDishCategory = idDishCategory;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Dish> getDishes() {
        return dishes;
    }

    public void setDishes(List<Dish> dishes) {
        this.dishes = dishes;
    }
}
