package com.tapalque.gastronomia.demo.Entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "restaurant")
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idRestaurant;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

   

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private Boolean delivery;

    @Column(name = "map_url",  nullable= true)
    private String mapUrl;

    @ManyToMany
    @JoinTable(
        name = "restaurant_category",
        joinColumns = @JoinColumn(name = "idRestaurant"),
        inverseJoinColumns = @JoinColumn(name = "idCategory")
    )
    private List<Category> categories;

    @JsonIgnore
    @OneToOne(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    private Menu menus;
    @JsonManagedReference
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Schedule> schedules;

    @JsonManagedReference
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PhoneNumber> phoneNumbers;
    @JsonManagedReference
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RestaurantImage> images;

    @JsonManagedReference
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews;
    
    public Restaurant(){}
  
    public Restaurant(String address, List<Category> categories, Boolean delivery, Menu menu, String email, Long idRestaurant, List<RestaurantImage> images, String name, List<PhoneNumber> phone, List<PhoneNumber> phoneNumbers, List<Schedule> schedules) {
        this.address = address;
        this.categories = categories;
        this.delivery = delivery;
        this.menus = menu;
        this.email = email;
        this.idRestaurant = idRestaurant;
        this.images = images;
        this.name = name;
        this.phoneNumbers = phone;
        this.phoneNumbers = phoneNumbers;
        this.schedules = schedules;
    }

    public Long getIdRestaurant() {
        return idRestaurant;
    }

    public void setIdRestaurant(Long idRestaurant) {
        this.idRestaurant = idRestaurant;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    
    public void setEmail(String email) {
        this.email = email;
    }

    public void setDelivery(Boolean delivery) {
        this.delivery = delivery;
    }

    public void setCategories(List<Category> categories) {
        this.categories = categories;
    }

    

    public void setSchedules(List<Schedule> schedules) {
        this.schedules = schedules;
    }

    public void setPhoneNumbers(List<PhoneNumber> phoneNumbers) {
        this.phoneNumbers = phoneNumbers;
    }

    public void setImages(List<RestaurantImage> images) {
        this.images = images;
    }

    public String getName() {
        return name;
    }

    public String getAddress() {
        return address;
    }

    
    public String getEmail() {
        return email;
    }

    public Boolean getDelivery() {
        return delivery;
    }

    public List<Category> getCategories() {
        return categories;
    }

    public Menu getMenus() {
        return menus;
    }

    public void setMenus(Menu menus) {
        this.menus = menus;
    }

    public List<Schedule> getSchedules() {
        return schedules;
    }

    public List<PhoneNumber> getPhoneNumbers(){
        return phoneNumbers;
    }
    public List<RestaurantImage> getImages() {
        return images;
    }
    public List<Review> getReviews() {
        return reviews;
    }

    public void setReviews(List<Review> reviews) {
        this.reviews = reviews;
    }
    public String getMapUrl() {
        return mapUrl;
    }

    public void setMapUrl(String mapUrl) {
        this.mapUrl = mapUrl;
    }

}