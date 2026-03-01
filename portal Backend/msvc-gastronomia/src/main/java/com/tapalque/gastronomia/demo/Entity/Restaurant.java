package com.tapalque.gastronomia.demo.Entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import io.micrometer.common.lang.Nullable;
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
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "restaurant")
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idRestaurant;

    @Column(nullable = false)
    @NotNull(message = "El nombre es obligarorio")
    private String name;

    @Column(nullable = false)
    @NotNull (message = "Direccion obligaria")
    private String address;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    @NotNull (message = "Por favor informar existencia de delivery")
    private Boolean delivery;

    @Column(name = "delivery_price")
    @Nullable
    private Double deliveryPrice;

    @Column(name = "estimated_wait_time")
    @Nullable
    private Integer estimatedWaitTime;

    @Column(name = "last_close_date")
    @Nullable
    private java.time.LocalDateTime lastCloseDate;

    @Column(name = "es_heladeria", nullable = false, columnDefinition = "boolean default false")
    private Boolean esHeladeria = false;


    @Min(value = -90, message = "La latitud debe estar entre -90 y 90")
    @Max(value = 90, message = "La latitud debe estar entre -90 y 90")
    @Column (name="latitude" ,nullable= false)
    private Double coordinate_lat; 

    @Min(value = -180, message = "La longitud debe estar entre -180 y 180")
    @Max(value = 180, message = "La longitud debe estar entre -180 y 180")
    @Column (name = "longitude", nullable = false)
    private Double coordinate_lon; 

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

    @OneToMany(mappedBy = "restaurante", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaborHeladeria> saboresHeladeria;
    
    public Restaurant(){}
  
    public Restaurant(Integer estimatedWaitTime, Double deliveryPrice, Double lat, Double lon, String address, List<Category> categories, Boolean delivery, Menu menu, String email, Long idRestaurant, List<RestaurantImage> images, String name, List<PhoneNumber> phone, List<PhoneNumber> phoneNumbers, List<Schedule> schedules) {
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
        this.estimatedWaitTime = estimatedWaitTime;
        this.deliveryPrice = deliveryPrice;
        this.schedules = schedules;
        this.coordinate_lat = (coordinate_lat != null) ? lat : 0.0;
        this.coordinate_lon = (coordinate_lon != null) ?  lon : 0.0;
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

    public Double getcoordinate_lat(){
        return coordinate_lat;
    }

    public void setCoordinate_lat(Double lat){
        coordinate_lat = (lat != null) ? lat : 0.0;
    }

    public Double getCoordinate_lon(){
        return coordinate_lon;
    }

    public void setCoordinate_lon(Double lon){
        coordinate_lon = (lon != null) ? lon : 0.0;
    }

    public Double getDeliveryPrice() {
        return deliveryPrice;
    }

    public void setDeliveryPrice(Double deliveryPrice) {
        this.deliveryPrice = deliveryPrice;
    }

    public Integer getEstimatedWaitTime() {
        return estimatedWaitTime;
    }

    public void setEstimatedWaitTime(Integer estimatedWaitTime) {
        this.estimatedWaitTime = estimatedWaitTime;
    }

    public java.time.LocalDateTime getLastCloseDate() {
        return lastCloseDate;
    }

    public void setLastCloseDate(java.time.LocalDateTime lastCloseDate) {
        this.lastCloseDate = lastCloseDate;
    }

    public Boolean getEsHeladeria() {
        return esHeladeria != null ? esHeladeria : false;
    }

    public void setEsHeladeria(Boolean esHeladeria) {
        this.esHeladeria = esHeladeria != null ? esHeladeria : false;
    }

}