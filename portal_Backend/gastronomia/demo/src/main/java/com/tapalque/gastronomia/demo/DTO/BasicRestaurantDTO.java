package com.tapalque.gastronomia.demo.DTO;

import java.util.List;

import org.hibernate.validator.constraints.URL;

import com.tapalque.gastronomia.demo.Entity.PhoneNumber;
import com.tapalque.gastronomia.demo.Entity.Restaurant;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;
import jakarta.validation.constraints.Size;


public class BasicRestaurantDTO {

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

    @NotNull
    private Boolean delivery;

    @NotNull
    private List<String> categories;

    
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

    public Boolean getDelivery() {
        return delivery;
    }

    public void setDelivery(Boolean delivery) {
        this.delivery = delivery;
    }

    public List<String> getCategories() {
        return categories;
    }

    public void setCategories(List<String> categories) {
        this.categories = categories;
    }
    
    public BasicRestaurantDTO() {
    }

    // Constructor Entity -> DTO
    public BasicRestaurantDTO(Restaurant restaurant) {
    this.id = restaurant.getIdRestaurant();  // <-- antes estaba getIdRestaurant()
    this.name = restaurant.getName();
    this.address = restaurant.getAddress();
    this.mapUrl = restaurant.getMapUrl();
    this.phoneNumbers = restaurant.getPhoneNumbers();
    
}

    // DTO -> Entity
    public Restaurant toEntity() {
        Restaurant restaurant = new Restaurant();
        restaurant.setIdRestaurant(this.id); // si es null, se genera en DB
        restaurant.setName(this.name);
        restaurant.setAddress(this.address);
        restaurant.setMapUrl(this.mapUrl);
        restaurant.setPhoneNumbers(this.phoneNumbers);
        
        return restaurant;
    }
}
