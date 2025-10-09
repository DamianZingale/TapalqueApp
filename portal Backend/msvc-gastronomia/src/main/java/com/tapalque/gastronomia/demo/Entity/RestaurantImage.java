package com.tapalque.gastronomia.demo.Entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "restaurant_images")
public class RestaurantImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "photo")
    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "restaurant_id", referencedColumnName = "idRestaurant", nullable = false)
    private Restaurant restaurant;
    public RestaurantImage() {
    }

    public RestaurantImage(Long id, String imageUrl, Restaurant restaurant) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.restaurant = restaurant;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Restaurant getRestaurant() {
        return restaurant;
    }

    public void setRestaurant(Restaurant restaurant) {
        this.restaurant = restaurant;
    }

    

    
 
}
