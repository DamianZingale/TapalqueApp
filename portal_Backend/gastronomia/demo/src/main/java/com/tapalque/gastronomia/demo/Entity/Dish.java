package com.tapalque.gastronomia.demo.Entity;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

    public Dish() {
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDish;

    public Dish(Long idDish, String name, Double price, DishType type, Menu menu,
            List<Ingredient> ingredients) {
        this.idDish = idDish;
        this.name = name;
        this.price = price;
        this.type = type;
        this.menu = menu;
        this.ingredients = ingredients;
    }

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DishType type;  // FOOD or DRINK

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

    public DishType getType() {
        return type;
    }

    public void setType(DishType type) {
        this.type = type;
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