package com.tapalque.gastronomia.demo.DTO;

import java.util.List;

import org.hibernate.validator.constraints.URL;

import com.tapalque.gastronomia.demo.Entity.PhoneNumber;
import com.tapalque.gastronomia.demo.Entity.Restaurant;
import com.tapalque.gastronomia.demo.Entity.RestaurantImage;
import com.tapalque.gastronomia.demo.Entity.Review;
import com.tapalque.gastronomia.demo.Entity.Schedule;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;
import jakarta.validation.constraints.Size;


public class RestaurantDTO {

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getMapUrl() {
        return mapUrl;
    }

    public void setMapUrl(String mapUrl) {
        this.mapUrl = mapUrl;
    }

    public List<PhoneNumber> getPhoneNumbers() {
        return phoneNumbers;
    }

    public void setPhoneNumbers(List<PhoneNumber> phoneNumbers) {
        this.phoneNumbers = phoneNumbers;
    }

    public List<RestaurantImage> getImages() {
        return images;
    }

    public void setImages(List<RestaurantImage> images) {
        this.images = images;
    }

    public List<Schedule> getSchedules() {
        return schedules;
    }

    public void setSchedules(List<Schedule> schedules) {
        this.schedules = schedules;
    }

    public List<Review> getReviews() {
        return reviews;
    }

    public void setReviews(List<Review> reviews) {
        this.reviews = reviews;
    }

    @Null(message = "ID is auto-generated and should not be provided")
    private Long id;

    @NotNull(message = "Restaurant name cannot be null")
    @Size(min = 1, max = 50, message = "Restaurant name must be between 1 and 50 characters")
    private String name;

    @NotNull(message = "Address cannot be null")
    @Size(min = 1, max = 200, message = "Address must be between 1 and 200 characters")
    private String address;

    @URL(message = "URL must be valid")
    private String mapUrl;

    @Valid
    @NotEmpty(message = "There must be at least one phone number")
    private List<PhoneNumber> phoneNumbers;

    private List<RestaurantImage> images;
    private List<Schedule> schedules;
    private List<Review> reviews;

    // Constructor Entity -> DTO
    public RestaurantDTO(Restaurant restaurant) {
    this.id = restaurant.getIdRestaurant();  // <-- antes estaba getIdRestaurant()
    this.name = restaurant.getName();
    this.address = restaurant.getAddress();
    this.mapUrl = restaurant.getMapUrl();
    this.phoneNumbers = restaurant.getPhoneNumbers();
    this.schedules = restaurant.getSchedules();
    this.reviews = restaurant.getReviews();
    this.images = restaurant.getImages();
}

    // DTO -> Entity
    public Restaurant toEntity() {
        Restaurant restaurant = new Restaurant();
        restaurant.setIdRestaurant(this.id); // si es null, se genera en DB
        restaurant.setName(this.name);
        restaurant.setAddress(this.address);
        restaurant.setMapUrl(this.mapUrl);
        restaurant.setPhoneNumbers(this.phoneNumbers);
        restaurant.setSchedules(this.schedules);
        restaurant.setReviews(this.reviews);
        restaurant.setImages(this.images);
        return restaurant;
    }
}
