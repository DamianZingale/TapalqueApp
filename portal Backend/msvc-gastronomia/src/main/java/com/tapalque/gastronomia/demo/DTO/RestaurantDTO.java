package com.tapalque.gastronomia.demo.DTO;

public class RestaurantDTO {

    private Long id;
    private String name;
    private String address;
    private String email;
    private String mapUrl;
    private String categories; // concatenadas con ', '
    private String phones;     // concatenados con ', '
    private String schedule;   // concatenado tipo "1:09:00-22:00; 2:09:00-22:00"

    public RestaurantDTO() {}

    public RestaurantDTO(Long id, String name, String address, String email, String mapUrl,
                             String categories, String phones, String schedule) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.email = email;
        this.mapUrl = mapUrl;
        this.categories = categories;
        this.phones = phones;
        this.schedule = schedule;
    }

    // 🔹 Getters y Setters
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMapUrl() {
        return mapUrl;
    }

    public void setMapUrl(String mapUrl) {
        this.mapUrl = mapUrl;
    }

    public String getCategories() {
        return categories;
    }

    public void setCategories(String categories) {
        this.categories = categories;
    }

    public String getPhones() {
        return phones;
    }

    public void setPhones(String phones) {
        this.phones = phones;
    }

    public String getSchedule() {
        return schedule;
    }

    public void setSchedule(String schedule) {
        this.schedule = schedule;
    }
}
