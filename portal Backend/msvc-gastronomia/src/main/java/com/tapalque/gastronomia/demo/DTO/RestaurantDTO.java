package com.tapalque.gastronomia.demo.DTO;
import java.util.List;
import java.util.stream.Collectors;

import com.tapalque.gastronomia.demo.Entity.PhoneNumber;
import com.tapalque.gastronomia.demo.Entity.Restaurant;
import com.tapalque.gastronomia.demo.Entity.Schedule;

public class RestaurantDTO {

    private Long id;
    private String name;
    private String address;
    private String mapUrl;
    private List<PhoneNumberDTO> phoneNumbers;
    private List<ScheduleDTO> schedules;

    public RestaurantDTO() {}

    // Constructor Entity -> DTO
    public RestaurantDTO(Restaurant restaurant) {
        this.id = restaurant.getIdRestaurant();
        this.name = restaurant.getName();
        this.address = restaurant.getAddress();
        this.mapUrl = restaurant.getMapUrl();

        // Mapeo PhoneNumber sin referencia al Restaurant
        if (restaurant.getPhoneNumbers() != null) {
            this.phoneNumbers = restaurant.getPhoneNumbers()
                                         .stream()
                                         .map(PhoneNumberDTO::new)
                                         .collect(Collectors.toList());
        }

        // Mapeo Schedule sin referencia al Restaurant
        if (restaurant.getSchedules() != null) {
            this.schedules = restaurant.getSchedules()
                                       .stream()
                                       .map(ScheduleDTO::new)
                                       .collect(Collectors.toList());
        }
    }

    // DTO -> Entity
    public Restaurant toEntity() {
        Restaurant restaurant = new Restaurant();
        restaurant.setIdRestaurant(this.id);
        restaurant.setName(this.name);
        restaurant.setAddress(this.address);
        restaurant.setMapUrl(this.mapUrl);

        if (this.phoneNumbers != null) {
            restaurant.setPhoneNumbers(
                this.phoneNumbers.stream()
                                 .map(p -> { 
                                     PhoneNumber ph = p.toEntity(); 
                                     ph.setRestaurant(restaurant); // link inverso
                                     return ph; 
                                 })
                                 .collect(Collectors.toList())
            );
        }

        if (this.schedules != null) {
            restaurant.setSchedules(
                this.schedules.stream()
                              .map(s -> {
                                  Schedule sch = s.toEntity();
                                  sch.setRestaurant(restaurant); // link inverso
                                  return sch;
                              })
                              .collect(Collectors.toList())
            );
        }

        return restaurant;
    }

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

    public List<PhoneNumberDTO> getPhoneNumbers() {
        return phoneNumbers;
    }

    public void setPhoneNumbers(List<PhoneNumberDTO> phoneNumbers) {
        this.phoneNumbers = phoneNumbers;
    }

    public List<ScheduleDTO> getSchedules() {
        return schedules;
    }

    public void setSchedules(List<ScheduleDTO> schedules) {
        this.schedules = schedules;
    }

   
}
