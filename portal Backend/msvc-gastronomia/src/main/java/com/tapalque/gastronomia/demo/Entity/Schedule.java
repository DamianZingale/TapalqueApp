package com.tapalque.gastronomia.demo.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "schedule")
public class Schedule {

     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idSchedule;

    @Column(nullable = false)
    private Integer dayOfWeek; // 1 = Monday ... 7 = Sunday

    @Column(nullable = false)
    private String openingTime;

    @Column(nullable = false)
    private String closingTime;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "idRestaurant", nullable = false)
    private Restaurant restaurant;
    public Long getIdSchedule() {
        return idSchedule;
    }

    public void setIdSchedule(Long idSchedule) {
        this.idSchedule = idSchedule;
    }

    public Integer getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(Integer dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public String getOpeningTime() {
        return openingTime;
    }

    public void setOpeningTime(String openingTime) {
        this.openingTime = openingTime;
    }

    public String getClosingTime() {
        return closingTime;
    }

    public void setClosingTime(String closingTime) {
        this.closingTime = closingTime;
    }

    public Restaurant getRestaurant() {
        return restaurant;
    }

    public void setRestaurant(Restaurant restaurant) {
        this.restaurant = restaurant;
    }

    public Schedule() {
    }

    public Schedule(Long idSchedule, Integer dayOfWeek, String openingTime, String closingTime, Restaurant restaurant) {
        this.idSchedule = idSchedule;
        this.dayOfWeek = dayOfWeek;
        this.openingTime = openingTime;
        this.closingTime = closingTime;
        this.restaurant = restaurant;
    }

   
}