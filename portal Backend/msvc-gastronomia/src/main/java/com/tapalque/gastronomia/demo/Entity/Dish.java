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

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Boolean available = true;

    @Column(length = 1000)
    private String picture;

    // 🔹 Relación ManyToMany con DishCategory
    @ManyToMany
    @JoinTable(
        name = "dish_category_relation",
        joinColumns = @JoinColumn(name = "idDish"),
        inverseJoinColumns = @JoinColumn(name = "idDishCategory")
    )
    private List<DishCategory> categories;

    // 🔹 Restricciones del plato (Vegano, Sin gluten, etc.)
    @ManyToMany
    @JoinTable(
        name = "dish_restriction",
        joinColumns = @JoinColumn(name = "idDish"),
        inverseJoinColumns = @JoinColumn(name = "idRestriction")
    )
    private List<DishRestriction> restrictions;

    // 🔹 Menú al que pertenece
    @ManyToOne
    @JoinColumn(name = "idMenu", nullable = false)
    private Menu menu;

    // 🔹 Ingredientes
    @ManyToMany
    @JoinTable(
        name = "dish_ingredient",
        joinColumns = @JoinColumn(name = "idDish"),
        inverseJoinColumns = @JoinColumn(name = "idIngredient")
    )
    private List<Ingredient> ingredients;

    public Dish() {}

    public Dish(Long idDish, String name, Double price, List<DishCategory> categories, Menu menu, List<Ingredient> ingredients, List<DishRestriction> restrictions) {
        this.idDish = idDish;
        this.name = name;
        this.price = price;
        this.categories = categories;
        this.menu = menu;
        this.ingredients = ingredients;
        this.restrictions = restrictions;
    }

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

    public List<DishCategory> getCategories() {
        return categories;
    }

    public void setCategories(List<DishCategory> categories) {
        this.categories = categories;
    }

    public List<DishRestriction> getRestrictions() {
        return restrictions;
    }

    public void setRestrictions(List<DishRestriction> restrictions) {
        this.restrictions = restrictions;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public String getPicture() {
        return picture;
    }

    public void setPicture(String picture) {
        this.picture = picture;
    }
}
