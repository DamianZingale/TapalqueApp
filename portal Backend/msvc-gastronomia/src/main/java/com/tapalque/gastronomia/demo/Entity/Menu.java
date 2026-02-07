package com.tapalque.gastronomia.demo.Entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "menu")
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMenu;

    @Column(nullable = false)
    private String name;

    @Column(nullable = true, columnDefinition = "TEXT")
    private String description;

    // Relación con Restaurant
    @JsonBackReference
    @OneToOne
    @JoinColumn(name = "id_restaurant", nullable = false)
    private Restaurant restaurant;

    // Relación con Dish
    @OneToMany(mappedBy = "menu", cascade = CascadeType.ALL, orphanRemoval = true, fetch=FetchType.LAZY)
    private List<Dish> dishes;

    public Menu() {}

    public Menu(String name, String description, Restaurant restaurant, List<Dish> dishes) {
        this.name = name;
        this.description = description;
        this.restaurant = restaurant;
        this.dishes = dishes;
    }

    public Long getIdMenu() {
        return idMenu;
    }

    public void setIdMenu(Long idMenu) {
        this.idMenu = idMenu;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Restaurant getRestaurant() {
        return restaurant;
    }

    public void setRestaurant(Restaurant restaurant) {
        this.restaurant = restaurant;
    }

    public List<Dish> getDishes() {
        return dishes;
    }

    public void setDishes(List<Dish> dishes) {
        this.dishes = dishes;
    }
}

