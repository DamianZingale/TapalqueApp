package com.tapalque.gastronomia.demo.Entity;


import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "ingredient")
public class Ingredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idIngredient;

    @Column(nullable = false, unique = true)
    private String name;

    @ManyToMany(mappedBy = "ingredients")
    private List<Dish> dishes;
    
    public Ingredient() {
    }

    public Ingredient(Long idIngredient, String name, List<Dish> dishes) {
        this.idIngredient = idIngredient;
        this.name = name;
        this.dishes = dishes;
    }

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

    public List<Dish> getDishes() {
        return dishes;
    }

    public void setDishes(List<Dish> dishes) {
        this.dishes = dishes;
    }

    
}
