package com.tapalque.gastronomia.demo.Entity;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "dish")
public class Dish {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDish;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double price;

    // 🔹 Relación con Category
    @ManyToOne
    @JoinColumn(name = "idCategory", nullable = false)
    private Category category;

    @ManyToOne
    @JoinColumn(name = "idMenu", nullable = false)
    private Menu menu;

    @ManyToMany
    @JoinTable(
        name = "dish_ingredient",
        joinColumns = @JoinColumn(name = "idDish"),
        inverseJoinColumns = @JoinColumn(name = "idIngredient")
    )
    private List<Ingredient> ingredients;

    public Dish() {}

    public Dish(Long idDish, String name, Double price, Category category, Menu menu, List<Ingredient> ingredients) {
        this.idDish = idDish;
        this.name = name;
        this.price = price;
        this.category = category;
        this.menu = menu;
        this.ingredients = ingredients;
    }

    // 🔹 Getters y Setters

    public Long getIdDish() {
        return idDish;
    }

    public void setIdDish(Long idDish) {
        this.idDish = idDish;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Menu getMenu() {
        return menu;
    }

    public void setMenu(Menu menu) {
        this.menu = menu;
    }

    public List<Ingredient> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<Ingredient> ingredients) {
        this.ingredients = ingredients;
    }
}
